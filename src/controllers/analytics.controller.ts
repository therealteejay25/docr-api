import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { analyticsService } from "../services/analytics.service";
import { logger } from "../lib/logger";

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const days = parseInt(req.query.days as string) || 30;
    const analytics = await analyticsService.getAnalytics(req.user.userId, days);

    res.json({ analytics });
  } catch (error: any) {
    logger.error("Failed to get analytics", { error: error.message });
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

