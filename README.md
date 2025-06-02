# GitHub Repos Manager MCP Server

A comprehensive Model Context Protocol (MCP) server that enables your MCP client (Claude Desktop, Roo Code, Cline, Cursor, Windsurf, etc.) to interact with GitHub repositories using your GitHub personal access token.

This server is built using Node.js and provides a complete toolkit for repository management, issue tracking, collaboration management, and more, all while leveraging the GitHub API for optimal performance.

## 🚀 Key Advantages of This Approach

✅ **Direct API calls** - No dependency on `gh` CLI, faster and more reliable  
✅ **Uses your existing `GH_TOKEN`** - Leverages what you already have set up  
✅ **Comprehensive feature set** - 33 powerful tools for complete GitHub workflow  
✅ **Branch & commit management** - Create branches, explore history, compare changes  
✅ **Image upload support** - Upload and embed images directly in issues  
✅ **Smart defaults** - Set default repositories to streamline workflows  
✅ **Advanced filtering** - Sort, filter, and search with multiple criteria  
✅ **Rate limit handling** - Built-in GitHub API rate limit management

## 🎯 Complete Feature Set

### 📁 Repository Management
- **Smart repository listing** with filtering by visibility (public/private/all) and sorting options
- **Detailed repository information** including stats, URLs, and metadata
- **File and directory browsing** with support for specific branches/commits
- **Repository search** across all of GitHub with advanced sorting
- **Default repository setting** for streamlined workflows

### 🎫 Advanced Issue Management
- **Complete issue lifecycle** - create, edit, list, and manage states
- **Rich content support** - upload and embed images directly in issues
- **Label management** - add, remove, and organize with custom labels
- **Assignee management** - assign/unassign team members
- **Issue locking/unlocking** with customizable reasons
- **Comment system** - create, edit, delete, and list issue comments
- **State management** - open, close, and track issue progress

### 🔄 Pull Request Management
- **Pull request listing** with state filtering and sorting
- **Comprehensive PR information** including branch details and status

### 🌿 Branch & Commit Management
- **Branch operations** - list all branches with protection status and latest commits
- **Branch creation** - create new branches from existing branches or commits
- **Commit history** - explore commit history with advanced filtering (date, author, branch)
- **Commit details** - get comprehensive commit information including file changes
- **Commit comparison** - compare any two commits, branches, or tags to see differences

### 👥 Collaboration & User Management
- **User profile information** for any GitHub user or your own account
- **Repository collaborator management** with permission filtering
- **Team collaboration tools** for managing access and permissions

### 🎨 Advanced Capabilities
- **Image upload and embedding** - upload local images directly to GitHub
- **Batch operations** - manage multiple assignees, labels, and comments
- **Flexible authentication** - secure token-based GitHub API access
- **Smart error handling** - comprehensive error reporting and recovery

## Prerequisites

1. **Node.js** (version 18 or higher recommended)
2. **GitHub Personal Access Token (PAT)**: This is **CRUCIAL** for the server to function.
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) or Fine-grained tokens.
   - Generate a new token with at least these scopes:
     - `repo` (Full control of private repositories) - Recommended for full functionality.
     - `user:read` or `user:email` (to read user profile data).
     - `read:org` (if you need to access organization information).
   - **Important**: Store this token securely. You will need to provide it directly in your MCP client's configuration for this server (see Step 3 below).

## Quick Setup

### 1. Create the project
```bash
mkdir github-repos-manager-mcp
cd github-repos-manager-mcp
# Save the server.cjs, package.json, and README.md files into this directory.
npm install
chmod +x server.cjs # Make the server script executable
```

### 2. Configure Your MCP Client (e.g., Claude Desktop, Roo Code, Cline, Cursor, Windsurf, etc.)
Add the following configuration to your MCP client.
- Replace `/full/path/to/your/project/github-repos-manager-mcp/server.cjs` with the actual absolute path to the `server.cjs` script.
- **Crucially, replace `"ghp_YOUR_ACTUAL_TOKEN_HERE"` with your GitHub Personal Access Token within the `env` block.** This is how the server receives the token.

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["/full/path/to/your/project/github-repos-manager-mcp/server.cjs"],
      "env": {
        "GH_TOKEN": "ghp_YOUR_ACTUAL_TOKEN_HERE"
      }
    }
  }
}
```

### 3. Test the Server
Once the MCP client is configured with the correct path to `server.cjs` and your `GH_TOKEN`, the server should start automatically when the client attempts to use one of its tools.

You can also test the server script directly for basic authentication, but **this requires temporarily setting the GH_TOKEN environment variable in your shell for this specific test**:
```bash
# For direct script testing ONLY (normal operation uses MCP client config)
export GH_TOKEN="ghp_YOUR_TEMPORARY_TEST_TOKEN"
node server.cjs
unset GH_TOKEN # Important: unset after testing
```
If successful, you should see "GitHub API authentication successful" and "GitHub Repos Manager MCP Server running on stdio".

**Example File Locations for Claude Desktop `claude_desktop_config.json`:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json` (path may vary)


