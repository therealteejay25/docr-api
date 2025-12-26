type MetricKey = "reposConnected" | "docsGenerated" | "creditsUsed" | "averageDiffSize" | "successRate" | "failureRate" | "webhooksReceived" | "patchesApplied" | "prsCreated" | "commitsPushed";
export declare class AnalyticsService {
    recordMetric(userId: string, metric: MetricKey, value: number): Promise<void>;
    getAnalytics(userId: string, days?: number): Promise<any>;
    updateSuccessRate(userId: string, success: boolean): Promise<void>;
}
export declare const analyticsService: AnalyticsService;
export {};
//# sourceMappingURL=analytics.service.d.ts.map