import OpenAI from "openai";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import { githubService } from "./github.service";
import { creditsService } from "./credits.service";
import { analyticsService } from "./analytics.service";
import { Repo } from "../models/Repo";
import { Job } from "../models/Job";
import { WebhookEvent } from "../models/WebhookEvent";
import { User } from "../models/User";
import { processCommitQueue, addJob } from "../lib/queue";

export interface AgentRequest {
  userId: string;
  message: string;
  context?: Record<string, any>;
}

export interface AgentResponse {
  message: string;
  status?: "thinking" | "executing" | "asking" | "completed" | "error";
  actions?: Array<{
    type: string;
    description: string;
    result?: any;
    status?: "pending" | "executing" | "completed" | "failed";
  }>;
  confirmation?: {
    type: "permission" | "choice" | "input";
    message: string;
    options?: Array<{ label: string; value: string }>;
    required?: boolean;
  };
  steps?: Array<{
    step: number;
    description: string;
    status: "pending" | "in_progress" | "completed" | "failed";
  }>;
  data?: any;
}

export interface StreamEvent {
  type:
    | "status"
    | "thinking"
    | "action"
    | "confirmation"
    | "step"
    | "message"
    | "result"
    | "error";
  data: any;
  timestamp: number;
}

export class AIAgentService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_KEY,
      baseURL: "https://api.algion.dev/v1",
    });
  }

  async processRequest(
    request: AgentRequest,
    onStream?: (event: StreamEvent) => void
  ): Promise<AgentResponse> {
    try {
      const emit = (event: StreamEvent) => {
        if (onStream) onStream(event);
      };

      emit({
        type: "status",
        data: {
          status: "thinking",
          message: "Let me understand your request...",
        },
        timestamp: Date.now(),
      });

      const user = await User.findById(request.userId);
      if (!user) {
        throw new Error("User not found");
      }

      emit({
        type: "status",
        data: {
          status: "thinking",
          message: "Gathering your account information...",
        },
        timestamp: Date.now(),
      });

      // Get user context
      const userContext = await this.buildUserContext(request.userId);

      // Define available tools
      const tools = this.getAvailableTools();

      emit({
        type: "thinking",
        data: {
          message: "Analyzing your request and determining the best actions...",
        },
        timestamp: Date.now(),
      });

      // Call OpenAI with function calling
      const model = (env.MODEL || "gpt-4o-mini").includes("gpt-4")
        ? env.MODEL || "gpt-4o-mini"
        : "gpt-4o-mini";
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(userContext),
          },
          {
            role: "user",
            content: request.message,
          },
        ],
        tools,
        tool_choice: "auto",
        temperature: 0.7,
      });

      const message = response.choices[0]?.message;
      if (!message) {
        throw new Error("No response from AI");
      }

      // Process tool calls
      const actions: Array<{
        type: string;
        description: string;
        result?: any;
        status?: "pending" | "executing" | "completed" | "failed";
      }> = [];
      const steps: Array<{
        step: number;
        description: string;
        status: "pending" | "in_progress" | "completed" | "failed";
      }> = [];
      let finalMessage = message.content || "";

      if (message.tool_calls && message.tool_calls.length > 0) {
        emit({
          type: "status",
          data: {
            status: "executing",
            message: `I'll execute ${message.tool_calls.length} action(s) to complete your request.`,
          },
          timestamp: Date.now(),
        });

        const toolResults = [];

        for (let i = 0; i < message.tool_calls.length; i++) {
          const toolCall = message.tool_calls[i];
          const stepNum = i + 1;
          const toolName = toolCall.type === "function" ? toolCall.function.name : (toolCall as any).function?.name;
          const toolArgs = toolCall.type === "function" ? JSON.parse(toolCall.function.arguments) : JSON.parse((toolCall as any).function?.arguments || "{}");

          // Check if action needs confirmation
          const needsConfirmation = this.requiresConfirmation(
            toolName,
            toolArgs
          );

          if (needsConfirmation) {
            emit({
              type: "confirmation",
              data: {
                type: "permission",
                message: this.getConfirmationMessage(toolName, toolArgs),
                tool: toolName,
                args: toolArgs,
                step: stepNum,
              },
              timestamp: Date.now(),
            });

            // For now, auto-confirm. In real implementation, wait for user response
            // This would be handled by the streaming endpoint
          }

          const stepDescription = this.getStepDescription(toolName, toolArgs);
          steps.push({
            step: stepNum,
            description: stepDescription,
            status: "in_progress",
          });

          emit({
            type: "step",
            data: {
              step: stepNum,
              description: stepDescription,
              status: "in_progress",
              totalSteps: message.tool_calls.length,
            },
            timestamp: Date.now(),
          });

          emit({
            type: "action",
            data: {
              type: toolName,
              status: "executing",
              description: `Executing: ${stepDescription}`,
            },
            timestamp: Date.now(),
          });

          try {
            const result = await this.executeTool(
              toolName,
              toolArgs,
              request.userId
            );

            actions.push({
              type: toolName,
              description: stepDescription,
              result,
              status: "completed",
            });

            steps[steps.length - 1].status = "completed";

            emit({
              type: "action",
              data: {
                type: toolName,
                status: "completed",
                description: stepDescription,
                result,
              },
              timestamp: Date.now(),
            });

            emit({
              type: "step",
              data: {
                step: stepNum,
                description: stepDescription,
                status: "completed",
                totalSteps: message.tool_calls.length,
              },
              timestamp: Date.now(),
            });

            toolResults.push({
              role: "tool" as const,
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                success: true,
                result,
                message: this.getResultMessage(toolName, result),
              }),
            });
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            logger.error("Tool execution failed", {
              tool: toolName,
              error: errorMessage,
            });

            actions.push({
              type: toolName,
              description: stepDescription,
              result: { error: errorMessage },
              status: "failed",
            });

            steps[steps.length - 1].status = "failed";

            emit({
              type: "action",
              data: {
                type: toolName,
                status: "failed",
                description: stepDescription,
                error: errorMessage,
              },
              timestamp: Date.now(),
            });

            toolResults.push({
              role: "tool" as const,
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                success: false,
                error: errorMessage,
                message: `I encountered an error: ${errorMessage}. Let me know if you'd like me to try a different approach.`,
              }),
            });
          }
        }

        emit({
          type: "status",
          data: {
            status: "executing",
            message:
              "Processing the results and preparing a summary for you...",
          },
          timestamp: Date.now(),
        });

        // Get final response with tool results
        const finalResponse = await this.openai.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content:
                this.getSystemPrompt(userContext) +
                "\n\nAlways respond in natural, conversational language. Explain what you did, the results, and any next steps. Be friendly and helpful.",
            },
            {
              role: "user",
              content: request.message,
            },
            message,
            ...toolResults,
          ],
          temperature: 0.7,
        });

        finalMessage =
          finalResponse.choices[0]?.message?.content || finalMessage;

        emit({
          type: "message",
          data: { message: finalMessage },
          timestamp: Date.now(),
        });
      }

      emit({
        type: "status",
        data: { status: "completed", message: "All done!" },
        timestamp: Date.now(),
      });

      emit({
        type: "result",
        data: {
          message: finalMessage,
          actions,
          steps,
        },
        timestamp: Date.now(),
      });

      return {
        message: finalMessage,
        status: "completed",
        actions,
        steps,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("AI agent request failed", {
        error: errorMessage,
        request,
      });

      const userErrorMessage = `I'm sorry, I encountered an error while processing your request: ${errorMessage}. Please try again or rephrase your request.`;

      if (onStream) {
        onStream({
          type: "error",
          data: { message: userErrorMessage, error: errorMessage },
          timestamp: Date.now(),
        });
      }

      throw error;
    }
  }

  private requiresConfirmation(toolName: string, _args: any): boolean {
    const criticalActions = [
      "disconnect_repository",
      "update_github_file",
      "create_github_pr",
      "add_credits",
    ];
    return criticalActions.includes(toolName);
  }

  private getConfirmationMessage(toolName: string, args: any): string {
    switch (toolName) {
      case "disconnect_repository":
        return `Are you sure you want to disconnect this repository? This will remove the webhook and stop automatic documentation updates.`;
      case "update_github_file":
        return `I'm about to update the file "${args.path}" in "${args.owner}/${args.repo}". This will create a commit. Would you like me to proceed?`;
      case "create_github_pr":
        return `I'm about to create a pull request "${args.title}" in "${args.owner}/${args.repo}". Should I proceed?`;
      case "add_credits":
        return `I'm about to add ${args.amount} credits to your account. Confirm to proceed.`;
      default:
        return `I need your permission to proceed with this action.`;
    }
  }

  private getStepDescription(toolName: string, args: any): string {
    switch (toolName) {
      case "list_repositories":
        return "Fetching your connected repositories...";
      case "get_repository_details":
        return `Getting details for repository...`;
      case "connect_repository":
        return `Connecting repository ${args.owner}/${args.name}...`;
      case "disconnect_repository":
        return "Disconnecting repository...";
      case "update_repo_settings":
        return "Updating repository settings...";
      case "get_github_file":
        return `Reading file ${args.path} from GitHub...`;
      case "update_github_file":
        return `Updating file ${args.path} on GitHub...`;
      case "create_github_pr":
        return `Creating pull request "${args.title}"...`;
      case "get_github_commits":
        return "Fetching recent commits...";
      case "trigger_documentation_generation":
        return "Triggering documentation generation...";
      case "get_credit_balance":
        return "Checking your credit balance...";
      case "add_credits":
        return `Adding ${args.amount} credits to your account...`;
      case "get_analytics":
        return "Fetching your analytics...";
      case "get_jobs":
        return "Retrieving job information...";
      case "get_job_details":
        return "Getting job details...";
      default:
        return `Executing ${toolName}...`;
    }
  }

  private getResultMessage(toolName: string, result: any): string {
    switch (toolName) {
      case "list_repositories":
        return `Found ${result.repos?.length || 0} connected repositories.`;
      case "get_credit_balance":
        return `Your current balance is ${result.balance} credits.`;
      case "update_github_file":
        return `Successfully updated the file! Commit: ${result.commit?.sha?.substring(
          0,
          7
        )}`;
      case "create_github_pr":
        return `Pull request created! PR #${result.pr?.number} - ${result.pr?.url}`;
      case "add_credits":
        return `Added credits successfully! Your new balance is ${result.balance} credits.`;
      default:
        return "Action completed successfully.";
    }
  }

  private getSystemPrompt(userContext: any): string {
    return `You are Docr AI, an intelligent assistant for the Docr documentation platform. You have access to all user capabilities and can help with:

1. Repository Management: Connect, disconnect, list, and configure repositories
2. GitHub Operations: Access GitHub API for urgent requests, file operations, commits, PRs
3. Documentation: Generate, update, and manage documentation
4. Credits: Check balance, add credits, view transaction history
5. Analytics: View metrics, success rates, usage statistics
6. Jobs: Monitor job status, view processing history
7. Settings: Update repository and user settings

Current User Context:
- Connected Repos: ${userContext.reposCount}
- Credit Balance: ${userContext.creditBalance}
- Active Jobs: ${userContext.activeJobsCount}
- Recent Activity: ${userContext.recentActivity}

You can execute actions on behalf of the user. Always confirm important actions and provide clear explanations of what you're doing. For urgent GitHub requests, prioritize speed and efficiency.`;
  }

  private async buildUserContext(userId: string): Promise<any> {
    const repos = await Repo.find({ userId, isActive: true });
    const creditBalance = await creditsService.getBalance(userId);
    const activeJobs = await Job.find({
      repoId: { $in: repos.map((r) => r._id) },
      status: { $in: ["pending", "processing"] },
    });

    const recentEvents = await WebhookEvent.find({
      repoId: { $in: repos.map((r) => r._id) },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      reposCount: repos.length,
      creditBalance,
      activeJobsCount: activeJobs.length,
      recentActivity: recentEvents.length,
      repos: repos.map((r) => ({
        id: r._id.toString(),
        name: r.fullName,
        branch: r.defaultBranch,
      })),
    };
  }

  private getAvailableTools(): OpenAI.Chat.Completions.ChatCompletionTool[] {
    return [
      {
        type: "function",
        function: {
          name: "list_repositories",
          description: "List all connected repositories for the user",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_repository_details",
          description: "Get detailed information about a specific repository",
          parameters: {
            type: "object",
            properties: {
              repoId: {
                type: "string",
                description: "The repository ID",
              },
            },
            required: ["repoId"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "connect_repository",
          description: "Connect a new GitHub repository to Docr",
          parameters: {
            type: "object",
            properties: {
              repoId: {
                type: "number",
                description: "GitHub repository ID",
              },
              owner: {
                type: "string",
                description: "Repository owner username",
              },
              name: {
                type: "string",
                description: "Repository name",
              },
            },
            required: ["repoId", "owner", "name"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "disconnect_repository",
          description: "Disconnect a repository from Docr",
          parameters: {
            type: "object",
            properties: {
              repoId: {
                type: "string",
                description: "The repository ID to disconnect",
              },
            },
            required: ["repoId"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "update_repo_settings",
          description:
            "Update repository settings (auto-update, doc types, branch, notifications)",
          parameters: {
            type: "object",
            properties: {
              repoId: {
                type: "string",
                description: "The repository ID",
              },
              settings: {
                type: "object",
                description: "Settings to update",
                properties: {
                  autoUpdate: { type: "boolean" },
                  docTypes: {
                    type: "object",
                    properties: {
                      readme: { type: "boolean" },
                      changelog: { type: "boolean" },
                      apiDocs: { type: "boolean" },
                      architectureDocs: { type: "boolean" },
                    },
                  },
                  branchPreference: { type: "string" },
                  emailNotifications: { type: "boolean" },
                },
              },
            },
            required: ["repoId", "settings"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_github_file",
          description: "Get file content from GitHub (urgent requests)",
          parameters: {
            type: "object",
            properties: {
              owner: {
                type: "string",
                description: "Repository owner",
              },
              repo: {
                type: "string",
                description: "Repository name",
              },
              path: {
                type: "string",
                description: "File path",
              },
              ref: {
                type: "string",
                description: "Branch or commit SHA (optional)",
              },
            },
            required: ["owner", "repo", "path"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "update_github_file",
          description: "Update a file on GitHub directly (urgent requests)",
          parameters: {
            type: "object",
            properties: {
              owner: {
                type: "string",
                description: "Repository owner",
              },
              repo: {
                type: "string",
                description: "Repository name",
              },
              path: {
                type: "string",
                description: "File path",
              },
              content: {
                type: "string",
                description: "New file content",
              },
              message: {
                type: "string",
                description: "Commit message",
              },
              branch: {
                type: "string",
                description: "Branch name (default: main)",
              },
            },
            required: ["owner", "repo", "path", "content", "message"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "create_github_pr",
          description: "Create a pull request on GitHub (urgent requests)",
          parameters: {
            type: "object",
            properties: {
              owner: {
                type: "string",
                description: "Repository owner",
              },
              repo: {
                type: "string",
                description: "Repository name",
              },
              title: {
                type: "string",
                description: "PR title",
              },
              body: {
                type: "string",
                description: "PR description",
              },
              head: {
                type: "string",
                description: "Source branch",
              },
              base: {
                type: "string",
                description: "Target branch (default: main)",
              },
            },
            required: ["owner", "repo", "title", "body", "head"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_github_commits",
          description: "Get recent commits from GitHub",
          parameters: {
            type: "object",
            properties: {
              owner: {
                type: "string",
                description: "Repository owner",
              },
              repo: {
                type: "string",
                description: "Repository name",
              },
              branch: {
                type: "string",
                description: "Branch name (optional)",
              },
            },
            required: ["owner", "repo"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "trigger_documentation_generation",
          description:
            "Manually trigger documentation generation for a repository",
          parameters: {
            type: "object",
            properties: {
              repoId: {
                type: "string",
                description: "The repository ID",
              },
              commitSha: {
                type: "string",
                description:
                  "Commit SHA to process (optional, uses latest if not provided)",
              },
            },
            required: ["repoId"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_credit_balance",
          description: "Get current credit balance and status",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      },
      {
        type: "function",
        function: {
          name: "add_credits",
          description: "Add credits to user account",
          parameters: {
            type: "object",
            properties: {
              amount: {
                type: "number",
                description: "Amount of credits to add",
              },
            },
            required: ["amount"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_analytics",
          description: "Get analytics and metrics for the user",
          parameters: {
            type: "object",
            properties: {
              days: {
                type: "number",
                description: "Number of days to look back (default: 30)",
              },
            },
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_jobs",
          description: "Get job status and history",
          parameters: {
            type: "object",
            properties: {
              repoId: {
                type: "string",
                description: "Filter by repository ID (optional)",
              },
              status: {
                type: "string",
                enum: ["pending", "processing", "completed", "failed"],
                description: "Filter by status (optional)",
              },
              limit: {
                type: "number",
                description: "Maximum number of jobs to return (default: 20)",
              },
            },
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_job_details",
          description: "Get detailed information about a specific job",
          parameters: {
            type: "object",
            properties: {
              jobId: {
                type: "string",
                description: "The job ID",
              },
            },
            required: ["jobId"],
          },
        },
      },
    ];
  }

  private async executeTool(
    toolName: string,
    args: any,
    userId: string
  ): Promise<any> {
    logger.info("Executing tool", { toolName, args, userId });

    switch (toolName) {
      case "list_repositories":
        const repos = await Repo.find({ userId, isActive: true });
        return {
          repos: repos.map((r) => ({
            id: r._id.toString(),
            name: r.fullName,
            owner: r.owner,
            branch: r.defaultBranch,
            isActive: r.isActive,
            settings: r.settings,
          })),
        };

      case "get_repository_details":
        const repo = await Repo.findOne({ _id: args.repoId, userId });
        if (!repo) {
          throw new Error("Repository not found");
        }
        return {
          id: repo._id.toString(),
          name: repo.fullName,
          owner: repo.owner,
          branch: repo.defaultBranch,
          isActive: repo.isActive,
          settings: repo.settings,
          lastProcessedCommit: repo.lastProcessedCommit,
          lastProcessedAt: repo.lastProcessedAt,
        };

      case "connect_repository":
        const repoData = await githubService.getRepo(
          userId,
          args.owner,
          args.name
        );
        const hasWriteAccess = await githubService.checkWriteAccess(
          userId,
          args.owner,
          args.name
        );
        if (!hasWriteAccess) {
          throw new Error("Write access required");
        }
        // Note: Full connection requires webhook setup, which is handled in controller
        return {
          message:
            "Repository connection initiated. Use the connect endpoint for full setup.",
          repo: {
            id: repoData.id,
            name: repoData.full_name,
            owner: repoData.owner.login,
          },
        };

      case "disconnect_repository":
        const repoToDisconnect = await Repo.findOne({
          _id: args.repoId,
          userId,
        });
        if (!repoToDisconnect) {
          throw new Error("Repository not found");
        }
        if (repoToDisconnect.webhookId) {
          await githubService.deleteWebhook(
            userId,
            repoToDisconnect.owner,
            repoToDisconnect.name,
            repoToDisconnect.webhookId
          );
        }
        await Repo.findByIdAndDelete(args.repoId);
        return { message: "Repository disconnected successfully" };

      case "update_repo_settings":
        const repoToUpdate = await Repo.findOne({
          _id: args.repoId,
          userId,
        });
        if (!repoToUpdate) {
          throw new Error("Repository not found");
        }
        repoToUpdate.settings = { ...repoToUpdate.settings, ...args.settings };
        await repoToUpdate.save();
        return {
          message: "Settings updated successfully",
          settings: repoToUpdate.settings,
        };

      case "get_github_file":
        const fileContent = await githubService.getFileContent(
          userId,
          args.owner,
          args.repo,
          args.path,
          args.ref
        );
        return { content: fileContent, path: args.path };

      case "update_github_file":
        // Get current file SHA
        let sha: string | undefined;
        try {
          const { Octokit } = await import("@octokit/rest");
          const user = await User.findById(userId);
          if (user && user.githubToken && user.githubTokenIv) {
            const { decrypt } = await import("../utils/encryption");
            const token = decrypt(user.githubToken, user.githubTokenIv);
            const octokit = new Octokit({ auth: token });
            const { data } = await octokit.repos.getContent({
              owner: args.owner,
              repo: args.repo,
              path: args.path,
              ref: args.branch || "main",
            });
            if (!Array.isArray(data) && data.type === "file") {
              sha = data.sha;
            }
          }
        } catch {
          // File doesn't exist, will create new
        }

        const result = await githubService.updateFile(
          userId,
          args.owner,
          args.repo,
          args.path,
          args.message,
          args.content,
          sha || "",
          args.branch || "main"
        );
        return {
          message: "File updated successfully",
          commit: {
            sha: result.commit.sha,
            url: result.commit.html_url,
          },
        };

      case "create_github_pr":
        const pr = await githubService.createPullRequest(
          userId,
          args.owner,
          args.repo,
          args.title,
          args.body,
          args.head,
          args.base || "main"
        );
        return {
          message: "Pull request created successfully",
          pr: {
            number: pr.number,
            url: pr.html_url,
            title: pr.title,
          },
        };

      case "get_github_commits":
        const { Octokit } = await import("@octokit/rest");
        const user = await User.findById(userId);
        if (!user || !user.githubToken || !user.githubTokenIv) {
          throw new Error("GitHub token not found");
        }
        const { decrypt } = await import("../utils/encryption");
        const token = decrypt(user.githubToken, user.githubTokenIv);
        const octokit = new Octokit({ auth: token });
        const { data: commits } = await octokit.repos.listCommits({
          owner: args.owner,
          repo: args.repo,
          sha: args.branch,
          per_page: 10,
        });
        return {
          commits: commits.map((c) => ({
            sha: c.sha,
            message: c.commit.message,
            author: c.commit.author?.name,
            date: c.commit.author?.date,
            url: c.html_url,
          })),
        };

      case "trigger_documentation_generation":
        const repoForGen = await Repo.findOne({ _id: args.repoId, userId });
        if (!repoForGen) {
          throw new Error("Repository not found");
        }
        // Create a webhook event and process it
        const webhookEvent = await WebhookEvent.create({
          repoId: repoForGen._id,
          eventType: "push",
          githubDeliveryId: `manual-${Date.now()}`,
          payload: {
            commits: args.commitSha
              ? [{ id: args.commitSha }]
              : [{ id: repoForGen.lastProcessedCommit || "HEAD" }],
            ref: `refs/heads/${repoForGen.defaultBranch}`,
          },
        });
        // Use commit SHA as jobId for idempotency when triggering manually
        const chosenSha =
          args.commitSha || repoForGen.lastProcessedCommit || "HEAD";
        const jobId = await addJob(
          processCommitQueue,
          "process_commit",
          {
            webhookEventId: webhookEvent._id.toString(),
            repoId: repoForGen._id.toString(),
            userId,
            commitSha: chosenSha,
            branch: repoForGen.defaultBranch,
          },
          { jobId: chosenSha }
        );
        return {
          message: "Documentation generation triggered",
          jobId,
        };

      case "get_credit_balance":
        const balance = await creditsService.getBalance(userId);
        const isBelowThreshold = await creditsService.isBelowThreshold(userId);
        return {
          balance,
          isBelowThreshold,
          warningThreshold: 100,
        };

      case "add_credits":
        await creditsService.addCredits(userId, args.amount, "AI Agent top-up");
        const newBalance = await creditsService.getBalance(userId);
        return {
          message: "Credits added successfully",
          balance: newBalance,
        };

      case "get_analytics":
        const analytics = await analyticsService.getAnalytics(
          userId,
          args.days || 30
        );
        return {
          analytics: analytics.map((a: any) => ({
            date: a.date,
            metrics: a.metrics,
          })),
        };

      case "get_jobs":
        const query: any = {};
        if (args.repoId) query.repoId = args.repoId;
        if (args.status) query.status = args.status;
        const jobs = await Job.find(query)
          .sort({ createdAt: -1 })
          .limit(args.limit || 20);
        return {
          jobs: jobs.map((j) => ({
            jobId: j.jobId,
            jobType: j.jobType,
            status: j.status,
            createdAt: j.createdAt,
            completedAt: j.completedAt,
            duration: j.duration,
          })),
        };

      case "get_job_details":
        const job = await Job.findOne({ jobId: args.jobId });
        if (!job) {
          throw new Error("Job not found");
        }
        // Verify user owns the repo
        if (job.repoId) {
          const jobRepo = await Repo.findById(job.repoId);
          if (jobRepo && jobRepo.userId.toString() !== userId) {
            throw new Error("Access denied");
          }
        }
        return {
          jobId: job.jobId,
          jobType: job.jobType,
          status: job.status,
          input: job.input,
          output: job.output,
          error: job.error,
          createdAt: job.createdAt,
          startedAt: job.startedAt,
          completedAt: job.completedAt,
          duration: job.duration,
        };

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}

export const aiAgentService = new AIAgentService();
