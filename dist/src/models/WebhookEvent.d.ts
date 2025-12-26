import { Schema } from "mongoose";
export declare const WebhookEvent: import("mongoose").Model<{
    repoId: import("mongoose").Types.ObjectId;
    eventType: "push" | "pull_request" | "workflow_dispatch";
    githubDeliveryId: string;
    payload: any;
    processed: boolean;
    error?: string | null | undefined;
    jobId?: string | null | undefined;
    signature?: string | null | undefined;
    processedAt?: NativeDate | null | undefined;
} & import("mongoose").DefaultTimestampProps, {}, {}, {
    id: string;
}, import("mongoose").Document<unknown, {}, {
    repoId: import("mongoose").Types.ObjectId;
    eventType: "push" | "pull_request" | "workflow_dispatch";
    githubDeliveryId: string;
    payload: any;
    processed: boolean;
    error?: string | null | undefined;
    jobId?: string | null | undefined;
    signature?: string | null | undefined;
    processedAt?: NativeDate | null | undefined;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    repoId: import("mongoose").Types.ObjectId;
    eventType: "push" | "pull_request" | "workflow_dispatch";
    githubDeliveryId: string;
    payload: any;
    processed: boolean;
    error?: string | null | undefined;
    jobId?: string | null | undefined;
    signature?: string | null | undefined;
    processedAt?: NativeDate | null | undefined;
} & import("mongoose").DefaultTimestampProps & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    repoId: import("mongoose").Types.ObjectId;
    eventType: "push" | "pull_request" | "workflow_dispatch";
    githubDeliveryId: string;
    payload: any;
    processed: boolean;
    error?: string | null | undefined;
    jobId?: string | null | undefined;
    signature?: string | null | undefined;
    processedAt?: NativeDate | null | undefined;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, {
    repoId: import("mongoose").Types.ObjectId;
    eventType: "push" | "pull_request" | "workflow_dispatch";
    githubDeliveryId: string;
    payload: any;
    processed: boolean;
    error?: string | null | undefined;
    jobId?: string | null | undefined;
    signature?: string | null | undefined;
    processedAt?: NativeDate | null | undefined;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<{
    timestamps: true;
}>> & Omit<{
    repoId: import("mongoose").Types.ObjectId;
    eventType: "push" | "pull_request" | "workflow_dispatch";
    githubDeliveryId: string;
    payload: any;
    processed: boolean;
    error?: string | null | undefined;
    jobId?: string | null | undefined;
    signature?: string | null | undefined;
    processedAt?: NativeDate | null | undefined;
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
        repoId: import("mongoose").Types.ObjectId;
        eventType: "push" | "pull_request" | "workflow_dispatch";
        githubDeliveryId: string;
        payload: any;
        processed: boolean;
        error?: string | null | undefined;
        jobId?: string | null | undefined;
        signature?: string | null | undefined;
        processedAt?: NativeDate | null | undefined;
    } & import("mongoose").DefaultTimestampProps, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<{
        timestamps: true;
    }>> & Omit<{
        repoId: import("mongoose").Types.ObjectId;
        eventType: "push" | "pull_request" | "workflow_dispatch";
        githubDeliveryId: string;
        payload: any;
        processed: boolean;
        error?: string | null | undefined;
        jobId?: string | null | undefined;
        signature?: string | null | undefined;
        processedAt?: NativeDate | null | undefined;
    } & import("mongoose").DefaultTimestampProps & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    repoId: import("mongoose").Types.ObjectId;
    eventType: "push" | "pull_request" | "workflow_dispatch";
    githubDeliveryId: string;
    payload: any;
    processed: boolean;
    error?: string | null | undefined;
    jobId?: string | null | undefined;
    signature?: string | null | undefined;
    processedAt?: NativeDate | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>, {
    repoId: import("mongoose").Types.ObjectId;
    eventType: "push" | "pull_request" | "workflow_dispatch";
    githubDeliveryId: string;
    payload: any;
    processed: boolean;
    error?: string | null | undefined;
    jobId?: string | null | undefined;
    signature?: string | null | undefined;
    processedAt?: NativeDate | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=WebhookEvent.d.ts.map