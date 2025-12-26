import { Worker } from "bullmq";
interface ApplyPatchJobData {
    repoId: string;
    userId: string;
    webhookEventId: string;
    patches: Array<{
        file: string;
        patch: string;
        reason: string;
    }>;
    summary: string;
    coverageScore: number;
    commitSha: string;
    branch: string;
}
export declare const applyPatchWorker: Worker<ApplyPatchJobData, any, string>;
export {};
//# sourceMappingURL=applyPatch.worker.d.ts.map