#!/usr/bin/env node

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const {
  StdioServerTransport,
} = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

// Import all handler modules
const GitHubAPIService = require("./services/github-api.cjs");
const repositoryHandlerFunctions = require("./handlers/repository.cjs");
const issueHandlerFunctions = require("./handlers/issues.cjs");
const commentHandlerFunctions = require("./handlers/comments.cjs");
const pullRequestHandlerFunctions = require("./handlers/pull-requests.cjs");
const userHandlerFunctions = require("./handlers/users.cjs");
const labelsHandlerFunctions = require("./handlers/labels.cjs");
const milestonesHandlerFunctions = require("./handlers/milestones.cjs");
const branchCommitHandlerFunctions = require("./handlers/branches-commits.cjs");
const EnhancedPullRequestHandlersModule = require("./handlers/enhanced-pull-requests.cjs");
const FileManagementHandlersModule = require("./handlers/file-management.cjs");
const SecurityHandlersModule = require("./handlers/security.cjs");
const AnalyticsHandlersModule = require("./handlers/analytics.cjs");
const SearchHandlersModule = require("./handlers/search.cjs");
const OrganizationHandlersModule = require("./handlers/organizations.cjs");
const AdvancedFeaturesHandlerModule = require("./handlers/advanced-features.cjs");
const toolsConfig = require("./utils/tools-config.cjs");

