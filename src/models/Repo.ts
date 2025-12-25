import { Schema, model } from "mongoose";

const RepoSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    githubRepoId: { type: Number, required: true },
    name: { type: String, required: true },
    fullName: { type: String, required: true },
    owner: { type: String, required: true },
    defaultBranch: { type: String, default: "main" },
    webhookId: { type: Number },
    webhookUrl: { type: String },
    webhookSecret: { type: String }, // Encrypted webhook secret
    webhookSecretIv: { type: String }, // IV for decryption
    isActive: { type: Boolean, default: true },
    settings: {
      autoUpdate: { type: Boolean, default: true },
      docTypes: {
        readme: { type: Boolean, default: true },
        changelog: { type: Boolean, default: false },
        apiDocs: { type: Boolean, default: false },
        architectureDocs: { type: Boolean, default: false },
      },
      branchPreference: { type: String, default: "main" },
      emailNotifications: { type: Boolean, default: true },
    },
    lastProcessedCommit: { type: String },
    lastProcessedSummary: { type: String },
    lastProcessedAt: { type: Date },
    language: { type: String },
    size: { type: Number },
  },
  { timestamps: true }
);

RepoSchema.index({ userId: 1, githubRepoId: 1 }, { unique: true });
RepoSchema.index({ userId: 1 });
// Index for webhook lookups (most common query path)
RepoSchema.index({ fullName: 1, isActive: 1 });

export const Repo = model("Repo", RepoSchema);
