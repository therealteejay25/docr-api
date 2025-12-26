export interface WriteOptions {
    userId: string;
    repoId: string;
    files: Array<{
        path: string;
        content: string;
        sha?: string;
    }>;
    message: string;
    branch?: string;
    createPR?: boolean;
}
export declare class WriterService {
    /**
     * Write files directly to GitHub
     */
    writeFiles(options: WriteOptions): Promise<{
        success: boolean;
        prUrl?: string;
        commitSha?: string;
        commitUrl?: string;
    }>;
    private writeFilesDirect;
    /**
     * Create PR with changes
     */
    private createPRWithChanges;
}
export declare const writerService: WriterService;
//# sourceMappingURL=writer.service.d.ts.map