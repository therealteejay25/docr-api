"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const analytics_service_1 = require("../services/analytics.service");
const logger_1 = require("../lib/logger");
const getAnalytics = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const days = parseInt(req.query.days) || 30;
        const analytics = await analytics_service_1.analyticsService.getAnalytics(req.user.userId, days);
        return res.json({ analytics });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Failed to get analytics", { error: errorMessage });
        return res.status(500).json({ error: "Failed to fetch analytics" });
    }
};
exports.getAnalytics = getAnalytics;
//# sourceMappingURL=analytics.controller.js.map