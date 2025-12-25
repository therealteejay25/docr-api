import { Credit } from "../models/Credit";
import { logger } from "../lib/logger";

export interface CreditCost {
  baseCost: number;
  repoSizeMultiplier: number;
  filesTouchedMultiplier: number;
  tokenMultiplier: number;
}

export class CreditsService {
  /**
   * Calculate credit cost for an operation
   */
  calculateCost(
    repoSize: number,
    filesTouched: number,
    tokensUsed: number
  ): number {
    const baseCost = 10;
    const repoSizeMultiplier = Math.ceil(repoSize / 1000); // 1 credit per 1000 lines
    const filesTouchedMultiplier = filesTouched * 2; // 2 credits per file
    const tokenMultiplier = Math.ceil(tokensUsed / 1000); // 1 credit per 1000 tokens

    return baseCost + repoSizeMultiplier + filesTouchedMultiplier + tokenMultiplier;
  }

  /**
   * Get or create credit record for user
   */
  async getOrCreateCredits(userId: string) {
    let credits = await Credit.findOne({ userId });
    if (!credits) {
      credits = await Credit.create({
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
  async deductCredits(
    userId: string,
    amount: number,
    reason: string,
    jobId?: string
  ): Promise<{ success: boolean; balance: number; message?: string }> {
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

      logger.info("Credits deducted", { userId, amount, reason, balance: credits.balance });

      return { success: true, balance: credits.balance };
    } catch (error: any) {
      logger.error("Failed to deduct credits", { userId, amount, error: error.message });
      throw error;
    }
  }

  /**
   * Add credits to user account
   */
  async addCredits(
    userId: string,
    amount: number,
    reason: string
  ): Promise<void> {
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
      logger.info("Credits added", { userId, amount, reason, balance: credits.balance });
    } catch (error: any) {
      logger.error("Failed to add credits", { userId, amount, error: error.message });
      throw error;
    }
  }

  /**
   * Check if user has sufficient credits
   */
  async hasSufficientCredits(userId: string, amount: number): Promise<boolean> {
    const credits = await this.getOrCreateCredits(userId);
    return credits.balance >= amount;
  }

  /**
   * Get credit balance
   */
  async getBalance(userId: string): Promise<number> {
    const credits = await this.getOrCreateCredits(userId);
    return credits.balance;
  }

  /**
   * Check if user is below warning threshold
   */
  async isBelowThreshold(userId: string): Promise<boolean> {
    const credits = await this.getOrCreateCredits(userId);
    return credits.balance <= credits.warningThreshold;
  }

  /**
   * Reset monthly credits (for free tier)
   */
  async resetMonthlyCredits(userId: string): Promise<void> {
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
      logger.info("Monthly credits reset", { userId, balance: credits.balance });
    } catch (error: any) {
      logger.error("Failed to reset monthly credits", { userId, error: error.message });
      throw error;
    }
  }
}

export const creditsService = new CreditsService();

