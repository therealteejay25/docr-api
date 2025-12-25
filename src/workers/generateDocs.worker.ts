import { Worker, Job } from "bullmq";
import redis from "../lib/redis";
import { QUEUE_NAMES, applyPatchQueue, addJob } from "../lib/queue";
import { DocGenerator } from "../lib/doc-gen/DocGenerator";
import { Repo } from "../models/Repo";
import { Job as JobModel } from "../models/Job";
import { logger } from "../lib/logger";
import { analyticsService } from "../services/analytics.service";

interface GenerateDocsJobData {
  repoId: string;
  userId: string;
  webhookEventId: string;
  fileDiffs: Array<{ path: string; diff: string; status: string }>;
  commitMessage: string;
  repoContext: any;
  existingDocs: any;
  commitSha: string;
  branch: string;
}

export const generateDocsWorker = new Worker(
  QUEUE_NAMES.GENERATE_DOCS,
  async (job: Job<GenerateDocsJobData>) => {
    const startTime = Date.now();
    const {
      repoId,
      userId,
      webhookEventId,
      fileDiffs,
      commitMessage,
      repoContext,
      existingDocs,
      commitSha,
      branch,
    } = job.data;

    try {
      logger.info("Generating documentation", { jobId: job.id, repoId });

      await JobModel.findOneAndUpdate(
        { jobId: job.id },
        { status: "processing", startedAt: new Date() },
        { upsert: true }
      );

      // Initialize generator
      const docGenerator = new DocGenerator();
      
      // Generate Documentation
      const aiOutput = await docGenerator.generate({
        repoId,
        userId,
        branch,
        fileDiffs,
        commitMessage,
        repoContext,
        existingDocs
      });

      // Log full AI output
      logger.info("AI output data", {
        jobId: job.id,
        aiOutput: JSON.stringify(aiOutput),
      });

      // Publish realtime event: AI finished generating docs
      try {
        const { publishEvent } = await import("../lib/events");
        await publishEvent(repoId, {
          type: "ai:generated",
          jobId: job.id,
          summary: aiOutput.summary,
          patches: aiOutput.patches.map((p: any) => p.file),
          coverageScore: aiOutput.coverageScore,
          timestamp: Date.now(),
        });
      } catch (e) {
        logger.warn("Failed to publish AI generated event", {
          error: e.message,
        });
      }

      logger.info("Documentation generated successfully", {
        jobId: job.id,
        patches: aiOutput.patches.length,
      });

      // Enqueue apply_patch job
      const applyJobId = await addJob(applyPatchQueue, "apply_patch", {
        repoId,
        userId,
        webhookEventId,
        patches: aiOutput.patches,
        summary: aiOutput.summary,
        coverageScore: aiOutput.coverageScore,
        commitSha,
        branch,
      });

      // Save AI friendly name to job output for UI
      await JobModel.findOneAndUpdate(
        { jobId: job.id },
        { output: { aiSummary: aiOutput.summary, patches: aiOutput.patches } }
      );

      const duration = Date.now() - startTime;
      await JobModel.findOneAndUpdate(
        { jobId: job.id },
        {
          status: "completed",
          completedAt: new Date(),
          duration,
          output: { applyJobId },
        }
      );

      await analyticsService.recordMetric(userId, "docsGenerated", 1);
      logger.info("Generate docs job completed", { jobId: job.id, duration });
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Generate docs job failed", {
        jobId: job.id,
        error: error.message,
        duration,
      });
      await JobModel.findOneAndUpdate(
        { jobId: job.id },
        {
          status: "failed",
          error: error.message,
          completedAt: new Date(),
          duration,
        }
      );
      await analyticsService.updateSuccessRate(userId, false).catch(() => {});
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 2,
  }
);

generateDocsWorker.on("completed", (job) => {
  logger.info("Generate docs job completed", { jobId: job.id });
});

generateDocsWorker.on("failed", (job, err) => {
  logger.error("Generate docs job failed", {
    jobId: job?.id,
    error: err.message,
  });
});
