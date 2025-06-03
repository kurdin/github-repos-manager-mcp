#!/usr/bin/env node

// const { Server } = require("@modelcontextprotocol/sdk/server/index.js"); // Changed to dynamic import
// const {
//   StdioServerTransport,
// } = require("@modelcontextprotocol/sdk/server/stdio.js"); // Changed to dynamic import
// const {
// CallToolRequestSchema,
// ListToolsRequestSchema,
// } = require("@modelcontextprotocol/sdk/types.js"); // Changed to dynamic import

// Import all handler modules
const GitHubAPIService = require("./services/github-api.cjs");
const RepositoryHandlers = require("./handlers/repository.cjs");
const IssueHandlers = require("./handlers/issues.cjs");
const CommentHandlers = require("./handlers/comments.cjs");
const PullRequestHandlers = require("./handlers/pull-requests.cjs");
const UserHandlers = require("./handlers/users.cjs");
const LabelsHandlers = require("./handlers/labels.cjs");
const MilestonesHandlers = require("./handlers/milestones.cjs");
const BranchCommitHandlers = require("./handlers/branches-commits.cjs");
const toolsConfig = require("./utils/tools-config.cjs");

class GitHubMCPServer {
  constructor(config = {}) {
    const token = process.env.GH_TOKEN
      ? process.env.GH_TOKEN.trim()
      : undefined;

    // Initialize API service
    this.api = new GitHubAPIService(token);

    // Initialize all handlers
    this.repoHandler = new RepositoryHandlers(this.api);
    this.issueHandler = new IssueHandlers(this.api);
    this.commentHandler = new CommentHandlers(this.api);
    this.prHandler = new PullRequestHandlers(this.api);
    this.userHandler = new UserHandlers(this.api);
    this.labelsHandler = new LabelsHandlers(this.api);
    this.milestonesHandler = new MilestonesHandlers(this.api);
    this.branchCommitHandler = new BranchCommitHandlers(this.api);

    // Determine default/locked repository settings
    this.lockedOwner = config.defaultOwner || process.env.GH_DEFAULT_OWNER;
    this.lockedRepo = config.defaultRepo || process.env.GH_DEFAULT_REPO;
    this.isRepoLocked = !!(this.lockedOwner && this.lockedRepo);

    if (this.isRepoLocked) {
      this.setDefaultRepo(this.lockedOwner, this.lockedRepo); // Set it for handlers
      console.error(`Repository operations are locked to ${this.lockedOwner}/${this.lockedRepo}.`);
    } else if (config.defaultOwner && config.defaultRepo) {
      // This case handles if only config.defaultOwner and config.defaultRepo are set but not as locked.
      // This part of the original logic might be redundant if we always lock when owner/repo are provided at startup.
      // For now, keeping it to ensure existing default setting behavior if not locked.
      this.setDefaultRepo(config.defaultOwner, config.defaultRepo);
      console.error(`Default repository set: ${config.defaultOwner}/${config.defaultRepo}`);
    }


    // Determine default/locked repository settings
    this.lockedOwner = config.defaultOwner || process.env.GH_DEFAULT_OWNER;
    this.lockedRepo = config.defaultRepo || process.env.GH_DEFAULT_REPO;
    this.isRepoLocked = !!(this.lockedOwner && this.lockedRepo);

    if (this.isRepoLocked) {
      this.setDefaultRepo(this.lockedOwner, this.lockedRepo); // Set it for handlers
      console.error(`Repository operations are locked to ${this.lockedOwner}/${this.lockedRepo}.`);
    } else if (config.defaultOwner && config.defaultRepo) {
      this.setDefaultRepo(config.defaultOwner, config.defaultRepo);
      console.error(`Default repository set: ${config.defaultOwner}/${config.defaultRepo}`);
    }

    // Tool filtering logic
    const parseToolsString = (toolsString) => new Set(toolsString ? toolsString.split(',').map(t => t.trim()).filter(t => t) : []);

    // Prepare tool strings from config (CLI) or environment variables
    let configDisabledToolsStr = config.disabledTools;
    if (Array.isArray(config.disabledTools)) {
      configDisabledToolsStr = config.disabledTools.join(',');
    }

    let configAllowedToolsStr = config.allowedTools;
    if (Array.isArray(config.allowedTools)) {
      configAllowedToolsStr = config.allowedTools.join(',');
    }

    const disabledToolsRaw = configDisabledToolsStr || process.env.GH_DISABLED_TOOLS;
    const allowedToolsRaw = configAllowedToolsStr || process.env.GH_ALLOWED_TOOLS;

    const disabledToolsSet = parseToolsString(disabledToolsRaw);
    const allowedToolsSet = parseToolsString(allowedToolsRaw);

    this.availableToolsConfig = { ...toolsConfig }; // Start with all tools

    if (allowedToolsSet.size > 0) {
      const filteredTools = {};
      for (const toolName of allowedToolsSet) {
        if (this.availableToolsConfig[toolName]) {
          filteredTools[toolName] = this.availableToolsConfig[toolName];
        }
      }
      this.availableToolsConfig = filteredTools;
      console.error(`Tool access restricted by allowed list. Available tools: [${Object.keys(this.availableToolsConfig).join(', ')}]`);
    } else if (disabledToolsSet.size > 0) {
      for (const toolName of disabledToolsSet) {
        delete this.availableToolsConfig[toolName];
      }
      console.error(`Some tools disabled. Disabled tools: [${[...disabledToolsSet].join(', ')}]. Available tools: [${Object.keys(this.availableToolsConfig).join(', ')}]`);
    }
    // End of Tool filtering logic

    // Initialize server with dynamic import
    import("@modelcontextprotocol/sdk/server/index.js").then(({ Server }) => {
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
      this.setupToolHandlers(); // Call setupToolHandlers after server is initialized
    }).catch(error => {
      console.error("Failed to import Server:", error);
      // Handle initialization error, perhaps by exiting or setting a flag
      process.exit(1); // Exit if server fails to initialize
    });
  }

