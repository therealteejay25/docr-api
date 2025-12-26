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
exports.processCommitWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../lib/redis"));
const queue_1 = require("../lib/queue");
const github_service_1 = require("../services/github.service");
const Repo_1 = require("../models/Repo");
const WebhookEvent_1 = require("../models/WebhookEvent");
const Job_1 = require("../models/Job");
const logger_1 = require("../lib/logger");
const analytics_service_1 = require("../services/analytics.service");
exports.processCommitWorker = new bullmq_1.Worker(queue_1.QUEUE_NAMES.PROCESS_COMMIT, async (job) => {
    const { webhookEventId, repoId, userId, commitSha, branch } = job.data;
    const startTime = Date.now();
    try {
        logger_1.logger.info("Processing commit", { jobId: job.id, commitSha, repoId });
        // Publish event: commit processing started
        try {
            const { publishEvent } = await Promise.resolve().then(() => __importStar(require("../lib/events")));
            await publishEvent(repoId, {
                type: "commit:processing",
                jobId: job.id,
                commitSha,
                timestamp: Date.now(),
            });
        }
        catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error";
            logger_1.logger.warn("Failed to publish commit processing event", {
                error: errorMessage,
            });
        }
        // Update job status
        await Job_1.Job.findOneAndUpdate({ jobId: job.id }, { status: "processing", startedAt: new Date() }, { upsert: true });
        const repo = await Repo_1.Repo.findById(repoId);
        if (!repo) {
            throw new Error("Repo not found");
        }
        const [owner, repoName] = repo.fullName.split("/");
        // Get commit details
        const commit = await github_service_1.githubService.getCommit(userId, owner, repoName, commitSha);
        // Log full commit data
        logger_1.logger.info("Commit data fetched", {
            commitSha,
            commitData: JSON.stringify(commit),
        });
        // Get commit diff
        const parentSha = commit.parents[0]?.sha;
        if (!parentSha) {
            throw new Error("No parent commit found");
        }
        const diff = await github_service_1.githubService.getCommitDiff(userId, owner, repoName, parentSha, commitSha);
        // Log full diff data
        logger_1.logger.info("Commit diff fetched", {
            commitSha,
            parentSha,
            diffData: JSON.stringify(diff),
        });
        // Extract file changes
        const fileDiffs = diff.files
            ?.filter((f) => f.status !== "removed")
            .map((f) => ({
            path: f.filename,
            diff: f.patch || "",
            status: f.status,
        })) || [];
        if (fileDiffs.length === 0) {
            logger_1.logger.info("No file changes to process", { commitSha });
            await Job_1.Job.findOneAndUpdate({ jobId: job.id }, {
                status: "completed",
                completedAt: new Date(),
                duration: Date.now() - startTime,
            });
            return;
        }
        // Get existing documentation
        const existingDocs = {};
        try {
            existingDocs.readme = await github_service_1.githubService.getFileContent(userId, owner, repoName, "README.md", branch);
        }
        catch {
            // README doesn't exist
        }
        try {
            existingDocs.changelog = await github_service_1.githubService.getFileContent(userId, owner, repoName, "CHANGELOG.md", branch);
        }
        catch {
            // CHANGELOG doesn't exist
        }
        // Build repo context
        const repoContext = {
            name: repo.fullName,
            language: repo.language || "unknown",
            structure: [], // Could be enhanced with repo structure analysis
        };
        // Trigger doc generation
        const generateDocsJobId = await (0, queue_1.addJob)(queue_1.generateDocsQueue, "generate_docs", {
            repoId,
            userId,
            webhookEventId,
            fileDiffs,
            commitMessage: commit.commit.message,
            repoContext,
            existingDocs,
            commitSha,
            branch,
        });
        // Update webhook event
        await WebhookEvent_1.WebhookEvent.findByIdAndUpdate(webhookEventId, {
            jobId: generateDocsJobId,
        });
        // Record analytics
        await analytics_service_1.analyticsService.recordMetric(userId, "webhooksReceived", 1);
        const duration = Date.now() - startTime;
        await Job_1.Job.findOneAndUpdate({ jobId: job.id }, {
            status: "completed",
            completedAt: new Date(),
            duration,
            output: { generateDocsJobId },
        });
        logger_1.logger.info("Commit processed successfully", {
            jobId: job.id,
            commitSha,
            duration,
        });
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Failed to process commit", {
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
        await analytics_service_1.analyticsService.updateSuccessRate(userId, false);
        throw error;
    }
}, {
    connection: redis_1.default,
    concurrency: 5,
});
exports.processCommitWorker.on("completed", (job) => {
    logger_1.logger.info("Process commit job completed", { jobId: job.id });
});
exports.processCommitWorker.on("failed", (job, err) => {
    logger_1.logger.error("Process commit job failed", {
        jobId: job?.id,
        error: err.message,
    });
});
//# sourceMappingURL=processCommit.worker.js.map