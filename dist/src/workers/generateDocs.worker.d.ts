import { Worker } from "bullmq";
interface GenerateDocsJobData {
    repoId: string;
    userId: string;
    webhookEventId: string;
    fileDiffs: Array<{
        path: string;
        diff: string;
        status: string;
    }>;
    commitMessage: string;
    repoContext: any;
    existingDocs: any;
    commitSha: string;
    branch: string;
}
export declare const generateDocsWorker: Worker<GenerateDocsJobData, any, string>;
export {};
//# sourceMappingURL=generateDocs.worker.d.ts.map