  setDefaultRepo(owner, repo) {
    this.repoHandler.setDefaultRepo(owner, repo);
    this.issueHandler.setDefaultRepo(owner, repo);
    this.commentHandler.setDefaultRepo(owner, repo);
    this.prHandler.setDefaultRepo(owner, repo);
    this.labelsHandler.setDefaultRepo(owner, repo);
    this.milestonesHandler.setDefaultRepo(owner, repo);
    this.branchCommitHandler.setDefaultRepo(owner, repo);
  }

  setupToolHandlers() {
    import("@modelcontextprotocol/sdk/types.js").then(({ ListToolsRequestSchema, CallToolRequestSchema }) => {
      // List available tools
      this.server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
          // Return filtered list of tools
          tools: Object.values(this.availableToolsConfig),
        };
      });

      // Handle tool calls
      this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const toolNameFromRequest = request.params.name;
        // Check if the tool is available before any other logic
        if (!this.availableToolsConfig[toolNameFromRequest]) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Tool '${toolNameFromRequest}' is not available or has been disabled.`,
              },
            ],
            isError: true,
          };
        }

        let { name, arguments: args } = request.params; // Use let for args as it might be reassigned
        args = args || {}; // Ensure args is an object

        if (this.isRepoLocked) {
          if (name === "set_default_repo") {
            // Return an error response for set_default_repo when locked
            return {
              content: [
                {
                  type: "text",
                  text: "Error: Repository is locked by startup configuration and cannot be changed.",
                },
              ],
              isError: true,
            };
          } else if (name === 'list_repos') {
            // Special handling for list_repos when locked
            try {
              const lockedRepoInfo = await this.repoHandler.getRepoInfo({ owner: this.lockedOwner, repo: this.lockedRepo });
              // The actual repo data is a JSON string in lockedRepoInfo.content[0].text
              // We need to format this for display. A simple way is to present the JSON,
              // or try to extract key fields if a more user-friendly format is needed.
              // For now, let's assume the JSON string itself is okay for the "list-like" output.
              let repoDetails = "Details not available or error fetching locked repository.";
              if (lockedRepoInfo.content && lockedRepoInfo.content[0] && lockedRepoInfo.content[0].text) {
                // Attempt to parse and pretty-print the JSON for better readability
                try {
                  const repoJson = JSON.parse(lockedRepoInfo.content[0].text);
                  repoDetails = JSON.stringify(repoJson, null, 2);
                } catch (parseError) {
                  // If parsing fails, use the raw text
                  repoDetails = lockedRepoInfo.content[0].text;
                  console.error("Error parsing repo details for locked list_repos:", parseError);
                }
              } else if (lockedRepoInfo.isError && lockedRepoInfo.content && lockedRepoInfo.content[0] && lockedRepoInfo.content[0].text) {
                repoDetails = `Error fetching locked repository: ${lockedRepoInfo.content[0].text}`;
              }

              return {
                content: [{
                  type: 'text',
                  text: `Listing is restricted to the locked repository: ${this.lockedOwner}/${this.lockedRepo} as per startup configuration.\n\n${repoDetails}`
                }]
              };
            } catch (error) {
              console.error(`Error in locked list_repos for ${this.lockedOwner}/${this.lockedRepo}:`, error);
              return {
                content: [{ type: 'text', text: `Error fetching details for locked repository ${this.lockedOwner}/${this.lockedRepo}: ${error.message}` }],
                isError: true,
              };
            }
          } else if (name === 'search_repos') {
            // Special handling for search_repos when locked
            args.query = args.query ? `${args.query} repo:${this.lockedOwner}/${this.lockedRepo}` : `repo:${this.lockedOwner}/${this.lockedRepo}`;
            console.error(`Search is restricted to the locked repository: ${this.lockedOwner}/${this.lockedRepo}. Modified query: "${args.query}"`);
            // The call will proceed to the main switch statement with modified args.
          }

          const toolsModifyingRepoArgs = [
            "get_repo_info", "list_issues", "create_issue", "edit_issue", "get_issue_details",
            "lock_issue", "unlock_issue", "add_assignees_to_issue", "remove_assignees_from_issue",
            "get_repo_contents", "list_repo_collaborators", "list_prs",
            "list_repo_labels", "create_label", "edit_label", "delete_label",
            "list_milestones", "create_milestone", "edit_milestone", "delete_milestone",
            "list_branches", "create_branch", "list_commits", "get_commit_details", "compare_commits",
            "list_issue_comments", "create_issue_comment", "edit_issue_comment", "delete_issue_comment"
            // Note: 'set_default_repo', 'list_repos', 'search_repos' are handled above or not applicable for this generic override.
            // Tools like 'get_user_info' are not included.
          ];

          // This block will now apply to tools in toolsModifyingRepoArgs
          // EXCLUDING set_default_repo, list_repos, search_repos (which have specific handling above if locked)
          if (toolsModifyingRepoArgs.includes(name) && name !== 'list_repos' && name !== 'search_repos') {
            if (args.owner !== this.lockedOwner || args.repo !== this.lockedRepo) {
              // Log if owner/repo are being overridden, but only if they were different or present
              if (args.owner || args.repo) {
                console.error(`Overriding owner/repo for tool '${name}' due to repository lock. Original: ${args.owner}/${args.repo}, Locked: ${this.lockedOwner}/${this.lockedRepo}`);
              }
            }
            args.owner = this.lockedOwner;
            args.repo = this.lockedRepo;
          }
        }

        try {
          // For set_default_repo, if not locked, the original logic applies.
          // If locked, it's handled above and won't reach here for set_default_repo.
          if (name === "set_default_repo") {
            // Validate arguments (this is now only for the non-locked case)
            if (!args.owner || !args.repo) {
              throw new Error("Both owner and repo are required for set_default_repo");
            }
            // Set the default repo on all handlers
            this.setDefaultRepo(args.owner, args.repo);
            // Return success response
            return {
              content: [
                {
                  type: "text",
                  text: `Default repository set to: ${args.owner}/${args.repo}`,
                },
              ],
            };
          }

          switch (name) {
            // Repository tools
            case "list_repos":
            return await this.repoHandler.listRepos(args || {});
          case "get_repo_info":
            return await this.repoHandler.getRepoInfo(args || {});
          case "search_repos":
            return await this.repoHandler.searchRepos(args || {});
          case "get_repo_contents":
            return await this.repoHandler.getRepoContents(args || {});
          case "list_repo_collaborators":
            return await this.repoHandler.listRepoCollaborators(args || {});

          // Issue tools
          case "list_issues":
            return await this.issueHandler.listIssues(args || {});
          case "create_issue":
            return await this.issueHandler.createIssue(args || {});
          case "edit_issue":
            return await this.issueHandler.editIssue(args || {});
          case "get_issue_details":
            return await this.issueHandler.getIssueDetails(args || {});
          case "lock_issue":
            return await this.issueHandler.lockIssue(args || {});
          case "unlock_issue":
            return await this.issueHandler.unlockIssue(args || {});
          case "add_assignees_to_issue":
            return await this.issueHandler.addAssigneesToIssue(args || {});
          case "remove_assignees_from_issue":
            return await this.issueHandler.removeAssigneesFromIssue(args || {});

          // Comment tools
          case "list_issue_comments":
            return await this.commentHandler.listIssueComments(args || {});
          case "create_issue_comment":
            return await this.commentHandler.createIssueComment(args || {});
          case "edit_issue_comment":
            return await this.commentHandler.editIssueComment(args || {});
          case "delete_issue_comment":
            return await this.commentHandler.deleteIssueComment(args || {});

          // Pull request tools
          case "list_prs":
            return await this.prHandler.listPRs(args || {});

          // User tools
          case "get_user_info":
            return await this.userHandler.getUserInfo(args || {});

          // Labels tools
          case "list_repo_labels":
            return await this.labelsHandler.listRepoLabels(args || {});
          case "create_label":
            return await this.labelsHandler.createLabel(args || {});
          case "edit_label":
            return await this.labelsHandler.editLabel(args || {});
          case "delete_label":
            return await this.labelsHandler.deleteLabel(args || {});

          // Milestones tools
          case "list_milestones":
            return await this.milestonesHandler.listMilestones(args || {});
          case "create_milestone":
            return await this.milestonesHandler.createMilestone(args || {});
          case "edit_milestone":
            return await this.milestonesHandler.editMilestone(args || {});
          case "delete_milestone":
            return await this.milestonesHandler.deleteMilestone(args || {});

          // Branch and Commit tools
          case "list_branches":
            return await this.branchCommitHandler.listBranches(args || {});
          case "create_branch":
            return await this.branchCommitHandler.createBranch(args || {});
          case "list_commits":
            return await this.branchCommitHandler.listCommits(args || {});
          case "get_commit_details":
            return await this.branchCommitHandler.getCommitDetails(args || {});
          case "compare_commits":
            return await this.branchCommitHandler.compareCommits(args || {});

          default:
            throw new Error(`Unknown tool: ${name}`);
          }
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      });
    }).catch(error => {
      console.error("Failed to import SDK types:", error);
      process.exit(1);
    });
  }

  async run() {
    // Test GitHub API authentication
    // try {
    //   await this.api.testAuthentication();
    // } catch (error) {
    //   console.error("Failed to authenticate with GitHub:", error.message);
    //   process.exit(1);
    // }

    // Dynamically import StdioServerTransport and connect
    import("@modelcontextprotocol/sdk/server/stdio.js")
      .then(async ({ StdioServerTransport }) => {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("GitHub Repos Manager MCP Server is running...");

        // Keep the process alive by preventing it from exiting
        process.stdin.resume();
      })
      .catch((error) => {
        console.error("Failed to connect server:", error);
        process.exit(1);
      });
  }
}

// Handle shutdown gracefully
process.on("SIGINT", async () => {
  console.error("Shutting down GitHub Repos Manager MCP Server...");
  process.exit(0);
});

module.exports = GitHubMCPServer;
