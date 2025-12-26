import { Schema } from "mongoose";
export declare const User: import("mongoose").Model<{
    email: string;
    isActive: boolean;
    githubId?: number | null | undefined;
    name?: string | null | undefined;
    avatarUrl?: string | null | undefined;
    accessToken?: string | null | undefined;
    refreshToken?: string | null | undefined;
    timeZone?: string | null | undefined;
    githubToken?: string | null | undefined;
    githubTokenIv?: string | null | undefined;
    pricingPlan?: "free" | "pro" | "custom" | null | undefined;
    settings?: {
        emailNotifications: boolean;
        weeklyReport: boolean;
        autoGenerate: boolean;
        slackIntegration: boolean;
    } | null | undefined;
} & import("mongoose").DefaultTimestampProps, {}, {}, {
    id: string;
}, import("mongoose").Document<unknown, {}, {
    email: string;
    isActive: boolean;
    githubId?: number | null | undefined;
    name?: string | null | undefined;
    avatarUrl?: string | null | undefined;
    accessToken?: string | null | undefined;
    refreshToken?: string | null | undefined;
    timeZone?: string | null | undefined;
    githubToken?: string | null | undefined;
    githubTokenIv?: string | null | undefined;
    pricingPlan?: "free" | "pro" | "custom" | null | undefined;
    settings?: {
        emailNotifications: boolean;
        weeklyReport: boolean;
        autoGenerate: boolean;
        slackIntegration: boolean;
    } | null | undefined;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    email: string;
    isActive: boolean;
    githubId?: number | null | undefined;
    name?: string | null | undefined;
    avatarUrl?: string | null | undefined;
    accessToken?: string | null | undefined;
    refreshToken?: string | null | undefined;
    timeZone?: string | null | undefined;
    githubToken?: string | null | undefined;
    githubTokenIv?: string | null | undefined;
    pricingPlan?: "free" | "pro" | "custom" | null | undefined;
    settings?: {
        emailNotifications: boolean;
        weeklyReport: boolean;
        autoGenerate: boolean;
        slackIntegration: boolean;
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
    email: string;
    isActive: boolean;
    githubId?: number | null | undefined;
    name?: string | null | undefined;
    avatarUrl?: string | null | undefined;
    accessToken?: string | null | undefined;
    refreshToken?: string | null | undefined;
    timeZone?: string | null | undefined;
    githubToken?: string | null | undefined;
    githubTokenIv?: string | null | undefined;
    pricingPlan?: "free" | "pro" | "custom" | null | undefined;
    settings?: {
        emailNotifications: boolean;
        weeklyReport: boolean;
        autoGenerate: boolean;
        slackIntegration: boolean;
    } | null | undefined;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, {
    email: string;
    isActive: boolean;
    githubId?: number | null | undefined;
    name?: string | null | undefined;
    avatarUrl?: string | null | undefined;
    accessToken?: string | null | undefined;
    refreshToken?: string | null | undefined;
    timeZone?: string | null | undefined;
    githubToken?: string | null | undefined;
    githubTokenIv?: string | null | undefined;
    pricingPlan?: "free" | "pro" | "custom" | null | undefined;
    settings?: {
        emailNotifications: boolean;
        weeklyReport: boolean;
        autoGenerate: boolean;
        slackIntegration: boolean;
    } | null | undefined;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<{
    timestamps: true;
}>> & Omit<{
    email: string;
    isActive: boolean;
    githubId?: number | null | undefined;
    name?: string | null | undefined;
    avatarUrl?: string | null | undefined;
    accessToken?: string | null | undefined;
    refreshToken?: string | null | undefined;
    timeZone?: string | null | undefined;
    githubToken?: string | null | undefined;
    githubTokenIv?: string | null | undefined;
    pricingPlan?: "free" | "pro" | "custom" | null | undefined;
    settings?: {
        emailNotifications: boolean;
        weeklyReport: boolean;
        autoGenerate: boolean;
        slackIntegration: boolean;
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
        email: string;
        isActive: boolean;
        githubId?: number | null | undefined;
        name?: string | null | undefined;
        avatarUrl?: string | null | undefined;
        accessToken?: string | null | undefined;
        refreshToken?: string | null | undefined;
        timeZone?: string | null | undefined;
        githubToken?: string | null | undefined;
        githubTokenIv?: string | null | undefined;
        pricingPlan?: "free" | "pro" | "custom" | null | undefined;
        settings?: {
            emailNotifications: boolean;
            weeklyReport: boolean;
            autoGenerate: boolean;
            slackIntegration: boolean;
        } | null | undefined;
    } & import("mongoose").DefaultTimestampProps, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<{
        timestamps: true;
    }>> & Omit<{
        email: string;
        isActive: boolean;
        githubId?: number | null | undefined;
        name?: string | null | undefined;
        avatarUrl?: string | null | undefined;
        accessToken?: string | null | undefined;
        refreshToken?: string | null | undefined;
        timeZone?: string | null | undefined;
        githubToken?: string | null | undefined;
        githubTokenIv?: string | null | undefined;
        pricingPlan?: "free" | "pro" | "custom" | null | undefined;
        settings?: {
            emailNotifications: boolean;
            weeklyReport: boolean;
            autoGenerate: boolean;
            slackIntegration: boolean;
        } | null | undefined;
    } & import("mongoose").DefaultTimestampProps & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    email: string;
    isActive: boolean;
    githubId?: number | null | undefined;
    name?: string | null | undefined;
    avatarUrl?: string | null | undefined;
    accessToken?: string | null | undefined;
    refreshToken?: string | null | undefined;
    timeZone?: string | null | undefined;
    githubToken?: string | null | undefined;
    githubTokenIv?: string | null | undefined;
    pricingPlan?: "free" | "pro" | "custom" | null | undefined;
    settings?: {
        emailNotifications: boolean;
        weeklyReport: boolean;
        autoGenerate: boolean;
        slackIntegration: boolean;
    } | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>, {
    email: string;
    isActive: boolean;
    githubId?: number | null | undefined;
    name?: string | null | undefined;
    avatarUrl?: string | null | undefined;
    accessToken?: string | null | undefined;
    refreshToken?: string | null | undefined;
    timeZone?: string | null | undefined;
    githubToken?: string | null | undefined;
    githubTokenIv?: string | null | undefined;
    pricingPlan?: "free" | "pro" | "custom" | null | undefined;
    settings?: {
        emailNotifications: boolean;
        weeklyReport: boolean;
        autoGenerate: boolean;
        slackIntegration: boolean;
    } | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=User.d.ts.map