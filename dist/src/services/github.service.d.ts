export declare class GitHubService {
    /**
     * Get authenticated Octokit instance for a user
     */
    private getOctokit;
    /**
     * Get a single commit by sha
     */
    getCommit(userId: string, owner: string, repo: string, sha: string): Promise<any>;
    /**
     * Get the diff between two commits (parent -> head)
     */
    getCommitDiff(userId: string, owner: string, repo: string, base: string, head: string): Promise<any>;
    /**
     * Get file content from a repository
     */
    getFileContent(userId: string, owner: string, repo: string, path: string, branch?: string): Promise<string>;
    /**
     * Update or create a file in the repository
     */
    updateFile(userId: string, owner: string, repo: string, path: string, message: string, content: string, sha?: string, branch?: string): Promise<any>;
    /**
     * Create a new branch from an existing branch
     */
    createBranch(userId: string, owner: string, repo: string, newBranch: string, baseBranch?: string): Promise<void>;
    /**
     * Create a pull request
     */
    createPullRequest(userId: string, owner: string, repo: string, title: string, body: string, head: string, base?: string): Promise<any>;
    /**
     * Get repository information
     */
    getRepository(userId: string, owner: string, repo: string): Promise<any>;
    /**
     * Get commits for a repository
     */
    getCommits(userId: string, owner: string, repo: string, branch?: string, perPage?: number): Promise<any[]>;
    /**
     * Get repository structure (files and directories)
     */
    getRepositoryStructure(userId: string, owner: string, repo: string, path?: string, branch?: string): Promise<any[]>;
    /**
     * Get user's repositories
     */
    getUserRepos(userId: string): Promise<any[]>;
    /**
     * Get repository information (alias for getRepository)
     */
    getRepo(userId: string, owner: string, name: string): Promise<any>;
    /**
     * Check if user has write access to a repository
     */
    checkWriteAccess(userId: string, owner: string, repo: string): Promise<boolean>;
    /**
     * Create a webhook for a repository
     */
    createWebhook(userId: string, owner: string, repo: string, url: string, secret: string): Promise<any>;
    /**
     * Delete a webhook from a repository
     */
    deleteWebhook(userId: string, owner: string, repo: string, webhookId: number): Promise<void>;
}
export declare const githubService: GitHubService;
//# sourceMappingURL=github.service.d.ts.map