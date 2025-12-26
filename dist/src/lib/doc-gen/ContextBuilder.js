"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextBuilder = void 0;
const github_service_1 = require("../../services/github.service");
const Repo_1 = require("../../models/Repo");
const logger_1 = require("../../lib/logger");
class ContextBuilder {
    /**
     * Build project analysis by fetching package.json, structure, and key files
     */
    async buildProjectAnalysis(repoId, userId, branch) {
        const repo = await Repo_1.Repo.findById(repoId);
        if (!repo)
            throw new Error("Repo not found");
        const analysis = {
            packageJson: repo.packageJson || null,
            projectDescription: repo.description || null,
            mainFiles: [],
        };
        const [owner, repoName] = repo.fullName.split("/");
        // 1. Fetch package.json if missing
        if (!analysis.packageJson) {
            try {
                const pkgContent = await github_service_1.githubService.getFileContent(userId, owner, repoName, "package.json", branch);
                analysis.packageJson = JSON.parse(pkgContent);
            }
            catch {
                logger_1.logger.warn("Could not fetch or parse package.json", { repoId });
            }
        }
        // 2. Get repository structure
        try {
            const listing = await github_service_1.githubService.getRepositoryStructure(userId, owner, repoName, "", branch);
            analysis.structure = listing.map((item) => item.path || item.name);
            // 3. Pick key files (up to 12)
            const candidateFiles = listing
                .filter((f) => f.type === "file")
                .map((f) => f.path || f.name)
                .filter((p) => /\.(js|ts|tsx|md|json)$/.test(p))
                .slice(0, 12);
            for (const pathItem of candidateFiles) {
                try {
                    const content = await github_service_1.githubService.getFileContent(userId, owner, repoName, pathItem, branch);
                    analysis.mainFiles.push({ path: pathItem, content });
                }
                catch {
                    // ignore failures
                }
            }
        }
        catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error";
            logger_1.logger.warn("Failed to fetch repo structure", { error: errorMessage, repoId });
        }
        return analysis;
    }
}
exports.ContextBuilder = ContextBuilder;
//# sourceMappingURL=ContextBuilder.js.map