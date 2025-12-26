"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = exports.AnalyticsService = void 0;
const Analytics_1 = require("../models/Analytics");
const logger_1 = require("../lib/logger");
class AnalyticsService {
    async recordMetric(userId, metric, value) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let analytics = await Analytics_1.Analytics.findOne({ userId, date: today });
            if (!analytics) {
                analytics = await Analytics_1.Analytics.create({
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
            analytics.metrics[metric] = (analytics.metrics[metric] || 0) + value;
            await analytics.save();
        }
        catch (error) {
            logger_1.logger.error("Failed to record metric", { userId, metric, value, error: error.message });
        }
    }
    async getAnalytics(userId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            startDate.setHours(0, 0, 0, 0);
            const analytics = await Analytics_1.Analytics.find({
                userId,
                date: { $gte: startDate },
            }).sort({ date: -1 });
            return analytics;
        }
        catch (error) {
            logger_1.logger.error("Failed to get analytics", { userId, days, error: error.message });
            throw error;
        }
    }
    async updateSuccessRate(userId, success) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let analytics = await Analytics_1.Analytics.findOne({ userId, date: today });
            if (!analytics) {
                analytics = await Analytics_1.Analytics.create({
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
            if (!analytics.metrics) {
                analytics.metrics = {
                    reposConnected: 0,
                    docsGenerated: 0,
                    creditsUsed: 0,
                    averageDiffSize: 0,
                    successRate: 0,
                    failureRate: 0,
                    webhooksReceived: 0,
                    patchesApplied: 0,
                    prsCreated: 0,
                };
            }
            const total = analytics.metrics.successRate + analytics.metrics.failureRate + 1;
            if (success) {
                analytics.metrics.successRate += 1;
            }
            else {
                analytics.metrics.failureRate += 1;
            }
            // Recalculate rates
            const successCount = analytics.metrics.successRate;
            const failureCount = analytics.metrics.failureRate;
            analytics.metrics.successRate = successCount / total;
            analytics.metrics.failureRate = failureCount / total;
            await analytics.save();
        }
        catch (error) {
            logger_1.logger.error("Failed to update success rate", { userId, success, error: error.message });
        }
    }
}
exports.AnalyticsService = AnalyticsService;
exports.analyticsService = new AnalyticsService();
//# sourceMappingURL=analytics.service.js.map