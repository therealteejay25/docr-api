import { Schema, model } from "mongoose";

const WebhookEventSchema = new Schema(
  {
    repoId: { type: Schema.Types.ObjectId, ref: "Repo", required: true },
    eventType: { type: String, required: true, enum: ["push", "pull_request", "workflow_dispatch"] },
    githubDeliveryId: { type: String, required: true, unique: true },
    payload: { type: Schema.Types.Mixed, required: true },
    signature: { type: String },
    processed: { type: Boolean, default: false },
    processedAt: { type: Date },
    jobId: { type: String },
    error: { type: String },
  },
  { timestamps: true }
);

WebhookEventSchema.index({ repoId: 1, createdAt: -1 });
WebhookEventSchema.index({ processed: 1, createdAt: -1 });
WebhookEventSchema.index({ githubDeliveryId: 1 });

export const WebhookEvent = model("WebhookEvent", WebhookEventSchema);

