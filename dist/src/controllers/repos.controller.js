"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRepoSettings = exports.getRepos = exports.disconnectRepo = exports.connectRepo = exports.listRepos = void 0;
const github_service_1 = require("../services/github.service");
const Repo_1 = require("../models/Repo");
const webhook_1 = require("../utils/webhook");
const encryption_1 = require("../utils/encryption");
const logger_1 = require("../lib/logger");
const env_1 = require("../config/env");
const listRepos = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const repos = await github_service_1.githubService.getUserRepos(req.user.userId);
        return res.json({ repos });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Failed to list repos", { error: errorMessage });
        return res.status(500).json({ error: "Failed to fetch repositories" });
    }
};
exports.listRepos = listRepos;
const connectRepo = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { repoId, owner, name } = req.body;
        if (!repoId || !owner || !name) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // Check if repo already connected
        const existing = await Repo_1.Repo.findOne({
            userId: req.user.userId,
            githubRepoId: repoId,
        });
        if (existing) {
            return res.status(400).json({ error: "Repository already connected" });
        }
        // Get repo details
        const repoData = await github_service_1.githubService.getRepo(req.user.userId, owner, name);
        // Check write access
        const hasWriteAccess = await github_service_1.githubService.checkWriteAccess(req.user.userId, owner, name);
        if (!hasWriteAccess) {
            return res.status(403).json({ error: "Write access required" });
        }
        // Create webhook with per-repo secret
        const webhookSecret = (0, webhook_1.generateWebhookSecret)();
        const encryptedSecret = (0, encryption_1.encrypt)(webhookSecret);
        const webhookUrl = `${env_1.env.API_URL}/api/${env_1.env.API_VERSION}/webhooks/github`;
        const webhook = await github_service_1.githubService.createWebhook(req.user.userId, owner, name, webhookUrl, webhookSecret);
        // Save repo with encrypted webhook secret
        const repo = await Repo_1.Repo.create({
            userId: req.user.userId,
            githubRepoId: repoId,
            name,
            fullName: `${owner}/${name}`,
            owner,
            defaultBranch: repoData.default_branch || "main",
            webhookId: webhook.id,
            webhookUrl: webhook.config.url,
            webhookSecret: encryptedSecret.encrypted,
            webhookSecretIv: encryptedSecret.iv,
            language: repoData.language,
            size: repoData.size,
            settings: {
                autoUpdate: true,
                docTypes: {
                    readme: true,
                    changelog: false,
                    apiDocs: false,
                    architectureDocs: false,
                },
                branchPreference: repoData.default_branch || "main",
                emailNotifications: true,
            },
        });
        return res.json({ repo });
    }
    catch (error) {
        const err = error;
        logger_1.logger.error("Failed to connect repo", {
            userId: req.user?.userId,
            error: err.message || "Unknown error",
            status: err.status,
            response: err.response?.data
        });
        // Provide more specific error messages
        if (err.status === 401 || err.status === 403) {
            return res.status(err.status).json({
                error: "GitHub authentication failed - check token has repo and admin:repo_hook scopes"
            });
        }
        if (err.message?.includes("webhook")) {
            return res.status(422).json({
                error: `Webhook creation failed: ${err.message}. Ensure webhook URL is accessible.`
            });
        }
        return res.status(500).json({ error: "Failed to connect repository" });
    }
};
exports.connectRepo = connectRepo;
const disconnectRepo = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { repoId } = req.params;
        const repo = await Repo_1.Repo.findOne({
            _id: repoId,
            userId: req.user.userId,
        });
        if (!repo) {
            return res.status(404).json({ error: "Repository not found" });
        }
        // Delete webhook
        if (repo.webhookId) {
            try {
                await github_service_1.githubService.deleteWebhook(req.user.userId, repo.owner, repo.name, repo.webhookId);
            }
            catch (error) {
                logger_1.logger.warn("Failed to delete webhook", { error: error.message });
            }
        }
        // Delete repo
        await Repo_1.Repo.findByIdAndDelete(repoId);
        return res.json({ message: "Repository disconnected" });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Failed to disconnect repo", { error: errorMessage });
        return res.status(500).json({ error: "Failed to disconnect repository" });
    }
};
exports.disconnectRepo = disconnectRepo;
const getRepos = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const repos = await Repo_1.Repo.find({ userId: req.user.userId, isActive: true });
        return res.json({ repos });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Failed to get repos", { error: errorMessage });
        return res.status(500).json({ error: "Failed to fetch repositories" });
    }
};
exports.getRepos = getRepos;
const updateRepoSettings = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { repoId } = req.params;
        const { settings } = req.body;
        const repo = await Repo_1.Repo.findOne({
            _id: repoId,
            userId: req.user.userId,
        });
        if (!repo) {
            return res.status(404).json({ error: "Repository not found" });
        }
        if (settings) {
            repo.settings = { ...repo.settings, ...settings };
            await repo.save();
        }
        return res.json({ repo });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Failed to update repo settings", { error: errorMessage });
        return res.status(500).json({ error: "Failed to update settings" });
    }
};
exports.updateRepoSettings = updateRepoSettings;
//# sourceMappingURL=repos.controller.js.map