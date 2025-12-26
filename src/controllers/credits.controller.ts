import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { creditsService } from "../services/credits.service";
import { logger } from "../lib/logger";

export const getCredits = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const balance = await creditsService.getBalance(req.user.userId);
    const isBelowThreshold = await creditsService.isBelowThreshold(
      req.user.userId
    );

    return res.json({
      balance,
      isBelowThreshold,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to get credits", { error: errorMessage });
    return res.status(500).json({ error: "Failed to fetch credits" });
  }
};

export const addCredits = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    await creditsService.addCredits(req.user.userId, amount, "Manual top-up");
    const balance = await creditsService.getBalance(req.user.userId);

    return res.json({
      balance,
      message: "Credits added successfully",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to add credits", { error: errorMessage });
    return res.status(500).json({ error: "Failed to add credits" });
  }
};
