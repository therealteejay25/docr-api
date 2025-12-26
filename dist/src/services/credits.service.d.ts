export interface CreditCost {
    baseCost: number;
    repoSizeMultiplier: number;
    filesTouchedMultiplier: number;
    tokenMultiplier: number;
}
export declare class CreditsService {
    /**
     * Calculate credit cost for an operation
     */
    calculateCost(repoSize: number, filesTouched: number, tokensUsed: number): number;
    /**
     * Get or create credit record for user
     */
    getOrCreateCredits(userId: string): Promise<import("mongoose").Document<unknown, {}, {
        userId: import("mongoose").Types.ObjectId;
        balance: number;
        totalUsed: number;
        totalAdded: number;
        warningThreshold: number;
        transactions: import("mongoose").Types.DocumentArray<{
            type: "deduct" | "add" | "reset";
            createdAt: NativeDate;
            amount: number;
            reason?: string | null | undefined;
            jobId?: string | null | undefined;
        }, import("mongoose").Types.Subdocument<import("bson").ObjectId, unknown, {
            type: "deduct" | "add" | "reset";
            createdAt: NativeDate;
            amount: number;
            reason?: string | null | undefined;
            jobId?: string | null | undefined;
        }> & {
            type: "deduct" | "add" | "reset";
            createdAt: NativeDate;
            amount: number;
            reason?: string | null | undefined;
            jobId?: string | null | undefined;
        }>;
        lastResetAt?: NativeDate | null | undefined;
    } & import("mongoose").DefaultTimestampProps, {
        id: string;
    }, {
        timestamps: true;
    }> & Omit<{
        userId: import("mongoose").Types.ObjectId;
        balance: number;
        totalUsed: number;
        totalAdded: number;
        warningThreshold: number;
        transactions: import("mongoose").Types.DocumentArray<{
            type: "deduct" | "add" | "reset";
            createdAt: NativeDate;
            amount: number;
            reason?: string | null | undefined;
            jobId?: string | null | undefined;
        }, import("mongoose").Types.Subdocument<import("bson").ObjectId, unknown, {
            type: "deduct" | "add" | "reset";
            createdAt: NativeDate;
            amount: number;
            reason?: string | null | undefined;
            jobId?: string | null | undefined;
        }> & {
            type: "deduct" | "add" | "reset";
            createdAt: NativeDate;
            amount: number;
            reason?: string | null | undefined;
            jobId?: string | null | undefined;
        }>;
        lastResetAt?: NativeDate | null | undefined;
    } & import("mongoose").DefaultTimestampProps & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    /**
     * Deduct credits from user account
     */
    deductCredits(userId: string, amount: number, reason: string, jobId?: string): Promise<{
        success: boolean;
        balance: number;
        message?: string;
    }>;
    /**
     * Add credits to user account
     */
    addCredits(userId: string, amount: number, reason: string): Promise<void>;
    /**
     * Check if user has sufficient credits
     */
    hasSufficientCredits(userId: string, amount: number): Promise<boolean>;
    /**
     * Get credit balance
     */
    getBalance(userId: string): Promise<number>;
    /**
     * Check if user is below warning threshold
     */
    isBelowThreshold(userId: string): Promise<boolean>;
    /**
     * Reset monthly credits (for free tier)
     */
    resetMonthlyCredits(userId: string): Promise<void>;
}
export declare const creditsService: CreditsService;
//# sourceMappingURL=credits.service.d.ts.map