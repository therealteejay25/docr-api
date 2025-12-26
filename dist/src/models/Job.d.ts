import { Schema } from "mongoose";
export declare const Job: import("mongoose").Model<{
    jobId: string;
    jobType: "process_commit" | "generate_docs" | "apply_patch" | "send_email" | "recompute_coverage";
    status: "completed" | "failed" | "pending" | "processing" | "dead-letter";
    retryCount: number;
    maxRetries: number;
    error?: string | null | undefined;
    repoId?: import("mongoose").Types.ObjectId | null | undefined;
    webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
    input?: any;
    output?: any;
    startedAt?: NativeDate | null | undefined;
    completedAt?: NativeDate | null | undefined;
    duration?: number | null | undefined;
} & import("mongoose").DefaultTimestampProps, {}, {}, {
    id: string;
}, import("mongoose").Document<unknown, {}, {
    jobId: string;
    jobType: "process_commit" | "generate_docs" | "apply_patch" | "send_email" | "recompute_coverage";
    status: "completed" | "failed" | "pending" | "processing" | "dead-letter";
    retryCount: number;
    maxRetries: number;
    error?: string | null | undefined;
    repoId?: import("mongoose").Types.ObjectId | null | undefined;
    webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
    input?: any;
    output?: any;
    startedAt?: NativeDate | null | undefined;
    completedAt?: NativeDate | null | undefined;
    duration?: number | null | undefined;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    jobId: string;
    jobType: "process_commit" | "generate_docs" | "apply_patch" | "send_email" | "recompute_coverage";
    status: "completed" | "failed" | "pending" | "processing" | "dead-letter";
    retryCount: number;
    maxRetries: number;
    error?: string | null | undefined;
    repoId?: import("mongoose").Types.ObjectId | null | undefined;
    webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
    input?: any;
    output?: any;
    startedAt?: NativeDate | null | undefined;
    completedAt?: NativeDate | null | undefined;
    duration?: number | null | undefined;
} & import("mongoose").DefaultTimestampProps & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    jobId: string;
    jobType: "process_commit" | "generate_docs" | "apply_patch" | "send_email" | "recompute_coverage";
    status: "completed" | "failed" | "pending" | "processing" | "dead-letter";
    retryCount: number;
    maxRetries: number;
    error?: string | null | undefined;
    repoId?: import("mongoose").Types.ObjectId | null | undefined;
    webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
    input?: any;
    output?: any;
    startedAt?: NativeDate | null | undefined;
    completedAt?: NativeDate | null | undefined;
    duration?: number | null | undefined;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, {
    jobId: string;
    jobType: "process_commit" | "generate_docs" | "apply_patch" | "send_email" | "recompute_coverage";
    status: "completed" | "failed" | "pending" | "processing" | "dead-letter";
    retryCount: number;
    maxRetries: number;
    error?: string | null | undefined;
    repoId?: import("mongoose").Types.ObjectId | null | undefined;
    webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
    input?: any;
    output?: any;
    startedAt?: NativeDate | null | undefined;
    completedAt?: NativeDate | null | undefined;
    duration?: number | null | undefined;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<{
    timestamps: true;
}>> & Omit<{
    jobId: string;
    jobType: "process_commit" | "generate_docs" | "apply_patch" | "send_email" | "recompute_coverage";
    status: "completed" | "failed" | "pending" | "processing" | "dead-letter";
    retryCount: number;
    maxRetries: number;
    error?: string | null | undefined;
    repoId?: import("mongoose").Types.ObjectId | null | undefined;
    webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
    input?: any;
    output?: any;
    startedAt?: NativeDate | null | undefined;
    completedAt?: NativeDate | null | undefined;
    duration?: number | null | undefined;
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
        jobId: string;
        jobType: "process_commit" | "generate_docs" | "apply_patch" | "send_email" | "recompute_coverage";
        status: "completed" | "failed" | "pending" | "processing" | "dead-letter";
        retryCount: number;
        maxRetries: number;
        error?: string | null | undefined;
        repoId?: import("mongoose").Types.ObjectId | null | undefined;
        webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
        input?: any;
        output?: any;
        startedAt?: NativeDate | null | undefined;
        completedAt?: NativeDate | null | undefined;
        duration?: number | null | undefined;
    } & import("mongoose").DefaultTimestampProps, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<{
        timestamps: true;
    }>> & Omit<{
        jobId: string;
        jobType: "process_commit" | "generate_docs" | "apply_patch" | "send_email" | "recompute_coverage";
        status: "completed" | "failed" | "pending" | "processing" | "dead-letter";
        retryCount: number;
        maxRetries: number;
        error?: string | null | undefined;
        repoId?: import("mongoose").Types.ObjectId | null | undefined;
        webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
        input?: any;
        output?: any;
        startedAt?: NativeDate | null | undefined;
        completedAt?: NativeDate | null | undefined;
        duration?: number | null | undefined;
    } & import("mongoose").DefaultTimestampProps & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    jobId: string;
    jobType: "process_commit" | "generate_docs" | "apply_patch" | "send_email" | "recompute_coverage";
    status: "completed" | "failed" | "pending" | "processing" | "dead-letter";
    retryCount: number;
    maxRetries: number;
    error?: string | null | undefined;
    repoId?: import("mongoose").Types.ObjectId | null | undefined;
    webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
    input?: any;
    output?: any;
    startedAt?: NativeDate | null | undefined;
    completedAt?: NativeDate | null | undefined;
    duration?: number | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>, {
    jobId: string;
    jobType: "process_commit" | "generate_docs" | "apply_patch" | "send_email" | "recompute_coverage";
    status: "completed" | "failed" | "pending" | "processing" | "dead-letter";
    retryCount: number;
    maxRetries: number;
    error?: string | null | undefined;
    repoId?: import("mongoose").Types.ObjectId | null | undefined;
    webhookEventId?: import("mongoose").Types.ObjectId | null | undefined;
    input?: any;
    output?: any;
    startedAt?: NativeDate | null | undefined;
    completedAt?: NativeDate | null | undefined;
    duration?: number | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Job.d.ts.map