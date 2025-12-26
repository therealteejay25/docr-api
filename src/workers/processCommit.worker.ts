import { Worker, Job } from "bullmq";
import redis from "../lib/redis";
import { QUEUE_NAMES, generateDocsQueue, addJob } from "../lib/queue";
import { githubService } from "../services/github.service";
import { Repo } from "../models/Repo";
import { WebhookEvent } from "../models/WebhookEvent";
import { Job as JobModel } from "../models/Job";
import { logger } from "../lib/logger";
import { analyticsService } from "../services/analytics.service";

interface ProcessCommitJobData {
  webhookEventId: string;
  repoId: string;
  userId: string;
  commitSha: string;
  branch: string;
}

export const processCommitWorker = new Worker(
  QUEUE_NAMES.PROCESS_COMMIT,
  async (job: Job<ProcessCommitJobData>) => {
    const { webhookEventId, repoId, userId, commitSha, branch } = job.data;
    const startTime = Date.now();

    try {
      logger.info("Processing commit", { jobId: job.id, commitSha, repoId });

      // Publish event: commit processing started
      try {
        const { publishEvent } = await import("../lib/events");
        await publishEvent(repoId, {
          type: "commit:processing",
          jobId: job.id,
          commitSha,
          timestamp: Date.now(),
        });
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        logger.warn("Failed to publish commit processing event", {
          error: errorMessage,
        });
      }

      // Update job status
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

      // Get commit details
      const commit = await githubService.getCommit(
        userId,
        owner,
        repoName,
        commitSha
      );

      // Log full commit data
      logger.info("Commit data fetched", {
        commitSha,
        commitData: JSON.stringify(commit),
      });

      // Get commit diff
      const parentSha = commit.parents[0]?.sha;
      if (!parentSha) {
        throw new Error("No parent commit found");
      }

      const diff = await githubService.getCommitDiff(
        userId,
        owner,
        repoName,
        parentSha,
        commitSha
      );

      // Log full diff data
      logger.info("Commit diff fetched", {
        commitSha,
        parentSha,
        diffData: JSON.stringify(diff),
      });

      // Extract file changes
      const fileDiffs =
        diff.files
          ?.filter((f: any) => f.status !== "removed")
          .map((f: any) => ({
            path: f.filename,
            diff: f.patch || "",
            status: f.status,
          })) || [];

      if (fileDiffs.length === 0) {
        logger.info("No file changes to process", { commitSha });
        await JobModel.findOneAndUpdate(
          { jobId: job.id },
          {
            status: "completed",
            completedAt: new Date(),
            duration: Date.now() - startTime,
          }
        );
        return;
      }

      // Get existing documentation
      const existingDocs: any = {};
      try {
        existingDocs.readme = await githubService.getFileContent(
          userId,
          owner,
          repoName,
          "README.md",
          branch
        );
      } catch {
        // README doesn't exist
      }

      try {
        existingDocs.changelog = await githubService.getFileContent(
          userId,
          owner,
          repoName,
          "CHANGELOG.md",
          branch
        );
      } catch {
        // CHANGELOG doesn't exist
      }

      // Build repo context
      const repoContext = {
        name: repo.fullName,
        language: repo.language || "unknown",
        structure: [], // Could be enhanced with repo structure analysis
      };

      // Trigger doc generation
      const generateDocsJobId = await addJob(
        generateDocsQueue,
        "generate_docs",
        {
          repoId,
          userId,
          webhookEventId,
          fileDiffs,
          commitMessage: commit.commit.message,
          repoContext,
          existingDocs,
          commitSha,
          branch,
        }
      );

      // Update webhook event
      await WebhookEvent.findByIdAndUpdate(webhookEventId, {
        jobId: generateDocsJobId,
      });

      // Record analytics
      await analyticsService.recordMetric(userId, "webhooksReceived", 1);

      const duration = Date.now() - startTime;
      await JobModel.findOneAndUpdate(
        { jobId: job.id },
        {
          status: "completed",
          completedAt: new Date(),
          duration,
          output: { generateDocsJobId },
        }
      );

      logger.info("Commit processed successfully", {
        jobId: job.id,
        commitSha,
        duration,
      });
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Failed to process commit", {
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

      await analyticsService.updateSuccessRate(userId, false);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

processCommitWorker.on("completed", (job) => {
  logger.info("Process commit job completed", { jobId: job.id });
});

processCommitWorker.on("failed", (job, err) => {
  logger.error("Process commit job failed", {
    jobId: job?.id,
    error: err.message,
  });
});
