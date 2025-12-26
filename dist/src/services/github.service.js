"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubService = exports.GitHubService = void 0;
const rest_1 = require("@octokit/rest");
const User_1 = require("../models/User");
const encryption_1 = require("../utils/encryption");
const logger_1 = require("../lib/logger");
class GitHubService {
    /**
     * Get authenticated Octokit instance for a user
     */
    async getOctokit(userId) {
        const user = await User_1.User.findById(userId);
        if (!user || !user.githubToken || !user.githubTokenIv) {
            throw new Error("User not found or GitHub token missing");
        }
        const token = (0, encryption_1.decrypt)(user.githubToken, user.githubTokenIv);
        return new rest_1.Octokit({ auth: token });
    }
    /**
     * Get a single commit by sha
     */
    async getCommit(userId, owner, repo, sha) {
        try {
            const octokit = await this.getOctokit(userId);
            const response = await octokit.repos.getCommit({ owner, repo, ref: sha });
            return response.data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            logger_1.logger.error("Failed to get commit", {
                userId,
                owner,
                repo,
                sha,
                error: errorMessage,
            });
            throw error;
        }
    }
    /**
     * Get the diff between two commits (parent -> head)
     */
    async getCommitDiff(userId, owner, repo, base, head) {
        try {
            const octokit = await this.getOctokit(userId);
            // Use compareCommits to get files and patches between two SHAs
            const response = await octokit.repos.compareCommits({
                owner,
                repo,
                base,
                head,
            });
            return response.data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            logger_1.logger.error("Failed to get commit diff", {
                userId,
                owner,
                repo,
                base,
                head,
                error: errorMessage,
            });
            throw error;
        }
    }
    /**
     * Get file content from a repository
     */
    async getFileContent(userId, owner, repo, path, branch) {
        try {
            const octokit = await this.getOctokit(userId);
            const response = await octokit.repos.getContent({
                owner,
                repo,
                path,
                ref: branch,
            });
            if (Array.isArray(response.data)) {
                throw new Error("Path is a directory, not a file");
            }
            if (response.data.type !== "file") {
                throw new Error("Path is not a file");
            }
            // GitHub returns base64 encoded content
            const content = Buffer.from(response.data.content, "base64").toString("utf-8");
            return content;
        }
        catch (error) {
            const err = error;
            // Don't log 404 errors as they are expected when files don't exist
            if (err.status !== 404) {
                logger_1.logger.error("Failed to get file content", {
                    userId,
                    owner,
                    repo,
                    path,
                    error: err.message || "Unknown error",
                });
            }
            throw error;
        }
    }
    /**
     * Update or create a file in the repository
     */
    async updateFile(userId, owner, repo, path, message, content, sha, branch) {
        try {
            const octokit = await this.getOctokit(userId);
            const params = {
                owner,
                repo,
                path,
                message,
                content: Buffer.from(content).toString("base64"),
                branch,
            };
            // If SHA is provided, it's an update; otherwise, create new file
            if (sha) {
                params.sha = sha;
            }
            const response = await octokit.repos.createOrUpdateFileContents(params);
            // Log the full response for debugging
            try {
                const respStr = JSON.stringify(response.data);
                logger_1.logger.info("File updated/created successfully", {
                    userId,
                    owner,
                    repo,
                    path,
                    sha: response.data.commit.sha,
                    rawResponse: respStr.slice(0, 2000),
                });
                // Also output full response to console for immediate visibility
                // eslint-disable-next-line no-console
                console.log("[Octokit updateFile response]", respStr);
            }
            catch (e) {
                logger_1.logger.info("File updated/created successfully (logging failed to stringify full response)", {
                    userId,
                    owner,
                    repo,
                    path,
                });
            }
            return response.data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            logger_1.logger.error("Failed to update file", {
                userId,
                owner,
                repo,
                path,
                error: errorMessage,
            });
            throw error;
        }
    }
    /**
     * Create a new branch from an existing branch
     */
    async createBranch(userId, owner, repo, newBranch, baseBranch = "main") {
        try {
            const octokit = await this.getOctokit(userId);
            // Get the SHA of the base branch
            const baseRef = await octokit.git.getRef({
                owner,
                repo,
                ref: `heads/${baseBranch}`,
            });
            // Create new branch
            await octokit.git.createRef({
                owner,
                repo,
                ref: `refs/heads/${newBranch}`,
                sha: baseRef.data.object.sha,
            });
            logger_1.logger.info("Branch created successfully", {
                userId,
                owner,
                repo,
                newBranch,
                baseBranch,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            logger_1.logger.error("Failed to create branch", {
                userId,
                owner,
                repo,
                newBranch,
                baseBranch,
                error: errorMessage,
            });
            throw error;
        }
    }
    /**
     * Create a pull request
     */
    async createPullRequest(userId, owner, repo, title, body, head, base = "main") {
        try {
            const octokit = await this.getOctokit(userId);
            const response = await octokit.pulls.create({
                owner,
                repo,
                title,
                body,
                head,
                base,
            });
            logger_1.logger.info("Pull request created successfully", {
                userId,
                owner,
                repo,
                prNumber: response.data.number,
                prUrl: response.data.html_url,
            });
            return response.data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            logger_1.logger.error("Failed to create pull request", {
                userId,
                owner,
                repo,
                title,
                head,
                base,
                error: errorMessage,
            });
            throw error;
        }
    }
    /**
     * Get repository information
     */
    async getRepository(userId, owner, repo) {
        try {
            const octokit = await this.getOctokit(userId);
            const response = await octokit.repos.get({
                owner,
                repo,
            });
            return response.data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            logger_1.logger.error("Failed to get repository info", {
                userId,
                owner,
                repo,
                error: errorMessage,
            });
            throw error;
        }
    }
    /**
     * Get commits for a repository
     */
    async getCommits(userId, owner, repo, branch, perPage = 10) {
        try {
            const octokit = await this.getOctokit(userId);
            const response = await octokit.repos.listCommits({
                owner,
                repo,
                sha: branch,
                per_page: perPage,
            });
            return response.data.map((commit) => ({
                sha: commit.sha,
                message: commit.commit.message,
                author: commit.commit.author?.name,
                date: commit.commit.author?.date,
                url: commit.html_url,
            }));
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            logger_1.logger.error("Failed to get commits", {
                userId,
                owner,
                repo,
                branch,
                error: errorMessage,
            });
            throw error;
        }
    }
    /**
     * Get repository structure (files and directories)
     */
    async getRepositoryStructure(userId, owner, repo, path = "", branch) {
        try {
            const octokit = await this.getOctokit(userId);
            const response = await octokit.repos.getContent({
                owner,
                repo,
                path,
                ref: branch,
            });
            return Array.isArray(response.data) ? response.data : [response.data];
        }
        catch (error) {
            const err = error;
            // Don't log 404 for missing paths
            if (err.status !== 404) {
                logger_1.logger.error("Failed to get repository structure", {
                    userId,
                    owner,
                    repo,
                    path,
                    error: err.message || "Unknown error",
                });
            }
            throw error;
        }
    }
    /**
     * Get user's repositories
     */
    async getUserRepos(userId) {
        try {
            const octokit = await this.getOctokit(userId);
            const response = await octokit.repos.listForAuthenticatedUser({
                per_page: 100,
                sort: "updated",
            });
            return response.data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            logger_1.logger.error("Failed to get user repos", {
                userId,
                error: errorMessage,
            });
            throw error;
        }
    }
    /**
     * Get repository information (alias for getRepository)
     */
    async getRepo(userId, owner, name) {
        return this.getRepository(userId, owner, name);
    }
    /**
     * Check if user has write access to a repository
     */
    async checkWriteAccess(userId, owner, repo) {
        try {
            const octokit = await this.getOctokit(userId);
            const response = await octokit.repos.get({
                owner,
                repo,
            });
            // Check permissions
            return response.data.permissions?.push === true || response.data.permissions?.admin === true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            logger_1.logger.error("Failed to check write access", {
                userId,
                owner,
                repo,
                error: errorMessage,
            });
            return false;
        }
    }
    /**
     * Create a webhook for a repository
     */
    async createWebhook(userId, owner, repo, url, secret) {
        try {
            const octokit = await this.getOctokit(userId);
            const response = await octokit.repos.createWebhook({
                owner,
                repo,
                config: {
                    url,
                    content_type: "json",
                    secret,
                },
                events: ["push", "pull_request"],
                active: true,
            });
            return response.data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            logger_1.logger.error("Failed to create webhook", {
                userId,
                owner,
                repo,
                url,
                error: errorMessage,
            });
            throw error;
        }
    }
    /**
     * Delete a webhook from a repository
     */
    async deleteWebhook(userId, owner, repo, webhookId) {
        try {
            const octokit = await this.getOctokit(userId);
            await octokit.repos.deleteWebhook({
                owner,
                repo,
                hook_id: webhookId,
            });
            logger_1.logger.info("Webhook deleted successfully", {
                userId,
                owner,
                repo,
                webhookId,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            logger_1.logger.error("Failed to delete webhook", {
                userId,
                owner,
                repo,
                webhookId,
                error: errorMessage,
            });
            throw error;
        }
    }
}
exports.GitHubService = GitHubService;
exports.githubService = new GitHubService();
//# sourceMappingURL=github.service.js.map