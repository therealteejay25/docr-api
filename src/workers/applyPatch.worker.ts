import { Worker, Job } from "bullmq";
import redis from "../lib/redis";
import { QUEUE_NAMES, sendEmailQueue, addJob } from "../lib/queue";
import { writerService } from "../services/writer.service";
import { diffService } from "../services/diff.service";
import { githubService } from "../services/github.service";
import { Repo } from "../models/Repo";
import { User } from "../models/User";
import { Job as JobModel } from "../models/Job";
import { logger } from "../lib/logger";
import { analyticsService } from "../services/analytics.service";

interface ApplyPatchJobData {
  repoId: string;
  userId: string;
  webhookEventId: string;
  patches: Array<{ file: string; patch: string; reason: string }>;
  summary: string;
  coverageScore: number;
  commitSha: string;
  branch: string;
}

export const applyPatchWorker = new Worker(
  QUEUE_NAMES.APPLY_PATCH,
  async (job: Job<ApplyPatchJobData>) => {
    const startTime = Date.now();
    const {
      repoId,
      userId,
      patches,
      summary,
      coverageScore,
      commitSha,
      branch,
    } = job.data;

    // Log full job data
    logger.info("Apply patch job data", {
      jobId: job.id,
      fullData: JSON.stringify(job.data),
    });

    try {
      logger.info("Applying patches", {
        jobId: job.id,
        repoId,
        patches: patches.length,
      });

      // Publish event: applying patches started
      try {
        const { publishEvent } = await import("../lib/events");
        await publishEvent(repoId, {
          type: "patch:applying",
          jobId: job.id,
          files: patches.map((p) => p.file),
          timestamp: Date.now(),
        });
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        logger.warn("Failed to publish patch applying event", {
          error: errorMessage,
        });
      }

      await JobModel.findOneAndUpdate(
        { jobId: job.id },
        { status: "processing", startedAt: new Date() },
        { upsert: true }
      );

      const repo = await Repo.findById(repoId);
      if (!repo) {
        throw new Error("Repo not found");
      }

      const [owner, repoName] = repo.fullName.split("/");

      // Apply patches to files
      const filesToWrite = [];
      for (const patchData of patches) {
        try {
          // Determine if patch is raw content or unified diff
          const isUnifiedDiff =
            patchData.patch.includes("+++") ||
            patchData.patch.includes("---") ||
            patchData.patch.includes("@@");

          let newContent: string;
          if (isUnifiedDiff) {
            // Apply unified diff format
            let originalContent = "";
            try {
              originalContent = await githubService.getFileContent(
                userId,
                owner,
                repoName,
                patchData.file,
                branch
              );
            } catch {
              // File doesn't exist, will create new
              originalContent = "";
            }
            newContent = diffService.applyPatch(
              originalContent,
              patchData.patch
            );
          } else {
            // Treat as raw content (direct write)
            newContent = patchData.patch;
          }

          filesToWrite.push({
            path: patchData.file,
            content: newContent,
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          logger.error("Failed to apply patch", {
            file: patchData.file,
            error: errorMessage,
          });
          // Continue with other files
        }
      }

      if (filesToWrite.length === 0) {
        throw new Error("No files to write");
      }

      // Write files to GitHub — push directly to default branch (no PR)
      const targetBranch = repo.defaultBranch || branch || "main";
      logger.info("Applying patches - about to write", {
        targetBranch,
        filesToWriteCount: filesToWrite.length,
        files: filesToWrite.map((f) => f.path),
      });
      const writeResult = await writerService.writeFiles({
        userId,
        repoId,
        files: filesToWrite,
        message: `docs: ${summary}`,
        branch: targetBranch,
        createPR: false, // Direct push: createPR=false
      });

      logger.info("Write result", { writeResult });

      // Publish write result
      try {
        const { publishEvent } = await import("../lib/events");
        await publishEvent(repoId, {
          type: "patch:written",
          jobId: job.id,
          commitSha: writeResult.commitSha,
          prUrl: writeResult.prUrl,
          commitUrl: writeResult.commitUrl,
          timestamp: Date.now(),
        });
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        logger.warn("Failed to publish patch written event", {
          error: errorMessage,
        });
      }

      // Update repo last processed. Prefer the commit SHA produced by the writer
      // (the new commit created by this job). Fallback to the triggering commit SHA.
      const newLastProcessed = writeResult.commitSha || commitSha;
      await Repo.findByIdAndUpdate(repoId, {
        lastProcessedCommit: newLastProcessed,
        lastProcessedAt: new Date(),
        lastProcessedSummary: summary,
      });

      // Record analytics
      await analyticsService.recordMetric(
        userId,
        "patchesApplied",
        filesToWrite.length
      );
      if (writeResult.prUrl) {
        await analyticsService.recordMetric(userId, "prsCreated", 1);
      } else if (writeResult.commitSha) {
        await analyticsService.recordMetric(userId, "commitsPushed", 1);
      }

      // Trigger email notification
      const user = await User.findById(userId);
      if (user && repo.settings?.emailNotifications) {
        await addJob(sendEmailQueue, "send_email", {
          userId,
          repoId,
          email: user.email,
          repoName: repo.fullName,
          summary,
          diffPreview: patches
            .map((p) => p.patch)
            .join("\n\n")
            .substring(0, 500),
          coverageScore,
          patches: patches.map((p) => ({ file: p.file, reason: p.reason })),
          prUrl: writeResult.prUrl || writeResult.commitUrl,
          jobId: job.id,
        });
      }

      const duration = Date.now() - startTime;
      await JobModel.findOneAndUpdate(
        { jobId: job.id },
        {
          status: "completed",
          completedAt: new Date(),
          duration,
          output: {
            filesWritten: filesToWrite.length,
            commitSha: writeResult.commitSha,
            prUrl: writeResult.prUrl,
            commitUrl: writeResult.commitUrl,
          },
        }
      );

      await analyticsService.updateSuccessRate(userId, true);

      logger.info("Patches applied successfully", {
        jobId: job.id,
        filesWritten: filesToWrite.length,
        duration,
      });
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Failed to apply patches", {
        jobId: job.id,
        error: errorMessage,
        duration,
      });

      await JobModel.findOneAndUpdate(
        { jobId: job.id },
        {
          status: "failed",
          error: errorMessage,
          completedAt: new Date(),
          duration,
        }
      );

      // Send error notification
      try {
        const user = await User.findById(userId);
        const repo = await Repo.findById(repoId);
        if (user && repo) {
          await addJob(sendEmailQueue, "send_error_email", {
            userId,
            email: user.email,
            repoName: repo.fullName,
            error: errorMessage,
            jobId: job.id,
          });
        }
      } catch (emailError: unknown) {
        const emailErrorMessage = emailError instanceof Error ? emailError.message : "Unknown error";
        logger.error("Failed to send error email", {
          error: emailErrorMessage,
        });
      }

      await analyticsService.updateSuccessRate(userId, false);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 3,
  }
);

applyPatchWorker.on("completed", (job) => {
  logger.info("Apply patch job completed", { jobId: job.id });
});

applyPatchWorker.on("failed", (job, err) => {
  logger.error("Apply patch job failed", {
    jobId: job?.id,
    error: err.message,
  });
});
