"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueEvents = exports.recomputeCoverageQueue = exports.sendEmailQueue = exports.applyPatchQueue = exports.generateDocsQueue = exports.processCommitQueue = exports.QUEUE_NAMES = void 0;
exports.addJob = addJob;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("./redis"));
const logger_1 = require("./logger");
// Queue names
exports.QUEUE_NAMES = {
    PROCESS_COMMIT: "process_commit",
    GENERATE_DOCS: "generate_docs",
    APPLY_PATCH: "apply_patch",
    SEND_EMAIL: "send_email",
    RECOMPUTE_COVERAGE: "recompute_coverage",
};
// Create queues
exports.processCommitQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.PROCESS_COMMIT, {
    connection: redis_1.default,
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
exports.generateDocsQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.GENERATE_DOCS, {
    connection: redis_1.default,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 3000,
        },
    },
});
exports.applyPatchQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.APPLY_PATCH, {
    connection: redis_1.default,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
    },
});
exports.sendEmailQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.SEND_EMAIL, {
    connection: redis_1.default,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
    },
});
exports.recomputeCoverageQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.RECOMPUTE_COVERAGE, {
    connection: redis_1.default,
    defaultJobOptions: {
        attempts: 2,
        backoff: {
            type: "exponential",
            delay: 10000,
        },
    },
});
// Queue events for monitoring
exports.queueEvents = new bullmq_1.QueueEvents(exports.QUEUE_NAMES.PROCESS_COMMIT, {
    connection: redis_1.default,
});
exports.queueEvents.on("completed", ({ jobId }) => {
    logger_1.logger.info("Job completed", { jobId, queue: exports.QUEUE_NAMES.PROCESS_COMMIT });
});
exports.queueEvents.on("failed", ({ jobId, failedReason }) => {
    logger_1.logger.error("Job failed", {
        jobId,
        queue: exports.QUEUE_NAMES.PROCESS_COMMIT,
        reason: failedReason,
    });
});
// Helper to add job with logging
async function addJob(queue, jobName, data, options) {
    // Allow callers to pass a jobId (eg. commit SHA) to deduplicate jobs
    const job = await queue.add(jobName, data, options);
    logger_1.logger.info("Job added to queue", {
        jobId: job.id,
        queueName: queue.name,
        jobName,
    });
    return job.id;
}
//# sourceMappingURL=queue.js.map