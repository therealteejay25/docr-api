"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const mongoose_1 = require("mongoose");
const LogSchema = new mongoose_1.Schema({
    level: { type: String, enum: ["info", "warn", "error", "debug"], required: true },
    service: { type: String, required: true },
    message: { type: String, required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    repoId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Repo" },
    jobId: { type: String },
    webhookEventId: { type: mongoose_1.Schema.Types.ObjectId, ref: "WebhookEvent" },
    metadata: { type: mongoose_1.Schema.Types.Mixed },
    error: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true });
LogSchema.index({ createdAt: -1 });
LogSchema.index({ service: 1, createdAt: -1 });
LogSchema.index({ userId: 1, createdAt: -1 });
LogSchema.index({ repoId: 1, createdAt: -1 });
// TTL index to auto-delete logs older than 90 days
LogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
exports.Log = (0, mongoose_1.model)("Log", LogSchema);
//# sourceMappingURL=Log.js.map