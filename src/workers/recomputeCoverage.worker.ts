import { Worker, Job } from "bullmq";
import redis from "../lib/redis";
import { QUEUE_NAMES } from "../lib/queue";
import { githubService } from "../services/github.service";
import { Repo } from "../models/Repo";
import { logger } from "../lib/logger";

interface RecomputeCoverageJobData {
  repoId: string;
  userId: string;
}

export const recomputeCoverageWorker = new Worker(
  QUEUE_NAMES.RECOMPUTE_COVERAGE,
  async (job: Job<RecomputeCoverageJobData>) => {
    const { repoId, userId } = job.data;
    const startTime = Date.now();

    try {
      logger.info("Recomputing coverage", { jobId: job.id, repoId });

      const repo = await Repo.findById(repoId);
      if (!repo) {
        throw new Error("Repo not found");
      }

      const [owner, repoName] = repo.fullName.split("/");

      // Get repo files
      // This is a simplified version - could be enhanced with full repo scanning
      const docFiles = ["README.md", "CHANGELOG.md", "docs/", "API.md"];
      let foundDocs = 0;

      for (const docFile of docFiles) {
        try {
          await githubService.getFileContent(userId, owner, repoName, docFile, repo.defaultBranch);
          foundDocs++;
        } catch {
          // File doesn't exist
        }
      }

      // Calculate coverage score (simplified)
      const coverageScore = Math.min(1, foundDocs / docFiles.length);

      const duration = Date.now() - startTime;
      logger.info("Coverage recomputed", {
        jobId: job.id,
        coverageScore,
        duration,
      });

      return { coverageScore };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error("Failed to recompute coverage", {
        jobId: job.id,
        error: error.message,
        duration,
      });
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 2, // Lower concurrency for long-running jobs
  }
);

recomputeCoverageWorker.on("completed", (job) => {
  logger.info("Recompute coverage job completed", { jobId: job.id });
});

recomputeCoverageWorker.on("failed", (job, err) => {
  logger.error("Recompute coverage job failed", { jobId: job?.id, error: err.message });
});

