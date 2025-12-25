import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { githubService } from "../services/github.service";
import { Repo } from "../models/Repo";
import { generateWebhookSecret } from "../utils/webhook";
import { encrypt } from "../utils/encryption";
import { logger } from "../lib/logger";
import { env } from "../config/env";

export const listRepos = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const repos = await githubService.getUserRepos(req.user.userId);
    res.json({ repos });
  } catch (error: any) {
    logger.error("Failed to list repos", { error: error.message });
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
};

export const connectRepo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { repoId, owner, name } = req.body;
    if (!repoId || !owner || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if repo already connected
    const existing = await Repo.findOne({
      userId: req.user.userId,
      githubRepoId: repoId,
    });
    if (existing) {
      return res.status(400).json({ error: "Repository already connected" });
    }

    // Get repo details
    const repoData = await githubService.getRepo(req.user.userId, owner, name);

    // Check write access
    const hasWriteAccess = await githubService.checkWriteAccess(
      req.user.userId,
      owner,
      name
    );
    if (!hasWriteAccess) {
      return res.status(403).json({ error: "Write access required" });
    }

    // Create webhook with per-repo secret
    const webhookSecret = generateWebhookSecret();
    const encryptedSecret = encrypt(webhookSecret);
    const webhookUrl = `${env.API_URL}/api/${env.API_VERSION}/webhooks/github`;
    const webhook = await githubService.createWebhook(
      req.user.userId,
      owner,
      name,
      webhookUrl,
      webhookSecret
    );

    // Save repo with encrypted webhook secret
    const repo = await Repo.create({
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

    res.json({ repo });
  } catch (error: any) {
    logger.error("Failed to connect repo", { 
      userId: req.user?.userId,
      error: error.message,
      status: error.status,
      response: error.response?.data 
    });
    
    // Provide more specific error messages
    if (error.status === 401 || error.status === 403) {
      return res.status(error.status).json({ 
        error: "GitHub authentication failed - check token has repo and admin:repo_hook scopes" 
      });
    }
    
    if (error.message?.includes("webhook")) {
      return res.status(422).json({ 
        error: `Webhook creation failed: ${error.message}. Ensure webhook URL is accessible.` 
      });
    }
    
    res.status(500).json({ error: "Failed to connect repository" });
  }
};

export const disconnectRepo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { repoId } = req.params;
    const repo = await Repo.findOne({
      _id: repoId,
      userId: req.user.userId,
    });

    if (!repo) {
      return res.status(404).json({ error: "Repository not found" });
    }

    // Delete webhook
    if (repo.webhookId) {
      try {
        await githubService.deleteWebhook(
          req.user.userId,
          repo.owner,
          repo.name,
          repo.webhookId
        );
      } catch (error: any) {
        logger.warn("Failed to delete webhook", { error: error.message });
      }
    }

    // Delete repo
    await Repo.findByIdAndDelete(repoId);

    res.json({ message: "Repository disconnected" });
  } catch (error: any) {
    logger.error("Failed to disconnect repo", { error: error.message });
    res.status(500).json({ error: "Failed to disconnect repository" });
  }
};

export const getRepos = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const repos = await Repo.find({ userId: req.user.userId, isActive: true });
    res.json({ repos });
  } catch (error: any) {
    logger.error("Failed to get repos", { error: error.message });
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
};

export const updateRepoSettings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { repoId } = req.params;
    const { settings } = req.body;

    const repo = await Repo.findOne({
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

    res.json({ repo });
  } catch (error: any) {
    logger.error("Failed to update repo settings", { error: error.message });
    res.status(500).json({ error: "Failed to update settings" });
  }
};

