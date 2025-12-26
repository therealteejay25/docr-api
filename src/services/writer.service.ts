import { githubService } from "./github.service";
import { logger } from "../lib/logger";
import { Repo } from "../models/Repo";

export interface WriteOptions {
  userId: string;
  repoId: string;
  files: Array<{
    path: string;
    content: string;
    sha?: string;
  }>;
  message: string;
  branch?: string;
  createPR?: boolean;
}

export class WriterService {
  /**
   * Write files directly to GitHub
   */
  async writeFiles(
    options: WriteOptions
  ): Promise<{
    success: boolean;
    prUrl?: string;
    commitSha?: string;
    commitUrl?: string;
  }> {
    try {
      const repo = await Repo.findById(options.repoId);
      if (!repo) {
        throw new Error("Repo not found");
      }

      const [owner, repoName] = repo.fullName.split("/");
      const branch =
        options.branch ||
        repo.settings?.branchPreference ||
        repo.defaultBranch ||
        "main";

      logger.info("Writing files to GitHub", {
        repoId: options.repoId,
        owner,
        repoName,
        branch,
        fileCount: options.files.length,
        createPR: options.createPR,
      });

      // If caller requests direct push, attempt direct write to target branch
      if (options.createPR === false) {
        const direct = await this.writeFilesDirect({
          ...options,
          owner,
          repoName,
          branch,
        });

        const commitSha = direct.commitSha;
        const commitUrl = commitSha
          ? `https://github.com/${owner}/${repoName}/commit/${commitSha}`
          : undefined;

        logger.info("Direct write result", {
          directResult: direct,
          commitSha,
          commitUrl,
        });

        return {
          success: true,
          commitSha,
          commitUrl,
        };
      }

      // Default behavior: create PR with changes
      return await this.createPRWithChanges({
        ...options,
        owner,
        repoName,
        branch,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Failed to write files", {
        repoId: options.repoId,
        error: errorMessage,
      });
      throw error;
    }
  }

  // Write files directly (not currently used - always create PR instead)
  private async writeFilesDirect(
    options: WriteOptions & { owner: string; repoName: string; branch: string }
  ): Promise<{ success: boolean; commitSha?: string }> {
    try {
      const results = [];
      for (const file of options.files) {
        try {
          // Get current file SHA if exists
          let sha: string | undefined = file.sha;
          if (!sha) {
            try {
              await githubService.getFileContent(
                options.userId,
                options.owner,
                options.repoName,
                file.path,
                options.branch
              );
              // File exists, need to get SHA
              const { Octokit } = await import("@octokit/rest");
              const user = await import("../models/User").then((m) =>
                m.User.findById(options.userId)
              );
              if (user && user.githubToken && user.githubTokenIv) {
                const { decrypt } = await import("../utils/encryption");
                const token = decrypt(user.githubToken, user.githubTokenIv);
                const octokit = new Octokit({ auth: token });
                const { data } = await octokit.repos.getContent({
                  owner: options.owner,
                  repo: options.repoName,
                  path: file.path,
                  ref: options.branch,
                });
                if (!Array.isArray(data) && data.type === "file") {
                  sha = data.sha;
                }
              }
            } catch {
              // File doesn't exist, will create new
              sha = undefined;
            }
          }

          const result = await githubService.updateFile(
            options.userId,
            options.owner,
            options.repoName,
            file.path,
            options.message,
            file.content,
            sha || "",
            options.branch
          );
          results.push(result);
          // Log each file update result to console for visibility
          try {
            // eslint-disable-next-line no-console
            console.log(
              "[writeFilesDirect update result]",
              JSON.stringify(result)
            );
            logger.info("writeFilesDirect update result", {
              path: file.path,
              result: JSON.stringify(result).slice(0, 2000),
            });
          } catch (e) {
            logger.warn("Failed to log writeFilesDirect update result", {
              path: file.path,
            });
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          logger.error("Failed to write file", {
            userId: options.userId,
            repoId: options.repoId,
            path: file.path,
            error: errorMessage,
          });
          throw error;
        }
      }

      return {
        success: true,
        commitSha: results[results.length - 1]?.commit?.sha,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Failed to write files directly", {
        userId: options.userId,
        repoId: options.repoId,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * Create PR with changes
   */
  private async createPRWithChanges(
    options: WriteOptions & { owner: string; repoName: string; branch: string }
  ): Promise<{ success: boolean; prUrl: string }> {
    try {
      const prBranch = `docr-update-${Date.now()}`;

      // Create branch
      await githubService.createBranch(
        options.userId,
        options.owner,
        options.repoName,
        prBranch,
        options.branch
      );

      // Write files to PR branch
      for (const file of options.files) {
        let sha: string | undefined = file.sha;
        if (!sha) {
          try {
            await githubService.getFileContent(
              options.userId,
              options.owner,
              options.repoName,
              file.path,
              options.branch
            );
            // Get SHA
            const { Octokit } = await import("@octokit/rest");
            const user = await import("../models/User").then((m) =>
              m.User.findById(options.userId)
            );
            if (user && user.githubToken && user.githubTokenIv) {
              const { decrypt } = await import("../utils/encryption");
              const token = decrypt(user.githubToken, user.githubTokenIv);
              const octokit = new Octokit({ auth: token });
              const { data } = await octokit.repos.getContent({
                owner: options.owner,
                repo: options.repoName,
                path: file.path,
                ref: options.branch,
              });
              if (!Array.isArray(data) && data.type === "file") {
                sha = data.sha;
              }
            }
          } catch {
            sha = undefined;
          }
        }

        await githubService.updateFile(
          options.userId,
          options.owner,
          options.repoName,
          file.path,
          options.message,
          file.content,
          sha || "",
          prBranch
        );
      }

      // Create PR
      const pr = await githubService.createPullRequest(
        options.userId,
        options.owner,
        options.repoName,
        options.message,
        `Automated documentation update by Docr.\n\n${options.message}`,
        prBranch,
        options.branch
      );

      // Log full PR response
      logger.info("PR created successfully", {
        userId: options.userId,
        owner: options.owner,
        repo: options.repoName,
        prData: JSON.stringify(pr),
      });

      return {
        success: true,
        prUrl: pr.html_url,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Failed to create PR", {
        userId: options.userId,
        owner: options.owner,
        repo: options.repoName,
        error: errorMessage,
      });
      throw error;
    }
  }
}

export const writerService = new WriterService();
