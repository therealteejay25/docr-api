export interface DocGenerationInput {
    fileDiffs: Array<{
        path: string;
        diff: string;
        status: "added" | "modified" | "deleted" | string;
    }>;
    commitMessage: string;
    repoContext: {
        name: string;
        language: string;
        structure: string[];
    };
    existingDocs: {
        readme?: string;
        changelog?: string;
        apiDocs?: string;
    };
    projectAnalysis?: {
        packageJson?: any;
        mainFiles?: Array<{
            path: string;
            content: string;
        }>;
        codeSnippets?: string;
        projectDescription?: string;
    };
}
export interface DocGenerationOutput {
    patches: Array<{
        file: string;
        patch: string;
        reason: string;
    }>;
    summary: string;
    coverageScore: number;
    structuredDoc: {
        sections: Array<{
            title: string;
            content: string;
            type: string;
        }>;
    };
}
export declare class AIService {
    private client;
    constructor();
    /**
     * Generic completion method that returns parsed JSON
     */
    generateCompletion(messages: any[], model?: string): Promise<any>;
    private parseJsonSafely;
    private logRawResponse;
}
export declare const aiService: AIService;
//# sourceMappingURL=ai.service.d.ts.map