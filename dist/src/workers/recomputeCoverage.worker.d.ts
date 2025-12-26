import { Worker } from "bullmq";
interface RecomputeCoverageJobData {
    repoId: string;
    userId: string;
}
export declare const recomputeCoverageWorker: Worker<RecomputeCoverageJobData, any, string>;
export {};
//# sourceMappingURL=recomputeCoverage.worker.d.ts.map