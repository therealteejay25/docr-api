"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../config/env");
const logger_1 = require("./logger");
// Create a single shared Redis client for the app.
// Accept REDIS_URL in the form `redis://:password@host:port` or `redis://host:port`.
const redis = new ioredis_1.default(env_1.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    // Add retry strategy for cloud Redis instability
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        logger_1.logger.debug("Redis retry attempt", { times, delay });
        return delay;
    },
    enableReadyCheck: false,
    enableOfflineQueue: true,
    // Increase timeout for slow cloud connections
    connectTimeout: 10000,
    commandTimeout: 30000, // Increased from 5000 to avoid timeouts on slow cloud Redis
    reconnectOnError: (err) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
            return true; // Reconnect on readonly error
        }
        return false;
    },
});
redis.on("connect", () => {
    logger_1.logger.info("Redis connecting");
});
redis.on("ready", () => {
    logger_1.logger.info("Redis ready");
});
redis.on("error", (err) => {
    logger_1.logger.error("Redis error", {
        message: err.message,
        code: err.code,
        errno: err.errno,
    });
});
redis.on("close", () => {
    logger_1.logger.warn("Redis connection closed");
});
redis.on("reconnecting", (info) => {
    logger_1.logger.info("Redis reconnecting", {
        attempt: info.attempt,
        delay: info.delay,
    });
});
exports.default = redis;
//# sourceMappingURL=redis.js.map