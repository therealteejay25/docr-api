import { Worker } from "bullmq";
interface SendEmailJobData {
    userId: string;
    repoId?: string;
    email: string;
    repoName: string;
    summary: string;
    diffPreview: string;
    coverageScore: number;
    patches: Array<{
        file: string;
        reason: string;
    }>;
    prUrl?: string;
    issues?: string[];
}
interface SendErrorEmailJobData {
    userId: string;
    email: string;
    repoName: string;
    error: string;
    jobId?: string;
}
export declare const sendEmailWorker: Worker<SendEmailJobData | SendErrorEmailJobData, any, string>;
export {};
//# sourceMappingURL=sendEmail.worker.d.ts.map