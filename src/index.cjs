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
const RepositoryHandlers = require("./handlers/repository.cjs");
const IssueHandlers = require("./handlers/issues.cjs");
const CommentHandlers = require("./handlers/comments.cjs");
const PullRequestHandlers = require("./handlers/pull-requests.cjs");
const UserHandlers = require("./handlers/users.cjs");
const LabelsHandlers = require("./handlers/labels.cjs");
const MilestonesHandlers = require("./handlers/milestones.cjs");
const toolsConfig = require("./utils/tools-config.cjs");

class GitHubMCPServer {
  constructor() {
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
    this.repoHandler.setDefaultRepo(owner, repo);
    this.issueHandler.setDefaultRepo(owner, repo);
    this.commentHandler.setDefaultRepo(owner, repo);
    this.prHandler.setDefaultRepo(owner, repo);
    this.labelsHandler.setDefaultRepo(owner, repo);
    this.milestonesHandler.setDefaultRepo(owner, repo);
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: Object.values(toolsConfig),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
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
          case "set_default_repo":
            const result = await this.repoHandler.setDefaultRepo(args || {});
            this.setDefaultRepo(args.owner, args.repo);
            return result;
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
  }

  async run() {
    // Test GitHub API authentication
    try {
      await this.api.testAuthentication();
    } catch (error) {
      console.error("Failed to authenticate with GitHub:", error.message);
      process.exit(1);
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("GitHub Repos Manager MCP Server is running...");
  }
}

// Handle shutdown gracefully
process.on("SIGINT", async () => {
  console.error("Shutting down GitHub Repos Manager MCP Server...");
  process.exit(0);
});

module.exports = GitHubMCPServer;
