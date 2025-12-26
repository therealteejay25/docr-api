import redis from "./redis";
import { logger } from "./logger";

export async function publishEvent(repoId: string, event: any) {
  try {
    const channel = `events:${repoId}`;
    await redis.publish(channel, JSON.stringify(event));
    logger.info("Published event", { repoId, eventType: event.type });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to publish event", { error: errorMessage });
  }
}

export default null;
