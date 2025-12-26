"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
UserSchema.index({ email: 1 });
UserSchema.index({ githubId: 1 });
exports.User = (0, mongoose_1.model)("User", UserSchema);
//# sourceMappingURL=User.js.map