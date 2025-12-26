export interface DocGeneratorOptions {
    repoId: string;
    userId: string;
    branch: string;
    fileDiffs: any[];
    commitMessage: string;
    repoContext: any;
    existingDocs: any;
}
export declare class DocGenerator {
    private contextBuilder;
    private promptBuilder;
    constructor();
    generate(options: DocGeneratorOptions): Promise<any>;
}
//# sourceMappingURL=DocGenerator.d.ts.map