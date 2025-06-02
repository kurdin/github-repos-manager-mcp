#!/usr/bin/env node

// Import the refactored server from the src directory
const GitHubMCPServer = require("./src/index.cjs");

// Start the server
const server = new GitHubMCPServer();
server.run().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
  constructor() {
    this.token = process.env.GH_TOKEN ? process.env.GH_TOKEN.trim() : undefined;
    if (!this.token) {
      console.error(
        "Error: GH_TOKEN environment variable is not set or empty after trim"
      );
      process.exit(1);
    }

    this.defaultOwner = null;
    this.defaultRepo = null;

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

  async makeGitHubRequest(endpoint, options = {}) {
    console.error("makeGitHubRequest method entered.");
    const url = `https://api.github.com${endpoint}`;
    const headers = {
      Authorization: `token ${this.token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "node-fetch", // Or a more generic one like "MyNodeApp/1.0"
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 204) {
        // Handle No Content responses
        return { success: true, message: "Operation successful (No Content)" };
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GitHub API error (${response.status}): ${errorText}`);
      }

      // For other successful responses, try to parse JSON
      // If response body is empty for some other OK status, .json() might fail
      const responseText = await response.text();
      if (responseText) {
        return JSON.parse(responseText);
      }
      return {
        success: true,
        message: `Operation successful (${response.status})`,
      }; // Or some other generic success object
    } catch (error) {
      console.error(`API request failed: ${error.message}`);
      throw error;
    }
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "list_repos",
            description: "List GitHub repositories for the authenticated user",
            inputSchema: {
              type: "object",
              properties: {
                per_page: {
                  type: "number",
                  description:
                    "Number of repositories to list (default: 10, max: 100)",
                  default: 10,
                  maximum: 100,
                },
                visibility: {
                  type: "string",
                  enum: ["all", "public", "private"],
                  description: "Repository visibility filter",
                  default: "all",
                },
                sort: {
                  type: "string",
                  enum: ["created", "updated", "pushed", "full_name"],
                  description: "Sort repositories by",
                  default: "updated",
                },
              },
            },
          },
          {
            name: "get_repo_info",
            description: "Get detailed information about a specific repository",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description: "Repository owner username",
                },
                repo: {
                  type: "string",
                  description: "Repository name",
                },
              },
              required: ["owner", "repo"],
            },
          },
          {
            name: "list_issues",
            description: "List issues for a repository",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description: "Repository owner username",
                },
                repo: {
                  type: "string",
                  description: "Repository name",
                },
                state: {
                  type: "string",
                  enum: ["open", "closed", "all"],
                  description: "Issue state filter",
                  default: "open",
                },
                per_page: {
                  type: "number",
                  description:
                    "Number of issues to list (default: 10, max: 100)",
                  default: 10,
                  maximum: 100,
                },
              },
              required: ["owner", "repo"],
            },
          },
          {
            name: "create_issue",
            description: "Create a new issue in a repository",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description: "Repository owner username",
                },
                repo: {
                  type: "string",
                  description: "Repository name",
                },
                title: {
                  type: "string",
                  description: "Issue title",
                },
                body: {
                  type: "string",
                  description: "Issue body/description",
                },
                image_path: {
                  type: "string",
                  description:
                    "Optional local path to an image to upload and embed in the issue body.",
                },
                labels: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of label names",
                },
                assignees: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of usernames to assign",
                },
              },
              required: ["owner", "repo", "title"],
            },
          },
          {
            name: "list_prs",
            description: "List pull requests for a repository",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description: "Repository owner username",
                },
                repo: {
                  type: "string",
                  description: "Repository name",
                },
                state: {
                  type: "string",
                  enum: ["open", "closed", "all"],
                  description: "Pull request state filter",
                  default: "open",
                },
                per_page: {
                  type: "number",
                  description:
                    "Number of pull requests to list (default: 10, max: 100)",
                  default: 10,
                  maximum: 100,
                },
              },
              required: ["owner", "repo"],
            },
          },
          {
            name: "get_user_info",
            description:
              "Get information about the authenticated user or a specific user",
            inputSchema: {
              type: "object",
              properties: {
                username: {
                  type: "string",
                  description:
                    "Username to get info for (optional, defaults to authenticated user)",
                },
              },
            },
          },
          {
            name: "search_repos",
            description: "Search for repositories on GitHub",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description:
                    'Search query (e.g., "react language:javascript")',
                },
                per_page: {
                  type: "number",
                  description:
                    "Number of results to return (default: 10, max: 100)",
                  default: 10,
                  maximum: 100,
                },
                sort: {
                  type: "string",
                  enum: ["stars", "forks", "help-wanted-issues", "updated"],
                  description: "Sort results by",
                  default: "stars",
                },
              },
              required: ["query"],
            },
          },
          {
            name: "get_repo_contents",
            description: "Get contents of a file or directory in a repository",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description: "Repository owner username",
                },
                repo: {
                  type: "string",
                  description: "Repository name",
                },
                path: {
                  type: "string",
                  description: "Path to file or directory",
                  default: "",
                },
                ref: {
                  type: "string",
                  description:
                    "Branch, tag, or commit SHA (default: default branch)",
                },
              },
              required: ["owner", "repo"],
            },
          },
          {
            name: "set_default_repo",
            description:
              "Set a default owner and repository for subsequent commands.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "The GitHub username or organization name for the repository owner.",
                },
                repo: {
                  type: "string",
                  description: "The name of the GitHub repository.",
                },
              },
              required: ["owner", "repo"],
            },
          },
          {
            name: "edit_issue",
            description:
              "Edit an existing issue in a repository. Allows updating title, body, state, labels, assignees, and appending an image.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner username (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                issue_number: {
                  type: "integer",
                  description: "The number of the issue to edit.",
                },
                title: {
                  type: "string",
                  description: "New title for the issue (optional).",
                },
                body: {
                  type: "string",
                  description:
                    "New body for the issue. If image_path is also provided, the image will be appended to this new body (optional).",
                },
                state: {
                  type: "string",
                  enum: ["open", "closed"],
                  description:
                    "New state for the issue (e.g., 'open' or 'closed') (optional).",
                },
                image_path: {
                  type: "string",
                  description:
                    "Local path to an image to upload and append to the issue body (optional).",
                },
                labels: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "Array of label names to replace existing labels (optional).",
                },
                assignees: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "Array of usernames to replace existing assignees (optional).",
                },
              },
              required: ["issue_number"],
            },
          },
          {
            name: "get_issue_details",
            description: "Get detailed information about a single issue.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                issue_number: {
                  type: "integer",
                  description: "The number of the issue.",
                },
              },
              required: ["issue_number"],
            },
          },
          {
            name: "list_issue_comments",
            description: "List comments for an issue.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                issue_number: {
                  type: "integer",
                  description: "The number of the issue.",
                },
                per_page: {
                  type: "integer",
                  description:
                    "Number of comments per page (default 30, max 100).",
                  default: 30,
                },
                since: {
                  type: "string",
                  format: "date-time",
                  description:
                    "Only comments updated at or after this time are returned.",
                },
              },
              required: ["issue_number"],
            },
          },
          {
            name: "create_issue_comment",
            description: "Create a new comment on an issue.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                issue_number: {
                  type: "integer",
                  description: "The number of the issue.",
                },
                body: {
                  type: "string",
                  description: "The content of the comment.",
                },
              },
              required: ["issue_number", "body"],
            },
          },
          {
            name: "edit_issue_comment",
            description: "Edit an existing comment on an issue.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                comment_id: {
                  type: "integer",
                  description: "The ID of the comment to edit.",
                },
                body: {
                  type: "string",
                  description: "The new content of the comment.",
                },
              },
              required: ["comment_id", "body"],
            },
          },
          {
            name: "delete_issue_comment",
            description: "Delete a comment on an issue.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                comment_id: {
                  type: "integer",
                  description: "The ID of the comment to delete.",
                },
              },
              required: ["comment_id"],
            },
          },
          {
            name: "lock_issue",
            description: "Lock an issue to prevent further comments.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                issue_number: {
                  type: "integer",
                  description: "The number of the issue to lock.",
                },
                lock_reason: {
                  type: "string",
                  enum: ["off-topic", "too heated", "resolved", "spam"],
                  description: "Reason for locking (optional).",
                },
              },
              required: ["issue_number"],
            },
          },
          {
            name: "unlock_issue",
            description: "Unlock a previously locked issue.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                issue_number: {
                  type: "integer",
                  description: "The number of the issue to unlock.",
                },
              },
              required: ["issue_number"],
            },
          },
          {
            name: "add_assignees_to_issue",
            description: "Add one or more assignees to an issue.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                issue_number: {
                  type: "integer",
                  description: "The number of the issue.",
                },
                assignees: {
                  type: "array",
                  items: { type: "string" },
                  description: "Usernames of assignees to add.",
                },
              },
              required: ["issue_number", "assignees"],
            },
          },
          {
            name: "remove_assignees_from_issue",
            description: "Remove one or more assignees from an issue.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                issue_number: {
                  type: "integer",
                  description: "The number of the issue.",
                },
                assignees: {
                  type: "array",
                  items: { type: "string" },
                  description: "Usernames of assignees to remove.",
                },
              },
              required: ["issue_number", "assignees"],
            },
          },
          {
            name: "list_repo_collaborators",
            description: "List collaborators for a repository.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                affiliation: {
                  type: "string",
                  enum: ["outside", "direct", "all"],
                  default: "all",
                  description: "Filter by affiliation.",
                },
                permission: {
                  type: "string",
                  enum: ["pull", "triage", "push", "maintain", "admin"],
                  description: "Filter by permission level.",
                },
                per_page: {
                  type: "integer",
                  default: 30,
                  description: "Results per page (max 100).",
                },
              },
            },
          },
          {
            name: "list_repo_labels",
            description: "List all labels in a repository.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                per_page: {
                  type: "integer",
                  default: 30,
                  description: "Results per page (max 100).",
                },
              },
            },
          },
          {
            name: "create_label",
            description: "Create a new label in a repository.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                name: {
                  type: "string",
                  description: "The name of the label.",
                },
                color: {
                  type: "string",
                  description:
                    "The hexadecimal color code for the label (without #).",
                  default: "f29513",
                },
                description: {
                  type: "string",
                  description: "A short description of the label.",
                },
              },
              required: ["name"],
            },
          },
          {
            name: "edit_label",
            description: "Edit an existing label in a repository.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                current_name: {
                  type: "string",
                  description: "The current name of the label to edit.",
                },
                name: {
                  type: "string",
                  description: "The new name of the label.",
                },
                color: {
                  type: "string",
                  description:
                    "The new hexadecimal color code for the label (without #).",
                },
                description: {
                  type: "string",
                  description: "The new description of the label.",
                },
              },
              required: ["current_name"],
            },
          },
          {
            name: "delete_label",
            description: "Delete a label from a repository.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                name: {
                  type: "string",
                  description: "The name of the label to delete.",
                },
              },
              required: ["name"],
            },
          },
          {
            name: "list_milestones",
            description: "List milestones in a repository.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                state: {
                  type: "string",
                  enum: ["open", "closed", "all"],
                  default: "open",
                  description: "The state of the milestones to return.",
                },
                sort: {
                  type: "string",
                  enum: ["due_on", "completeness"],
                  default: "due_on",
                  description: "What to sort results by.",
                },
                direction: {
                  type: "string",
                  enum: ["asc", "desc"],
                  default: "asc",
                  description: "The direction to sort the results by.",
                },
                per_page: {
                  type: "integer",
                  default: 30,
                  description: "Results per page (max 100).",
                },
              },
            },
          },
          {
            name: "create_milestone",
            description: "Create a new milestone in a repository.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                title: {
                  type: "string",
                  description: "The title of the milestone.",
                },
                state: {
                  type: "string",
                  enum: ["open", "closed"],
                  default: "open",
                  description: "The state of the milestone.",
                },
                description: {
                  type: "string",
                  description: "A description of the milestone.",
                },
                due_on: {
                  type: "string",
                  format: "date-time",
                  description: "The milestone due date (ISO 8601 format).",
                },
              },
              required: ["title"],
            },
          },
          {
            name: "edit_milestone",
            description: "Edit an existing milestone in a repository.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                milestone_number: {
                  type: "integer",
                  description: "The number of the milestone to edit.",
                },
                title: {
                  type: "string",
                  description: "The new title of the milestone.",
                },
                state: {
                  type: "string",
                  enum: ["open", "closed"],
                  description: "The new state of the milestone.",
                },
                description: {
                  type: "string",
                  description: "The new description of the milestone.",
                },
                due_on: {
                  type: "string",
                  format: "date-time",
                  description: "The new milestone due date (ISO 8601 format).",
                },
              },
              required: ["milestone_number"],
            },
          },
          {
            name: "delete_milestone",
            description: "Delete a milestone from a repository.",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description:
                    "Repository owner (uses default if not provided).",
                },
                repo: {
                  type: "string",
                  description:
                    "Repository name (uses default if not provided).",
                },
                milestone_number: {
                  type: "integer",
                  description: "The number of the milestone to delete.",
                },
              },
              required: ["milestone_number"],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "set_default_repo":
            return await this.setDefaultRepo(args);
          case "edit_issue":
            return await this.editIssue(args);
          case "get_issue_details":
            return await this.getIssueDetails(args);
          case "list_issue_comments":
            return await this.listIssueComments(args);
          case "create_issue_comment":
            return await this.createIssueComment(args);
          case "edit_issue_comment":
            return await this.editIssueComment(args);
          case "delete_issue_comment":
            return await this.deleteIssueComment(args);
          case "lock_issue":
            return await this.lockIssue(args);
          case "unlock_issue":
            return await this.unlockIssue(args);
          case "add_assignees_to_issue":
            return await this.addAssigneesToIssue(args);
          case "remove_assignees_from_issue":
            return await this.removeAssigneesFromIssue(args);
          case "list_repo_collaborators":
            return await this.listRepoCollaborators(args);
          case "list_repos":
            return await this.listRepos(args);
          case "get_repo_info":
            return await this.getRepoInfo(args);
          case "list_issues":
            return await this.listIssues(args);
          case "create_issue":
            return await this.createIssue(args);
          case "list_prs":
            return await this.listPRs(args);
          case "get_user_info":
            return await this.getUserInfo(args);
          case "search_repos":
            return await this.searchRepos(args);
          case "get_repo_contents":
            return await this.getRepoContents(args);
          case "list_repo_labels":
            return await this.listRepoLabels(args);
          case "create_label":
            return await this.createLabel(args);
          case "edit_label":
            return await this.editLabel(args);
          case "delete_label":
            return await this.deleteLabel(args);
          case "list_milestones":
            return await this.listMilestones(args);
          case "create_milestone":
            return await this.createMilestone(args);
          case "edit_milestone":
            return await this.editMilestone(args);
          case "delete_milestone":
            return await this.deleteMilestone(args);
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
        };
      }
    });
  }

  async listRepos(args) {
    const { per_page = 10, visibility = "all", sort = "updated" } = args;
    const params = new URLSearchParams({
      per_page: per_page.toString(),
      sort,
      direction: "desc",
    });

    if (visibility !== "all") {
      params.append("visibility", visibility);
    }
    const repos = await this.makeGitHubRequest(
      `/user/repos?${params.toString()}`
    );

    const formatted = repos.map((repo) => ({
      name: repo.full_name,
      description: repo.description || "No description",
      private: repo.private,
      language: repo.language || "N/A",
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updated: repo.updated_at,
      url: repo.html_url,
    }));

    return {
      content: [
        {
          type: "text",
          text: `Found ${repos.length} repositories:\n\n${formatted
            .map(
              (repo) =>
                `**${repo.name}** ${
                  repo.private ? "(private)" : "(public)"
                }\n` +
                `Description: ${repo.description}\n` +
                `Language: ${repo.language} | Stars: ${repo.stars} | Forks: ${repo.forks}\n` +
                `Updated: ${new Date(repo.updated).toLocaleDateString()}\n` +
                `URL: ${repo.url}\n`
            )
            .join("\n")}`,
        },
      ],
    };
  }

  async getRepoInfo(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;

    if (!owner || !repo) {
      throw new Error(
        "Repository owner and name are required. Please provide them or set a default repository using set_default_repo."
      );
    }
    const repoData = await this.makeGitHubRequest(`/repos/${owner}/${repo}`);

    const info = `
**${repoData.full_name}** ${repoData.private ? "(private)" : "(public)"}

**Description:** ${repoData.description || "No description"}
**Language:** ${repoData.language || "N/A"}
**Stars:** ${repoData.stargazers_count}
**Forks:** ${repoData.forks_count}
**Watchers:** ${repoData.watchers_count}
**Open Issues:** ${repoData.open_issues_count}
**Default Branch:** ${repoData.default_branch}
**Created:** ${new Date(repoData.created_at).toLocaleDateString()}
**Updated:** ${new Date(repoData.updated_at).toLocaleDateString()}
**Size:** ${repoData.size} KB

**Clone URL:** ${repoData.clone_url}
**Web URL:** ${repoData.html_url}

${repoData.homepage ? `**Homepage:** ${repoData.homepage}` : ""}
${repoData.license ? `**License:** ${repoData.license.name}` : ""}
    `.trim();

    return {
      content: [
        {
          type: "text",
          text: info,
        },
      ],
    };
  }

  async listIssues(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { state = "open", per_page = 10 } = args;

    if (!owner || !repo) {
      throw new Error(
        "Repository owner and name are required. Please provide them or set a default repository using set_default_repo."
      );
    }

    const params = new URLSearchParams({
      state,
      per_page: per_page.toString(),
      sort: "updated",
      direction: "desc",
    });

    const issues = await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues?${params}`
    );

    if (issues.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No ${state} issues found in ${owner}/${repo}`,
          },
        ],
      };
    }

    const formatted = issues
      .map(
        (issue) =>
          `**#${issue.number}** ${issue.title}\n` +
          `State: ${issue.state} | Author: ${issue.user.login}\n` +
          `Created: ${new Date(issue.created_at).toLocaleDateString()}\n` +
          `URL: ${issue.html_url}\n` +
          `Labels: ${issue.labels.map((l) => l.name).join(", ") || "None"}\n`
      )
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${issues.length} ${state} issues in ${owner}/${repo}:\n\n${formatted}`,
        },
      ],
    };
  }

  async createIssue(args) {
    let { title, body = "", labels = [], assignees = [], image_path } = args;
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    let finalBody = body;

    if (!owner || !repo) {
      throw new Error(
        "Repository owner and name are required. Please provide them or set a default repository using set_default_repo."
      );
    }

    if (image_path) {
      try {
        console.error(`Attempting to read image from: ${image_path}`);
        const imageContent = await fs.readFile(image_path);
        const base64Image = imageContent.toString("base64");
        const originalFileName = path.basename(image_path);
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${originalFileName}`;
        const repoImagePath = `.github/issue_images/${uniqueFileName}`;

        console.error(`Uploading image to repo at: ${repoImagePath}`);
        const uploadedImage = await this.uploadFileToRepo(
          owner,
          repo,
          repoImagePath,
          base64Image,
          `Upload image ${uniqueFileName} for issue`
        );

        if (uploadedImage && uploadedImage.download_url) {
          const imageMarkdown = `\n\n![${originalFileName}](${uploadedImage.download_url})`;
          finalBody += imageMarkdown;
          console.error(
            `Image uploaded and markdown added: ${uploadedImage.download_url}`
          );
        } else {
          console.error(
            "Failed to upload image or get download_url in createIssue. Uploaded object was:",
            JSON.stringify(uploadedImage, null, 2),
            "Proceeding without image."
          );
        }
      } catch (uploadError) {
        console.error(
          `Error processing image upload: ${uploadError.message}. Proceeding without image.`
        );
        // Optionally, append error message to body or handle differently
        // finalBody += `\n\n(Failed to upload image: ${uploadError.message})`;
      }
    }

    const issueData = {
      title,
      body: finalBody,
      labels,
      assignees,
    };

    const issue = await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(issueData),
      }
    );

    return {
      content: [
        {
          type: "text",
          text:
            `Created issue #${issue.number} in ${owner}/${repo}:\n\n` +
            `**${issue.title}**\n` +
            `URL: ${issue.html_url}\n` +
            `State: ${issue.state}\n` +
            `Created: ${new Date(issue.created_at).toLocaleDateString()}`,
        },
      ],
    };
  }

  async listPRs(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { state = "open", per_page = 10 } = args;

    if (!owner || !repo) {
      throw new Error(
        "Repository owner and name are required. Please provide them or set a default repository using set_default_repo."
      );
    }
    const params = new URLSearchParams({
      state,
      per_page: per_page.toString(),
      sort: "updated",
      direction: "desc",
    });

    const prs = await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/pulls?${params}`
    );

    if (prs.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No ${state} pull requests found in ${owner}/${repo}`,
          },
        ],
      };
    }

    const formatted = prs
      .map(
        (pr) =>
          `**#${pr.number}** ${pr.title}\n` +
          `State: ${pr.state} | Author: ${pr.user.login}\n` +
          `Base: ${pr.base.ref} ← Head: ${pr.head.ref}\n` +
          `Created: ${new Date(pr.created_at).toLocaleDateString()}\n` +
          `URL: ${pr.html_url}\n`
      )
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${prs.length} ${state} pull requests in ${owner}/${repo}:\n\n${formatted}`,
        },
      ],
    };
  }

  async getUserInfo(args) {
    const { username } = args;
    const endpoint = username ? `/users/${username}` : "/user";
    const user = await this.makeGitHubRequest(endpoint);

    const info = `
