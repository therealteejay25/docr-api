"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCredits = exports.getCredits = void 0;
const credits_service_1 = require("../services/credits.service");
const logger_1 = require("../lib/logger");
const getCredits = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const balance = await credits_service_1.creditsService.getBalance(req.user.userId);
        const isBelowThreshold = await credits_service_1.creditsService.isBelowThreshold(req.user.userId);
        return res.json({
            balance,
            isBelowThreshold,
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Failed to get credits", { error: errorMessage });
        return res.status(500).json({ error: "Failed to fetch credits" });
    }
};
exports.getCredits = getCredits;
const addCredits = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }
        await credits_service_1.creditsService.addCredits(req.user.userId, amount, "Manual top-up");
        const balance = await credits_service_1.creditsService.getBalance(req.user.userId);
        return res.json({
            balance,
            message: "Credits added successfully",
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Failed to add credits", { error: errorMessage });
        return res.status(500).json({ error: "Failed to add credits" });
    }
};
exports.addCredits = addCredits;
//# sourceMappingURL=credits.controller.js.map