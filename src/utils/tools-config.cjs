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

  // File Management Tools
  create_file: {
    name: "create_file",
    description: "Create a new file in a repository.",
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
          // Corresponds to filePath in handler/service
          type: "string",
          description:
            "Full path of the file to create in the repository (e.g., 'src/new-file.js').",
        },
        content: {
          type: "string",
          description:
            "Content of the file. For binary files, this should be a base64 encoded string.",
        },
        message: {
          type: "string",
          description: "Commit message for creating the file.",
        },
        branch: {
          type: "string",
          description:
            "The branch name. Default: the repository’s default branch.",
        },
        is_binary: {
          type: "boolean",
          description:
            "Set to true if the content is base64 encoded binary data. Default: false.",
          default: false,
        },
      },
      required: ["path", "content", "message"],
    },
  },
  update_file: {
    name: "update_file",
    description: "Update an existing file in a repository.",
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
          // Corresponds to filePath in handler/service
          type: "string",
          description:
            "Full path of the file to update in the repository (e.g., 'src/existing-file.js').",
        },
        content: {
          type: "string",
          description:
            "New content of the file. For binary files, this should be a base64 encoded string.",
        },
        message: {
          type: "string",
          description: "Commit message for updating the file.",
        },
        sha: {
          type: "string",
          description: "The blob SHA of the file being replaced.",
        },
        branch: {
          type: "string",
          description:
            "The branch name. Default: the repository’s default branch.",
        },
        is_binary: {
          type: "boolean",
          description:
            "Set to true if the content is base64 encoded binary data. Default: false.",
          default: false,
        },
      },
      required: ["path", "content", "message", "sha"],
    },
  },
  upload_file: {
    name: "upload_file",
    description:
      "Upload a local file (binary or text) to a repository. Creates or updates the file.",
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
        path_in_repo: {
          // Corresponds to filePathInRepo in handler/service
          type: "string",
          description:
            "Full path where the file will be saved in the repository (e.g., 'assets/image.png').",
        },
        local_file_path: {
          type: "string",
          description: "Local path to the file to be uploaded.",
        },
        message: {
          type: "string",
          description: "Commit message for uploading the file.",
        },
        branch: {
          type: "string",
          description:
            "The branch name. Default: the repository’s default branch.",
        },
      },
      required: ["path_in_repo", "local_file_path", "message"],
    },
  },
  delete_file: {
    name: "delete_file",
    description: "Delete a file from a repository.",
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
          // Corresponds to filePath in handler/service
          type: "string",
          description:
            "Full path of the file to delete in the repository (e.g., 'src/old-file.js').",
        },
        message: {
          type: "string",
          description: "Commit message for deleting the file.",
        },
        sha: {
          type: "string",
          description: "The blob SHA of the file being deleted.",
        },
        branch: {
          type: "string",
          description:
            "The branch name. Default: the repository’s default branch.",
        },
      },
      required: ["path", "message", "sha"],
    },
  },

  // Enhanced Pull Request Management Tools
  create_pull_request: {
    name: "create_pull_request",
    description:
      "Create new pull requests with title, body, head/base branches.",
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
          description: "Pull request title",
        },
        head: {
          type: "string",
          description:
            "The name of the branch where your changes are implemented",
        },
        base: {
          type: "string",
          description:
            "The name of the branch you want the changes pulled into",
        },
        body: {
          type: "string",
          description: "Pull request body (optional)",
        },
      },
      required: ["title", "head", "base"],
    },
  },
  edit_pull_request: {
    name: "edit_pull_request",
    description: "Modify PR title, body, labels, assignees.",
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
        pull_number: {
          type: "number",
          description: "Pull request number",
        },
        title: {
          type: "string",
          description: "New pull request title",
        },
        body: {
          type: "string",
          description: "New pull request body",
        },
        state: {
          type: "string",
          description: "Pull request state (e.g., 'open', 'closed')",
          enum: ["open", "closed"],
        },
        base: {
          type: "string",
          description:
            "The name of the branch you want the changes pulled into",
        },
        maintainer_can_modify: {
          type: "boolean",
          description: "Whether maintainers can modify the pull request",
        },
        labels: {
          type: "array",
          items: { type: "string" },
          description: "Labels to assign to the pull request",
        },
        assignees: {
          type: "array",
          items: { type: "string" },
          description: "Usernames to assign to the pull request",
        },
      },
      required: ["pull_number"],
    },
  },
  get_pr_details: {
    name: "get_pr_details",
    description: "Get comprehensive PR information with review status.",
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
        pull_number: {
          type: "number",
          description: "Pull request number",
        },
      },
      required: ["pull_number"],
    },
  },
  list_pr_reviews: {
    name: "list_pr_reviews",
    description: "List PR reviews and their approval status.",
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
        pull_number: {
          type: "number",
          description: "Pull request number",
        },
        per_page: {
          type: "number",
          description: "Number of reviews per page (default: 30)",
          default: 30,
        },
        page: {
          type: "number",
          description: "Page number of the results to fetch (default: 1)",
          default: 1,
        },
      },
      required: ["pull_number"],
    },
  },
  create_pr_review: {
    name: "create_pr_review",
    description: "Submit PR reviews with comments and approval/rejection.",
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
        pull_number: {
          type: "number",
          description: "Pull request number",
        },
        commit_id: {
          type: "string",
          description: "The SHA of the commit that needs a review (optional)",
        },
        body: {
          type: "string",
          description:
            "The body text of the review (optional if event is not COMMENT)",
        },
        event: {
          type: "string",
          description:
            "The review action ('APPROVE', 'REQUEST_CHANGES', or 'COMMENT')",
          enum: ["APPROVE", "REQUEST_CHANGES", "COMMENT"],
        },
        comments: {
          type: "array",
          description: "Array of review comment objects (optional)",
          items: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description:
                  "The relative path to the file that necessitates a review comment.",
              },
              position: {
                type: "number",
                description:
                  "The position in the diff where you want to add a review comment.",
              },
              body: {
                type: "string",
                description: "Text of the review comment.",
              },
            },
            required: ["path", "position", "body"],
          },
        },
      },
      required: ["pull_number", "event"],
    },
  },
  list_pr_files: {
    name: "list_pr_files",
    description: "List files changed in a PR with diff stats.",
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
        pull_number: {
          type: "number",
          description: "Pull request number",
        },
        per_page: {
          type: "number",
          description: "Number of files per page (default: 30)",
          default: 30,
        },
        page: {
          type: "number",
          description: "Page number of the results to fetch (default: 1)",
          default: 1,
        },
      },
      required: ["pull_number"],
    },
  },

  // Security & Access Management Tools
  list_deploy_keys: {
    name: "list_deploy_keys",
    description: "List repository deploy keys.",
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
          description: "Number of deploy keys per page (default: 30)",
          default: 30,
        },
      },
    },
  },
  create_deploy_key: {
    name: "create_deploy_key",
    description: "Add new deploy keys.",
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
          description: "A name for the key.",
        },
        key: {
          type: "string",
          description: "The public SSH key.",
        },
        read_only: {
          type: "boolean",
          description: "If true, the key will only have read-only access.",
          default: false,
        },
      },
      required: ["title", "key"],
    },
  },
  delete_deploy_key: {
    name: "delete_deploy_key",
    description: "Remove deploy keys.",
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
        key_id: {
          type: "number",
          description: "The ID of the key to delete.",
        },
      },
      required: ["key_id"],
    },
  },
  list_webhooks: {
    name: "list_webhooks",
    description: "List repository webhooks.",
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
          description: "Number of webhooks per page (default: 30)",
          default: 30,
        },
      },
    },
  },
  create_webhook: {
    name: "create_webhook",
    description: "Create event webhooks.",
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
        config: {
          type: "object",
          description: "Key/value pairs to provide settings for this webhook.",
          properties: {
            url: {
              type: "string",
              description: "The URL to which the payloads will be delivered.",
            },
            content_type: {
              type: "string",
              description:
                "The media type used to serialize the payloads. Supported values include 'json' and 'form'.",
              default: "json",
            },
            secret: {
              type: "string",
              description:
                "If provided, the 'secret' will be used as the 'key' to generate the HMAC hex digest value in the 'X-Hub-Signature-256' header.",
            },
            insecure_ssl: {
              type: ["string", "number"], // Can be "0" or "1" or 0 or 1
              description:
                "Determines whether the SSL certificate of the host for 'url' will be verified when delivering payloads. Supported values include '0' (SSL certificate is verified) and '1' (SSL certificate is not verified).",
              default: "0",
            },
          },
          required: ["url"],
        },
        events: {
          type: "array",
          items: { type: "string" },
          description: "Determines what events the hook is triggered for.",
          default: ["push"],
        },
        active: {
          type: "boolean",
          description:
            "Determines if notifications are sent when the webhook is triggered.",
          default: true,
        },
      },
      required: ["config"],
    },
  },
  edit_webhook: {
    name: "edit_webhook",
    description: "Modify webhook configurations.",
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
        hook_id: {
          type: "number",
          description: "The ID of the webhook to update.",
        },
        config: {
          type: "object",
          description: "Key/value pairs to provide settings for this webhook.",
          properties: {
            url: {
              type: "string",
              description: "The URL to which the payloads will be delivered.",
            },
            content_type: {
              type: "string",
              description: "The media type used to serialize the payloads.",
            },
            secret: {
              type: "string",
              description:
                "If provided, the 'secret' will be used as the 'key' to generate the HMAC hex digest value in the 'X-Hub-Signature-256' header.",
            },
            insecure_ssl: {
              type: ["string", "number"],
              description:
                "Determines whether the SSL certificate of the host for 'url' will be verified.",
            },
          },
        },
        events: {
          type: "array",
          items: { type: "string" },
          description:
            "Determines what events the hook is triggered for. This replaces the existing events.",
        },
        add_events: {
          type: "array",
          items: { type: "string" },
          description:
            "Determines a list of events to be added to the list of events that the Hook triggers for.",
        },
        remove_events: {
          type: "array",
          items: { type: "string" },
          description:
            "Determines a list of events to be removed from the list of events that the Hook triggers for.",
        },
        active: {
          type: "boolean",
          description:
            "Determines if notifications are sent when the webhook is triggered.",
        },
      },
      required: ["hook_id"],
    },
  },
  delete_webhook: {
    name: "delete_webhook",
    description: "Remove webhooks.",
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
        hook_id: {
          type: "number",
          description: "The ID of the webhook to delete.",
        },
      },
      required: ["hook_id"],
    },
  },
  list_secrets: {
    name: "list_secrets",
    description: "List repository secrets (names only).",
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
          description: "Number of secrets per page (default: 30)",
          default: 30,
        },
      },
    },
  },
  update_secret: {
    // This covers create or update
    name: "update_secret",
    description: "Create or update repository secrets.",
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
        secret_name: {
          type: "string",
          description: "The name of the secret.",
        },
        encrypted_value: {
          type: "string",
          description:
            "Value for your secret, encrypted with LibSodium. Required if key_id is provided.",
        },
        key_id: {
          type: "string",
          description:
            "ID of the key you used to encrypt the secret. Required if encrypted_value is provided.",
        },
      },
      required: ["secret_name", "encrypted_value", "key_id"],
    },
  },

  // GitHub Actions & Workflows Tools
  list_workflows: {
    name: "list_workflows",
    description: "List repository GitHub Actions workflows.",
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
          description: "Number of workflows per page (default: 30)",
          default: 30,
        },
        page: {
          type: "number",
          description: "Page number of the results to fetch (default: 1)",
          default: 1,
        },
      },
    },
  },
  list_workflow_runs: {
    name: "list_workflow_runs",
    description: "Get workflow run history with status.",
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
        workflow_id: {
          type: ["string", "number"], // Can be workflow file name or ID
          description:
            "The ID or file name of the workflow (e.g., 'main.yml' or 12345).",
        },
        actor: {
          type: "string",
          description: "Returns workflow runs triggered by the actor login.",
        },
        branch: {
          type: "string",
          description: "Returns workflow runs associated with a branch.",
        },
        event: {
          type: "string",
          description: "Returns workflow run triggered by the event type.",
        },
        status: {
          type: "string",
          description: "Returns workflow runs with the specified status.",
          enum: [
            "completed",
            "action_required",
            "cancelled",
            "failure",
            "neutral",
            "skipped",
            "stale",
            "success",
            "timed_out",
            "in_progress",
            "queued",
            "requested",
            "waiting",
            "pending",
          ],
        },
        per_page: {
          type: "number",
          description: "Number of workflow runs per page (default: 30)",
          default: 30,
        },
        page: {
          type: "number",
          description: "Page number of the results to fetch (default: 1)",
          default: 1,
        },
        created: {
          type: "string",
          description:
            "Returns workflow runs created within the given date-time range. ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ or YYYY-MM-DDTHH:MM:SS+/-HH:MM. Example: '2023-01-01T00:00:00Z..2023-01-02T00:00:00Z' or '>=2023-01-01T00:00:00Z'",
        },
        exclude_pull_requests: {
          type: "boolean",
          description:
            "If true, excludes pull requests from the results. Default: false",
          default: false,
        },
        check_suite_id: {
          type: "number",
          description:
            "Returns workflow runs associated with the check_suite_id.",
        },
        head_sha: {
          type: "string",
          description:
            "Returns workflow runs associated with a head SHA. Only returns the latest run for the SHA.",
        },
      },
      required: ["workflow_id"],
    },
  },
  get_workflow_run_details: {
    name: "get_workflow_run_details",
    description: "Detailed run information and logs.",
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
        run_id: {
          type: "number",
          description: "The unique identifier of the workflow run.",
        },
        exclude_pull_requests: {
          type: "boolean",
          description:
            "If true, excludes pull requests from the results. Default: false",
          default: false,
        },
      },
      required: ["run_id"],
    },
  },
  trigger_workflow: {
    name: "trigger_workflow",
    description:
      "Manually trigger workflow dispatches (handle input parameters).",
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
        workflow_id: {
          type: ["string", "number"], // Can be workflow file name or ID
          description:
            "The ID or file name of the workflow (e.g., 'main.yml' or 12345).",
        },
        ref: {
          type: "string",
          description:
            "The git reference for the workflow. The reference can be a branch or tag.",
        },
        inputs: {
          type: "object",
          description:
            "Input parameters to pass to the workflow. These are defined in the workflow's 'on.workflow_dispatch.inputs' section.",
          additionalProperties: true, // Allows any properties
        },
      },
      required: ["workflow_id", "ref"],
    },
  },
  download_workflow_artifacts: {
    name: "download_workflow_artifacts",
    description: "Download build artifacts (implement with proper streaming).",
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
        artifact_id: {
          type: "number",
          description: "The unique identifier of the artifact.",
        },
        archive_format: {
          type: "string",
          description:
            "The format of the archive to download. Typically 'zip'.",
          default: "zip",
        },
        // Note: Actual download path will be handled by the MCP client or user
        // This tool will return the download URL or stream the data if possible
      },
      required: ["artifact_id"],
    },
  },
  cancel_workflow_run: {
    name: "cancel_workflow_run",
    description: "Cancel running workflows.",
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
        run_id: {
          type: "number",
          description: "The unique identifier of the workflow run to cancel.",
        },
      },
      required: ["run_id"],
    },
  },

  // Repository Analytics & Insights Tools
  get_repo_stats: {
    name: "get_repo_stats",
    description:
      "Get repository statistics including traffic, clones, views, and popular content.",
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
        type: {
          type: "string",
          description: "Type of stats to retrieve",
          enum: ["traffic", "clones", "views", "popular_content"],
          default: "traffic",
        },
      },
    },
  },
  list_repo_topics: {
    name: "list_repo_topics",
    description: "List all topics for a repository.",
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
  update_repo_topics: {
    name: "update_repo_topics",
    description: "Replace all topics for a repository.",
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
        names: {
          type: "array",
          items: { type: "string" },
          description:
            "An array of topics to add to the repository. Pass one or more topics to replace the set of existing topics. Send an empty array to clear all topics.",
        },
      },
      required: ["names"],
    },
  },
  get_repo_languages: {
    name: "get_repo_languages",
    description: "Get language breakdown statistics for a repository.",
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
  list_stargazers: {
    name: "list_stargazers",
    description: "List users who have starred the repository.",
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
          description: "Number of stargazers per page (default: 30)",
          default: 30,
        },
        page: {
          type: "number",
          description: "Page number of the results to fetch (default: 1)",
          default: 1,
        },
      },
    },
  },
  list_watchers: {
    name: "list_watchers",
    description: "List users watching/subscribed to the repository.",
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
          description: "Number of watchers per page (default: 30)",
          default: 30,
        },
        page: {
          type: "number",
          description: "Page number of the results to fetch (default: 1)",
          default: 1,
        },
      },
    },
  },
  list_forks: {
    name: "list_forks",
    description: "List repository forks with details.",
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
        sort: {
          type: "string",
          description:
            "The sort order. Can be 'newest', 'oldest', or 'stargazers'.",
          enum: ["newest", "oldest", "stargazers"],
          default: "newest",
        },
        per_page: {
          type: "number",
          description: "Number of forks per page (default: 30)",
          default: 30,
        },
        page: {
          type: "number",
          description: "Page number of the results to fetch (default: 1)",
          default: 1,
        },
      },
    },
  },
  get_repo_traffic: {
    name: "get_repo_traffic",
    description:
      "Get comprehensive repository traffic analytics (views, clones, referrers, paths).",
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
        data_type: {
          type: "string",
          description: "Type of traffic data to retrieve",
          enum: ["views", "clones", "popular_referrers", "popular_paths"],
          default: "views",
        },
      },
    },
  },

  // Advanced Search & Discovery Tools
  search_issues: {
    name: "search_issues",
    description: "Advanced issue search across repositories.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The search query using GitHub's search syntax (e.g., 'repo:owner/repo state:open label:bug').",
        },
        sort: {
          type: "string",
          description: "Sort field (e.g., 'comments', 'created', 'updated').",
          enum: [
            "comments",
            "created",
            "updated",
            "reactions",
            "reactions-+1",
            "reactions--1",
            "reactions-smile",
            "reactions-thinking_face",
            "reactions-heart",
            "reactions-tada",
            "interactions",
          ],
        },
        order: {
          type: "string",
          description: "Sort order ('asc' or 'desc').",
          enum: ["asc", "desc"],
          default: "desc",
        },
        per_page: {
          type: "number",
          description: "Number of results per page (default: 30).",
          default: 30,
        },
        page: {
          type: "number",
          description: "Page number of the results to fetch (default: 1).",
          default: 1,
        },
      },
      required: ["query"],
    },
  },
  search_commits: {
    name: "search_commits",
    description: "Search commit messages and content.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The search query using GitHub's search syntax (e.g., 'repo:owner/repo author:name message:fix').",
        },
        sort: {
          type: "string",
          description: "Sort field (e.g., 'author-date', 'committer-date').",
          enum: ["author-date", "committer-date"],
        },
        order: {
          type: "string",
          description: "Sort order ('asc' or 'desc').",
          enum: ["asc", "desc"],
          default: "desc",
        },
        per_page: {
          type: "number",
          description: "Number of results per page (default: 30).",
          default: 30,
        },
        page: {
          type: "number",
          description: "Page number of the results to fetch (default: 1).",
          default: 1,
        },
      },
      required: ["query"],
    },
  },
  search_code: {
    name: "search_code",
    description: "Search code content across repositories.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The search query using GitHub's search syntax (e.g., 'addClass repo:owner/repo language:javascript').",
        },
        sort: {
          type: "string",
          description:
            "Sort field (e.g., 'indexed'). Best match is default if not specified.",
          enum: ["indexed"],
        },
        order: {
          type: "string",
          description: "Sort order ('asc' or 'desc').",
          enum: ["asc", "desc"],
          default: "desc",
        },
        per_page: {
          type: "number",
          description: "Number of results per page (default: 30).",
          default: 30,
        },
        page: {
          type: "number",
          description: "Page number of the results to fetch (default: 1).",
          default: 1,
        },
      },
      required: ["query"],
    },
  },
  search_users: {
    name: "search_users",
    description: "Search for GitHub users.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The search query using GitHub's search syntax (e.g., 'fullname:John Doe location:USA followers:>1000').",
        },
        sort: {
          type: "string",
          description:
            "Sort field (e.g., 'followers', 'repositories', 'joined').",
          enum: ["followers", "repositories", "joined"],
        },
        order: {
          type: "string",
          description: "Sort order ('asc' or 'desc').",
          enum: ["asc", "desc"],
          default: "desc",
        },
        per_page: {
          type: "number",
          description: "Number of results per page (default: 30).",
          default: 30,
        },
        page: {
          type: "number",
          description: "Page number of the results to fetch (default: 1).",
          default: 1,
        },
      },
      required: ["query"],
    },
  },
  search_topics: {
    name: "search_topics",
    description: "Search repositories by topics.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The search query for topics (e.g., 'react javascript'). GitHub's API searches repositories by topic.",
        },
        sort: {
          type: "string",
          description: "Sort field (e.g., 'stars', 'forks', 'updated').",
          enum: ["stars", "forks", "help-wanted-issues", "updated"],
        },
        order: {
          type: "string",
          description: "Sort order ('asc' or 'desc').",
          enum: ["asc", "desc"],
          default: "desc",
        },
        per_page: {
          type: "number",
          description: "Number of results per page (default: 30).",
          default: 30,
        },
        page: {
          type: "number",
          description: "Page number of the results to fetch (default: 1).",
          default: 1,
        },
      },
      required: ["query"],
    },
  },

  // Organization Management Tools
  list_org_repos: {
    name: "list_org_repos",
    description: "List organization repositories.",
    inputSchema: {
      type: "object",
      properties: {
        org: {
          type: "string",
          description: "The organization name.",
        },
        type: {
          type: "string",
          description: "The type of repositories to list.",
          enum: ["all", "public", "private", "forks", "sources", "member"],
          default: "all",
        },
        sort: {
          type: "string",
          description: "The property to sort the results by.",
          enum: ["created", "updated", "pushed", "full_name"],
          default: "created",
        },
        direction: {
          type: "string",
          description: "The direction to sort the results by.",
          enum: ["asc", "desc"],
        },
        per_page: {
          type: "number",
          description: "Number of results per page (max 100).",
          default: 30,
        },
        page: {
          type: "number",
          description: "Page number of the results to fetch.",
          default: 1,
        },
      },
      required: ["org"],
    },
  },
  list_org_members: {
    name: "list_org_members",
    description: "List organization members.",
    inputSchema: {
      type: "object",
      properties: {
        org: {
          type: "string",
          description: "The organization name.",
        },
        filter: {
          type: "string",
          description: "Filter members returned in the list.",
          enum: ["2fa_disabled", "all"],
          default: "all",
        },
        role: {
          type: "string",
          description: "Filter members returned by their role.",
          enum: ["all", "admin", "member"],
          default: "all",
        },
        per_page: {
          type: "number",
          description: "Number of results per page (max 100).",
          default: 30,
        },
        page: {
          type: "number",
          description: "Page number of the results to fetch.",
          default: 1,
        },
      },
      required: ["org"],
    },
  },
  get_org_info: {
    name: "get_org_info",
    description: "Get organization details.",
    inputSchema: {
      type: "object",
      properties: {
        org: {
          type: "string",
          description: "The organization name.",
        },
      },
      required: ["org"],
    },
  },
  list_org_teams: {
    name: "list_org_teams",
    description: "List organization teams.",
    inputSchema: {
      type: "object",
      properties: {
        org: {
          type: "string",
          description: "The organization name.",
        },
        per_page: {
          type: "number",
          description: "Number of results per page (max 100).",
          default: 30,
        },
        page: {
          type: "number",
          description: "Page number of the results to fetch.",
          default: 1,
        },
      },
      required: ["org"],
    },
  },
  get_team_members: {
    name: "get_team_members",
    description: "Get team membership for a team.",
    inputSchema: {
      type: "object",
      properties: {
        org: {
          type: "string",
          description: "The organization name.",
        },
        team_slug: {
          type: "string",
          description: "The slug of the team name.",
        },
        role: {
          type: "string",
          description: "Filters members returned by their role in the team.",
          enum: ["member", "maintainer", "all"],
          default: "all",
        },
        per_page: {
          type: "number",
          description: "Number of results per page (max 100).",
          default: 30,
        },
        page: {
          type: "number",
          description: "Page number of the results to fetch.",
          default: 1,
        },
      },
      required: ["org", "team_slug"],
    },
  },
  manage_team_repos: {
    name: "manage_team_repos",
    description: "Manage team repository access (add, update, or remove).",
    inputSchema: {
      type: "object",
      properties: {
        org: {
          type: "string",
          description: "The organization name.",
        },
        team_slug: {
          type: "string",
          description: "The slug of the team name.",
        },
        owner: {
          type: "string",
          description:
            "The owner of the repository (usually the organization).",
        },
        repo: {
          type: "string",
          description: "The name of the repository.",
        },
        permission: {
          type: "string",
          description:
            "The permission to grant. If omitted, removes access. Options: pull, push, admin, maintain, triage.",
          enum: ["pull", "push", "admin", "maintain", "triage"],
        },
      },
      required: ["org", "team_slug", "owner", "repo"],
    },
  },

  // Project Management Tools (Projects V2 Focus)
  list_repo_projects: {
    name: "list_repo_projects",
    description: "List repository or organization project boards (V2).",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description:
            "Repository or Organization owner (optional if default repo/org is set). For org projects, provide org name here.",
        },
        repo: {
          type: "string",
          description:
            "Repository name (optional if listing organization projects or default repo is set).",
        },
        // V2 projects are often user or org level, not strictly repo level.
        // Consider adding 'organization_login' if focusing on org-level projects.
        per_page: {
          type: "number",
          description: "Number of projects per page (default: 10)",
          default: 10,
        },
        state: {
          type: "string",
          description: "State of the projects to list.",
          enum: ["open", "closed", "all"],
          default: "open",
        },
      },
    },
  },
  create_project: {
    name: "create_project",
    description: "Create a new project board (V2).",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          // This would be the owner of the project (user or organization node ID)
          type: "string",
          description:
            "The login of the user or organization to own the project.",
        },
        repo: {
          // Optional, if project is linked to a specific repo
          type: "string",
          description:
            "Repository name to associate the project with (optional).",
        },
        title: {
          type: "string",
          description: "Title of the new project.",
        },
        body: {
          type: "string",
          description: "Body/description of the new project (optional).",
        },
        // V2 projects might have different creation parameters (e.g., template)
      },
      required: ["owner", "title"],
    },
  },
  list_project_columns: {
    // For V2, this might be listing fields or views
    name: "list_project_columns",
    description: "List project board columns, fields, or views (V2).",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          // This would be the GraphQL node ID of the project
          type: "string",
          description: "The Node ID of the project.",
        },
        per_page: {
          type: "number",
          description: "Number of items per page (default: 30)",
          default: 30,
        },
      },
      required: ["project_id"],
    },
  },
  list_project_cards: {
    // For V2, this is listing project items
    name: "list_project_cards",
    description: "List cards/items in a project (V2).",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          // GraphQL node ID of the project
          type: "string",
          description: "The Node ID of the project.",
        },
        // V2 might use filters for status fields instead of column_id
        // column_id: {
        //   type: "string", // Or number depending on API (GraphQL node ID for V2 status field option)
        //   description: "ID of the column/status field to list cards from (optional).",
        // },
        per_page: {
          type: "number",
          description: "Number of items per page (default: 30)",
          default: 30,
        },
      },
      required: ["project_id"],
    },
  },
  create_project_card: {
    // For V2, adding an item to a project
    name: "create_project_card",
    description: "Add cards/items to projects (V2).",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          // GraphQL node ID of the project
          type: "string",
          description: "The Node ID of the project.",
        },
        content_id: {
          // GraphQL node ID of the issue or PR
          type: "string",
          description:
            "The Node ID of the issue or pull request to add. Required if not creating a draft issue.",
        },
        note: {
          // For creating a draft issue
          type: "string",
          description:
            "The content of a draft issue. Required if content_id is not provided.",
        },
        // V2 might require specifying which status field to assign the new item to.
        // column_id: { // Or status_field_option_id
        //   type: "string",
        //   description: "The Node ID of the status field option to assign the item to (optional).",
        // },
      },
      required: ["project_id"], // Either content_id or note should be required, handled in logic
    },
  },
  move_project_card: {
    // For V2, updating an item's status field
    name: "move_project_card",
    description: "Move cards/items between columns or update status (V2).",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          // GraphQL node ID of the project
          type: "string",
          description: "The Node ID of the project.",
        },
        item_id: {
          // GraphQL node ID of the project item
          type: "string",
          description: "The Node ID of the project item (card) to move.",
        },
        field_id: {
          // GraphQL node ID of the single-select status field
          type: "string",
          description:
            "The Node ID of the single-select status field to update.",
        },
        option_id: {
          // GraphQL node ID of the new status option for that field
          type: "string",
          description:
            "The Node ID of the new status option for the specified field.",
        },
      },
      required: ["project_id", "item_id", "field_id", "option_id"],
    },
  },

  // Advanced Features (Placeholders)
  code_quality_checks: {
    name: "code_quality_checks",
    description: "Placeholder for integration with code quality tools.",
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
        tool_name: {
          type: "string",
          description:
            "Name of the quality tool to use (e.g., 'linter', 'static_analyzer').",
        },
        config_path: {
          type: "string",
          description:
            "Path to the configuration file for the quality tool (optional).",
        },
      },
    },
  },
  custom_dashboards: {
    name: "custom_dashboards",
    description: "Placeholder for personalized metric dashboards.",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description:
            "Repository owner or organization for the dashboard (optional if default is set)",
        },
        repo: {
          type: "string",
          description:
            "Repository name for repository-specific dashboard (optional)",
        },
        dashboard_id: {
          type: "string",
          description:
            "Identifier for the custom dashboard to retrieve or manage.",
        },
        action: {
          type: "string",
          description:
            "Action to perform (e.g., 'get', 'create', 'update', 'delete').",
          enum: ["get", "create", "update", "delete"],
          default: "get",
        },
      },
      required: ["dashboard_id"],
    },
  },
  automated_reporting: {
    name: "automated_reporting",
    description: "Placeholder for generating repository reports.",
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
        report_type: {
          type: "string",
          description:
            "Type of report to generate (e.g., 'activity', 'security', 'issues').",
          default: "activity",
        },
        output_format: {
          type: "string",
          description:
            "Desired output format for the report (e.g., 'pdf', 'csv', 'json').",
          default: "json",
        },
      },
    },
  },
  notification_management: {
    name: "notification_management",
    description: "Placeholder for GitHub notification handling.",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description:
            "Action to perform on notifications (e.g., 'list', 'mark_read', 'subscribe').",
          enum: [
            "list",
            "mark_read",
            "get_thread",
            "mark_thread_read",
            "subscribe_thread",
            "unsubscribe_thread",
          ],
          default: "list",
        },
        thread_id: {
          type: "string",
          description:
            "ID of the notification thread (required for thread-specific actions).",
        },
        all: {
          type: "boolean",
          description:
            "Whether to fetch all notifications (true) or only unread (false).",
          default: false,
        },
        participating: {
          type: "boolean",
          description:
            "If true, only shows notifications in which the user is directly participating or mentioned.",
          default: false,
        },
      },
    },
  },
  release_management: {
    name: "release_management",
    description: "Placeholder for creating and managing releases.",
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
        action: {
          type: "string",
          description:
            "Action to perform (e.g., 'list', 'create', 'get', 'update', 'delete').",
          enum: [
            "list",
            "create",
            "get",
            "update",
            "delete",
            "upload_asset",
            "get_latest",
          ],
          default: "list",
        },
        release_id: {
          type: "number",
          description:
            "ID of the release (for get, update, delete, upload_asset).",
        },
        tag_name: {
          type: "string",
          description: "The name of the tag (for create, update).",
        },
        target_commitish: {
          type: "string",
          description:
            "Specifies the commitish value that determines where the Git tag is created from (for create).",
        },
        name: {
          type: "string",
          description: "The name of the release (for create, update).",
        },
        body: {
          type: "string",
          description:
            "Text describing the contents of the tag (for create, update).",
        },
        draft: {
          type: "boolean",
          description:
            "true to create a draft (unpublished) release, false to create a published one.",
          default: false,
        },
        prerelease: {
          type: "boolean",
          description: "true to identify the release as a prerelease.",
          default: false,
        },
      },
    },
  },
  dependency_analysis: {
    name: "dependency_analysis",
    description: "Placeholder for security and dependency insights.",
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
        report_type: {
          type: "string",
          description:
            "Type of dependency report (e.g., 'vulnerabilities', 'licenses', 'graph').",
          default: "vulnerabilities",
        },
        depth: {
          type: "number",
          description: "Depth of dependency tree to analyze (optional).",
        },
      },
    },
  },
};

module.exports = toolsConfig;
