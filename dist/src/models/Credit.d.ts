import { Schema } from "mongoose";
export declare const Credit: import("mongoose").Model<{
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
} & import("mongoose").DefaultTimestampProps, {}, {}, {
    id: string;
}, import("mongoose").Document<unknown, {}, {
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
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
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
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, {
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
}, import("mongoose").ResolveSchemaOptions<{
    timestamps: true;
}>> & Omit<{
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
}, {
    [path: string]: import("mongoose").SchemaDefinitionProperty<undefined, any, any>;
} | {
    [x: string]: import("mongoose").SchemaDefinitionProperty<any, any, import("mongoose").Document<unknown, {}, {
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
    }, import("mongoose").ResolveSchemaOptions<{
        timestamps: true;
    }>> & Omit<{
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
    }> | undefined;
}, {
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
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>, {
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
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Credit.d.ts.map