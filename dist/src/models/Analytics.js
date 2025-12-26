"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analytics = void 0;
const mongoose_1 = require("mongoose");
const AnalyticsSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
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
}, { timestamps: true });
AnalyticsSchema.index({ userId: 1, date: -1 });
AnalyticsSchema.index({ date: -1 });
exports.Analytics = (0, mongoose_1.model)("Analytics", AnalyticsSchema);
//# sourceMappingURL=Analytics.js.map