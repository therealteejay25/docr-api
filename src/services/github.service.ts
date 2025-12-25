import { Octokit } from "@octokit/rest";
import { User } from "../models/User";
import { decrypt } from "../utils/encryption";
import { logger } from "../lib/logger";

export class GitHubService {
  /**
   * Get authenticated Octokit instance for a user
   */
  private async getOctokit(userId: string): Promise<Octokit> {
    const user = await User.findById(userId);
    if (!user || !user.githubToken || !user.githubTokenIv) {
      throw new Error("User not found or GitHub token missing");
    }

    const token = decrypt(user.githubToken, user.githubTokenIv);
    return new Octokit({ auth: token });
  }

  /**
   * Get a single commit by sha
   */
  async getCommit(
    userId: string,
    owner: string,
    repo: string,
    sha: string
  ): Promise<any> {
    try {
      const octokit = await this.getOctokit(userId);
      const response = await octokit.repos.getCommit({ owner, repo, ref: sha });
      return response.data;
    } catch (error) {
      logger.error("Failed to get commit", {
        userId,
        owner,
        repo,
        sha,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get the diff between two commits (parent -> head)
   */
  async getCommitDiff(
    userId: string,
    owner: string,
    repo: string,
    base: string,
    head: string
  ): Promise<any> {
    try {
      const octokit = await this.getOctokit(userId);
      // Use compareCommits to get files and patches between two SHAs
      const response = await octokit.repos.compareCommits({
        owner,
        repo,
        base,
        head,
      });
      return response.data;
    } catch (error) {
      logger.error("Failed to get commit diff", {
        userId,
        owner,
        repo,
        base,
        head,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get file content from a repository
   */
  async getFileContent(
    userId: string,
    owner: string,
    repo: string,
    path: string,
    branch?: string
  ): Promise<string> {
    try {
      const octokit = await this.getOctokit(userId);

      const response = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      if (Array.isArray(response.data)) {
        throw new Error("Path is a directory, not a file");
      }

      if (response.data.type !== "file") {
        throw new Error("Path is not a file");
      }

      // GitHub returns base64 encoded content
      const content = Buffer.from(response.data.content, "base64").toString(
        "utf-8"
      );
      return content;
    } catch (error) {
      // Don't log 404 errors as they are expected when files don't exist
      if (error.status !== 404) {
        logger.error("Failed to get file content", {
          userId,
          owner,
          repo,
          path,
          error: error.message,
        });
      }
      throw error;
    }
  }

  /**
   * Update or create a file in the repository
   */
  async updateFile(
    userId: string,
    owner: string,
    repo: string,
    path: string,
    message: string,
    content: string,
    sha?: string,
    branch?: string
  ): Promise<any> {
    try {
      const octokit = await this.getOctokit(userId);

      const params: any = {
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString("base64"),
        branch,
      };

      // If SHA is provided, it's an update; otherwise, create new file
      if (sha) {
        params.sha = sha;
      }

      const response = await octokit.repos.createOrUpdateFileContents(params);

      // Log the full response for debugging
      try {
        const respStr = JSON.stringify(response.data);
        logger.info("File updated/created successfully", {
          userId,
          owner,
          repo,
          path,
          sha: response.data.commit.sha,
          rawResponse: respStr.slice(0, 2000),
        });
        // Also output full response to console for immediate visibility
        // eslint-disable-next-line no-console
        console.log("[Octokit updateFile response]", respStr);
      } catch (e) {
        logger.info(
          "File updated/created successfully (logging failed to stringify full response)",
          {
            userId,
            owner,
            repo,
            path,
          }
        );
      }

      return response.data;
    } catch (error) {
      logger.error("Failed to update file", {
        userId,
        owner,
        repo,
        path,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Create a new branch from an existing branch
   */
  async createBranch(
    userId: string,
    owner: string,
    repo: string,
    newBranch: string,
    baseBranch: string = "main"
  ): Promise<void> {
    try {
      const octokit = await this.getOctokit(userId);

      // Get the SHA of the base branch
      const baseRef = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${baseBranch}`,
      });

      // Create new branch
      await octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${newBranch}`,
        sha: baseRef.data.object.sha,
      });

      logger.info("Branch created successfully", {
        userId,
        owner,
        repo,
        newBranch,
        baseBranch,
      });
    } catch (error) {
      logger.error("Failed to create branch", {
        userId,
        owner,
        repo,
        newBranch,
        baseBranch,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Create a pull request
   */
  async createPullRequest(
    userId: string,
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base: string = "main"
  ): Promise<any> {
    try {
      const octokit = await this.getOctokit(userId);

      const response = await octokit.pulls.create({
        owner,
        repo,
        title,
        body,
        head,
        base,
      });

      logger.info("Pull request created successfully", {
        userId,
        owner,
        repo,
        prNumber: response.data.number,
        prUrl: response.data.html_url,
      });

      return response.data;
    } catch (error) {
      logger.error("Failed to create pull request", {
        userId,
        owner,
        repo,
        title,
        head,
        base,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get repository information
   */
  async getRepository(
    userId: string,
    owner: string,
    repo: string
  ): Promise<any> {
    try {
      const octokit = await this.getOctokit(userId);

      const response = await octokit.repos.get({
        owner,
        repo,
      });

      return response.data;
    } catch (error) {
      logger.error("Failed to get repository info", {
        userId,
        owner,
        repo,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get commits for a repository
   */
  async getCommits(
    userId: string,
    owner: string,
    repo: string,
    branch?: string,
    perPage: number = 10
  ): Promise<any[]> {
    try {
      const octokit = await this.getOctokit(userId);

      const response = await octokit.repos.listCommits({
        owner,
        repo,
        sha: branch,
        per_page: perPage,
      });

      return response.data.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name,
        date: commit.commit.author?.date,
        url: commit.html_url,
      }));
    } catch (error) {
      logger.error("Failed to get commits", {
        userId,
        owner,
        repo,
        branch,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get repository structure (files and directories)
   */
  async getRepositoryStructure(
    userId: string,
    owner: string,
    repo: string,
    path: string = "",
    branch?: string
  ): Promise<any[]> {
    try {
      const octokit = await this.getOctokit(userId);

      const response = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      // Don't log 404 for missing paths
      if (error.status !== 404) {
        logger.error("Failed to get repository structure", {
          userId,
          owner,
          repo,
          path,
          error: error.message,
        });
      }
      throw error;
    }
  }
}

export const githubService = new GitHubService();
