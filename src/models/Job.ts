import { Schema, model } from "mongoose";

const JobSchema = new Schema(
  {
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
    repoId: { type: Schema.Types.ObjectId, ref: "Repo" },
    webhookEventId: { type: Schema.Types.ObjectId, ref: "WebhookEvent" },
    input: { type: Schema.Types.Mixed },
    output: { type: Schema.Types.Mixed },
    error: { type: String },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    startedAt: { type: Date },
    completedAt: { type: Date },
    duration: { type: Number },
  },
  { timestamps: true }
);

JobSchema.index({ jobId: 1 });
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ repoId: 1, createdAt: -1 });

export const Job = model("Job", JobSchema);