## 🛠️ Complete Tool Reference

This server provides **33 comprehensive tools** for complete GitHub workflow management:

### Repository Management Tools
- **`set_default_repo`**: Set a default owner and repository for subsequent commands to streamline your workflow.
  - *Args*: `owner` (string, required), `repo` (string, required)
- **`list_repos`**: List GitHub repositories for the authenticated user with advanced filtering.
  - *Args*: `per_page` (number, optional, default 10, max 100), `visibility` (string, optional, enum: "all", "public", "private", default "all"), `sort` (string, optional, enum: "created", "updated", "pushed", "full_name", default "updated")
- **`get_repo_info`**: Get comprehensive information about a specific repository including stats and metadata.
  - *Args*: `owner` (string, required if no default), `repo` (string, required if no default)
- **`search_repos`**: Search for repositories across GitHub with advanced sorting options.
  - *Args*: `query` (string, required), `per_page` (number, optional, default 10, max 100), `sort` (string, optional, enum: "stars", "forks", "help-wanted-issues", "updated", default "stars")
- **`get_repo_contents`**: Browse files and directories in any repository with branch/commit support.
  - *Args*: `owner` (string, required if no default), `repo` (string, required if no default), `path` (string, optional, default ""), `ref` (string, optional, e.g., branch name or commit SHA)

### Advanced Issue Management Tools
- **`list_issues`**: List issues with filtering by state and comprehensive pagination.
  - *Args*: `owner` (string, required if no default), `repo` (string, required if no default), `state` (string, optional, enum: "open", "closed", "all", default "open"), `per_page` (number, optional, default 10, max 100)
- **`create_issue`**: Create feature-rich issues with image uploads, labels, and assignees.
  - *Args*: `owner` (string, required if no default), `repo` (string, required if no default), `title` (string, required), `body` (string, optional), `image_path` (string, optional, full local path to image), `labels` (array of strings, optional), `assignees` (array of strings, optional)
- **`edit_issue`**: Modify existing issues including title, body, state, labels, assignees, and image uploads.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `issue_number` (integer, required), `title` (string, optional), `body` (string, optional), `state` (string, optional, enum: "open", "closed"), `image_path` (string, optional, full local path to image), `labels` (array of strings, optional), `assignees` (array of strings, optional)
- **`get_issue_details`**: Get comprehensive information about any specific issue.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `issue_number` (integer, required)
- **`lock_issue`**: Lock issues to prevent further comments with customizable reasons.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `issue_number` (integer, required), `lock_reason` (string, optional, enum: "off-topic", "too heated", "resolved", "spam")
- **`unlock_issue`**: Unlock previously locked issues to resume discussions.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `issue_number` (integer, required)
- **`add_assignees_to_issue`**: Add one or more team members to an issue.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `issue_number` (integer, required), `assignees` (array of strings, required)
- **`remove_assignees_from_issue`**: Remove assignees from issues for better task management.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `issue_number` (integer, required), `assignees` (array of strings, required)

### Issue Comment Management Tools
- **`list_issue_comments`**: List all comments for an issue with timestamp filtering.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `issue_number` (integer, required), `per_page` (integer, optional, default 30, max 100), `since` (string, optional, ISO 8601 format date-time)
- **`create_issue_comment`**: Add new comments to ongoing issue discussions.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `issue_number` (integer, required), `body` (string, required)
- **`edit_issue_comment`**: Modify existing comments for corrections or updates.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `comment_id` (integer, required), `body` (string, required)
- **`delete_issue_comment`**: Remove comments when necessary for content management.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `comment_id` (integer, required)

### Pull Request Management Tools
- **`list_prs`**: List pull requests with state filtering and pagination.
  - *Args*: `owner` (string, required if no default), `repo` (string, required if no default), `state` (string, optional, enum: "open", "closed", "all", default "open"), `per_page` (number, optional, default 10, max 100)

