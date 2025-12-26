"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGitHubWebhook = void 0;
const webhook_1 = require("../utils/webhook");
const WebhookEvent_1 = require("../models/WebhookEvent");
const Repo_1 = require("../models/Repo");
const queue_1 = require("../lib/queue");
const encryption_1 = require("../utils/encryption");
const logger_1 = require("../lib/logger");
const env_1 = require("../config/env");
const handleGitHubWebhook = async (req, res) => {
    const startTime = Date.now();
    try {
        const signature = req.headers["x-hub-signature-256"];
        const deliveryId = req.headers["x-github-delivery"];
        const eventType = req.headers["x-github-event"];
        if (!deliveryId || !eventType) {
            return res.status(400).json({ error: "Missing webhook headers" });
        }
        // Find repo first to get its webhook secret
        const repoFullName = req.body.repository?.full_name;
        if (!repoFullName) {
            return res.status(400).json({ error: "Repository not found in payload" });
        }
        const repo = await Repo_1.Repo.findOne({ fullName: repoFullName, isActive: true });
        if (!repo) {
            logger_1.logger.info("Webhook received for unconnected repo", { repoFullName });
            return res.status(200).json({ message: "Repository not connected" });
        }
        // Get webhook secret (per-repo or fallback to global)
        let webhookSecret;
        if (repo.webhookSecret && repo.webhookSecretIv) {
            // Use per-repo encrypted secret
            webhookSecret = (0, encryption_1.decrypt)(repo.webhookSecret, repo.webhookSecretIv);
        }
        else {
            // Fallback to global secret for backward compatibility
            webhookSecret =
                env_1.env.GITHUB_WEBHOOK_SECRET || "default-secret-change-in-production";
            logger_1.logger.warn("Using global webhook secret for repo", {
                repoId: repo._id,
                repoFullName,
            });
        }
        // Verify signature
        const payload = JSON.stringify(req.body);
        const isValid = (0, webhook_1.verifyWebhookSignature)(payload, signature, webhookSecret);
        if (!isValid) {
            logger_1.logger.warn("Invalid webhook signature", {
                deliveryId,
                repoId: repo._id,
            });
            return res.status(401).json({ error: "Invalid signature" });
        }
        // Log full webhook payload for debugging
        logger_1.logger.info("Webhook payload received", {
            deliveryId,
            eventType,
            repoFullName,
            fullPayload: JSON.stringify(req.body),
        });
        // Check if auto-update is enabled
        if (!repo.settings?.autoUpdate) {
            logger_1.logger.info("Auto-update disabled for repo", { repoId: repo._id });
            return res.status(200).json({ message: "Auto-update disabled" });
        }
        // Save webhook event
        const webhookEvent = await WebhookEvent_1.WebhookEvent.create({
            repoId: repo._id,
            eventType,
            githubDeliveryId: deliveryId,
            payload: req.body,
            signature,
        });
        // Process based on event type
        if (eventType === "push") {
            const commits = req.body.commits || [];
            const branch = req.body.ref?.replace("refs/heads/", "");
            // Ignore pushes to our automated update branches to avoid feedback loops
            if (branch && branch.startsWith("docr-update-")) {
                logger_1.logger.info("Ignoring push to automated branch", { branch });
                return res
                    .status(200)
                    .json({ message: "Ignored automated branch push" });
            }
            if (commits.length === 0) {
                return res.status(200).json({ message: "No commits to process" });
            }
            // Ignore pushes coming from bots or our own automation to avoid feedback loops
            const senderType = req.body.sender?.type;
            const senderLogin = req.body.sender?.login;
            const allCommitsFromBot = commits.every((c) => {
                const author = c.author || {};
                const name = (author.name || "").toString().toLowerCase();
                const email = (author.email || "").toString().toLowerCase();
                return (name.includes("bot") ||
                    name.includes("docr") ||
                    email.includes("noreply") ||
                    email.includes("no-reply"));
            });
            if (senderType === "Bot" ||
                allCommitsFromBot ||
                (senderLogin && senderLogin.toLowerCase().includes("docr"))) {
                logger_1.logger.info("Ignoring bot-generated push to avoid loop", {
                    senderType,
                    senderLogin,
                });
                return res.status(200).json({ message: "Ignored bot push" });
            }
            // Process each commit
            for (const commit of commits) {
                // Ignore commits that look auto-generated by our system or similar bots
                const message = (commit.message || "").toString().toLowerCase();
                if (message.includes("auto-generated") ||
                    message.includes("auto generated") ||
                    message.includes("docs: auto-generated") ||
                    message.includes("auto-generated documentation")) {
                    logger_1.logger.info("Ignoring auto-generated commit by message", {
                        commitSha: commit.id,
                        message: commit.message,
                        repoId: repo._id,
                    });
                    continue;
                }
                // Skip if we've already processed this commit for this repo
                if (repo.lastProcessedCommit &&
                    repo.lastProcessedCommit === commit.id) {
                    logger_1.logger.info("Skipping already-processed commit", {
                        commitSha: commit.id,
                        repoId: repo._id,
                    });
                    continue;
                }
                // Use commit SHA as jobId so duplicate webhook deliveries don't cause multiple runs
                const jobId = await (0, queue_1.addJob)(queue_1.processCommitQueue, "process_commit", {
                    webhookEventId: webhookEvent._id.toString(),
                    repoId: repo._id.toString(),
                    userId: repo.userId.toString(),
                    commitSha: commit.id,
                    branch,
                }, { jobId: commit.id });
                await WebhookEvent_1.WebhookEvent.findByIdAndUpdate(webhookEvent._id, {
                    jobId,
                });
            }
        }
        else if (eventType === "pull_request") {
            // Handle PR events if needed
            logger_1.logger.info("PR event received", {
                repoId: repo._id,
                action: req.body.action,
            });
        }
        const duration = Date.now() - startTime;
        logger_1.logger.info("Webhook processed", {
            deliveryId,
            eventType,
            repoId: repo._id,
            duration,
        });
        // Always return 200 immediately
        return res.status(200).json({ message: "Webhook received" });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Webhook processing failed", {
            error: errorMessage,
            duration: Date.now() - startTime,
        });
        // Still return 200 to prevent GitHub retries
        return res.status(200).json({ error: "Processing failed, will retry" });
    }
};
exports.handleGitHubWebhook = handleGitHubWebhook;
//# sourceMappingURL=webhooks.controller.js.map