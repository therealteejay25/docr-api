"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEvent = void 0;
const mongoose_1 = require("mongoose");
const WebhookEventSchema = new mongoose_1.Schema({
    repoId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Repo", required: true },
    eventType: { type: String, required: true, enum: ["push", "pull_request", "workflow_dispatch"] },
    githubDeliveryId: { type: String, required: true, unique: true },
    payload: { type: mongoose_1.Schema.Types.Mixed, required: true },
    signature: { type: String },
    processed: { type: Boolean, default: false },
    processedAt: { type: Date },
    jobId: { type: String },
    error: { type: String },
}, { timestamps: true });
WebhookEventSchema.index({ repoId: 1, createdAt: -1 });
WebhookEventSchema.index({ processed: 1, createdAt: -1 });
WebhookEventSchema.index({ githubDeliveryId: 1 });
exports.WebhookEvent = (0, mongoose_1.model)("WebhookEvent", WebhookEventSchema);
//# sourceMappingURL=WebhookEvent.js.map