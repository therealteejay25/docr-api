export interface ProjectAnalysis {
    packageJson?: any;
    projectDescription?: string;
    structure?: string[];
    mainFiles: Array<{
        path: string;
        content: string;
    }>;
}
export declare class ContextBuilder {
    /**
     * Build project analysis by fetching package.json, structure, and key files
     */
    buildProjectAnalysis(repoId: string, userId: string, branch: string): Promise<ProjectAnalysis>;
}
//# sourceMappingURL=ContextBuilder.d.ts.map