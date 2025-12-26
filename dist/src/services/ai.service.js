"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AIService = void 0;
const openai_1 = __importDefault(require("openai"));
const env_1 = require("../config/env");
const logger_1 = require("../lib/logger");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/* =======================
   Validation
======================= */
// Unused validation function, may be used in future
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
function _isValidDocOutput(o) {
    return (o &&
        Array.isArray(o.patches) &&
        o.patches.every((p) => typeof p.file === "string" &&
            typeof p.patch === "string" &&
            typeof p.reason === "string") &&
        typeof o.summary === "string" &&
        typeof o.coverageScore === "number" &&
        o.structuredDoc &&
        Array.isArray(o.structuredDoc.sections));
}
/* =======================
   Service
======================= */
class AIService {
    constructor() {
        this.client = new openai_1.default({
            apiKey: env_1.env.OPENAI_KEY,
            baseURL: env_1.env.OPENAI_API_BASE || "https://openrouter.ai/api/v1",
        });
    }
    /**
     * Generic completion method that returns parsed JSON
     */
    async generateCompletion(messages, model = "google/gemini-2.0-flash-001") {
        try {
            logger_1.logger.info("Generating AI completion", { model });
            const response = await this.client.chat.completions.create({
                model,
                temperature: 0,
                max_tokens: 8000,
                response_format: { type: "json_object" },
                messages,
            });
            // Extract content
            let rawContentStr = "";
            const choice = response?.choices?.[0];
            if (choice?.message?.content) {
                rawContentStr = choice.message.content;
            }
            else {
                throw new Error("No content in AI response");
            }
            // Log raw response for debugging
            console.log("=== AI RESPONSE START ===");
            console.log("Response length:", rawContentStr.length);
            console.log("Raw AI Response:", rawContentStr);
            console.log("=== AI RESPONSE END ===");
            this.logRawResponse(rawContentStr);
            // Parse JSON
            return this.parseJsonSafely(rawContentStr);
        }
        catch (err) {
            // Re-enable console logging for debugging
            console.error("AI Service Error:", err);
            if (err.response) {
                console.error("AI Service Error Response:", err.response.data);
            }
            logger_1.logger.error("AI completion failed", {
                error: err.message,
                name: err.name,
                stack: err.stack,
                code: err.code,
                status: err.status,
            });
            throw err;
        }
    }
    parseJsonSafely(jsonStr) {
        try {
            // 1. Try direct parse
            return JSON.parse(jsonStr);
        }
        catch (e) {
            // 2. Try unwrap double encoding
            try {
                const inner = JSON.parse(jsonStr);
                if (typeof inner === "string")
                    return JSON.parse(inner);
            }
            catch (_) {
                // ignore
            }
            // 3. Try to extract from markdown fences
            const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/i);
            if (match) {
                try {
                    return JSON.parse(match[1]);
                }
                catch (_) {
                    // ignore
                }
            }
            throw new Error("Failed to parse AI JSON response");
        }
    }
    logRawResponse(content) {
        try {
            const logsDir = path_1.default.join(process.cwd(), "logs", "ai-responses");
            if (!fs_1.default.existsSync(logsDir))
                fs_1.default.mkdirSync(logsDir, { recursive: true });
            fs_1.default.writeFileSync(path_1.default.join(logsDir, `${Date.now()}-ai-response.json`), content, "utf-8");
        }
        catch (e) {
            // ignore logging errors
        }
    }
}
exports.AIService = AIService;
exports.aiService = new AIService();
//# sourceMappingURL=ai.service.js.map