**${user.login}** ${user.name ? `(${user.name})` : ""}

**Bio:** ${user.bio || "No bio"}
**Company:** ${user.company || "N/A"}
**Location:** ${user.location || "N/A"}
**Email:** ${user.email || "Not public"}
**Blog:** ${user.blog || "N/A"}
**Twitter:** ${user.twitter_username ? `@${user.twitter_username}` : "N/A"}

**Public Repos:** ${user.public_repos}
**Public Gists:** ${user.public_gists}
**Followers:** ${user.followers}
**Following:** ${user.following}

**Account Created:** ${new Date(user.created_at).toLocaleDateString()}
**Profile URL:** ${user.html_url}
    `.trim();

    return {
      content: [
        {
          type: "text",
          text: info,
        },
      ],
    };
  }

  async searchRepos(args) {
    const { query, per_page = 10, sort = "stars" } = args;
    const params = new URLSearchParams({
      q: query,
      per_page: per_page.toString(),
      sort,
      order: "desc",
    });

    const results = await this.makeGitHubRequest(
      `/search/repositories?${params}`
    );

    if (results.total_count === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No repositories found for query: "${query}"`,
          },
        ],
      };
    }

    const formatted = results.items
      .map(
        (repo) =>
          `**${repo.full_name}** ${repo.private ? "(private)" : "(public)"}\n` +
          `Description: ${repo.description || "No description"}\n` +
          `Language: ${repo.language || "N/A"} | Stars: ${
            repo.stargazers_count
          } | Forks: ${repo.forks_count}\n` +
          `Updated: ${new Date(repo.updated_at).toLocaleDateString()}\n` +
          `URL: ${repo.html_url}\n`
      )
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${results.total_count} repositories (showing ${results.items.length}):\n\n${formatted}`,
        },
      ],
    };
  }

  async getRepoContents(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { path = "", ref } = args;

    if (!owner || !repo) {
      throw new Error(
        "Repository owner and name are required. Please provide them or set a default repository using set_default_repo."
      );
    }
    let endpoint = `/repos/${owner}/${repo}/contents/${path}`;

    if (ref) {
      endpoint += `?ref=${ref}`;
    }

    const contents = await this.makeGitHubRequest(endpoint);

    if (Array.isArray(contents)) {
      // Directory listing
      const formatted = contents
        .map(
          (item) =>
            `${item.type === "dir" ? "📁" : "📄"} **${item.name}**\n` +
            `Type: ${item.type} | Size: ${item.size || 0} bytes\n` +
            `URL: ${item.html_url}\n`
        )
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `Contents of ${owner}/${repo}/${path}:\n\n${formatted}`,
          },
        ],
      };
    } else {
      // Single file
      const isText = contents.encoding === "base64" && contents.size < 100000; // Only decode small files
      let fileContent = "";

      if (isText) {
        try {
          fileContent = Buffer.from(contents.content, "base64").toString(
            "utf8"
          );
          // Truncate if too long
          if (fileContent.length > 2000) {
            fileContent =
              fileContent.substring(0, 2000) + "\n\n... (truncated)";
          }
        } catch (e) {
          fileContent = "(Binary file or decode error)";
        }
      }

      return {
        content: [
          {
            type: "text",
            text:
              `**File:** ${owner}/${repo}/${path}\n` +
              `**Size:** ${contents.size} bytes\n` +
              `**Type:** ${contents.type}\n` +
              `**SHA:** ${contents.sha}\n` +
              `**URL:** ${contents.html_url}\n\n` +
              (isText
                ? `**Content:**\n\`\`\`\n${fileContent}\n\`\`\``
                : "(Binary file - content not shown)"),
          },
        ],
      };
    }
  }

  async uploadFileToRepo(
    owner,
    repo,
    filePathInRepo,
    base64Content,
    commitMessage
  ) {
    const endpoint = `/repos/${owner}/${repo}/contents/${filePathInRepo}`;
    console.error(`Attempting to upload file to: ${endpoint}`);
    try {
      const apiResponse = await this.makeGitHubRequest(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: commitMessage,
          content: base64Content,
        }),
      });
      console.error(
        "Full API response from makeGitHubRequest in uploadFileToRepo:",
        JSON.stringify(apiResponse, null, 2)
      );

      if (!apiResponse || typeof apiResponse !== "object") {
        console.error(
          "API response from makeGitHubRequest is not a valid object:",
          apiResponse
        );
        throw new Error(
          "Invalid API response structure received for file upload."
        );
      }
      if (!apiResponse.content) {
        console.error(
          "API response from makeGitHubRequest is missing 'content' field:",
          apiResponse
        );
        throw new Error(
          "API response for file upload is missing the 'content' field."
        );
      }
      return apiResponse.content; // This is the 'content' object from the GitHub API response
    } catch (error) {
      console.error(
        `Failed to upload file ${filePathInRepo} to ${owner}/${repo}: ${error.message}`
      );
      throw error; // Re-throw to be caught by createIssue or handled by the caller
    }
  }

  async setDefaultRepo(args) {
    const { owner, repo } = args;
    if (!owner || !repo) {
      throw new Error(
        "Owner and repo are required to set a default repository."
      );
    }
    this.defaultOwner = owner;
    this.defaultRepo = repo;
    console.error(`Default repository set to: ${owner}/${repo}`);
    return {
      content: [
        {
          type: "text",
          text: `Default repository set to: ${owner}/${repo}`,
        },
      ],
    };
  }

  async editIssue(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const issue_number = args.issue_number;

    if (!owner || !repo) {
      throw new Error(
        "Repository owner and name are required. Please provide them or set a default repository."
      );
    }
    if (!issue_number) {
      throw new Error("Issue number is required to edit an issue.");
    }

    const payload = {};
    if (args.title !== undefined) payload.title = args.title;
    if (args.state !== undefined) payload.state = args.state;
    if (args.labels !== undefined) payload.labels = args.labels;
    if (args.assignees !== undefined) payload.assignees = args.assignees;

    let currentBody = args.body; // Use provided body if it exists

    // Handle image upload and appending
    if (args.image_path) {
      try {
        console.error(
          `Attempting to read image for edit from: ${args.image_path}`
        );
        const imageContent = await fs.readFile(args.image_path);
        const base64Image = imageContent.toString("base64");
        const originalFileName = path.basename(args.image_path);
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${originalFileName}`;
        const repoImagePath = `.github/issue_images/${uniqueFileName}`;

        console.error(`Uploading image to repo at: ${repoImagePath}`);
        const uploadedImage = await this.uploadFileToRepo(
          owner,
          repo,
          repoImagePath,
          base64Image,
          `Upload image ${uniqueFileName} for issue #${issue_number}`
        );
        console.error(
          "Full uploadedImage object from editIssue:",
          JSON.stringify(uploadedImage, null, 2)
        );

        if (uploadedImage && uploadedImage.download_url) {
          const imageMarkdown = `\n\n![${originalFileName}](${uploadedImage.download_url})`;
          if (currentBody === undefined) {
            // If no new body, fetch existing and append
            console.error(
              `Fetching existing issue body for issue #${issue_number} to append image.`
            );
            const existingIssue = await this.makeGitHubRequest(
              `/repos/${owner}/${repo}/issues/${issue_number}`
            );
            currentBody = existingIssue.body || ""; // Ensure body is at least an empty string
          }
          currentBody += imageMarkdown;
          console.error(
            `Image uploaded and markdown appended: ${uploadedImage.download_url}`
          );
        } else {
          console.error(
            "Failed to upload image or get download_url for edit. Image not appended. Uploaded object was:",
            JSON.stringify(uploadedImage, null, 2)
          );
        }
      } catch (uploadError) {
        console.error(
          `Error processing image upload for edit: ${uploadError.message}. Image not appended.`
        );
      }
    }

    if (currentBody !== undefined) payload.body = currentBody;

    if (Object.keys(payload).length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No changes specified for the issue. Nothing to update.",
          },
        ],
      };
    }

    console.error(
      `Editing issue #${issue_number} in ${owner}/${repo} with payload:`,
      payload
    );
    const updatedIssue = await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/${issue_number}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    return {
      content: [
        {
          type: "text",
          text:
            `Successfully edited issue #${updatedIssue.number} in ${owner}/${repo}:\n\n` +
            `**${updatedIssue.title}**\n` +
            `URL: ${updatedIssue.html_url}\n` +
            `State: ${updatedIssue.state}`,
        },
      ],
    };
  }

  async getIssueDetails(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const issue_number = args.issue_number;

    if (!owner || !repo) {
      throw new Error("Repository owner and name are required.");
    }
    if (!issue_number) {
      throw new Error("Issue number is required.");
    }

    const issue = await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/${issue_number}`
    );
    // Format this nicely later if needed, for now return raw
    return {
      content: [{ type: "text", text: JSON.stringify(issue, null, 2) }],
    };
  }

  async listIssueComments(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const issue_number = args.issue_number;
    const { per_page = 30, since } = args;

    if (!owner || !repo)
      throw new Error("Repository owner and name are required.");
    if (!issue_number) throw new Error("Issue number is required.");

    const params = new URLSearchParams();
    params.append("per_page", per_page.toString());
    if (since) params.append("since", since);

    const comments = await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/${issue_number}/comments?${params}`
    );
    const formatted = comments
      .map(
        (c) =>
          `**Comment ID: ${c.id} by @${c.user.login} on ${new Date(
            c.created_at
          ).toLocaleDateString()}**\n${c.body}\nURL: ${c.html_url}`
      )
      .join("\n\n---\n\n");
    return {
      content: [
        {
          type: "text",
          text: `Found ${
            comments.length
          } comments for issue #${issue_number}:\n\n${
            formatted || "No comments found."
          }`,
        },
      ],
    };
  }

  async createIssueComment(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const issue_number = args.issue_number;
    const { body } = args;

    if (!owner || !repo)
      throw new Error("Repository owner and name are required.");
    if (!issue_number) throw new Error("Issue number is required.");
    if (!body) throw new Error("Comment body is required.");

    const comment = await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/${issue_number}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      }
    );
    return {
      content: [
        {
          type: "text",
          text: `Comment created on issue #${issue_number}:\nID: ${comment.id}\nURL: ${comment.html_url}`,
        },
      ],
    };
  }

  async editIssueComment(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const comment_id = args.comment_id;
    const { body } = args;

    if (!owner || !repo)
      throw new Error("Repository owner and name are required.");
    if (!comment_id) throw new Error("Comment ID is required.");
    if (!body) throw new Error("New comment body is required.");

    const updatedComment = await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/comments/${comment_id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      }
    );
    return {
      content: [
        {
          type: "text",
          text: `Comment ID ${updatedComment.id} updated:\nURL: ${updatedComment.html_url}`,
        },
      ],
    };
  }

  async deleteIssueComment(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const comment_id = args.comment_id;

    if (!owner || !repo)
      throw new Error("Repository owner and name are required.");
    if (!comment_id) throw new Error("Comment ID is required.");

    await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/comments/${comment_id}`,
      { method: "DELETE" }
    );
    return {
      content: [
        {
          type: "text",
          text: `Comment ID ${comment_id} deleted successfully.`,
        },
      ],
    };
  }

  async lockIssue(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const issue_number = args.issue_number;
    const { lock_reason } = args;

    if (!owner || !repo)
      throw new Error("Repository owner and name are required.");
    if (!issue_number) throw new Error("Issue number is required.");

    const payload = {};
    if (lock_reason) payload.lock_reason = lock_reason;

    await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/${issue_number}/lock`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // API expects a body even if empty for lock_reason
      }
    );
    return {
      content: [
        {
          type: "text",
          text: `Issue #${issue_number} locked successfully.${
            lock_reason ? ` Reason: ${lock_reason}` : ""
          }`,
        },
      ],
    };
  }

  async unlockIssue(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const issue_number = args.issue_number;

    if (!owner || !repo)
      throw new Error("Repository owner and name are required.");
    if (!issue_number) throw new Error("Issue number is required.");

    await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/${issue_number}/lock`,
      { method: "DELETE" }
    );
    return {
      content: [
        { type: "text", text: `Issue #${issue_number} unlocked successfully.` },
      ],
    };
  }

  async addAssigneesToIssue(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const issue_number = args.issue_number;
    const { assignees } = args;

    if (!owner || !repo)
      throw new Error("Repository owner and name are required.");
    if (!issue_number) throw new Error("Issue number is required.");
    if (!assignees || assignees.length === 0)
      throw new Error("At least one assignee username is required.");

    const updatedIssue = await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/${issue_number}/assignees`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignees }),
      }
    );
    const assignedNames = updatedIssue.assignees.map((a) => a.login).join(", ");
    return {
      content: [
        {
          type: "text",
          text: `Successfully added assignees to issue #${issue_number}. Current assignees: ${
            assignedNames || "None"
          }`,
        },
      ],
    };
  }

  async removeAssigneesFromIssue(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const issue_number = args.issue_number;
    const { assignees } = args; // This should be an array of usernames to remove

    if (!owner || !repo)
      throw new Error("Repository owner and name are required.");
    if (!issue_number) throw new Error("Issue number is required.");
    if (!assignees || assignees.length === 0)
      throw new Error("At least one assignee username to remove is required.");

    // The API expects the list of assignees in the body for removal
    const updatedIssue = await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/${issue_number}/assignees`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignees }),
      }
    );
    const remainingAssignees = updatedIssue.assignees
      ? updatedIssue.assignees.map((a) => a.login).join(", ")
      : "None";
    return {
      content: [
        {
          type: "text",
          text: `Successfully removed assignees from issue #${issue_number}. Remaining assignees: ${remainingAssignees}`,
        },
      ],
    };
  }

  async listRepoCollaborators(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { affiliation = "all", permission, per_page = 30 } = args;

    if (!owner || !repo)
      throw new Error("Repository owner and name are required.");

    const params = new URLSearchParams({
      affiliation,
      per_page: per_page.toString(),
    });
    if (permission) params.append("permission", permission);

    const collaborators = await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/collaborators?${params}`
    );
    const formatted = collaborators
      .map((c) => {
        const permissions = Object.entries(c.permissions)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(", ");
        return `@${c.login} (Role: ${c.role_name}, Permissions: ${
          permissions || "N/A"
        })`;
      })
      .join("\n");
    return {
      content: [
        {
          type: "text",
          text: `Found ${
            collaborators.length
          } collaborators for ${owner}/${repo}:\n${
            formatted || "No collaborators found."
          }`,
        },
      ],
    };
  }

  // Labels Management Methods
  async listRepoLabels(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { per_page = 30 } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repo are required. Set defaults with set_default_repo or provide them explicitly."
      );
    }

    const params = new URLSearchParams({
      per_page: per_page.toString(),
    });

    const labels = await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/labels?${params}`
    );

    const formatted = labels
      .map(
        (label) =>
          `**${label.name}** (#${label.color})\n` +
          `Description: ${label.description || "No description"}\n` +
          `URL: ${label.url}`
      )
      .join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${labels.length} labels in ${owner}/${repo}:\n\n${formatted}`,
        },
      ],
    };
  }

  async createLabel(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { name, color = "f29513", description } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repo are required. Set defaults with set_default_repo or provide them explicitly."
      );
    }

    if (!name) {
      throw new Error("Label name is required.");
    }

    const labelData = {
      name,
      color: color.replace("#", ""), // Remove # if provided
      description: description || "",
    };

    const label = await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/labels`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(labelData),
      }
    );

    return {
      content: [
        {
          type: "text",
          text:
            `Created label "${label.name}" in ${owner}/${repo}:\n` +
            `Color: #${label.color}\n` +
            `Description: ${label.description || "No description"}\n` +
            `URL: ${label.url}`,
        },
      ],
    };
  }

  async editLabel(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { current_name, name, color, description } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repo are required. Set defaults with set_default_repo or provide them explicitly."
      );
    }

    if (!current_name) {
      throw new Error("Current label name is required.");
    }

    const payload = {};
    if (name !== undefined) payload.name = name;
    if (color !== undefined) payload.color = color.replace("#", "");
    if (description !== undefined) payload.description = description;

    if (Object.keys(payload).length === 0) {
      throw new Error(
        "At least one field (name, color, description) must be provided to edit."
      );
    }

    const updatedLabel = await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/labels/${encodeURIComponent(current_name)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    return {
      content: [
        {
          type: "text",
          text:
            `Updated label "${updatedLabel.name}" in ${owner}/${repo}:\n` +
            `Color: #${updatedLabel.color}\n` +
            `Description: ${updatedLabel.description || "No description"}\n` +
            `URL: ${updatedLabel.url}`,
        },
      ],
    };
  }

  async deleteLabel(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { name } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repo are required. Set defaults with set_default_repo or provide them explicitly."
      );
    }

    if (!name) {
      throw new Error("Label name is required.");
    }

    await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/labels/${encodeURIComponent(name)}`,
      {
        method: "DELETE",
      }
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted label "${name}" from ${owner}/${repo}`,
        },
      ],
    };
  }

  // Milestones Management Methods
  async listMilestones(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const {
      state = "open",
      sort = "due_on",
      direction = "asc",
      per_page = 30,
    } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repo are required. Set defaults with set_default_repo or provide them explicitly."
      );
    }

    const params = new URLSearchParams({
      state,
      sort,
      direction,
      per_page: per_page.toString(),
    });

    const milestones = await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/milestones?${params}`
    );

    if (milestones.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No ${state} milestones found in ${owner}/${repo}`,
          },
        ],
      };
    }

    const formatted = milestones
      .map(
        (milestone) =>
          `**${milestone.title}** (#${milestone.number})\n` +
          `State: ${milestone.state}\n` +
          `Description: ${milestone.description || "No description"}\n` +
          `Due: ${
            milestone.due_on
              ? new Date(milestone.due_on).toLocaleDateString()
              : "No due date"
          }\n` +
          `Progress: ${milestone.closed_issues}/${
            milestone.closed_issues + milestone.open_issues
          } issues closed\n` +
          `Created: ${new Date(milestone.created_at).toLocaleDateString()}\n` +
          `URL: ${milestone.html_url}`
      )
      .join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${milestones.length} ${state} milestones in ${owner}/${repo}:\n\n${formatted}`,
        },
      ],
    };
  }

  async createMilestone(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { title, state = "open", description, due_on } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repo are required. Set defaults with set_default_repo or provide them explicitly."
      );
    }

    if (!title) {
      throw new Error("Milestone title is required.");
    }

    const milestoneData = {
      title,
      state,
      description: description || "",
    };

    if (due_on) {
      milestoneData.due_on = due_on;
    }

    const milestone = await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/milestones`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(milestoneData),
      }
    );

    return {
      content: [
        {
          type: "text",
          text:
            `Created milestone "${milestone.title}" (#${milestone.number}) in ${owner}/${repo}:\n` +
            `State: ${milestone.state}\n` +
            `Description: ${milestone.description || "No description"}\n` +
            `Due: ${
              milestone.due_on
                ? new Date(milestone.due_on).toLocaleDateString()
                : "No due date"
            }\n` +
            `URL: ${milestone.html_url}`,
        },
      ],
    };
  }

  async editMilestone(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { milestone_number, title, state, description, due_on } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repo are required. Set defaults with set_default_repo or provide them explicitly."
      );
    }

    if (!milestone_number) {
      throw new Error("Milestone number is required.");
    }

    const payload = {};
    if (title !== undefined) payload.title = title;
    if (state !== undefined) payload.state = state;
    if (description !== undefined) payload.description = description;
    if (due_on !== undefined) payload.due_on = due_on;

    if (Object.keys(payload).length === 0) {
      throw new Error(
        "At least one field (title, state, description, due_on) must be provided to edit."
      );
    }

    const updatedMilestone = await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/milestones/${milestone_number}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    return {
      content: [
        {
          type: "text",
          text:
            `Updated milestone "${updatedMilestone.title}" (#${updatedMilestone.number}) in ${owner}/${repo}:\n` +
            `State: ${updatedMilestone.state}\n` +
            `Description: ${
              updatedMilestone.description || "No description"
            }\n` +
            `Due: ${
              updatedMilestone.due_on
                ? new Date(updatedMilestone.due_on).toLocaleDateString()
                : "No due date"
            }\n` +
            `Progress: ${updatedMilestone.closed_issues}/${
              updatedMilestone.closed_issues + updatedMilestone.open_issues
            } issues closed\n` +
            `URL: ${updatedMilestone.html_url}`,
        },
      ],
    };
  }

  async deleteMilestone(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { milestone_number } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repo are required. Set defaults with set_default_repo or provide them explicitly."
      );
    }

    if (!milestone_number) {
      throw new Error("Milestone number is required.");
    }

    await this.makeGitHubRequest(
      `/repos/${owner}/${repo}/milestones/${milestone_number}`,
      {
        method: "DELETE",
      }
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted milestone #${milestone_number} from ${owner}/${repo}`,
        },
      ],
    };
  }

  async run() {
    // Test GitHub API authentication
    try {
      console.error("Testing GitHub API authentication...");
      await this.makeGitHubRequest("/user");
      console.error("GitHub API authentication successful");
    } catch (error) {
      console.error(`GitHub API authentication failed: ${error.message}`);
      console.error("Please check your GH_TOKEN environment variable");
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("GitHub MCP Server running on stdio");
  }
}

// Handle shutdown gracefully
process.on("SIGINT", async () => {
  console.error("Shutting down GitHub MCP Server...");
  process.exit(0);
});

// Start the server
const server = new GitHubMCPServer();
server.run().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
