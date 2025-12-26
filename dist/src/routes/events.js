"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../config/env");
const logger_1 = require("../lib/logger");
const router = (0, express_1.Router)();
// SSE endpoint: /events/:repoId
router.get("/:repoId", async (req, res) => {
    const { repoId } = req.params;
    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    const sub = new ioredis_1.default(env_1.env.REDIS_URL);
    const channel = `events:${repoId}`;
    const handleMessage = (_channelName, message) => {
        try {
            res.write(`event: message\n`);
            res.write(`data: ${message}\n\n`);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            logger_1.logger.warn("Failed to write SSE message", { error: errorMessage });
        }
    };
    sub.subscribe(channel, (err, _count) => {
        if (err) {
            logger_1.logger.error("Failed to subscribe to events channel", {
                err: err.message,
            });
            res.status(500).end();
            return;
        }
        logger_1.logger.info("SSE client subscribed", { repoId, channel });
    });
    sub.on("message", handleMessage);
    req.on("close", () => {
        try {
            sub.unsubscribe(channel).catch(() => { });
            sub.disconnect();
        }
        catch { }
    });
});
exports.default = router;
//# sourceMappingURL=events.js.map