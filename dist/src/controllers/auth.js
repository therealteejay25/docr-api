"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.gitHubCallback = exports.redirectToGitHub = void 0;
const github_1 = require("../config/scopes/github");
const env_1 = require("../config/env");
const github_2 = require("../utils/github");
const User_1 = require("../models/User");
const encryption_1 = require("../utils/encryption");
const jwt_1 = require("../utils/jwt");
const credits_service_1 = require("../services/credits.service");
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../lib/logger");
const GITHUB_CLIENT_ID = env_1.env.GITHUB_CLIENT_ID;
const GITHUB_REDIRECT_URI = env_1.env.GITHUB_REDIRECT_URI;
const redirectToGitHub = (_req, res) => {
    const scopes = github_1.githubScopes.join(",");
    try {
        const state = Math.random().toString(36).substring(7);
        const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&state=${state}`;
        res.redirect(url);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return res
            .status(500)
            .json({ message: "Unable to get GitHub OAuth url", err: errorMessage });
    }
};
exports.redirectToGitHub = redirectToGitHub;
const gitHubCallback = async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).json({ message: "No code provided." });
    }
    try {
        const tokenRes = await (0, github_2.getGitHubToken)(code);
        const userCheck = await axios_1.default.get("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${tokenRes}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "Docr",
            },
        });
        const userProfile = userCheck.data;
        const { encrypted, iv } = (0, encryption_1.encrypt)(tokenRes);
        let user = await User_1.User.findOne({ githubId: userProfile.id });
        if (!user) {
            user = await User_1.User.findOne({ email: userProfile.email });
        }
        if (user) {
            user.githubId = userProfile.id;
            user.githubToken = encrypted;
            user.githubTokenIv = iv;
            user.name = userProfile.name || user.name;
            user.avatarUrl = userProfile.avatar_url;
            await user.save();
        }
        else {
            user = await User_1.User.create({
                githubId: userProfile.id,
                name: userProfile.name,
                email: userProfile.email || `${userProfile.login}@users.noreply.github.com`,
                avatarUrl: userProfile.avatar_url,
                githubToken: encrypted,
                githubTokenIv: iv,
            });
            // Initialize credits for new user
            await credits_service_1.creditsService.getOrCreateCredits(user._id.toString());
        }
        const accessToken = (0, jwt_1.generateAccessToken)({
            userId: user._id.toString(),
            email: user.email,
        });
        const refreshToken = (0, jwt_1.generateRefreshToken)({
            userId: user._id.toString(),
            email: user.email,
        });
        user.refreshToken = refreshToken;
        await user.save();
        // Redirect to frontend with tokens
        const frontendUrl = "http://localhost:3000";
        res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&refresh=${refreshToken}`);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        logger_1.logger.error("GitHub OAuth callback failed", { error: errorMessage });
        return res
            .status(500)
            .json({ message: "Authentication failed", error: errorMessage });
    }
};
exports.gitHubCallback = gitHubCallback;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            return res.status(400).json({ error: "Refresh token required" });
        }
        const { verifyRefreshToken } = await Promise.resolve().then(() => __importStar(require("../utils/jwt")));
        const payload = verifyRefreshToken(token);
        const user = await User_1.User.findById(payload.userId);
        if (!user || user.refreshToken !== token) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }
        const accessToken = (0, jwt_1.generateAccessToken)({
            userId: user._id.toString(),
            email: user.email,
        });
        return res.json({ accessToken });
    }
    catch (error) {
        return res.status(401).json({ error: "Invalid refresh token" });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (token) {
            const user = await User_1.User.findOne({ refreshToken: token });
            if (user) {
                user.refreshToken = undefined;
                await user.save();
            }
        }
        res.json({ message: "Logged out successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Logout failed" });
    }
};
exports.logout = logout;
//# sourceMappingURL=auth.js.map