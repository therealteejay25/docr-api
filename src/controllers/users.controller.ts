import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { logger } from "../lib/logger";

export const getUser = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(req.user.userId).select(
      "-githubToken -githubTokenIv -refreshToken"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        githubId: user.githubId,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to get user", {
      userId: req.user?.userId,
      error: errorMessage,
    });
    return res.status(500).json({ error: "Failed to get user" });
  }
};

export const getSettings = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(req.user.userId).select("settings");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      settings: user.settings || {
        emailNotifications: true,
        weeklyReport: true,
        autoGenerate: true,
        slackIntegration: false,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to get settings", {
      userId: req.user?.userId,
      error: errorMessage,
    });
    return res.status(500).json({ error: "Failed to get settings" });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { settings } = req.body;

    if (!settings || typeof settings !== "object") {
      return res.status(400).json({ error: "Invalid settings provided" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { settings },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      settings: user.settings,
      message: "Settings updated successfully",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to update settings", {
      userId: req.user?.userId,
      error: errorMessage,
    });
    return res.status(500).json({ error: "Failed to update settings" });
  }
};
