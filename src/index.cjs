#!/usr/bin/env node

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
const ProjectsHandlersModule = require("./handlers/projects.cjs");
const WorkflowsHandlersModule = require("./handlers/workflows.cjs");
const AdvancedFeaturesHandlerModule = require("./handlers/advanced-features.cjs");
const toolsConfig = require("./utils/tools-config.cjs");
const { formatHandlerResponse } = require("./utils/response-formatter.cjs");
const { handleError } = require("./utils/error-handler.cjs");

class GitHubMCPServer {
  constructor(config = {}, sdkModules = {}) {
    this.Server = sdkModules.Server;
    this.StdioServerTransport = sdkModules.StdioServerTransport;
    this.CallToolRequestSchema = sdkModules.CallToolRequestSchema;
    this.ListToolsRequestSchema = sdkModules.ListToolsRequestSchema;

    this.defaultOwner = null;
    this.defaultRepo = null;
    this.disabledTools = new Set();
    this.allowedTools = null; // null means all tools allowed, Set means only specific tools
    this.allowedRepos = null; // null means all repos allowed, Set means only specific repos/owners

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
    this.projectsHandler = ProjectsHandlersModule;
    this.workflowsHandler = WorkflowsHandlersModule;
    this.advancedFeaturesHandler = AdvancedFeaturesHandlerModule;

    // Set default repository if provided
    this.defaultOwner = config.defaultOwner || process.env.GH_DEFAULT_OWNER;
    this.defaultRepo = config.defaultRepo || process.env.GH_DEFAULT_REPO;

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

    // Handle allowed repos from config or environment
    const allowedReposFromEnv = process.env.GH_ALLOWED_REPOS;
    const allowedReposFromConfig = config.allowedRepos;

    if (allowedReposFromEnv || allowedReposFromConfig) {
      this.allowedRepos = new Set();

      // If config.allowedRepos is already an array, use it directly
      if (Array.isArray(allowedReposFromConfig)) {
        allowedReposFromConfig.forEach((repo) =>
          this.allowedRepos.add(repo.trim())
        );
      } else if (allowedReposFromEnv) {
        // Parse from environment variable as comma-separated string
        allowedReposFromEnv
          .split(",")
          .forEach((repo) => this.allowedRepos.add(repo.trim()));
      }
    }

    this.server = new this.Server(
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
    // First check if this repo is allowed
    if (this.allowedRepos) {
      const repoIdentifier = `${owner}/${repo}`;
      const isAllowed =
        this.allowedRepos.has(repoIdentifier) ||
        this.allowedRepos.has(owner) ||
        Array.from(this.allowedRepos).some((allowed) => {
          if (allowed.includes("/")) {
            return allowed === repoIdentifier;
          }
          return allowed === owner;
        });

      if (!isAllowed) {
        const allowedList = Array.from(this.allowedRepos).join(", ");
        return {
          content: [
            {
              type: "text",
              text: `Repository ${repoIdentifier} is not in the allowed repositories list. Allowed: ${allowedList}`,
            },
          ],
          isError: true,
        };
      }
    }

    this.defaultOwner = owner;
    this.defaultRepo = repo;
    const successMessage = `Default repository set to: ${owner}/${repo}`;
    console.error(successMessage);
    return {
      content: [{ type: "text", text: successMessage }],
    };
  }

  getHandlerArgs(args) {
    const effectiveArgs = { ...(args || {}) };

    // Apply defaults if not specified
    if (!effectiveArgs.owner && this.defaultOwner) {
      effectiveArgs.owner = this.defaultOwner;
    }
    if (!effectiveArgs.repo && this.defaultRepo) {
      effectiveArgs.repo = this.defaultRepo;
    }

    // Check if the repository is allowed
    if (this.allowedRepos && effectiveArgs.owner) {
      let isAllowed = false;

      if (effectiveArgs.repo) {
        // Check full repo path
        const repoIdentifier = `${effectiveArgs.owner}/${effectiveArgs.repo}`;
        isAllowed =
          this.allowedRepos.has(repoIdentifier) ||
          this.allowedRepos.has(effectiveArgs.owner);
      } else {
        // Only owner specified, check if owner is allowed
        isAllowed =
          this.allowedRepos.has(effectiveArgs.owner) ||
          Array.from(this.allowedRepos).some((allowed) =>
            allowed.startsWith(`${effectiveArgs.owner}/`)
          );
      }

      if (!isAllowed) {
        const allowedList = Array.from(this.allowedRepos).join(", ");
        const attempted = effectiveArgs.repo
          ? `${effectiveArgs.owner}/${effectiveArgs.repo}`
          : effectiveArgs.owner;
        throw new Error(
          `Repository or owner '${attempted}' is not in the allowed list. Allowed: ${allowedList}`
        );
      }
    }

    return effectiveArgs;
  }

  setupToolHandlers() {
    this.server.setRequestHandler(this.ListToolsRequestSchema, async () => {
      try {
        const allTools = Object.values(toolsConfig);
        let availableTools;

        if (this.allowedTools) {
          // If allowedTools is set, only those tools are available (disabledTools is ignored)
          availableTools = allTools.filter((tool) =>
            this.allowedTools.has(tool.name)
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
      } catch (error) {
        const errorResponse = handleError(error, "list_tools");
        return {
          tools: [],
          error: errorResponse.message,
        };
      }
    });

    this.server.setRequestHandler(
      this.CallToolRequestSchema,
      async (request) => {
        let processedArgs;
        let name, rawArgs;

        try {
          // Validate request structure
          if (!request || typeof request !== "object") {
            throw new Error("Invalid request: request must be an object");
          }

          if (!request.params || typeof request.params !== "object") {
            throw new Error("Invalid request: missing or invalid params");
          }

          name = request.params.name;
          rawArgs = request.params.arguments;

          // Validate tool name
          if (!name || typeof name !== "string" || name.trim() === "") {
            throw new Error(
              "Invalid request: tool name is required and must be a non-empty string"
            );
          }

          name = name.trim();

          // Ensure rawArgs is an object (or null)
          if (
            rawArgs !== null &&
            rawArgs !== undefined &&
            typeof rawArgs !== "object"
          ) {
            throw new Error(
              "Invalid request: arguments must be an object, null, or undefined"
            );
          }

          // Default to empty object if args are not provided
          rawArgs = rawArgs || {};
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

          // Validate API service is available
          if (!this.api) {
            throw new Error("GitHub API service is not initialized");
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
              return formatHandlerResponse(
                await this.enhancedPrHandler.create_pull_request(
                  processedArgs,
                  this.api
                )
              );
            case "edit_pull_request":
              return formatHandlerResponse(
                await this.enhancedPrHandler.edit_pull_request(
                  processedArgs,
                  this.api
                )
              );
            case "get_pr_details":
              return formatHandlerResponse(
                await this.enhancedPrHandler.get_pr_details(
                  processedArgs,
                  this.api
                )
              );
            case "list_pr_reviews":
              return formatHandlerResponse(
                await this.enhancedPrHandler.list_pr_reviews(
                  processedArgs,
                  this.api
                )
              );
            case "create_pr_review":
              return formatHandlerResponse(
                await this.enhancedPrHandler.create_pr_review(
                  processedArgs,
                  this.api
                )
              );
            case "list_pr_files":
              return formatHandlerResponse(
                await this.enhancedPrHandler.list_pr_files(
                  processedArgs,
                  this.api
                )
              );

            // File Management tools
            case "create_file":
              return formatHandlerResponse(
                await this.fileManagementHandler.createFileHandler(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "update_file":
              return formatHandlerResponse(
                await this.fileManagementHandler.updateFileHandler(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "upload_file":
              return formatHandlerResponse(
                await this.fileManagementHandler.uploadFileHandler(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "delete_file":
              return formatHandlerResponse(
                await this.fileManagementHandler.deleteFileHandler(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
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
              return formatHandlerResponse(
                await this.securityHandler.list_deploy_keys(
                  processedArgs,
                  this.api
                )
              );
            case "create_deploy_key":
              return formatHandlerResponse(
                await this.securityHandler.create_deploy_key(
                  processedArgs,
                  this.api
                )
              );
            case "delete_deploy_key":
              return formatHandlerResponse(
                await this.securityHandler.delete_deploy_key(
                  processedArgs,
                  this.api
                )
              );
            case "list_webhooks":
              return formatHandlerResponse(
                await this.securityHandler.list_webhooks(
                  processedArgs,
                  this.api
                )
              );
            case "create_webhook":
              return formatHandlerResponse(
                await this.securityHandler.create_webhook(
                  processedArgs,
                  this.api
                )
              );
            case "edit_webhook":
              return formatHandlerResponse(
                await this.securityHandler.edit_webhook(processedArgs, this.api)
              );
            case "delete_webhook":
              return formatHandlerResponse(
                await this.securityHandler.delete_webhook(
                  processedArgs,
                  this.api
                )
              );
            case "list_secrets":
              return formatHandlerResponse(
                await this.securityHandler.list_secrets(processedArgs, this.api)
              );
            case "update_secret":
              return formatHandlerResponse(
                await this.securityHandler.update_secret(
                  processedArgs,
                  this.api
                )
              );

            // Repository Analytics & Insights tools
            case "get_repo_stats":
              return formatHandlerResponse(
                await this.analyticsHandler.get_repo_stats(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "list_repo_topics":
              return formatHandlerResponse(
                await this.analyticsHandler.list_repo_topics(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "update_repo_topics":
              return formatHandlerResponse(
                await this.analyticsHandler.update_repo_topics(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "get_repo_languages":
              return formatHandlerResponse(
                await this.analyticsHandler.get_repo_languages(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "list_stargazers":
              return formatHandlerResponse(
                await this.analyticsHandler.list_stargazers(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "list_watchers":
              return formatHandlerResponse(
                await this.analyticsHandler.list_watchers(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "list_forks":
              return formatHandlerResponse(
                await this.analyticsHandler.list_forks(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "get_repo_traffic":
              return formatHandlerResponse(
                await this.analyticsHandler.get_repo_traffic(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );

            // Search tools
            case "search_issues":
              return formatHandlerResponse(
                await this.searchHandler.search_issues(
                  this.api.octokit,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  processedArgs,
                  this.api
                )
              );
            case "search_commits":
              return formatHandlerResponse(
                await this.searchHandler.search_commits(
                  this.api.octokit,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  processedArgs,
                  this.api
                )
              );
            case "search_code":
              return formatHandlerResponse(
                await this.searchHandler.search_code(
                  this.api.octokit,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  processedArgs,
                  this.api
                )
              );
            case "search_users":
              return formatHandlerResponse(
                await this.searchHandler.search_users(
                  this.api.octokit,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  processedArgs,
                  this.api
                )
              );
            case "search_topics":
              return formatHandlerResponse(
                await this.searchHandler.search_topics(
                  this.api.octokit,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  processedArgs,
                  this.api
                )
              );

            // Organization tools
            case "list_org_repos":
              return formatHandlerResponse(
                await this.organizationHandler.listOrgRepos(
                  this.api.octokit,
                  processedArgs,
                  this.api
                )
              );
            case "list_org_members":
              return formatHandlerResponse(
                await this.organizationHandler.listOrgMembers(
                  this.api.octokit,
                  processedArgs,
                  this.api
                )
              );
            case "get_org_info":
              return formatHandlerResponse(
                await this.organizationHandler.getOrgInfo(
                  this.api.octokit,
                  processedArgs,
                  this.api
                )
              );
            case "list_org_teams":
              return formatHandlerResponse(
                await this.organizationHandler.listOrgTeams(
                  this.api.octokit,
                  processedArgs,
                  this.api
                )
              );
            case "get_team_members":
              return formatHandlerResponse(
                await this.organizationHandler.getTeamMembers(
                  this.api.octokit,
                  processedArgs,
                  this.api
                )
              );
            case "manage_team_repos":
              return formatHandlerResponse(
                await this.organizationHandler.manageTeamRepos(
                  this.api.octokit,
                  processedArgs,
                  this.api
                )
              );

            // Projects & Boards tools
            case "list_repo_projects":
              return formatHandlerResponse(
                await this.projectsHandler.list_repo_projects(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "create_project":
              return formatHandlerResponse(
                await this.projectsHandler.create_project(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "list_project_columns":
              return formatHandlerResponse(
                await this.projectsHandler.list_project_columns(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "list_project_cards":
              return formatHandlerResponse(
                await this.projectsHandler.list_project_cards(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "create_project_card":
              return formatHandlerResponse(
                await this.projectsHandler.create_project_card(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "move_project_card":
              return formatHandlerResponse(
                await this.projectsHandler.move_project_card(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );

            // GitHub Actions & Workflows tools
            case "list_workflows":
              return formatHandlerResponse(
                await this.workflowsHandler.list_workflows(
                  processedArgs,
                  this.api
                )
              );
            case "list_workflow_runs":
              return formatHandlerResponse(
                await this.workflowsHandler.list_workflow_runs(
                  processedArgs,
                  this.api
                )
              );
            case "get_workflow_run_details":
              return formatHandlerResponse(
                await this.workflowsHandler.get_workflow_run_details(
                  processedArgs,
                  this.api
                )
              );
            case "trigger_workflow":
              return formatHandlerResponse(
                await this.workflowsHandler.trigger_workflow(
                  processedArgs,
                  this.api
                )
              );
            case "download_workflow_artifacts":
              return formatHandlerResponse(
                await this.workflowsHandler.download_workflow_artifacts(
                  processedArgs,
                  this.api
                )
              );
            case "cancel_workflow_run":
              return formatHandlerResponse(
                await this.workflowsHandler.cancel_workflow_run(
                  processedArgs,
                  this.api
                )
              );

            // Advanced Features tools
            case "code_quality_checks":
              return formatHandlerResponse(
                await this.advancedFeaturesHandler.handleCodeQualityChecks(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "custom_dashboards":
              return formatHandlerResponse(
                await this.advancedFeaturesHandler.handleCustomDashboards(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "automated_reporting":
              return formatHandlerResponse(
                await this.advancedFeaturesHandler.handleAutomatedReporting(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "notification_management":
              return formatHandlerResponse(
                await this.advancedFeaturesHandler.handleNotificationManagement(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "release_management":
              return formatHandlerResponse(
                await this.advancedFeaturesHandler.handleReleaseManagement(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );
            case "dependency_analysis":
              return formatHandlerResponse(
                await this.advancedFeaturesHandler.handleDependencyAnalysis(
                  processedArgs,
                  { owner: this.defaultOwner, repo: this.defaultRepo },
                  this.api
                )
              );

            default:
              throw new Error(`Unknown tool: ${name}`);
          }
        } catch (error) {
          // Ensure we always have a safe fallback error message
          let errorMessage = "An unexpected error occurred";
          let toolName = name || "unknown_tool";

          try {
            // Use enhanced error handling
            const errorResponse = handleError(error, `tool:${toolName}`, {
              toolName: toolName,
              arguments: rawArgs,
              processedArgs: processedArgs,
            });
            errorMessage = errorResponse.message;
          } catch (handlerError) {
            // If even the error handler fails, use a simple message
            errorMessage = `Error in ${toolName}: ${
              error?.message || "Unknown error occurred"
            }`;

            // Log to stderr to avoid MCP protocol interference
            process.stderr.write(
              `Error handler failed: ${handlerError.message}\n`
            );
            process.stderr.write(
              `Original error: ${error?.message || "Unknown"}\n`
            );
          }

          return {
            content: [
              {
                type: "text",
                text: errorMessage,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  async run() {
    try {
      await this.api.testAuthentication();
    } catch (error) {
      console.error("Failed to authenticate with GitHub:", error.message);
      process.exit(1);
    }

    const transport = new this.StdioServerTransport();

    try {
      await this.server.connect(transport);
      console.error("GitHub Repos Manager MCP Server is running...");

      const totalToolsCount = Object.keys(toolsConfig).length;
      let availableToolsCount;

      // Show default repository if set
      if (this.defaultOwner && this.defaultRepo) {
        console.error(
          `Default repository: ${this.defaultOwner}/${this.defaultRepo}`
        );
      }

      // Show allowed repositories if restricted
      if (this.allowedRepos) {
        const allowedReposList = Array.from(this.allowedRepos).join(", ");
        console.error(
          `Repository operations restricted to: ${allowedReposList}`
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

// Global error handlers to prevent server crashes
process.on("uncaughtException", (error) => {
  process.stderr.write(`Uncaught Exception: ${error.message}\n`);
  process.stderr.write(`Stack: ${error.stack}\n`);
  // Don't exit on uncaught exceptions - try to continue running
});

process.on("unhandledRejection", (reason, promise) => {
  process.stderr.write(
    `Unhandled Rejection at: ${promise}, reason: ${reason}\n`
  );
  // Don't exit on unhandled rejections - try to continue running
});

process.on("SIGINT", async () => {
  console.error("Shutting down GitHub Repos Manager MCP Server...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.error(
    "Received SIGTERM, shutting down GitHub Repos Manager MCP Server..."
  );
  process.exit(0);
});

module.exports = GitHubMCPServer;