### Branch & Commit Management Tools
- **`list_branches`**: List all branches in a repository with protection status and commit information.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `protected_only` (boolean, optional, default false), `per_page` (number, optional, default 30)
- **`create_branch`**: Create a new branch from an existing branch or commit.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `branch_name` (string, required), `from_branch` (string, optional, defaults to repository default branch)
- **`list_commits`**: List commits in a repository with detailed information and filtering options.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `sha` (string, optional, branch/tag/commit to list from), `per_page` (number, optional, default 20), `since` (string, optional, ISO 8601 date-time), `until` (string, optional, ISO 8601 date-time), `author` (string, optional, GitHub username or email)
- **`get_commit_details`**: Get detailed information about a specific commit including files changed.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `commit_sha` (string, required)
- **`compare_commits`**: Compare two commits or branches to see differences.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `base` (string, required, base branch or commit SHA), `head` (string, required, head branch or commit SHA)

### User & Collaboration Tools
- **`get_user_info`**: Get detailed information about any GitHub user or your own profile.
  - *Args*: `username` (string, optional - defaults to authenticated user)
- **`list_repo_collaborators`**: List repository collaborators with permission-based filtering.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `affiliation` (string, optional, enum: "outside", "direct", "all", default "all"), `permission` (string, optional, enum: "pull", "triage", "push", "maintain", "admin"), `per_page` (integer, optional, default 30, max 100)