class GitHubMCPServer {
  constructor(config = {}) {
    this.defaultOwner = null;
    this.defaultRepo = null;
    this.isRepoLockedByConfig = false; // Flag to indicate if repo is locked by initial config
    this.disabledTools = new Set();
    this.allowedTools = null; // null means all tools allowed, Set means only specific tools

    const token = process.env.GH_TOKEN
      ? process.env.GH_TOKEN.trim()
      : undefined;

    this.api = new GitHubAPIService(token);

    this.enhancedPrHandler = EnhancedPullRequestHandlersModule;
    this.fileManagementHandler = FileManagementHandlersModule;
    this.securityHandler = SecurityHandlersModule;
    this.analyticsHandler = AnalyticsHandlersModule;
    this.searchHandler = SearchHandlersModule;
    this.organizationHandler = OrganizationHandlersModule;
    this.advancedFeaturesHandler = AdvancedFeaturesHandlerModule;

    // Determine default/locked repository settings
    this.lockedOwner = config.defaultOwner || process.env.GH_DEFAULT_OWNER;
    this.lockedRepo = config.defaultRepo || process.env.GH_DEFAULT_REPO;
    this.isRepoLocked = !!(this.lockedOwner && this.lockedRepo);

    if (this.isRepoLocked) {
      this.setDefaultRepo(this.lockedOwner, this.lockedRepo); // Set it for handlers
      console.log(
        `Repository operations are locked to ${this.lockedOwner}/${this.lockedRepo}.`
      );
    }

    // Handle disabled tools from config or environment
    const disabledToolsFromEnv = process.env.GH_DISABLED_TOOLS;
    const disabledToolsFromConfig = config.disabledTools;
    
    if (disabledToolsFromEnv || disabledToolsFromConfig) {
      // If config.disabledTools is already an array, use it directly
      if (Array.isArray(disabledToolsFromConfig)) {
        disabledToolsFromConfig.forEach((toolName) => 
          this.disabledTools.add(toolName.trim())
        );
      } else if (disabledToolsFromEnv) {
        // Parse from environment variable as comma-separated string
        disabledToolsFromEnv
          .split(",")
          .forEach((toolName) => this.disabledTools.add(toolName.trim()));
      }
    }

    // Handle allowed tools from config or environment
    const allowedToolsFromEnv = process.env.GH_ALLOWED_TOOLS;
    const allowedToolsFromConfig = config.allowedTools;
    
    if (allowedToolsFromEnv || allowedToolsFromConfig) {
      this.allowedTools = new Set();
      
      // If config.allowedTools is already an array, use it directly
      if (Array.isArray(allowedToolsFromConfig)) {
        allowedToolsFromConfig.forEach((toolName) => 
          this.allowedTools.add(toolName.trim())
        );
      } else if (allowedToolsFromEnv) {
        // Parse from environment variable as comma-separated string
        allowedToolsFromEnv
          .split(",")
          .forEach((toolName) => this.allowedTools.add(toolName.trim()));
      }
    }

    let initialDefaultOwner =
      config.defaultOwner || process.env.GH_DEFAULT_OWNER;
    let initialDefaultRepo = config.defaultRepo || process.env.GH_DEFAULT_REPO;

    if (initialDefaultOwner && initialDefaultRepo) {
      this.defaultOwner = initialDefaultOwner;
      this.defaultRepo = initialDefaultRepo;
      this.isRepoLockedByConfig = true;
      console.error(
        `Default repository LOCKED by configuration to: ${this.defaultOwner}/${this.defaultRepo}`
      );
    }

    this.server = new Server(
      {
        name: "GitHub Repos Manager MCP Server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setDefaultRepo(owner, repo) {
    if (this.isRepoLockedByConfig) {
      const lockMessage = `Repository is locked by server configuration to ${this.defaultOwner}/${this.defaultRepo}. Cannot be changed by tool.`;
      console.warn(lockMessage);
      return {
        content: [{ type: "text", text: lockMessage }],
        isError: true,
      };
    }
    this.defaultOwner = owner;
    this.defaultRepo = repo;
    const successMessage = `Default repository set by tool to: ${owner}/${repo}`;
    console.error(successMessage);
    return {
      content: [{ type: "text", text: successMessage }],
    };
  }

  getHandlerArgs(args) {
    const effectiveArgs = { ...(args || {}) };

    if (this.isRepoLockedByConfig) {
      if (effectiveArgs.owner && effectiveArgs.owner !== this.defaultOwner) {
        throw new Error(
          `Operations are locked to repository ${this.defaultOwner}/${this.defaultRepo}. Provided owner '${effectiveArgs.owner}' is not allowed.`
        );
      }
      if (effectiveArgs.repo && effectiveArgs.repo !== this.defaultRepo) {
        throw new Error(
          `Operations are locked to repository ${this.defaultOwner}/${this.defaultRepo}. Provided repo '${effectiveArgs.repo}' is not allowed.`
        );
      }
      effectiveArgs.owner = this.defaultOwner;
      effectiveArgs.repo = this.defaultRepo;
    } else {
      if (!effectiveArgs.owner && this.defaultOwner) {
        effectiveArgs.owner = this.defaultOwner;
      }
      if (!effectiveArgs.repo && this.defaultRepo) {
        effectiveArgs.repo = this.defaultRepo;
      }
    }
    return effectiveArgs;
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const allTools = Object.values(toolsConfig);
      let availableTools;
      
      if (this.allowedTools) {
        // If allowedTools is set, only those tools are available (disabledTools is ignored)
        availableTools = allTools.filter(
          (tool) => this.allowedTools.has(tool.name)
        );
      } else {
        // If allowedTools is not set, all tools except disabled ones are available
        availableTools = allTools.filter(
          (tool) => !this.disabledTools.has(tool.name)
        );
      }
      
      return {
        tools: availableTools,
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: rawArgs } = request.params; // Renamed to rawArgs to avoid conflict
      let processedArgs;

      try {
        // Check if tool is allowed based on configuration
        if (this.allowedTools) {
          // If allowedTools is set, only those tools can be used
          if (!this.allowedTools.has(name)) {
            throw new Error(
              `Tool '${name}' is not in the allowed tools list.`
            );
          }
        } else {
          // If allowedTools is not set, check disabled tools
          if (this.disabledTools.has(name)) {
            throw new Error(
              `Tool '${name}' is disabled by server configuration.`
            );
          }
        }

        // For 'set_default_repo', we don't want to process args through getHandlerArgs
        // as it might throw an error if the repo is locked and args are different.
        // The setDefaultRepo method itself handles the locking logic.
        if (name === "set_default_repo") {
          if (!rawArgs || !rawArgs.owner || !rawArgs.repo) {
            throw new Error(
              "Both owner and repo are required in arguments for set_default_repo"
            );
          }
          return this.setDefaultRepo(rawArgs.owner, rawArgs.repo);
        }

        // For all other tools, process arguments to apply default/locked repo context
        processedArgs = this.getHandlerArgs(rawArgs);

        switch (name) {
          // Repository tools
          case "list_repos":
            return await repositoryHandlerFunctions.listRepos(
              processedArgs,
              this.api
            );
          case "get_repo_info":
            return await repositoryHandlerFunctions.getRepoInfo(
              processedArgs,
              this.api
            );
          case "search_repos":
            return await repositoryHandlerFunctions.searchRepos(
              processedArgs,
              this.api
            );
          case "get_repo_contents":
            return await repositoryHandlerFunctions.getRepoContents(
              processedArgs,
              this.api
            );
          // set_default_repo is handled above
          case "list_repo_collaborators":
            return await repositoryHandlerFunctions.listRepoCollaborators(
              processedArgs,
              this.api
            );

          // Issue tools
          case "list_issues":
            return await issueHandlerFunctions.listIssues(
              processedArgs,
              this.api
            );
          case "create_issue":
            return await issueHandlerFunctions.createIssue(
              processedArgs,
              this.api
            );
          case "edit_issue":
            return await issueHandlerFunctions.editIssue(
              processedArgs,
              this.api
            );
          case "get_issue_details":
            return await issueHandlerFunctions.getIssueDetails(
              processedArgs,
              this.api
            );
          case "lock_issue":
            return await issueHandlerFunctions.lockIssue(
              processedArgs,
              this.api
            );
          case "unlock_issue":
            return await issueHandlerFunctions.unlockIssue(
              processedArgs,
              this.api
            );
          case "add_assignees_to_issue":
            return await issueHandlerFunctions.addAssigneesToIssue(
              processedArgs,
              this.api
            );
          case "remove_assignees_from_issue":
            return await issueHandlerFunctions.removeAssigneesFromIssue(
              processedArgs,
              this.api
            );

          // Comment tools
          case "list_issue_comments":
            return await commentHandlerFunctions.listIssueComments(
              processedArgs,
              this.api
            );
          case "create_issue_comment":
            return await commentHandlerFunctions.createIssueComment(
              processedArgs,
              this.api
            );
          case "edit_issue_comment":
            return await commentHandlerFunctions.editIssueComment(
              processedArgs,
              this.api
            );
          case "delete_issue_comment":
            return await commentHandlerFunctions.deleteIssueComment(
              processedArgs,
              this.api
            );

          // Pull request tools
          case "list_prs":
            return await pullRequestHandlerFunctions.listPRs(
              processedArgs,
              this.api
            );

          // Enhanced Pull Request tools
          case "create_pull_request":
            return await this.enhancedPrHandler.create_pull_request(
              processedArgs,
              this.api
            );
          case "edit_pull_request":
            return await this.enhancedPrHandler.edit_pull_request(
              processedArgs,
              this.api
            );
          case "get_pr_details":
            return await this.enhancedPrHandler.get_pr_details(
              processedArgs,
              this.api
            );
          case "list_pr_reviews":
            return await this.enhancedPrHandler.list_pr_reviews(
              processedArgs,
              this.api
            );
          case "create_pr_review":
            return await this.enhancedPrHandler.create_pr_review(
              processedArgs,
              this.api
            );
          case "list_pr_files":
            return await this.enhancedPrHandler.list_pr_files(
              processedArgs,
              this.api
            );

          // File Management tools
          case "create_file":
            return await this.fileManagementHandler.createFileHandler(
              processedArgs,
              this.api
            );
          case "update_file":
            return await this.fileManagementHandler.updateFileHandler(
              processedArgs,
              this.api
            );
          case "upload_file":
            return await this.fileManagementHandler.uploadFileHandler(
              processedArgs,
              this.api
            );
          case "delete_file":
            return await this.fileManagementHandler.deleteFileHandler(
              processedArgs,
              this.api
            );

          // User tools
          case "get_user_info":
            return await userHandlerFunctions.getUserInfo(
              processedArgs,
              this.api
            );

          // Labels tools
          case "list_repo_labels":
            return await labelsHandlerFunctions.listRepoLabels(
              processedArgs,
              this.api
            );
          case "create_label":
            return await labelsHandlerFunctions.createLabel(
              processedArgs,
              this.api
            );
          case "edit_label":
            return await labelsHandlerFunctions.editLabel(
              processedArgs,
              this.api
            );
          case "delete_label":
            return await labelsHandlerFunctions.deleteLabel(
              processedArgs,
              this.api
            );

          // Milestones tools
          case "list_milestones":
            return await milestonesHandlerFunctions.listMilestones(
              processedArgs,
              this.api
            );
          case "create_milestone":
            return await milestonesHandlerFunctions.createMilestone(
              processedArgs,
              this.api
            );
          case "edit_milestone":
            return await milestonesHandlerFunctions.editMilestone(
              processedArgs,
              this.api
            );
          case "delete_milestone":
            return await milestonesHandlerFunctions.deleteMilestone(
              processedArgs,
              this.api
            );

          // Branch and Commit tools
          case "list_branches":
            return await branchCommitHandlerFunctions.listBranches(
              processedArgs,
              this.api
            );
          case "create_branch":
            return await branchCommitHandlerFunctions.createBranch(
              processedArgs,
              this.api
            );
          case "list_commits":
            return await branchCommitHandlerFunctions.listCommits(
              processedArgs,
              this.api
            );
          case "get_commit_details":
            return await branchCommitHandlerFunctions.getCommitDetails(
              processedArgs,
              this.api
            );
          case "compare_commits":
            return await branchCommitHandlerFunctions.compareCommits(
              processedArgs,
              this.api
            );

          // Security & Access Management tools
          case "list_deploy_keys":
            return await this.securityHandler.list_deploy_keys(
              processedArgs,
              this.api
            );
          case "create_deploy_key":
            return await this.securityHandler.create_deploy_key(
              processedArgs,
              this.api
            );
          case "delete_deploy_key":
            return await this.securityHandler.delete_deploy_key(
              processedArgs,
              this.api
            );
          case "list_webhooks":
            return await this.securityHandler.list_webhooks(
              processedArgs,
              this.api
            );
          case "create_webhook":
            return await this.securityHandler.create_webhook(
              processedArgs,
              this.api
            );
          case "edit_webhook":
            return await this.securityHandler.edit_webhook(
              processedArgs,
              this.api
            );
          case "delete_webhook":
            return await this.securityHandler.delete_webhook(
              processedArgs,
              this.api
            );
          case "list_secrets":
            return await this.securityHandler.list_secrets(
              processedArgs,
              this.api
            );
          case "update_secret":
            return await this.securityHandler.update_secret(
              processedArgs,
              this.api
            );

          // Repository Analytics & Insights tools
          case "get_repo_stats":
            return await this.analyticsHandler.get_repo_stats(
              processedArgs,
              this.api
            );
          case "list_repo_topics":
            return await this.analyticsHandler.list_repo_topics(
              processedArgs,
              this.api
            );
          case "update_repo_topics":
            return await this.analyticsHandler.update_repo_topics(
              processedArgs,
              this.api
            );
          case "get_repo_languages":
            return await this.analyticsHandler.get_repo_languages(
              processedArgs,
              this.api
            );
          case "list_stargazers":
            return await this.analyticsHandler.list_stargazers(
              processedArgs,
              this.api
            );
          case "list_watchers":
            return await this.analyticsHandler.list_watchers(
              processedArgs,
              this.api
            );
          case "list_forks":
            return await this.analyticsHandler.list_forks(
              processedArgs,
              this.api
            );
          case "get_repo_traffic":
            return await this.analyticsHandler.get_repo_traffic(
              processedArgs,
              this.api
            );

          // Search tools
          case "search_issues":
            return await this.searchHandler.search_issues(
              this.api.octokit,
              processedArgs
            );
          case "search_commits":
            return await this.searchHandler.search_commits(
              this.api.octokit,
              processedArgs
            );
          case "search_code":
            return await this.searchHandler.search_code(
              this.api.octokit,
              processedArgs
            );
          case "search_users":
            return await this.searchHandler.search_users(
              this.api.octokit,
              processedArgs
            );
          case "search_topics":
            return await this.searchHandler.search_topics(
              this.api.octokit,
              processedArgs
            );

          // Organization tools
          case "list_org_repos":
            return await this.organizationHandler.listOrgRepos(
              this.api.octokit,
              processedArgs
            );
          case "list_org_members":
            return await this.organizationHandler.listOrgMembers(
              this.api.octokit,
              processedArgs
            );
          case "get_org_info":
            return await this.organizationHandler.getOrgInfo(
              this.api.octokit,
              processedArgs
            );
          case "list_org_teams":
            return await this.organizationHandler.listOrgTeams(
              this.api.octokit,
              processedArgs
            );
          case "get_team_members":
            return await this.organizationHandler.getTeamMembers(
              this.api.octokit,
              processedArgs
            );
          case "manage_team_repos":
            return await this.organizationHandler.manageTeamRepos(
              this.api.octokit,
              processedArgs
            );

          // Advanced Features tools
          case "code_quality_checks":
            return await this.advancedFeaturesHandler.handleCodeQualityChecks(
              processedArgs,
              this.api
            );
          case "custom_dashboards":
            return await this.advancedFeaturesHandler.handleCustomDashboards(
              processedArgs,
              this.api
            );
          case "automated_reporting":
            return await this.advancedFeaturesHandler.handleAutomatedReporting(
              processedArgs,
              this.api
            );
          case "notification_management":
            return await this.advancedFeaturesHandler.handleNotificationManagement(
              processedArgs,
              this.api
            );
          case "release_management":
            return await this.advancedFeaturesHandler.handleReleaseManagement(
              processedArgs,
              this.api
            );
          case "dependency_analysis":
            return await this.advancedFeaturesHandler.handleDependencyAnalysis(
              processedArgs,
              this.api
            );

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error(
          `Error calling tool ${name}:`,
          error.message,
          error.stack
        );
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    });
  }

  async run() {
    try {
      await this.api.testAuthentication();
    } catch (error) {
      console.error("Failed to authenticate with GitHub:", error.message);
      process.exit(1);
    }

    const transport = new StdioServerTransport();

    try {
      await this.server.connect(transport);
      console.error("GitHub Repos Manager MCP Server is running...");

      const totalToolsCount = Object.keys(toolsConfig).length;
      let availableToolsCount;
      
      if (this.isRepoLockedByConfig) {
        console.error(
          `Operations are LOCKED to repository: ${this.defaultOwner}/${this.defaultRepo}`
        );
      }

      if (this.allowedTools) {
        // When allowedTools is set, only those tools are available
        availableToolsCount = this.allowedTools.size;
        const allowedToolNames = Array.from(this.allowedTools).join(", ");
        console.error(
          `${availableToolsCount} out of ${totalToolsCount} tools are available (allowed tools only).`
        );
        console.error(
          `Allowed tools (${availableToolsCount}): ${allowedToolNames}`
        );
      } else {
        // When allowedTools is not set, all tools except disabled ones are available
        const disabledToolsCount = this.disabledTools.size;
        availableToolsCount = totalToolsCount - disabledToolsCount;
        
        if (disabledToolsCount === 0) {
          console.error(`All ${totalToolsCount} tools are available.`);
        } else {
          console.error(
            `${availableToolsCount} out of ${totalToolsCount} tools are available.`
          );
          const disabledToolNames = Array.from(this.disabledTools).join(", ");
          console.error(
            `Disabled tools (${disabledToolsCount}): ${disabledToolNames}`
          );
        }
      }

      process.stdin.resume();
    } catch (error) {
      console.error("Failed to connect server:", error);
      process.exit(1);
    }
  }
}

process.on("SIGINT", async () => {
  console.error("Shutting down GitHub Repos Manager MCP Server...");
  process.exit(0);
});

module.exports = GitHubMCPServer;
