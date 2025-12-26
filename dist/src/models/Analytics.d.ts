import { Schema } from "mongoose";
export declare const Analytics: import("mongoose").Model<{
    date: NativeDate;
    userId: import("mongoose").Types.ObjectId;
    metrics?: {
        reposConnected: number;
        docsGenerated: number;
        creditsUsed: number;
        averageDiffSize: number;
        successRate: number;
        failureRate: number;
        webhooksReceived: number;
        patchesApplied: number;
        prsCreated: number;
    } | null | undefined;
} & import("mongoose").DefaultTimestampProps, {}, {}, {
    id: string;
}, import("mongoose").Document<unknown, {}, {
    date: NativeDate;
    userId: import("mongoose").Types.ObjectId;
    metrics?: {
        reposConnected: number;
        docsGenerated: number;
        creditsUsed: number;
        averageDiffSize: number;
        successRate: number;
        failureRate: number;
        webhooksReceived: number;
        patchesApplied: number;
        prsCreated: number;
    } | null | undefined;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    date: NativeDate;
    userId: import("mongoose").Types.ObjectId;
    metrics?: {
        reposConnected: number;
        docsGenerated: number;
        creditsUsed: number;
        averageDiffSize: number;
        successRate: number;
        failureRate: number;
        webhooksReceived: number;
        patchesApplied: number;
        prsCreated: number;
    } | null | undefined;
} & import("mongoose").DefaultTimestampProps & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    date: NativeDate;
    userId: import("mongoose").Types.ObjectId;
    metrics?: {
        reposConnected: number;
        docsGenerated: number;
        creditsUsed: number;
        averageDiffSize: number;
        successRate: number;
        failureRate: number;
        webhooksReceived: number;
        patchesApplied: number;
        prsCreated: number;
    } | null | undefined;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, {
    date: NativeDate;
    userId: import("mongoose").Types.ObjectId;
    metrics?: {
        reposConnected: number;
        docsGenerated: number;
        creditsUsed: number;
        averageDiffSize: number;
        successRate: number;
        failureRate: number;
        webhooksReceived: number;
        patchesApplied: number;
        prsCreated: number;
    } | null | undefined;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<{
    timestamps: true;
}>> & Omit<{
    date: NativeDate;
    userId: import("mongoose").Types.ObjectId;
    metrics?: {
        reposConnected: number;
        docsGenerated: number;
        creditsUsed: number;
        averageDiffSize: number;
        successRate: number;
        failureRate: number;
        webhooksReceived: number;
        patchesApplied: number;
        prsCreated: number;
    } | null | undefined;
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
        date: NativeDate;
        userId: import("mongoose").Types.ObjectId;
        metrics?: {
            reposConnected: number;
            docsGenerated: number;
            creditsUsed: number;
            averageDiffSize: number;
            successRate: number;
            failureRate: number;
            webhooksReceived: number;
            patchesApplied: number;
            prsCreated: number;
        } | null | undefined;
    } & import("mongoose").DefaultTimestampProps, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<{
        timestamps: true;
    }>> & Omit<{
        date: NativeDate;
        userId: import("mongoose").Types.ObjectId;
        metrics?: {
            reposConnected: number;
            docsGenerated: number;
            creditsUsed: number;
            averageDiffSize: number;
            successRate: number;
            failureRate: number;
            webhooksReceived: number;
            patchesApplied: number;
            prsCreated: number;
        } | null | undefined;
    } & import("mongoose").DefaultTimestampProps & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    date: NativeDate;
    userId: import("mongoose").Types.ObjectId;
    metrics?: {
        reposConnected: number;
        docsGenerated: number;
        creditsUsed: number;
        averageDiffSize: number;
        successRate: number;
        failureRate: number;
        webhooksReceived: number;
        patchesApplied: number;
        prsCreated: number;
    } | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>, {
    date: NativeDate;
    userId: import("mongoose").Types.ObjectId;
    metrics?: {
        reposConnected: number;
        docsGenerated: number;
        creditsUsed: number;
        averageDiffSize: number;
        successRate: number;
        failureRate: number;
        webhooksReceived: number;
        patchesApplied: number;
        prsCreated: number;
    } | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Analytics.d.ts.map