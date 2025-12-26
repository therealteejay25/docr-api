import { Schema } from "mongoose";
export declare const Repo: import("mongoose").Model<{
    name: string;
    isActive: boolean;
    userId: import("mongoose").Types.ObjectId;
    owner: string;
    githubRepoId: number;
    fullName: string;
    defaultBranch: string;
    settings?: {
        emailNotifications: boolean;
        autoUpdate: boolean;
        branchPreference: string;
        docTypes?: {
            readme: boolean;
            changelog: boolean;
            apiDocs: boolean;
            architectureDocs: boolean;
        } | null | undefined;
    } | null | undefined;
    webhookId?: number | null | undefined;
    webhookUrl?: string | null | undefined;
    webhookSecret?: string | null | undefined;
    webhookSecretIv?: string | null | undefined;
    lastProcessedCommit?: string | null | undefined;
    lastProcessedSummary?: string | null | undefined;
    lastProcessedAt?: NativeDate | null | undefined;
    language?: string | null | undefined;
    size?: number | null | undefined;
} & import("mongoose").DefaultTimestampProps, {}, {}, {
    id: string;
}, import("mongoose").Document<unknown, {}, {
    name: string;
    isActive: boolean;
    userId: import("mongoose").Types.ObjectId;
    owner: string;
    githubRepoId: number;
    fullName: string;
    defaultBranch: string;
    settings?: {
        emailNotifications: boolean;
        autoUpdate: boolean;
        branchPreference: string;
        docTypes?: {
            readme: boolean;
            changelog: boolean;
            apiDocs: boolean;
            architectureDocs: boolean;
        } | null | undefined;
    } | null | undefined;
    webhookId?: number | null | undefined;
    webhookUrl?: string | null | undefined;
    webhookSecret?: string | null | undefined;
    webhookSecretIv?: string | null | undefined;
    lastProcessedCommit?: string | null | undefined;
    lastProcessedSummary?: string | null | undefined;
    lastProcessedAt?: NativeDate | null | undefined;
    language?: string | null | undefined;
    size?: number | null | undefined;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    name: string;
    isActive: boolean;
    userId: import("mongoose").Types.ObjectId;
    owner: string;
    githubRepoId: number;
    fullName: string;
    defaultBranch: string;
    settings?: {
        emailNotifications: boolean;
        autoUpdate: boolean;
        branchPreference: string;
        docTypes?: {
            readme: boolean;
            changelog: boolean;
            apiDocs: boolean;
            architectureDocs: boolean;
        } | null | undefined;
    } | null | undefined;
    webhookId?: number | null | undefined;
    webhookUrl?: string | null | undefined;
    webhookSecret?: string | null | undefined;
    webhookSecretIv?: string | null | undefined;
    lastProcessedCommit?: string | null | undefined;
    lastProcessedSummary?: string | null | undefined;
    lastProcessedAt?: NativeDate | null | undefined;
    language?: string | null | undefined;
    size?: number | null | undefined;
} & import("mongoose").DefaultTimestampProps & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    name: string;
    isActive: boolean;
    userId: import("mongoose").Types.ObjectId;
    owner: string;
    githubRepoId: number;
    fullName: string;
    defaultBranch: string;
    settings?: {
        emailNotifications: boolean;
        autoUpdate: boolean;
        branchPreference: string;
        docTypes?: {
            readme: boolean;
            changelog: boolean;
            apiDocs: boolean;
            architectureDocs: boolean;
        } | null | undefined;
    } | null | undefined;
    webhookId?: number | null | undefined;
    webhookUrl?: string | null | undefined;
    webhookSecret?: string | null | undefined;
    webhookSecretIv?: string | null | undefined;
    lastProcessedCommit?: string | null | undefined;
    lastProcessedSummary?: string | null | undefined;
    lastProcessedAt?: NativeDate | null | undefined;
    language?: string | null | undefined;
    size?: number | null | undefined;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, {
    name: string;
    isActive: boolean;
    userId: import("mongoose").Types.ObjectId;
    owner: string;
    githubRepoId: number;
    fullName: string;
    defaultBranch: string;
    settings?: {
        emailNotifications: boolean;
        autoUpdate: boolean;
        branchPreference: string;
        docTypes?: {
            readme: boolean;
            changelog: boolean;
            apiDocs: boolean;
            architectureDocs: boolean;
        } | null | undefined;
    } | null | undefined;
    webhookId?: number | null | undefined;
    webhookUrl?: string | null | undefined;
    webhookSecret?: string | null | undefined;
    webhookSecretIv?: string | null | undefined;
    lastProcessedCommit?: string | null | undefined;
    lastProcessedSummary?: string | null | undefined;
    lastProcessedAt?: NativeDate | null | undefined;
    language?: string | null | undefined;
    size?: number | null | undefined;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<{
    timestamps: true;
}>> & Omit<{
    name: string;
    isActive: boolean;
    userId: import("mongoose").Types.ObjectId;
    owner: string;
    githubRepoId: number;
    fullName: string;
    defaultBranch: string;
    settings?: {
        emailNotifications: boolean;
        autoUpdate: boolean;
        branchPreference: string;
        docTypes?: {
            readme: boolean;
            changelog: boolean;
            apiDocs: boolean;
            architectureDocs: boolean;
        } | null | undefined;
    } | null | undefined;
    webhookId?: number | null | undefined;
    webhookUrl?: string | null | undefined;
    webhookSecret?: string | null | undefined;
    webhookSecretIv?: string | null | undefined;
    lastProcessedCommit?: string | null | undefined;
    lastProcessedSummary?: string | null | undefined;
    lastProcessedAt?: NativeDate | null | undefined;
    language?: string | null | undefined;
    size?: number | null | undefined;
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
        name: string;
        isActive: boolean;
        userId: import("mongoose").Types.ObjectId;
        owner: string;
        githubRepoId: number;
        fullName: string;
        defaultBranch: string;
        settings?: {
            emailNotifications: boolean;
            autoUpdate: boolean;
            branchPreference: string;
            docTypes?: {
                readme: boolean;
                changelog: boolean;
                apiDocs: boolean;
                architectureDocs: boolean;
            } | null | undefined;
        } | null | undefined;
        webhookId?: number | null | undefined;
        webhookUrl?: string | null | undefined;
        webhookSecret?: string | null | undefined;
        webhookSecretIv?: string | null | undefined;
        lastProcessedCommit?: string | null | undefined;
        lastProcessedSummary?: string | null | undefined;
        lastProcessedAt?: NativeDate | null | undefined;
        language?: string | null | undefined;
        size?: number | null | undefined;
    } & import("mongoose").DefaultTimestampProps, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<{
        timestamps: true;
    }>> & Omit<{
        name: string;
        isActive: boolean;
        userId: import("mongoose").Types.ObjectId;
        owner: string;
        githubRepoId: number;
        fullName: string;
        defaultBranch: string;
        settings?: {
            emailNotifications: boolean;
            autoUpdate: boolean;
            branchPreference: string;
            docTypes?: {
                readme: boolean;
                changelog: boolean;
                apiDocs: boolean;
                architectureDocs: boolean;
            } | null | undefined;
        } | null | undefined;
        webhookId?: number | null | undefined;
        webhookUrl?: string | null | undefined;
        webhookSecret?: string | null | undefined;
        webhookSecretIv?: string | null | undefined;
        lastProcessedCommit?: string | null | undefined;
        lastProcessedSummary?: string | null | undefined;
        lastProcessedAt?: NativeDate | null | undefined;
        language?: string | null | undefined;
        size?: number | null | undefined;
    } & import("mongoose").DefaultTimestampProps & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    name: string;
    isActive: boolean;
    userId: import("mongoose").Types.ObjectId;
    owner: string;
    githubRepoId: number;
    fullName: string;
    defaultBranch: string;
    settings?: {
        emailNotifications: boolean;
        autoUpdate: boolean;
        branchPreference: string;
        docTypes?: {
            readme: boolean;
            changelog: boolean;
            apiDocs: boolean;
            architectureDocs: boolean;
        } | null | undefined;
    } | null | undefined;
    webhookId?: number | null | undefined;
    webhookUrl?: string | null | undefined;
    webhookSecret?: string | null | undefined;
    webhookSecretIv?: string | null | undefined;
    lastProcessedCommit?: string | null | undefined;
    lastProcessedSummary?: string | null | undefined;
    lastProcessedAt?: NativeDate | null | undefined;
    language?: string | null | undefined;
    size?: number | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>, {
    name: string;
    isActive: boolean;
    userId: import("mongoose").Types.ObjectId;
    owner: string;
    githubRepoId: number;
    fullName: string;
    defaultBranch: string;
    settings?: {
        emailNotifications: boolean;
        autoUpdate: boolean;
        branchPreference: string;
        docTypes?: {
            readme: boolean;
            changelog: boolean;
            apiDocs: boolean;
            architectureDocs: boolean;
        } | null | undefined;
    } | null | undefined;
    webhookId?: number | null | undefined;
    webhookUrl?: string | null | undefined;
    webhookSecret?: string | null | undefined;
    webhookSecretIv?: string | null | undefined;
    lastProcessedCommit?: string | null | undefined;
    lastProcessedSummary?: string | null | undefined;
    lastProcessedAt?: NativeDate | null | undefined;
    language?: string | null | undefined;
    size?: number | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Repo.d.ts.map