import { githubService } from "../../services/github.service";
import { Repo } from "../../models/Repo";
import { logger } from "../../lib/logger";

export interface ProjectAnalysis {
  packageJson?: any;
  projectDescription?: string;
  structure?: string[];
  mainFiles: Array<{ path: string; content: string }>;
}

export class ContextBuilder {
  /**
   * Build project analysis by fetching package.json, structure, and key files
   */
  async buildProjectAnalysis(
    repoId: string,
    userId: string,
    branch: string
  ): Promise<ProjectAnalysis> {
    const repo = await Repo.findById(repoId);
    if (!repo) throw new Error("Repo not found");

    const analysis: ProjectAnalysis = {
      packageJson: repo.packageJson || null,
      projectDescription: repo.description || null,
      mainFiles: [],
    };

    const [owner, repoName] = repo.fullName.split("/");

    // 1. Fetch package.json if missing
    if (!analysis.packageJson) {
      try {
        const pkgContent = await githubService.getFileContent(
          userId,
          owner,
          repoName,
          "package.json",
          branch
        );
        analysis.packageJson = JSON.parse(pkgContent);
      } catch {
       logger.warn("Could not fetch or parse package.json", { repoId });
      }
    }

    // 2. Get repository structure
    try {
      const listing = await githubService.getRepositoryStructure(
        userId,
        owner,
        repoName,
        "",
        branch
      );

      analysis.structure = listing.map((item: any) => item.path || item.name);

      // 3. Pick key files (up to 12)
      const candidateFiles = listing
        .filter((f: any) => f.type === "file")
        .map((f: any) => f.path || f.name)
        .filter((p: string) => /\.(js|ts|tsx|md|json)$/.test(p))
        .slice(0, 12);

      for (const pathItem of candidateFiles) {
        try {
          const content = await githubService.getFileContent(
            userId,
            owner,
            repoName,
            pathItem,
            branch
          );
          analysis.mainFiles.push({ path: pathItem, content });
        } catch {
          // ignore failures
        }
      }
    } catch (e) {
      logger.warn("Failed to fetch repo structure", { error: e.message, repoId });
    }

    return analysis;
  }
}
