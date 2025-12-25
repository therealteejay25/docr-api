import { Analytics } from "../models/Analytics";
import { logger } from "../lib/logger";

type MetricKey = "reposConnected" | "docsGenerated" | "creditsUsed" | "averageDiffSize" | "successRate" | "failureRate" | "webhooksReceived" | "patchesApplied" | "prsCreated";

export class AnalyticsService {
  async recordMetric(
    userId: string,
    metric: MetricKey,
    value: number
  ): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let analytics = await Analytics.findOne({ userId, date: today });
      if (!analytics) {
        analytics = await Analytics.create({
          userId,
          date: today,
          metrics: {
            reposConnected: 0,
            docsGenerated: 0,
            creditsUsed: 0,
            averageDiffSize: 0,
            successRate: 0,
            failureRate: 0,
            webhooksReceived: 0,
            patchesApplied: 0,
            prsCreated: 0,
          },
        });
      }

      (analytics.metrics as any)[metric] = ((analytics.metrics as any)[metric] || 0) + value;
      await analytics.save();
    } catch (error: any) {
      logger.error("Failed to record metric", { userId, metric, value, error: error.message });
    }
  }

  async getAnalytics(userId: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const analytics = await Analytics.find({
        userId,
        date: { $gte: startDate },
      }).sort({ date: -1 });

      return analytics;
    } catch (error: any) {
      logger.error("Failed to get analytics", { userId, days, error: error.message });
      throw error;
    }
  }

  async updateSuccessRate(userId: string, success: boolean): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let analytics = await Analytics.findOne({ userId, date: today });
      if (!analytics) {
        analytics = await Analytics.create({
          userId,
          date: today,
          metrics: {
            reposConnected: 0,
            docsGenerated: 0,
            creditsUsed: 0,
            averageDiffSize: 0,
            successRate: 0,
            failureRate: 0,
            webhooksReceived: 0,
            patchesApplied: 0,
            prsCreated: 0,
          },
        });
      }

      const total = analytics.metrics.successRate + analytics.metrics.failureRate + 1;
      if (success) {
        analytics.metrics.successRate += 1;
      } else {
        analytics.metrics.failureRate += 1;
      }

      // Recalculate rates
      const successCount = analytics.metrics.successRate;
      const failureCount = analytics.metrics.failureRate;
      analytics.metrics.successRate = successCount / total;
      analytics.metrics.failureRate = failureCount / total;

      await analytics.save();
    } catch (error: any) {
      logger.error("Failed to update success rate", { userId, success, error: error.message });
    }
  }
}

export const analyticsService = new AnalyticsService();

