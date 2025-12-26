import { Worker } from "bullmq";
interface ProcessCommitJobData {
    webhookEventId: string;
    repoId: string;
    userId: string;
    commitSha: string;
    branch: string;
}
export declare const processCommitWorker: Worker<ProcessCommitJobData, any, string>;
export {};
//# sourceMappingURL=processCommit.worker.d.ts.map