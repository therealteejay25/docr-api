"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGitHubToken = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const GITHUB_CLIENT_ID = env_1.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = env_1.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = env_1.env.GITHUB_REDIRECT_URI;
const getGitHubToken = async (code) => {
    const response = await axios_1.default.post("https://github.com/login/oauth/access_token", {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_REDIRECT_URI,
    }, {
        headers: {
            Accept: "application/json",
        },
    });
    if (response.data.error) {
        throw new Error(`GitHub OAuth Error: ${response.data.error_description}`);
    }
    return response.data.access_token;
};
exports.getGitHubToken = getGitHubToken;
//# sourceMappingURL=github.js.map