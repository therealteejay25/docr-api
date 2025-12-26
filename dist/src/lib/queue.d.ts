import { Queue, QueueEvents } from "bullmq";
export declare const QUEUE_NAMES: {
    readonly PROCESS_COMMIT: "process_commit";
    readonly GENERATE_DOCS: "generate_docs";
    readonly APPLY_PATCH: "apply_patch";
    readonly SEND_EMAIL: "send_email";
    readonly RECOMPUTE_COVERAGE: "recompute_coverage";
};
export declare const processCommitQueue: Queue<any, any, string, any, any, string>;
export declare const generateDocsQueue: Queue<any, any, string, any, any, string>;
export declare const applyPatchQueue: Queue<any, any, string, any, any, string>;
export declare const sendEmailQueue: Queue<any, any, string, any, any, string>;
export declare const recomputeCoverageQueue: Queue<any, any, string, any, any, string>;
export declare const queueEvents: QueueEvents;
export declare function addJob<T>(queue: Queue, jobName: string, data: T, options?: {
    priority?: number;
    delay?: number;
    jobId?: string;
}): Promise<string>;
//# sourceMappingURL=queue.d.ts.map