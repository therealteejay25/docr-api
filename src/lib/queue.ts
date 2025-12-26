import { Queue, QueueEvents } from "bullmq";
import redis from "./redis";
import { logger } from "./logger";

// Queue names
export const QUEUE_NAMES = {
  PROCESS_COMMIT: "process_commit",
  GENERATE_DOCS: "generate_docs",
  APPLY_PATCH: "apply_patch",
  SEND_EMAIL: "send_email",
  RECOMPUTE_COVERAGE: "recompute_coverage",
} as const;

// Create queues
export const processCommitQueue = new Queue(QUEUE_NAMES.PROCESS_COMMIT, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 1000,
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours
    },
  },
});

export const generateDocsQueue = new Queue(QUEUE_NAMES.GENERATE_DOCS, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
  },
});

export const applyPatchQueue = new Queue(QUEUE_NAMES.APPLY_PATCH, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

export const sendEmailQueue = new Queue(QUEUE_NAMES.SEND_EMAIL, {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});

export const recomputeCoverageQueue = new Queue(
  QUEUE_NAMES.RECOMPUTE_COVERAGE,
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 10000,
      },
    },
  }
);

// Queue events for monitoring
export const queueEvents = new QueueEvents(QUEUE_NAMES.PROCESS_COMMIT, {
  connection: redis,
});

queueEvents.on("completed", ({ jobId }) => {
  logger.info("Job completed", { jobId, queue: QUEUE_NAMES.PROCESS_COMMIT });
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  logger.error("Job failed", {
    jobId,
    queue: QUEUE_NAMES.PROCESS_COMMIT,
    reason: failedReason,
  });
});

// Helper to add job with logging
export async function addJob<T>(
  queue: Queue,
  jobName: string,
  data: T,
  options?: { priority?: number; delay?: number; jobId?: string }
): Promise<string> {
  // Allow callers to pass a jobId (eg. commit SHA) to deduplicate jobs
  const job = await queue.add(jobName, data, options as any);
  logger.info("Job added to queue", {
    jobId: job.id,
    queueName: queue.name,
    jobName,
  });
  return job.id!;
}
