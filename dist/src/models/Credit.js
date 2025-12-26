"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Credit = void 0;
const mongoose_1 = require("mongoose");
const CreditSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    balance: { type: Number, default: 0, min: 0 },
    totalUsed: { type: Number, default: 0 },
    totalAdded: { type: Number, default: 0 },
    lastResetAt: { type: Date },
    warningThreshold: { type: Number, default: 100 },
    transactions: [
        {
            amount: { type: Number, required: true },
            type: {
                type: String,
                enum: ["deduct", "add", "reset"],
                required: true,
            },
            reason: { type: String },
            jobId: { type: String },
            createdAt: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });
CreditSchema.index({ userId: 1 });
exports.Credit = (0, mongoose_1.model)("Credit", CreditSchema);
//# sourceMappingURL=Credit.js.map