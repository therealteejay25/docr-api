"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocGenerator = void 0;
const ContextBuilder_1 = require("./ContextBuilder");
const PromptBuilder_1 = require("./PromptBuilder");
const ai_service_1 = require("../../services/ai.service");
const logger_1 = require("../../lib/logger");
class DocGenerator {
    constructor() {
        this.contextBuilder = new ContextBuilder_1.ContextBuilder();
        this.promptBuilder = new PromptBuilder_1.PromptBuilder();
    }
    async generate(options) {
        const { repoId, userId, branch, fileDiffs, commitMessage, repoContext, existingDocs, } = options;
        logger_1.logger.info("DocGenerator: Building context...", { repoId });
        // 1. Build context
        const projectAnalysis = await this.contextBuilder.buildProjectAnalysis(repoId, userId, branch);
        const input = {
            fileDiffs,
            commitMessage,
            repoContext,
            existingDocs,
            projectAnalysis,
        };
        // 2. Build prompts
        const systemPrompt = this.promptBuilder.buildSystemPrompt();
        const userPrompt = this.promptBuilder.buildUserPrompt(input);
        logger_1.logger.info("DocGenerator: Calling AI service...", { repoId });
        // 3. Call AI Service (Simplified)
        // We expect aiService to handle the raw completion and JSON parsing now,
        // or we can move parsing here. For now, let's keep parsing in AI service 
        // but pass the prompts directly to avoid the old rigid interface.
        // However, since we are refactoring ai.service to be simpler, 
        // let's assume we call a method that takes messages.
        // NOTE: This assumes we refactor aiService to expose generateCompletion or similar.
        // For now, mapping to existing generateDocumentation for compatibility if needed,
        // OR properly using the new generateCompletion method we plan to add.
        // Let's use the new method name we plan to add: generateCompletion
        const result = await ai_service_1.aiService.generateCompletion([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ], "anthropic/claude-3.5-sonnet" // or from env
        );
        return result;
    }
}
exports.DocGenerator = DocGenerator;
//# sourceMappingURL=DocGenerator.js.map