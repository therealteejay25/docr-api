import { Router, Request, Response } from "express";
import IORedis from "ioredis";
import { env } from "../config/env";
import { logger } from "../lib/logger";

const router = Router();

// SSE endpoint: /events/:repoId
router.get("/:repoId", async (req: Request, res: Response) => {
  const { repoId } = req.params;

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const sub = new IORedis(env.REDIS_URL);

  const channel = `events:${repoId}`;

  const handleMessage = (_channelName: string, message: string) => {
    try {
      res.write(`event: message\n`);
      res.write(`data: ${message}\n\n`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logger.warn("Failed to write SSE message", { error: errorMessage });
    }
  };

  sub.subscribe(channel, (err, _count) => {
    if (err) {
      logger.error("Failed to subscribe to events channel", {
        err: err.message,
      });
      res.status(500).end();
      return;
    }
    logger.info("SSE client subscribed", { repoId, channel });
  });

  sub.on("message", handleMessage);

  req.on("close", () => {
    try {
      sub.unsubscribe(channel).catch(() => {});
      sub.disconnect();
    } catch {}
  });
});

export default router;
