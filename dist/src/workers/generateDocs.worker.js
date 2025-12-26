"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDocsWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../lib/redis"));
const queue_1 = require("../lib/queue");
const DocGenerator_1 = require("../lib/doc-gen/DocGenerator");
// import { Repo } from "../models/Repo";
const Job_1 = require("../models/Job");
const logger_1 = require("../lib/logger");
const analytics_service_1 = require("../services/analytics.service");
exports.generateDocsWorker = new bullmq_1.Worker(queue_1.QUEUE_NAMES.GENERATE_DOCS, async (job) => {
    const startTime = Date.now();
    const { repoId, userId, webhookEventId, fileDiffs, commitMessage, repoContext, existingDocs, commitSha, branch, } = job.data;
    try {
        logger_1.logger.info("Generating documentation", { jobId: job.id, repoId });
        await Job_1.Job.findOneAndUpdate({ jobId: job.id }, { status: "processing", startedAt: new Date() }, { upsert: true });
        // Initialize generator
        const docGenerator = new DocGenerator_1.DocGenerator();
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
        logger_1.logger.info("AI output data", {
            jobId: job.id,
            aiOutput: JSON.stringify(aiOutput),
        });
        // Publish realtime event: AI finished generating docs
        try {
            const { publishEvent } = await Promise.resolve().then(() => __importStar(require("../lib/events")));
            await publishEvent(repoId, {
                type: "ai:generated",
                jobId: job.id,
                summary: aiOutput.summary,
                patches: aiOutput.patches.map((p) => p.file),
                coverageScore: aiOutput.coverageScore,
                timestamp: Date.now(),
            });
        }
        catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error";
            logger_1.logger.warn("Failed to publish AI generated event", {
                error: errorMessage,
            });
        }
        logger_1.logger.info("Documentation generated successfully", {
            jobId: job.id,
            patches: aiOutput.patches.length,
        });
        // Enqueue apply_patch job
        const applyJobId = await (0, queue_1.addJob)(queue_1.applyPatchQueue, "apply_patch", {
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
        await Job_1.Job.findOneAndUpdate({ jobId: job.id }, { output: { aiSummary: aiOutput.summary, patches: aiOutput.patches } });
        const duration = Date.now() - startTime;
        await Job_1.Job.findOneAndUpdate({ jobId: job.id }, {
            status: "completed",
            completedAt: new Date(),
            duration,
            output: { applyJobId },
        });
        await analytics_service_1.analyticsService.recordMetric(userId, "docsGenerated", 1);
        logger_1.logger.info("Generate docs job completed", { jobId: job.id, duration });
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Generate docs job failed", {
            jobId: job.id,
            error: errorMessage,
            duration,
        });
        await Job_1.Job.findOneAndUpdate({ jobId: job.id }, {
            status: "failed",
            error: errorMessage,
            completedAt: new Date(),
            duration,
        });
        await analytics_service_1.analyticsService.updateSuccessRate(userId, false).catch(() => { });
        throw error;
    }
}, {
    connection: redis_1.default,
    concurrency: 2,
});
exports.generateDocsWorker.on("completed", (job) => {
    logger_1.logger.info("Generate docs job completed", { jobId: job.id });
});
exports.generateDocsWorker.on("failed", (job, err) => {
    logger_1.logger.error("Generate docs job failed", {
        jobId: job?.id,
        error: err.message,
    });
});
//# sourceMappingURL=generateDocs.worker.js.map