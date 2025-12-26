"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const mongoose_1 = require("mongoose");
const JobSchema = new mongoose_1.Schema({
    jobId: { type: String, required: true, unique: true },
    jobType: {
        type: String,
        required: true,
        enum: ["process_commit", "generate_docs", "apply_patch", "send_email", "recompute_coverage"],
    },
    status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed", "dead-letter"],
        default: "pending",
    },
    repoId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Repo" },
    webhookEventId: { type: mongoose_1.Schema.Types.ObjectId, ref: "WebhookEvent" },
    input: { type: mongoose_1.Schema.Types.Mixed },
    output: { type: mongoose_1.Schema.Types.Mixed },
    error: { type: String },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    startedAt: { type: Date },
    completedAt: { type: Date },
    duration: { type: Number },
}, { timestamps: true });
JobSchema.index({ jobId: 1 });
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ repoId: 1, createdAt: -1 });
exports.Job = (0, mongoose_1.model)("Job", JobSchema);
//# sourceMappingURL=Job.js.map