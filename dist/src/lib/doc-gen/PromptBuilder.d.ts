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
        projectDescription?: string;
    };
}
export declare class PromptBuilder {
    buildSystemPrompt(): string;
    buildUserPrompt(input: DocGenerationInput): string;
}
//# sourceMappingURL=PromptBuilder.d.ts.map