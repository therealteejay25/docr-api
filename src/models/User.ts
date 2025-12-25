import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    githubId: { type: Number, unique: true, sparse: true },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    avatarUrl: { type: String },
    accessToken: { type: String, required: false },
    refreshToken: { type: String, required: false },
    timeZone: { type: String, required: false },
    githubToken: { type: String, required: false }, // Encrypted
    githubTokenIv: { type: String }, // IV for encryption
    pricingPlan: {
      type: String,
      required: false,
      enum: ["free", "pro", "custom"],
      default: "free",
    },
    isActive: { type: Boolean, default: true },
    settings: {
      emailNotifications: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
      autoGenerate: { type: Boolean, default: true },
      slackIntegration: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ githubId: 1 });

export const User = model("User", UserSchema);
