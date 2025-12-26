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
Object.defineProperty(exports, "__esModule", { value: true });
exports.writerService = exports.WriterService = void 0;
const github_service_1 = require("./github.service");
const logger_1 = require("../lib/logger");
const Repo_1 = require("../models/Repo");
class WriterService {
    /**
     * Write files directly to GitHub
     */
    async writeFiles(options) {
        try {
            const repo = await Repo_1.Repo.findById(options.repoId);
            if (!repo) {
                throw new Error("Repo not found");
            }
            const [owner, repoName] = repo.fullName.split("/");
            const branch = options.branch ||
                repo.settings?.branchPreference ||
                repo.defaultBranch ||
                "main";
            logger_1.logger.info("Writing files to GitHub", {
                repoId: options.repoId,
                owner,
                repoName,
                branch,
                fileCount: options.files.length,
                createPR: options.createPR,
            });
            // If caller requests direct push, attempt direct write to target branch
            if (options.createPR === false) {
                const direct = await this.writeFilesDirect({
                    ...options,
                    owner,
                    repoName,
                    branch,
                });
                const commitSha = direct.commitSha;
                const commitUrl = commitSha
                    ? `https://github.com/${owner}/${repoName}/commit/${commitSha}`
                    : undefined;
                logger_1.logger.info("Direct write result", {
                    directResult: direct,
                    commitSha,
                    commitUrl,
                });
                return {
                    success: true,
                    commitSha,
                    commitUrl,
                };
            }
            // Default behavior: create PR with changes
            return await this.createPRWithChanges({
                ...options,
                owner,
                repoName,
                branch,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            logger_1.logger.error("Failed to write files", {
                repoId: options.repoId,
                error: errorMessage,
            });
            throw error;
        }
    }
    // Write files directly (not currently used - always create PR instead)
    async writeFilesDirect(options) {
        try {
            const results = [];
            for (const file of options.files) {
                try {
                    // Get current file SHA if exists
                    let sha = file.sha;
                    if (!sha) {
                        try {
                            await github_service_1.githubService.getFileContent(options.userId, options.owner, options.repoName, file.path, options.branch);
                            // File exists, need to get SHA
                            const { Octokit } = await Promise.resolve().then(() => __importStar(require("@octokit/rest")));
                            const user = await Promise.resolve().then(() => __importStar(require("../models/User"))).then((m) => m.User.findById(options.userId));
                            if (user && user.githubToken && user.githubTokenIv) {
                                const { decrypt } = await Promise.resolve().then(() => __importStar(require("../utils/encryption")));
                                const token = decrypt(user.githubToken, user.githubTokenIv);
                                const octokit = new Octokit({ auth: token });
                                const { data } = await octokit.repos.getContent({
                                    owner: options.owner,
                                    repo: options.repoName,
                                    path: file.path,
                                    ref: options.branch,
                                });
                                if (!Array.isArray(data) && data.type === "file") {
                                    sha = data.sha;
                                }
                            }
                        }
                        catch {
                            // File doesn't exist, will create new
                            sha = undefined;
                        }
                    }
                    const result = await github_service_1.githubService.updateFile(options.userId, options.owner, options.repoName, file.path, options.message, file.content, sha || "", options.branch);
                    results.push(result);
                    // Log each file update result to console for visibility
                    try {
                        // eslint-disable-next-line no-console
                        console.log("[writeFilesDirect update result]", JSON.stringify(result));
                        logger_1.logger.info("writeFilesDirect update result", {
                            path: file.path,
                            result: JSON.stringify(result).slice(0, 2000),
                        });
                    }
                    catch (e) {
                        logger_1.logger.warn("Failed to log writeFilesDirect update result", {
                            path: file.path,
                        });
                    }
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "Unknown error";
                    logger_1.logger.error("Failed to write file", {
                        userId: options.userId,
                        repoId: options.repoId,
                        path: file.path,
                        error: errorMessage,
                    });
                    throw error;
                }
            }
            return {
                success: true,
                commitSha: results[results.length - 1]?.commit?.sha,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            logger_1.logger.error("Failed to write files directly", {
                userId: options.userId,
                repoId: options.repoId,
                error: errorMessage,
            });
            throw error;
        }
    }
    /**
     * Create PR with changes
     */
    async createPRWithChanges(options) {
        try {
            const prBranch = `docr-update-${Date.now()}`;
            // Create branch
            await github_service_1.githubService.createBranch(options.userId, options.owner, options.repoName, prBranch, options.branch);
            // Write files to PR branch
            for (const file of options.files) {
                let sha = file.sha;
                if (!sha) {
                    try {
                        await github_service_1.githubService.getFileContent(options.userId, options.owner, options.repoName, file.path, options.branch);
                        // Get SHA
                        const { Octokit } = await Promise.resolve().then(() => __importStar(require("@octokit/rest")));
                        const user = await Promise.resolve().then(() => __importStar(require("../models/User"))).then((m) => m.User.findById(options.userId));
                        if (user && user.githubToken && user.githubTokenIv) {
                            const { decrypt } = await Promise.resolve().then(() => __importStar(require("../utils/encryption")));
                            const token = decrypt(user.githubToken, user.githubTokenIv);
                            const octokit = new Octokit({ auth: token });
                            const { data } = await octokit.repos.getContent({
                                owner: options.owner,
                                repo: options.repoName,
                                path: file.path,
                                ref: options.branch,
                            });
                            if (!Array.isArray(data) && data.type === "file") {
                                sha = data.sha;
                            }
                        }
                    }
                    catch {
                        sha = undefined;
                    }
                }
                await github_service_1.githubService.updateFile(options.userId, options.owner, options.repoName, file.path, options.message, file.content, sha || "", prBranch);
            }
            // Create PR
            const pr = await github_service_1.githubService.createPullRequest(options.userId, options.owner, options.repoName, options.message, `Automated documentation update by Docr.\n\n${options.message}`, prBranch, options.branch);
            // Log full PR response
            logger_1.logger.info("PR created successfully", {
                userId: options.userId,
                owner: options.owner,
                repo: options.repoName,
                prData: JSON.stringify(pr),
            });
            return {
                success: true,
                prUrl: pr.html_url,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            logger_1.logger.error("Failed to create PR", {
                userId: options.userId,
                owner: options.owner,
                repo: options.repoName,
                error: errorMessage,
            });
            throw error;
        }
    }
}
exports.WriterService = WriterService;
exports.writerService = new WriterService();
//# sourceMappingURL=writer.service.js.map