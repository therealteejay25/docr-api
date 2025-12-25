import IORedis from "ioredis";
import { env } from "../config/env";
import { logger } from "./logger";

// Create a single shared Redis client for the app.
// Accept REDIS_URL in the form `redis://:password@host:port` or `redis://host:port`.
const redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  // Add retry strategy for cloud Redis instability
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    logger.debug("Redis retry attempt", { times, delay });
    return delay;
  },
  enableReadyCheck: false,
  enableOfflineQueue: true,
  // Increase timeout for slow cloud connections
  connectTimeout: 10000,
  commandTimeout: 30000, // Increased from 5000 to avoid timeouts on slow cloud Redis
  reconnectOnError: (err: any) => {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true; // Reconnect on readonly error
    }
    return false;
  },
});

redis.on("connect", () => {
  logger.info("Redis connecting");
});

redis.on("ready", () => {
  logger.info("Redis ready");
});

redis.on("error", (err: any) => {
  logger.error("Redis error", {
    message: err.message,
    code: err.code,
    errno: err.errno,
  });
});

redis.on("close", () => {
  logger.warn("Redis connection closed");
});

redis.on("reconnecting", (info: any) => {
  logger.info("Redis reconnecting", {
    attempt: info.attempt,
    delay: info.delay,
  });
});

export default redis;
