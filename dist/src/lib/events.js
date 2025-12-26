"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishEvent = publishEvent;
const redis_1 = __importDefault(require("./redis"));
const logger_1 = require("./logger");
async function publishEvent(repoId, event) {
    try {
        const channel = `events:${repoId}`;
        await redis_1.default.publish(channel, JSON.stringify(event));
        logger_1.logger.info("Published event", { repoId, eventType: event.type });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Failed to publish event", { error: errorMessage });
    }
}
exports.default = null;
//# sourceMappingURL=events.js.map