import { Schema, model } from "mongoose";

const AnalyticsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    metrics: {
      reposConnected: { type: Number, default: 0 },
      docsGenerated: { type: Number, default: 0 },
      creditsUsed: { type: Number, default: 0 },
      averageDiffSize: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
      failureRate: { type: Number, default: 0 },
      webhooksReceived: { type: Number, default: 0 },
      patchesApplied: { type: Number, default: 0 },
      prsCreated: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

AnalyticsSchema.index({ userId: 1, date: -1 });
AnalyticsSchema.index({ date: -1 });

export const Analytics = model("Analytics", AnalyticsSchema);