### Labels & Milestones Management Tools
- **`list_repo_labels`**: List all labels in a repository with their colors and descriptions.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `per_page` (integer, optional, default 30, max 100)
- **`create_label`**: Create custom labels with colors and descriptions for better issue organization.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `name` (string, required), `color` (string, optional, hex color without #, default "f29513"), `description` (string, optional)
- **`edit_label`**: Modify existing label properties including name, color, and description.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `current_name` (string, required), `name` (string, optional), `color` (string, optional, hex color without #), `description` (string, optional)
- **`delete_label`**: Remove labels from repository when no longer needed.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `name` (string, required)
- **`list_milestones`**: List repository milestones with filtering by state and sorting options.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `state` (string, optional, enum: "open", "closed", "all", default "open"), `sort` (string, optional, enum: "due_on", "completeness", default "due_on"), `direction` (string, optional, enum: "asc", "desc", default "asc"), `per_page` (integer, optional, default 30, max 100)
- **`create_milestone`**: Create new milestones with due dates for project planning.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `title` (string, required), `state` (string, optional, enum: "open", "closed", default "open"), `description` (string, optional), `due_on` (string, optional, ISO 8601 date-time format)
- **`edit_milestone`**: Update milestone details including title, description, state, and due dates.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `milestone_number` (integer, required), `title` (string, optional), `state` (string, optional, enum: "open", "closed"), `description` (string, optional), `due_on` (string, optional, ISO 8601 date-time format)
- **`delete_milestone`**: Remove milestones from repository when no longer needed.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `milestone_number` (integer, required)

## 💡 Usage Examples & Workflows

Once configured, you can ask your MCP client (e.g., Claude) to perform powerful GitHub operations:

### Repository Discovery & Management
- "List my GitHub repositories, sort by creation date and show only private repos."
- "Set default repository to `octocat/Spoon-Knife` for easier workflow."
- "Search for repositories matching 'tensorflow examples language:python' and sort by stars."
- "Get detailed information about the `my-org/internal-tooling` repository."
- "Show me the contents of the `src/main.js` file in the default repository on the `develop` branch."
- "List all collaborators for `my-org/my-repo` who have admin permissions."

### Advanced Issue Management
- "Create an issue in `my-org/my-repo` with title 'Urgent: UI Bug' and body 'The login button is broken on mobile.' Assign it to `user1` and `user2` and add the `bug` label."
- "Upload a screenshot from `/Users/me/screenshots/bug_report.png` to issue #42 in the default repository."
- "Edit issue #15: change title to 'Feature Request: Dark Mode', add the `enhancement` label, and close it."
- "Lock issue #23 with reason 'resolved' to prevent further discussion."
- "Get complete details for issue #7 including all metadata and current state."
- "Remove `old-assignee` from issue #12 and add `new-assignee` instead."

### Issue Discussion Management
- "List all comments on issue #7 from the last week."
- "Add a comment 'This looks great! Ready for merge.' to issue #15."
- "Edit comment ID 123456 to say 'Updated: This needs more testing before merge.'"
- "Delete comment ID 789012 from issue #20."

### Labels & Milestones Management
- "List all labels in the default repository to see current organization system."
- "Create a new label called 'urgent' with red color (#ff0000) and description 'Requires immediate attention'."
- "Edit the 'bug' label to change its color to orange (#FFA500) and update the description."
- "Delete the outdated 'legacy' label from the repository."
- "List all open milestones in `my-org/project-x` sorted by due date."
- "Create a milestone 'v2.0 Release' with due date '2025-12-31T23:59:59Z' and description 'Major version release'."
- "Edit milestone #3 to change the title to 'Q2 Goals' and extend the due date."
- "Delete milestone #5 as it's no longer relevant to the project."

### Pull Request & Collaboration
- "List all open pull requests for the default repository."
- "Show me closed pull requests from the last month for `my-org/project-x`."
- "Get my GitHub user profile information."
- "Get user profile details for `github_username`."

### Branch & Commit Management
- "List all branches in the default repository and show their protection status."
- "Show only protected branches in `my-org/secure-repo`."
- "Create a new feature branch called `feature/dark-mode` from the `develop` branch."
- "List the last 10 commits on the `main` branch."
- "Show me all commits by `john-doe` from the last week."
- "Get detailed information about commit `abc123def` including all file changes."
- "Compare the `main` branch with `feature/new-ui` to see what's different."
- "Show me the commit history between `v1.0.0` and `v2.0.0` tags."

### Workflow Automation Examples
- "Set `my-org/main-project` as default, then list all open issues assigned to me."
- "Create a bug report issue with title 'Login Error', upload the error screenshot from `/path/to/error.png`, assign to `dev-team`, and add labels `bug` and `high-priority`."
- "For issue #50: add assignee `reviewer1`, lock it with reason 'resolved', and add a final comment 'Issue resolved in PR #51'."

## 🔧 Troubleshooting

### Authentication Issues
1. **Token Problems**:
   - Double-check that the `GH_TOKEN` value in your MCP client's configuration is correct and doesn't have typos
   - Ensure the token hasn't expired or been revoked
   - Verify token validity using curl:
     ```bash
     export TEMP_TOKEN="ghp_YOUR_TOKEN_TO_TEST"
     curl -H "Authorization: token $TEMP_TOKEN" https://api.github.com/user
     unset TEMP_TOKEN
     ```
     This should return your GitHub user information.

2. **Configuration Issues**:
   - Verify the `GH_TOKEN` is correctly placed within the `env` object in your MCP client's server configuration
   - Ensure the path to `server.cjs` is absolute and correct
   - Check that Node.js version is 18 or higher: `node --version`

3. **Permission Issues**:
   - Ensure your token has the required scopes:
     - `repo` or `public_repo` (for repository access)
     - `user` (for user information)
     - `read:org` (for organization access, if needed)

### Performance & Rate Limiting
- **GitHub API Rate Limits**: 5,000 requests/hour for authenticated users
- If you hit limits, wait for the reset window or use a different token
- The server includes built-in rate limit error handling

### Common Setup Issues
- **Path Issues**: Verify the absolute path in your Claude Desktop config is correct
- **Node.js Version**: Ensure you're using Node.js 18 or higher
- **File Permissions**: Make sure `server.cjs` is executable: `chmod +x server.cjs`

### Image Upload Troubleshooting
- Ensure image files exist at the specified local path
- Supported formats: PNG, JPG, JPEG, GIF, WebP
- Check file permissions and accessibility
- Verify the file isn't corrupted or too large (GitHub has size limits)

## 🚦 API Rate Limits & Performance

- **Standard Rate Limits**: GitHub API allows 5,000 requests per hour for authenticated users
- **Built-in Handling**: The server includes comprehensive error handling for rate limit responses
- **Performance Optimization**: Direct HTTP requests ensure faster response times compared to CLI tools
- **Caching Recommendations**: Consider implementing caching strategies for frequently accessed data

## 🔒 Security Best Practices

- **Token Security**: Never commit your `GH_TOKEN` to version control or share it publicly
- **Minimum Permissions**: Use tokens with only the minimum required scopes for your use case
- **Environment Variables**: Always provide tokens via the `env` block in your MCP client configuration
- **Token Rotation**: Regularly rotate your GitHub tokens for enhanced security
- **Secure Storage**: Store tokens securely using your system's credential management

## 🔄 Development & Contribution

### Local Development Setup
```bash
# Clone and setup
mkdir github-repos-manager-mcp
cd github-repos-manager-mcp
# Add the server files
npm install
chmod +x server.cjs

# For development testing with nodemon
npm run dev
```

### Testing with MCP Clients
The recommended approach is configuring your MCP client (e.g., Claude Desktop) to point to your development version with proper `GH_TOKEN` configuration. Changes to `server.cjs` require restarting the server connection.

### Direct Script Testing
```bash
# Temporarily set token for quick verification
export GH_TOKEN="ghp_YOUR_DEVELOPMENT_TOKEN"
node server.cjs
unset GH_TOKEN  # Always clean up after testing
```

## 📜 License

MIT License - Feel free to use, modify, and distribute this MCP server.