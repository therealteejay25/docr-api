import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { aiAgentService } from "../services/ai-agent.service";
import type { StreamEvent } from "../services/ai-agent.service";
import { logger } from "../lib/logger";

export const chatWithAgent = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { message, context, stream } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Check if streaming is requested
    if (stream || req.headers.accept?.includes("text/event-stream")) {
      return handleStreamingChat(req, res);
    }

    const response = await aiAgentService.processRequest({
      userId: req.user.userId,
      message,
      context,
    });

    return res.json(response);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("AI agent request failed", {
      userId: req.user?.userId,
      error: errorMessage,
    });
    return res.status(500).json({
      error: "Failed to process request",
      message: errorMessage,
    });
  }
};

export const chatWithAgentStream = async (req: AuthRequest, res: Response) => {
  return handleStreamingChat(req, res);
};

async function handleStreamingChat(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { message, context } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Set up Server-Sent Events
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

    const sendEvent = (event: StreamEvent) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    // Process request with streaming
    await aiAgentService.processRequest(
      {
        userId: req.user.userId,
        message,
        context,
      },
      sendEvent
    );

    // Send completion event
    res.write(`data: ${JSON.stringify({
      type: "done",
      data: { message: "Stream completed" },
      timestamp: Date.now(),
    })}\n\n`);

    res.end();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Streaming chat failed", {
      userId: req.user?.userId,
      error: errorMessage,
    });

    res.write(`data: ${JSON.stringify({
      type: "error",
      data: {
        message: `I encountered an error: ${errorMessage}`,
        error: errorMessage,
      },
      timestamp: Date.now(),
    })}\n\n`);

    res.end();
  }
}

export const getAgentCapabilities = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const capabilities = {
      repositoryManagement: [
        "List connected repositories",
        "Get repository details",
        "Connect new repositories",
        "Disconnect repositories",
        "Update repository settings",
      ],
      githubOperations: [
        "Get file content",
        "Update files directly",
        "Create pull requests",
        "View commits",
        "Access GitHub API for urgent requests",
      ],
      documentation: [
        "Trigger documentation generation",
        "Monitor generation jobs",
        "View documentation history",
      ],
      credits: [
        "Check credit balance",
        "Add credits",
        "View transaction history",
      ],
      analytics: [
        "View usage statistics",
        "Get success rates",
        "View metrics over time",
      ],
      jobs: [
        "Monitor job status",
        "Get job details",
        "View job history",
      ],
    };

    return res.json({ capabilities });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to get capabilities", { error: errorMessage });
    return res.status(500).json({ error: "Failed to get capabilities" });
  }
};

