const toolsConfig = {
  list_repos: {
    name: "list_repos",
    description: "List user repositories with pagination and filtering options",
    inputSchema: {
      type: "object",
      properties: {
        per_page: {
          type: "number",
          description: "Number of repositories per page (default: 10)",
          default: 10,
        },
        visibility: {
          type: "string",
          description: "Repository visibility filter",
          enum: ["all", "public", "private"],
          default: "all",
        },
        sort: {
          type: "string",
          description: "Sort repositories by",
          enum: ["created", "updated", "pushed", "full_name"],
          default: "updated",
        },
      },
    },
  },
  get_repo_info: {
    name: "get_repo_info",
    description: "Get detailed information about a specific repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
      },
    },
  },
  search_repos: {
    name: "search_repos",
    description: "Search for repositories using GitHub's search API",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for repositories",
        },
        per_page: {
          type: "number",
          description: "Number of results per page (default: 10)",
          default: 10,
        },
        sort: {
          type: "string",
          description: "Sort results by",
          enum: ["stars", "forks", "help-wanted-issues", "updated"],
          default: "stars",
        },
      },
      required: ["query"],
    },
  },
  get_repo_contents: {
    name: "get_repo_contents",
    description: "Get contents of a repository directory or file",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        path: {
          type: "string",
          description: "Path to directory or file (default: root)",
          default: "",
        },
        ref: {
          type: "string",
          description: "Branch, tag, or commit SHA (default: default branch)",
        },
      },
    },
  },
  set_default_repo: {
    name: "set_default_repo",
    description: "Set a default repository for subsequent operations",
    inputSchema: {
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
      },
      required: ["owner", "repo"],
    },
  },
  list_repo_collaborators: {
    name: "list_repo_collaborators",
    description: "List collaborators for a repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        affiliation: {
          type: "string",
          description: "Filter by affiliation",
          enum: ["outside", "direct", "all"],
          default: "all",
        },
        permission: {
          type: "string",
          description: "Filter by permission level",
          enum: ["pull", "triage", "push", "maintain", "admin"],
        },
        per_page: {
          type: "number",
          description: "Number of results per page (default: 30)",
          default: 30,
        },
      },
    },
  },
  list_issues: {
    name: "list_issues",
    description: "List issues in a repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        state: {
          type: "string",
          description: "Issue state",
          enum: ["open", "closed", "all"],
          default: "open",
        },
        per_page: {
          type: "number",
          description: "Number of issues per page (default: 10)",
          default: 10,
        },
      },
    },
  },
  create_issue: {
    name: "create_issue",
    description: "Create a new issue in a repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        title: {
          type: "string",
          description: "Issue title",
        },
        body: {
          type: "string",
          description: "Issue body (optional)",
          default: "",
        },
        labels: {
          type: "array",
          items: { type: "string" },
          description: "Labels to assign to the issue",
          default: [],
        },
        assignees: {
          type: "array",
          items: { type: "string" },
          description: "Usernames to assign to the issue",
          default: [],
        },
        image_path: {
          type: "string",
          description: "Path to image file to upload and attach to issue",
        },
      },
      required: ["title"],
    },
  },
  edit_issue: {
    name: "edit_issue",
    description: "Edit an existing issue",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        issue_number: {
          type: "number",
          description: "Issue number",
        },
        title: {
          type: "string",
          description: "New issue title",
        },
        body: {
          type: "string",
          description: "New issue body",
        },
        state: {
          type: "string",
          description: "Issue state",
          enum: ["open", "closed"],
        },
        labels: {
          type: "array",
          items: { type: "string" },
          description: "Labels to assign to the issue",
        },
        assignees: {
          type: "array",
          items: { type: "string" },
          description: "Usernames to assign to the issue",
        },
        image_path: {
          type: "string",
          description: "Path to image file to upload and append to issue",
        },
      },
      required: ["issue_number"],
    },
  },
  get_issue_details: {
    name: "get_issue_details",
    description: "Get detailed information about a specific issue",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        issue_number: {
          type: "number",
          description: "Issue number",
        },
      },
      required: ["issue_number"],
    },
  },
  lock_issue: {
    name: "lock_issue",
    description: "Lock an issue to prevent further comments",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        issue_number: {
          type: "number",
          description: "Issue number",
        },
        lock_reason: {
          type: "string",
          description: "Reason for locking",
          enum: ["off-topic", "too heated", "resolved", "spam"],
        },
      },
      required: ["issue_number"],
    },
  },
  unlock_issue: {
    name: "unlock_issue",
    description: "Unlock an issue to allow comments",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        issue_number: {
          type: "number",
          description: "Issue number",
        },
      },
      required: ["issue_number"],
    },
  },
  add_assignees_to_issue: {
    name: "add_assignees_to_issue",
    description: "Add assignees to an issue",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        issue_number: {
          type: "number",
          description: "Issue number",
        },
        assignees: {
          type: "array",
          items: { type: "string" },
          description: "Usernames to assign to the issue",
        },
      },
      required: ["issue_number", "assignees"],
    },
  },
  remove_assignees_from_issue: {
    name: "remove_assignees_from_issue",
    description: "Remove assignees from an issue",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        issue_number: {
          type: "number",
          description: "Issue number",
        },
        assignees: {
          type: "array",
          items: { type: "string" },
          description: "Usernames to remove from the issue",
        },
      },
      required: ["issue_number", "assignees"],
    },
  },
  list_prs: {
    name: "list_prs",
    description: "List pull requests in a repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        state: {
          type: "string",
          description: "Pull request state",
          enum: ["open", "closed", "all"],
          default: "open",
        },
        per_page: {
          type: "number",
          description: "Number of pull requests per page (default: 10)",
          default: 10,
        },
      },
    },
  },
  get_user_info: {
    name: "get_user_info",
    description: "Get information about a GitHub user",
    inputSchema: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description:
            "GitHub username (optional, defaults to authenticated user)",
        },
      },
    },
  },
  list_issue_comments: {
    name: "list_issue_comments",
    description: "List comments on an issue",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        issue_number: {
          type: "number",
          description: "Issue number",
        },
        per_page: {
          type: "number",
          description: "Number of comments per page (default: 30)",
          default: 30,
        },
        since: {
          type: "string",
          description:
            "Only show comments updated after this time (ISO 8601 format)",
        },
      },
      required: ["issue_number"],
    },
  },
  create_issue_comment: {
    name: "create_issue_comment",
    description: "Create a comment on an issue",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        issue_number: {
          type: "number",
          description: "Issue number",
        },
        body: {
          type: "string",
          description: "Comment body",
        },
      },
      required: ["issue_number", "body"],
    },
  },
  edit_issue_comment: {
    name: "edit_issue_comment",
    description: "Edit an issue comment",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        comment_id: {
          type: "number",
          description: "Comment ID",
        },
        body: {
          type: "string",
          description: "New comment body",
        },
      },
      required: ["comment_id", "body"],
    },
  },
  delete_issue_comment: {
    name: "delete_issue_comment",
    description: "Delete an issue comment",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        comment_id: {
          type: "number",
          description: "Comment ID",
        },
      },
      required: ["comment_id"],
    },
  },
  list_repo_labels: {
    name: "list_repo_labels",
    description: "List labels in a repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        per_page: {
          type: "number",
          description: "Number of labels per page (default: 30)",
          default: 30,
        },
      },
    },
  },
  create_label: {
    name: "create_label",
    description: "Create a new label in a repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        name: {
          type: "string",
          description: "Label name",
        },
        color: {
          type: "string",
          description: "Label color (6-character hex code, without #)",
          default: "f29513",
        },
        description: {
          type: "string",
          description: "Label description",
        },
      },
      required: ["name"],
    },
  },
  edit_label: {
    name: "edit_label",
    description: "Edit an existing label",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        current_name: {
          type: "string",
          description: "Current label name",
        },
        name: {
          type: "string",
          description: "New label name",
        },
        color: {
          type: "string",
          description: "New label color (6-character hex code, without #)",
        },
        description: {
          type: "string",
          description: "New label description",
        },
      },
      required: ["current_name"],
    },
  },
  delete_label: {
    name: "delete_label",
    description: "Delete a label from a repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        name: {
          type: "string",
          description: "Label name",
        },
      },
      required: ["name"],
    },
  },
  list_milestones: {
    name: "list_milestones",
    description: "List milestones in a repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        state: {
          type: "string",
          description: "Milestone state",
          enum: ["open", "closed", "all"],
          default: "open",
        },
        sort: {
          type: "string",
          description: "Sort milestones by",
          enum: ["due_on", "completeness"],
          default: "due_on",
        },
        direction: {
          type: "string",
          description: "Sort direction",
          enum: ["asc", "desc"],
          default: "asc",
        },
        per_page: {
          type: "number",
          description: "Number of milestones per page (default: 30)",
          default: 30,
        },
      },
    },
  },
  create_milestone: {
    name: "create_milestone",
    description: "Create a new milestone",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        title: {
          type: "string",
          description: "Milestone title",
        },
        state: {
          type: "string",
          description: "Milestone state",
          enum: ["open", "closed"],
          default: "open",
        },
        description: {
          type: "string",
          description: "Milestone description",
        },
        due_on: {
          type: "string",
          description: "Due date (ISO 8601 format)",
        },
      },
      required: ["title"],
    },
  },
  edit_milestone: {
    name: "edit_milestone",
    description: "Edit an existing milestone",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        milestone_number: {
          type: "number",
          description: "Milestone number",
        },
        title: {
          type: "string",
          description: "New milestone title",
        },
        state: {
          type: "string",
          description: "New milestone state",
          enum: ["open", "closed"],
        },
        description: {
          type: "string",
          description: "New milestone description",
        },
        due_on: {
          type: "string",
          description: "New due date (ISO 8601 format)",
        },
      },
      required: ["milestone_number"],
    },
  },
  delete_milestone: {
    name: "delete_milestone",
    description: "Delete a milestone",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        milestone_number: {
          type: "number",
          description: "Milestone number",
        },
      },
      required: ["milestone_number"],
    },
  },

  // Branch and Commit Management Tools
  list_branches: {
    name: "list_branches",
    description:
      "List all branches in a repository with protection status and commit information",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        protected_only: {
          type: "boolean",
          description: "Show only protected branches",
          default: false,
        },
        per_page: {
          type: "number",
          description: "Number of branches per page (default: 30)",
          default: 30,
        },
      },
    },
  },
  create_branch: {
    name: "create_branch",
    description: "Create a new branch from an existing branch or commit",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        branch_name: {
          type: "string",
          description: "Name of the new branch to create",
        },
        from_branch: {
          type: "string",
          description:
            "Source branch to create from (default: repository default branch)",
        },
      },
      required: ["branch_name"],
    },
  },
  list_commits: {
    name: "list_commits",
    description: "List commits in a repository with detailed information",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        sha: {
          type: "string",
          description: "Branch, tag, or commit SHA to list commits from",
        },
        per_page: {
          type: "number",
          description: "Number of commits per page (default: 20)",
          default: 20,
        },
        since: {
          type: "string",
          description: "ISO 8601 date/time - only commits after this date",
        },
        until: {
          type: "string",
          description: "ISO 8601 date/time - only commits before this date",
        },
        author: {
          type: "string",
          description: "GitHub username or email - only commits by this author",
        },
      },
    },
  },
  get_commit_details: {
    name: "get_commit_details",
    description:
      "Get detailed information about a specific commit including files changed",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        commit_sha: {
          type: "string",
          description: "The SHA of the commit to get details for",
        },
      },
      required: ["commit_sha"],
    },
  },
  compare_commits: {
    name: "compare_commits",
    description: "Compare two commits or branches to see differences",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (optional if default repo is set)",
        },
        repo: {
          type: "string",
          description: "Repository name (optional if default repo is set)",
        },
        base: {
          type: "string",
          description: "The base branch or commit SHA to compare from",
        },
        head: {
          type: "string",
          description: "The head branch or commit SHA to compare to",
        },
      },
      required: ["base", "head"],
    },
  },
};

module.exports = toolsConfig;
