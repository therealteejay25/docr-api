import { Worker, Job } from "bullmq";
import redis from "../lib/redis";
import { QUEUE_NAMES } from "../lib/queue";
import { emailService } from "../services/email.service";
import { logger } from "../lib/logger";

interface SendEmailJobData {
  userId: string;
  repoId?: string;
  email: string;
  repoName: string;
  summary: string;
  diffPreview: string;
  coverageScore: number;
  patches: Array<{ file: string; reason: string }>;
  prUrl?: string;
  issues?: string[];
}

interface SendErrorEmailJobData {
  userId: string;
  email: string;
  repoName: string;
  error: string;
  jobId?: string;
}

export const sendEmailWorker = new Worker(
  QUEUE_NAMES.SEND_EMAIL,
  async (job: Job<SendEmailJobData | SendErrorEmailJobData>) => {
    try {
      const jobName = job.name;

      // Log full job data
      logger.info("Send email job data", {
        jobId: job.id,
        jobName,
        fullData: JSON.stringify(job.data),
      });

      if (jobName === "send_error_email") {
        const data = job.data as SendErrorEmailJobData;
        await emailService.sendErrorNotification(
          data.email,
          data.repoName,
          data.error,
          data.jobId
        );
      } else {
        const data = job.data as SendEmailJobData;
        await emailService.sendDocUpdateEmail({
          to: data.email,
          repoName: data.repoName,
          summary: data.summary,
          diffPreview: data.diffPreview,
          coverageScore: data.coverageScore,
          patches: data.patches,
          issues: data.issues,
          prUrl: (data as any).prUrl,
        });
      }

      logger.info("Email sent successfully", {
        jobId: job.id,
        email: (job.data as any).email,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Failed to send email", {
        jobId: job.id,
        error: errorMessage,
      });
      // Don't throw - email failures shouldn't fail the job
      // The queue will retry automatically
    }
  },
  {
    connection: redis,
    concurrency: 10, // Higher concurrency for emails
  }
);

sendEmailWorker.on("completed", (job) => {
  logger.info("Send email job completed", { jobId: job.id });
});

sendEmailWorker.on("failed", (job, err) => {
  logger.error("Send email job failed", { jobId: job?.id, error: err.message });
});
