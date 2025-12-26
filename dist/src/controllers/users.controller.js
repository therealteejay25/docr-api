"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = exports.getUser = void 0;
const User_1 = require("../models/User");
const logger_1 = require("../lib/logger");
const getUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await User_1.User.findById(req.user.userId).select("-githubToken -githubTokenIv -refreshToken");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                githubId: user.githubId,
            },
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Failed to get user", {
            userId: req.user?.userId,
            error: errorMessage,
        });
        return res.status(500).json({ error: "Failed to get user" });
    }
};
exports.getUser = getUser;
const getSettings = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await User_1.User.findById(req.user.userId).select("settings");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json({
            settings: user.settings || {
                emailNotifications: true,
                weeklyReport: true,
                autoGenerate: true,
                slackIntegration: false,
            },
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Failed to get settings", {
            userId: req.user?.userId,
            error: errorMessage,
        });
        return res.status(500).json({ error: "Failed to get settings" });
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { settings } = req.body;
        if (!settings || typeof settings !== "object") {
            return res.status(400).json({ error: "Invalid settings provided" });
        }
        const user = await User_1.User.findByIdAndUpdate(req.user.userId, { settings }, { new: true });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json({
            settings: user.settings,
            message: "Settings updated successfully",
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Failed to update settings", {
            userId: req.user?.userId,
            error: errorMessage,
        });
        return res.status(500).json({ error: "Failed to update settings" });
    }
};
exports.updateSettings = updateSettings;
//# sourceMappingURL=users.controller.js.map