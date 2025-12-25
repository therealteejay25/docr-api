import { Schema, model } from "mongoose";

const LogSchema = new Schema(
  {
    level: { type: String, enum: ["info", "warn", "error", "debug"], required: true },
    service: { type: String, required: true },
    message: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    repoId: { type: Schema.Types.ObjectId, ref: "Repo" },
    jobId: { type: String },
    webhookEventId: { type: Schema.Types.ObjectId, ref: "WebhookEvent" },
    metadata: { type: Schema.Types.Mixed },
    error: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

LogSchema.index({ createdAt: -1 });
LogSchema.index({ service: 1, createdAt: -1 });
LogSchema.index({ userId: 1, createdAt: -1 });
LogSchema.index({ repoId: 1, createdAt: -1 });

// TTL index to auto-delete logs older than 90 days
LogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export const Log = model("Log", LogSchema);

