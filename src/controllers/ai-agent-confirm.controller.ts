import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { logger } from "../lib/logger";

// This controller handles confirmation responses from the UI
export const handleConfirmation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { confirmationId, action, tool, args, modifiedArgs } = req.body;

    if (!confirmationId || !action) {
      return res.status(400).json({ error: "confirmationId and action are required" });
    }

    // Actions: "accept", "reject", "modify"
    if (!["accept", "reject", "modify"].includes(action)) {
      return res.status(400).json({ error: "Invalid action. Must be accept, reject, or modify" });
    }

    if (action === "reject") {
      return res.json({
        message: "Action cancelled. How else can I help you?",
        cancelled: true,
      });
    }

    // For accept or modify, we need to re-execute the tool
    // This would typically be handled by resuming the stream
    // For now, return success and let the frontend handle it
    return res.json({
      message: action === "accept" 
        ? "Proceeding with the action..." 
        : "Proceeding with your modifications...",
      action,
      tool,
      args: modifiedArgs || args,
    });
  } catch (error: any) {
    logger.error("Confirmation handling failed", {
      userId: req.user?.userId,
      error: error.message,
    });
    res.status(500).json({
      error: "Failed to process confirmation",
      message: error.message,
    });
  }
};

