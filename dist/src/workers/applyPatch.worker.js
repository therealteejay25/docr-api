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
exports.applyPatchWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../lib/redis"));
const queue_1 = require("../lib/queue");
const writer_service_1 = require("../services/writer.service");
const diff_service_1 = require("../services/diff.service");
const github_service_1 = require("../services/github.service");
const Repo_1 = require("../models/Repo");
const User_1 = require("../models/User");
const Job_1 = require("../models/Job");
const logger_1 = require("../lib/logger");
const analytics_service_1 = require("../services/analytics.service");
exports.applyPatchWorker = new bullmq_1.Worker(queue_1.QUEUE_NAMES.APPLY_PATCH, async (job) => {
    const startTime = Date.now();
    const { repoId, userId, patches, summary, coverageScore, commitSha, branch, } = job.data;
    // Log full job data
    logger_1.logger.info("Apply patch job data", {
        jobId: job.id,
        fullData: JSON.stringify(job.data),
    });
    try {
        logger_1.logger.info("Applying patches", {
            jobId: job.id,
            repoId,
            patches: patches.length,
        });
        // Publish event: applying patches started
        try {
            const { publishEvent } = await Promise.resolve().then(() => __importStar(require("../lib/events")));
            await publishEvent(repoId, {
                type: "patch:applying",
                jobId: job.id,
                files: patches.map((p) => p.file),
                timestamp: Date.now(),
            });
        }
        catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error";
            logger_1.logger.warn("Failed to publish patch applying event", {
                error: errorMessage,
            });
        }
        await Job_1.Job.findOneAndUpdate({ jobId: job.id }, { status: "processing", startedAt: new Date() }, { upsert: true });
        const repo = await Repo_1.Repo.findById(repoId);
        if (!repo) {
            throw new Error("Repo not found");
        }
        const [owner, repoName] = repo.fullName.split("/");
        // Apply patches to files
        const filesToWrite = [];
        for (const patchData of patches) {
            try {
                // Determine if patch is raw content or unified diff
                const isUnifiedDiff = patchData.patch.includes("+++") ||
                    patchData.patch.includes("---") ||
                    patchData.patch.includes("@@");
                let newContent;
                if (isUnifiedDiff) {
                    // Apply unified diff format
                    let originalContent = "";
                    try {
                        originalContent = await github_service_1.githubService.getFileContent(userId, owner, repoName, patchData.file, branch);
                    }
                    catch {
                        // File doesn't exist, will create new
                        originalContent = "";
                    }
                    newContent = diff_service_1.diffService.applyPatch(originalContent, patchData.patch);
                }
                else {
                    // Treat as raw content (direct write)
                    newContent = patchData.patch;
                }
                filesToWrite.push({
                    path: patchData.file,
                    content: newContent,
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                logger_1.logger.error("Failed to apply patch", {
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
        logger_1.logger.info("Applying patches - about to write", {
            targetBranch,
            filesToWriteCount: filesToWrite.length,
            files: filesToWrite.map((f) => f.path),
        });
        const writeResult = await writer_service_1.writerService.writeFiles({
            userId,
            repoId,
            files: filesToWrite,
            message: `docs: ${summary}`,
            branch: targetBranch,
            createPR: false, // Direct push: createPR=false
        });
        logger_1.logger.info("Write result", { writeResult });
        // Publish write result
        try {
            const { publishEvent } = await Promise.resolve().then(() => __importStar(require("../lib/events")));
            await publishEvent(repoId, {
                type: "patch:written",
                jobId: job.id,
                commitSha: writeResult.commitSha,
                prUrl: writeResult.prUrl,
                commitUrl: writeResult.commitUrl,
                timestamp: Date.now(),
            });
        }
        catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error";
            logger_1.logger.warn("Failed to publish patch written event", {
                error: errorMessage,
            });
        }
        // Update repo last processed. Prefer the commit SHA produced by the writer
        // (the new commit created by this job). Fallback to the triggering commit SHA.
        const newLastProcessed = writeResult.commitSha || commitSha;
        await Repo_1.Repo.findByIdAndUpdate(repoId, {
            lastProcessedCommit: newLastProcessed,
            lastProcessedAt: new Date(),
            lastProcessedSummary: summary,
        });
        // Record analytics
        await analytics_service_1.analyticsService.recordMetric(userId, "patchesApplied", filesToWrite.length);
        if (writeResult.prUrl) {
            await analytics_service_1.analyticsService.recordMetric(userId, "prsCreated", 1);
        }
        else if (writeResult.commitSha) {
            await analytics_service_1.analyticsService.recordMetric(userId, "commitsPushed", 1);
        }
        // Trigger email notification
        const user = await User_1.User.findById(userId);
        if (user && repo.settings?.emailNotifications) {
            await (0, queue_1.addJob)(queue_1.sendEmailQueue, "send_email", {
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
        await Job_1.Job.findOneAndUpdate({ jobId: job.id }, {
            status: "completed",
            completedAt: new Date(),
            duration,
            output: {
                filesWritten: filesToWrite.length,
                commitSha: writeResult.commitSha,
                prUrl: writeResult.prUrl,
                commitUrl: writeResult.commitUrl,
            },
        });
        await analytics_service_1.analyticsService.updateSuccessRate(userId, true);
        logger_1.logger.info("Patches applied successfully", {
            jobId: job.id,
            filesWritten: filesToWrite.length,
            duration,
        });
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Failed to apply patches", {
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
        // Send error notification
        try {
            const user = await User_1.User.findById(userId);
            const repo = await Repo_1.Repo.findById(repoId);
            if (user && repo) {
                await (0, queue_1.addJob)(queue_1.sendEmailQueue, "send_error_email", {
                    userId,
                    email: user.email,
                    repoName: repo.fullName,
                    error: errorMessage,
                    jobId: job.id,
                });
            }
        }
        catch (emailError) {
            const emailErrorMessage = emailError instanceof Error ? emailError.message : "Unknown error";
            logger_1.logger.error("Failed to send error email", {
                error: emailErrorMessage,
            });
        }
        await analytics_service_1.analyticsService.updateSuccessRate(userId, false);
        throw error;
    }
}, {
    connection: redis_1.default,
    concurrency: 3,
});
exports.applyPatchWorker.on("completed", (job) => {
    logger_1.logger.info("Apply patch job completed", { jobId: job.id });
});
exports.applyPatchWorker.on("failed", (job, err) => {
    logger_1.logger.error("Apply patch job failed", {
        jobId: job?.id,
        error: err.message,
    });
});
//# sourceMappingURL=applyPatch.worker.js.map