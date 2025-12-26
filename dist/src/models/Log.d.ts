import { Schema } from "mongoose";
export declare const Log: import("mongoose").Model<{
    message: string;
    level: "error" | "info" | "warn" | "debug";
    service: string;
    error?: any;
    userId?: import("mongoose").Types.ObjectId | null | undefined;
    jobId?: string | null | undefined;
    repoId?: import("mongoose").Types.ObjectId | null | undefined;
    webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
    metadata?: any;
} & import("mongoose").DefaultTimestampProps, {}, {}, {
    id: string;
}, import("mongoose").Document<unknown, {}, {
    message: string;
    level: "error" | "info" | "warn" | "debug";
    service: string;
    error?: any;
    userId?: import("mongoose").Types.ObjectId | null | undefined;
    jobId?: string | null | undefined;
    repoId?: import("mongoose").Types.ObjectId | null | undefined;
    webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
    metadata?: any;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    message: string;
    level: "error" | "info" | "warn" | "debug";
    service: string;
    error?: any;
    userId?: import("mongoose").Types.ObjectId | null | undefined;
    jobId?: string | null | undefined;
    repoId?: import("mongoose").Types.ObjectId | null | undefined;
    webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
    metadata?: any;
} & import("mongoose").DefaultTimestampProps & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    message: string;
    level: "error" | "info" | "warn" | "debug";
    service: string;
    error?: any;
    userId?: import("mongoose").Types.ObjectId | null | undefined;
    jobId?: string | null | undefined;
    repoId?: import("mongoose").Types.ObjectId | null | undefined;
    webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
    metadata?: any;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, {
    message: string;
    level: "error" | "info" | "warn" | "debug";
    service: string;
    error?: any;
    userId?: import("mongoose").Types.ObjectId | null | undefined;
    jobId?: string | null | undefined;
    repoId?: import("mongoose").Types.ObjectId | null | undefined;
    webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
    metadata?: any;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<{
    timestamps: true;
}>> & Omit<{
    message: string;
    level: "error" | "info" | "warn" | "debug";
    service: string;
    error?: any;
    userId?: import("mongoose").Types.ObjectId | null | undefined;
    jobId?: string | null | undefined;
    repoId?: import("mongoose").Types.ObjectId | null | undefined;
    webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
    metadata?: any;
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
        message: string;
        level: "error" | "info" | "warn" | "debug";
        service: string;
        error?: any;
        userId?: import("mongoose").Types.ObjectId | null | undefined;
        jobId?: string | null | undefined;
        repoId?: import("mongoose").Types.ObjectId | null | undefined;
        webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
        metadata?: any;
    } & import("mongoose").DefaultTimestampProps, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<{
        timestamps: true;
    }>> & Omit<{
        message: string;
        level: "error" | "info" | "warn" | "debug";
        service: string;
        error?: any;
        userId?: import("mongoose").Types.ObjectId | null | undefined;
        jobId?: string | null | undefined;
        repoId?: import("mongoose").Types.ObjectId | null | undefined;
        webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
        metadata?: any;
    } & import("mongoose").DefaultTimestampProps & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    message: string;
    level: "error" | "info" | "warn" | "debug";
    service: string;
    error?: any;
    userId?: import("mongoose").Types.ObjectId | null | undefined;
    jobId?: string | null | undefined;
    repoId?: import("mongoose").Types.ObjectId | null | undefined;
    webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
    metadata?: any;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>, {
    message: string;
    level: "error" | "info" | "warn" | "debug";
    service: string;
    error?: any;
    userId?: import("mongoose").Types.ObjectId | null | undefined;
    jobId?: string | null | undefined;
    repoId?: import("mongoose").Types.ObjectId | null | undefined;
    webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
    metadata?: any;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Log.d.ts.map