"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../lib/redis"));
const queue_1 = require("../lib/queue");
const email_service_1 = require("../services/email.service");
const logger_1 = require("../lib/logger");
exports.sendEmailWorker = new bullmq_1.Worker(queue_1.QUEUE_NAMES.SEND_EMAIL, async (job) => {
    try {
        const jobName = job.name;
        // Log full job data
        logger_1.logger.info("Send email job data", {
            jobId: job.id,
            jobName,
            fullData: JSON.stringify(job.data),
        });
        if (jobName === "send_error_email") {
            const data = job.data;
            await email_service_1.emailService.sendErrorNotification(data.email, data.repoName, data.error, data.jobId);
        }
        else {
            const data = job.data;
            await email_service_1.emailService.sendDocUpdateEmail({
                to: data.email,
                repoName: data.repoName,
                summary: data.summary,
                diffPreview: data.diffPreview,
                coverageScore: data.coverageScore,
                patches: data.patches,
                issues: data.issues,
                prUrl: data.prUrl,
            });
        }
        logger_1.logger.info("Email sent successfully", {
            jobId: job.id,
            email: job.data.email,
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Failed to send email", {
            jobId: job.id,
            error: errorMessage,
        });
        // Don't throw - email failures shouldn't fail the job
        // The queue will retry automatically
    }
}, {
    connection: redis_1.default,
    concurrency: 10, // Higher concurrency for emails
});
exports.sendEmailWorker.on("completed", (job) => {
    logger_1.logger.info("Send email job completed", { jobId: job.id });
});
exports.sendEmailWorker.on("failed", (job, err) => {
    logger_1.logger.error("Send email job failed", { jobId: job?.id, error: err.message });
});
//# sourceMappingURL=sendEmail.worker.js.map