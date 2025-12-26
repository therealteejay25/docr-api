"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditsService = exports.CreditsService = void 0;
const Credit_1 = require("../models/Credit");
const logger_1 = require("../lib/logger");
class CreditsService {
    /**
     * Calculate credit cost for an operation
     */
    calculateCost(repoSize, filesTouched, tokensUsed) {
        const baseCost = 10;
        const repoSizeMultiplier = Math.ceil(repoSize / 1000); // 1 credit per 1000 lines
        const filesTouchedMultiplier = filesTouched * 2; // 2 credits per file
        const tokenMultiplier = Math.ceil(tokensUsed / 1000); // 1 credit per 1000 tokens
        return baseCost + repoSizeMultiplier + filesTouchedMultiplier + tokenMultiplier;
    }
    /**
     * Get or create credit record for user
     */
    async getOrCreateCredits(userId) {
        let credits = await Credit_1.Credit.findOne({ userId });
        if (!credits) {
            credits = await Credit_1.Credit.create({
                userId,
                balance: 1000, // Free tier starting credits
                totalUsed: 0,
                totalAdded: 1000,
            });
        }
        return credits;
    }
    /**
     * Deduct credits from user account
     */
    async deductCredits(userId, amount, reason, jobId) {
        try {
            const credits = await this.getOrCreateCredits(userId);
            if (credits.balance < amount) {
                return {
                    success: false,
                    balance: credits.balance,
                    message: "Insufficient credits",
                };
            }
            credits.balance -= amount;
            credits.totalUsed += amount;
            credits.transactions.push({
                amount: -amount,
                type: "deduct",
                reason,
                jobId,
            });
            await credits.save();
            logger_1.logger.info("Credits deducted", { userId, amount, reason, balance: credits.balance });
            return { success: true, balance: credits.balance };
        }
        catch (error) {
            logger_1.logger.error("Failed to deduct credits", { userId, amount, error: error.message });
            throw error;
        }
    }
    /**
     * Add credits to user account
     */
    async addCredits(userId, amount, reason) {
        try {
            const credits = await this.getOrCreateCredits(userId);
            credits.balance += amount;
            credits.totalAdded += amount;
            credits.transactions.push({
                amount,
                type: "add",
                reason,
            });
            await credits.save();
            logger_1.logger.info("Credits added", { userId, amount, reason, balance: credits.balance });
        }
        catch (error) {
            logger_1.logger.error("Failed to add credits", { userId, amount, error: error.message });
            throw error;
        }
    }
    /**
     * Check if user has sufficient credits
     */
    async hasSufficientCredits(userId, amount) {
        const credits = await this.getOrCreateCredits(userId);
        return credits.balance >= amount;
    }
    /**
     * Get credit balance
     */
    async getBalance(userId) {
        const credits = await this.getOrCreateCredits(userId);
        return credits.balance;
    }
    /**
     * Check if user is below warning threshold
     */
    async isBelowThreshold(userId) {
        const credits = await this.getOrCreateCredits(userId);
        return credits.balance <= credits.warningThreshold;
    }
    /**
     * Reset monthly credits (for free tier)
     */
    async resetMonthlyCredits(userId) {
        try {
            const credits = await this.getOrCreateCredits(userId);
            const resetAmount = 1000; // Free tier monthly reset
            credits.balance = resetAmount;
            credits.totalAdded += resetAmount;
            credits.lastResetAt = new Date();
            credits.transactions.push({
                amount: resetAmount,
                type: "reset",
                reason: "Monthly reset",
            });
            await credits.save();
            logger_1.logger.info("Monthly credits reset", { userId, balance: credits.balance });
        }
        catch (error) {
            logger_1.logger.error("Failed to reset monthly credits", { userId, error: error.message });
            throw error;
        }
    }
}
exports.CreditsService = CreditsService;
exports.creditsService = new CreditsService();
//# sourceMappingURL=credits.service.js.map