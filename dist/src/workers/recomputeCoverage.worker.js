"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recomputeCoverageWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../lib/redis"));
const queue_1 = require("../lib/queue");
const github_service_1 = require("../services/github.service");
const Repo_1 = require("../models/Repo");
const logger_1 = require("../lib/logger");
exports.recomputeCoverageWorker = new bullmq_1.Worker(queue_1.QUEUE_NAMES.RECOMPUTE_COVERAGE, async (job) => {
    const { repoId, userId } = job.data;
    const startTime = Date.now();
    try {
        logger_1.logger.info("Recomputing coverage", { jobId: job.id, repoId });
        const repo = await Repo_1.Repo.findById(repoId);
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
                await github_service_1.githubService.getFileContent(userId, owner, repoName, docFile, repo.defaultBranch);
                foundDocs++;
            }
            catch {
                // File doesn't exist
            }
        }
        // Calculate coverage score (simplified)
        const coverageScore = Math.min(1, foundDocs / docFiles.length);
        const duration = Date.now() - startTime;
        logger_1.logger.info("Coverage recomputed", {
            jobId: job.id,
            coverageScore,
            duration,
        });
        return { coverageScore };
    }
    catch (error) {
        const duration = Date.now() - startTime;
        logger_1.logger.error("Failed to recompute coverage", {
            jobId: job.id,
            error: error.message,
            duration,
        });
        throw error;
    }
}, {
    connection: redis_1.default,
    concurrency: 2, // Lower concurrency for long-running jobs
});
exports.recomputeCoverageWorker.on("completed", (job) => {
    logger_1.logger.info("Recompute coverage job completed", { jobId: job.id });
});
exports.recomputeCoverageWorker.on("failed", (job, err) => {
    logger_1.logger.error("Recompute coverage job failed", { jobId: job?.id, error: err.message });
});
//# sourceMappingURL=recomputeCoverage.worker.js.map