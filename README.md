# GitHub Repos Manager MCP Server

**Token-based GitHub automation management. No Docker for optimal performance, Flexible configuration for fine-grained control, 80+ tools with direct API integration.**

A comprehensive Model Context Protocol (MCP) server that enables your MCP client (Claude Desktop, Roo Code, Cline, Cursor, Windsurf, etc.) to interact with GitHub repositories using your GitHub personal access token.

This tool simplifies managing GitHub repositories using only a GitHub token for setup. By skipping Docker, it avoids unnecessary complexity, delivering fast and effective results through direct API integration.

This server is built using Node.js and provides a complete toolkit for repository management, issue tracking, collaboration management, and more, all while leveraging the GitHub API for optimal performance.

## 🚀 Key Advantages over other GitHub Automation MCP Servers

🎯 **Simplicity**: Token-based access eliminates complexity.
🌿 **Efficiency**: No Docker ensures lightweight, optimal performance.
💪 **Power**: 80+ tools with direct API integration offer unmatched flexibility.
🔒 **Flexibility**: Fine-grained control with configurable tools.

### 🎯 Simple Setup & Operation
✅ **No Docker required** - Simple Node.js server that runs anywhere  
✅ **One token setup** - Only needs a GitHub Personal Access Token to work  
✅ **Direct API integration** - No dependency on `gh` CLI, faster and more reliable  
✅ **Zero configuration** - Works out of the box with just the token  

### 🔒 Advanced Security & Control
✅ **Allowed repositories** - Restrict operations to specific repos or owners  
✅ **Tool management** - Enable/disable specific tools for fine-grained control  
✅ **Default repository** - Set a default repo for streamlined workflows  
✅ **Flexible permissions** - Configure exactly what the server can access  

### 💪 Powerful Features
✅ **Comprehensive toolkit** - 89 powerful tools for complete GitHub workflow  
✅ **Branch & commit management** - Create branches, explore history, compare changes  
✅ **Image upload support** - Upload and embed images directly in issues  
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

### Minimal Requirements - It's That Simple!

1. **Node.js** (version 18 or higher) - That's it!
2. **GitHub Personal Access Token (PAT)** - The only configuration needed
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) or Fine-grained tokens.
   - Generate a new token with at least these scopes:
     - `repo` (Full control of private repositories) - Recommended for full functionality.
     - `user:read` or `user:email` (to read user profile data).
     - `read:org` (if you need to access organization information).
   - **Important**: Store this token securely. You will need to provide it directly in your MCP client's configuration for this server (see Step 3 below).

## Quick Setup

### Option 1: Using npx (Simplest - No Installation Required!)

You can run this server directly without cloning or installing:

```bash
# Run directly with npx
npx github-repos-manager-mcp
```

### Option 2: Clone and Install

```bash
git clone https://github.com/kurdin/github-repos-manager-mcp.git
cd github-repos-manager-mcp
npm install
```

### 2. Configure Your MCP Client

Add the appropriate configuration to your MCP client (Claude Desktop, Roo Code, Cline, Cursor, Windsurf, etc.):

#### Using npx (Recommended - No Installation!)

```bash
# Run directly with npx
npx github-repos-manager-mcp
```

### Option 2: Clone and Install

```bash
git clone https://github.com/kurdin/github-repos-manager-mcp.git
cd github-repos-manager-mcp
npm install
```

### 2.

**For macOS/Linux:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "github-repos-manager-mcp"
      ],
      "env": {
        "GH_TOKEN": "ghp_YOUR_ACTUAL_TOKEN_HERE"
      }
    }
  }
}
```

**For Windows:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx.cmd", // Use npx.cmd for Windows
      "args": [
        "-y",
        "github-repos-manager-mcp"
      ],
      "env": {
        "GH_TOKEN": "ghp_YOUR_ACTUAL_TOKEN_HERE"
      }
    }
  }
}
```

#### Using Local Installation

If you cloned the repository, use the full path to `server.cjs`:

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

**Important**: Replace `"ghp_YOUR_ACTUAL_TOKEN_HERE"` with your actual GitHub Personal Access Token.

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

**Note**: The server will only set a default repository if you explicitly configure it through environment variables, command line arguments, or use the `set_default_repo` tool. It never automatically sets a default repository.

**Example File Locations for Claude Desktop `claude_desktop_config.json`:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json` (path may vary)

## ⚙️ Configuration Options

### Default Repository Setting

You can set a default repository to streamline your workflow and avoid specifying `owner` and `repo` in every command. There are three ways to configure this:

#### 1. Environment Variables (Recommended for MCP clients)
Add environment variables to your MCP client configuration:

**Using npx:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["github-repos-manager-mcp"],
      "env": {
        "GH_TOKEN": "ghp_YOUR_ACTUAL_TOKEN_HERE",
        "GH_DEFAULT_OWNER": "octocat",
        "GH_DEFAULT_REPO": "Hello-World"
      }
    }
  }
}
```

**Using local installation:**
```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["/full/path/to/your/project/github-repos-manager-mcp/server.cjs"],
      "env": {
        "GH_TOKEN": "ghp_YOUR_ACTUAL_TOKEN_HERE",
        "GH_DEFAULT_OWNER": "octocat",
        "GH_DEFAULT_REPO": "Hello-World"
      }
    }
  }
}
```

#### 2. Command Line Arguments
When running the server directly, you can pass default repository settings:
```bash
node server.cjs --default-owner octocat --default-repo Hello-World
```

#### 3. Runtime Tool Call
Use the `set_default_repo` tool during your conversation to set or change the default repository:
- "Set default repository to `microsoft/vscode`"
- "Change the default to my own repo `username/my-project`"

**Configuration Priority (highest to lowest)**:
1. Command line arguments (`--default-owner`, `--default-repo`)
2. Environment variables (`GH_DEFAULT_OWNER`, `GH_DEFAULT_REPO`) 
3. Runtime tool calls (`set_default_repo`)

**Benefits of Default Repository**:
- Eliminates the need to specify `owner` and `repo` in every command
- Streamlines workflows when working primarily with one repository
- Can be changed at any time during your session using the `set_default_repo` tool
- Optional - all tools work without a default repository set

Once a default repository is set, you can omit `owner` and `repo` parameters from commands:
- Instead of: "List issues for microsoft/vscode"
- Simply say: "List issues" (after setting microsoft/vscode as default)


### Repository Access Control

You can restrict which repositories the server can access using the `GH_ALLOWED_REPOS` environment variable or `--allowed-repos` command line argument. This is a security feature that ensures the server can only operate on approved repositories.

#### Allowed Repositories Configuration

**1. Environment Variable (for MCP clients)**
```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["/path/to/server.cjs"],
      "env": {
        "GH_TOKEN": "ghp_YOUR_TOKEN",
        "GH_ALLOWED_REPOS": "owner1/repo1,owner2/repo2,owner3"
      }
    }
  }
}
```

**2. Command Line Argument**
```bash
node server.cjs --allowed-repos "microsoft/vscode,facebook/react,google"
```

**How it works:**
- **Full repo paths** (`owner/repo`): Only that specific repository is allowed
- **Owner only** (`owner`): All repositories from that owner are allowed
- **Mixed**: You can combine both formats

**Examples:**
- `"microsoft/vscode"` - Only the vscode repository from Microsoft
- `"kurdin"` - All repositories owned by kurdin
- `"kurdin,microsoft/vscode,facebook/react"` - All kurdin's repos plus specific repos

### Tool Access Control

#### Disabling Specific Tools
Disable tools that you don't want to be available by setting the `GH_DISABLED_TOOLS` environment variable or using `--disabled-tools` command line argument.

#### Allowing Only Specific Tools
For maximum security, you can restrict the server to only allow specific tools by setting the `GH_ALLOWED_TOOLS` environment variable or using `--allowed-tools` command line argument.

**Important:** If both `GH_ALLOWED_TOOLS` and `GH_DISABLED_TOOLS` are set, `GH_ALLOWED_TOOLS` takes precedence.

### Complete Configuration Example

**Using npx (macOS/Linux):**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["github-repos-manager-mcp"],
      "env": {
        "GH_TOKEN": "ghp_YOUR_ACTUAL_TOKEN_HERE",
        "GH_DEFAULT_OWNER": "mycompany",
        "GH_DEFAULT_REPO": "main-project",
        "GH_ALLOWED_REPOS": "mycompany,trusted-org/specific-repo",
        "GH_ALLOWED_TOOLS": "list_issues,create_issue,list_prs,get_repo_info"
      }
    }
  }
}
```

**Using npx (Windows):**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx.cmd",
      "args": ["github-repos-manager-mcp"],
      "env": {
        "GH_TOKEN": "ghp_YOUR_ACTUAL_TOKEN_HERE",
        "GH_DEFAULT_OWNER": "mycompany",
        "GH_DEFAULT_REPO": "main-project",
        "GH_ALLOWED_REPOS": "mycompany,trusted-org/specific-repo",
        "GH_ALLOWED_TOOLS": "list_issues,create_issue,list_prs,get_repo_info"
      }
    }
  }
}
```

**Using local installation:**
```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["/full/path/to/your/project/github-repos-manager-mcp/server.cjs"],
      "env": {
        "GH_TOKEN": "ghp_YOUR_ACTUAL_TOKEN_HERE",
        "GH_DEFAULT_OWNER": "mycompany",
        "GH_DEFAULT_REPO": "main-project",
        "GH_ALLOWED_REPOS": "mycompany,trusted-org/specific-repo",
        "GH_ALLOWED_TOOLS": "list_issues,create_issue,list_prs,get_repo_info"
      }
    }
  }
}
```

**Command Line Equivalents:**
```bash
node server.cjs \
  --default-owner mycompany \
  --default-repo main-project \
  --allowed-repos "mycompany,trusted-org/specific-repo" \
  --allowed-tools "list_issues,create_issue,list_prs,get_repo_info"
```

## 🛠️ Complete Tool Reference

This server provides **89 comprehensive tools** for complete GitHub workflow management:

### Enhanced Pull Request Management
- **`create_pull_request`**: Create a new pull request with title, body, and branch specifications.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `title` (string, required), `body` (string, optional), `head` (string, required - branch with changes), `base` (string, required - target branch), `draft` (boolean, optional), `maintainer_can_modify` (boolean, optional)
- **`edit_pull_request`**: Update an existing pull request's title, body, state, or base branch.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `pull_number` (integer, required), `title` (string, optional), `body` (string, optional), `state` (string, optional - "open" or "closed"), `base` (string, optional)
- **`get_pr_details`**: Get comprehensive information about a pull request including status and merge details.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `pull_number` (integer, required)
- **`list_pr_reviews`**: List all reviews on a pull request with their status and comments.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `pull_number` (integer, required), `per_page` (integer, optional, default 30)
- **`create_pr_review`**: Submit a review on a pull request with comments and approval status.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `pull_number` (integer, required), `body` (string, optional), `event` (string, optional - "APPROVE", "REQUEST_CHANGES", "COMMENT"), `comments` (array, optional)
- **`list_pr_files`**: List all files changed in a pull request with additions/deletions stats.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `pull_number` (integer, required), `per_page` (integer, optional, default 30)

### File & Content Management
- **`create_file`**: Create a new file in the repository with content and commit message.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `path` (string, required), `content` (string, required), `message` (string, required), `branch` (string, optional), `committer` (object, optional)
- **`update_file`**: Update an existing file's content with a new commit.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `path` (string, required), `content` (string, required), `message` (string, required), `sha` (string, required - current file SHA), `branch` (string, optional)
- **`upload_file`**: Upload a local file to the repository (binary files supported).
  - *Args*: `owner` (string, optional), `repo` (string, optional), `local_path` (string, required), `repo_path` (string, required), `message` (string, required), `branch` (string, optional)
- **`delete_file`**: Delete a file from the repository with a commit message.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `path` (string, required), `message` (string, required), `sha` (string, required - current file SHA), `branch` (string, optional)

### Security & Access Management
- **`list_deploy_keys`**: List all deploy keys for a repository with their permissions.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `per_page` (integer, optional, default 30)
- **`create_deploy_key`**: Add a new deploy key to the repository for secure access.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `title` (string, required), `key` (string, required - public SSH key), `read_only` (boolean, optional, default true)
- **`delete_deploy_key`**: Remove a deploy key from the repository.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `key_id` (integer, required)
- **`list_webhooks`**: List all webhooks configured for the repository.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `per_page` (integer, optional, default 30)
- **`create_webhook`**: Create a new webhook for repository events.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `config` (object, required - url and content_type), `events` (array, optional, default ["push"]), `active` (boolean, optional)
- **`edit_webhook`**: Update webhook configuration, events, or active status.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `hook_id` (integer, required), `config` (object, optional), `events` (array, optional), `active` (boolean, optional)
- **`delete_webhook`**: Remove a webhook from the repository.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `hook_id` (integer, required)
- **`list_secrets`**: List repository secrets (names only, values are encrypted).
  - *Args*: `owner` (string, optional), `repo` (string, optional), `per_page` (integer, optional, default 30)
- **`update_secret`**: Create or update a repository secret for Actions.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `secret_name` (string, required), `encrypted_value` (string, required), `key_id` (string, required)

### GitHub Actions & Workflows
*Note: These tools are placeholders for future GitHub Actions integration.*
- **`list_workflows`**: List all GitHub Actions workflows in the repository.
- **`list_workflow_runs`**: List workflow runs with filtering options.
- **`get_workflow_run_details`**: Get detailed information about a workflow run.
- **`trigger_workflow`**: Manually trigger a workflow dispatch event.
- **`download_workflow_artifacts`**: Download artifacts from a workflow run.
- **`cancel_workflow_run`**: Cancel a workflow run in progress.

### Repository Analytics & Insights
- **`get_repo_stats`**: Get comprehensive repository statistics including contributor activity.
  - *Args*: `owner` (string, optional), `repo` (string, optional)
- **`list_repo_topics`**: List all topics (tags) associated with the repository.
  - *Args*: `owner` (string, optional), `repo` (string, optional)
- **`update_repo_topics`**: Update the topics for better repository discovery.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `names` (array of strings, required)
- **`get_repo_languages`**: Get programming languages used in the repository with byte counts.
  - *Args*: `owner` (string, optional), `repo` (string, optional)
- **`list_stargazers`**: List users who have starred the repository.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `per_page` (integer, optional, default 30)
- **`list_watchers`**: List users watching the repository for notifications.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `per_page` (integer, optional, default 30)
- **`list_forks`**: List all forks of the repository with sorting options.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `sort` (string, optional - "newest", "oldest", "stargazers"), `per_page` (integer, optional)
- **`get_repo_traffic`**: Get repository traffic data including views and clones (requires admin access).
  - *Args*: `owner` (string, optional), `repo` (string, optional)

### Advanced Search & Discovery
- **`search_issues`**: Search for issues and pull requests across GitHub.
  - *Args*: `query` (string, required), `sort` (string, optional - "comments", "reactions", "interactions", "created", "updated"), `order` (string, optional - "asc", "desc"), `per_page` (integer, optional)
- **`search_commits`**: Search for commits across repositories.
  - *Args*: `query` (string, required), `sort` (string, optional - "author-date", "committer-date"), `order` (string, optional), `per_page` (integer, optional)
- **`search_code`**: Search for code across GitHub repositories.
  - *Args*: `query` (string, required), `sort` (string, optional - "indexed"), `order` (string, optional), `per_page` (integer, optional)
- **`search_users`**: Search for users and organizations.
  - *Args*: `query` (string, required), `sort` (string, optional - "followers", "repositories", "joined"), `order` (string, optional), `per_page` (integer, optional)
- **`search_topics`**: Search for repository topics.
  - *Args*: `query` (string, required), `per_page` (integer, optional, default 30)

### Organization Management
- **`list_org_repos`**: List all repositories in an organization.
  - *Args*: `org` (string, required), `type` (string, optional - "all", "public", "private", "forks", "sources", "member"), `sort` (string, optional), `per_page` (integer, optional)
- **`list_org_members`**: List members of an organization.
  - *Args*: `org` (string, required), `filter` (string, optional - "2fa_disabled", "all"), `role` (string, optional - "all", "admin", "member"), `per_page` (integer, optional)
- **`get_org_info`**: Get detailed information about an organization.
  - *Args*: `org` (string, required)
- **`list_org_teams`**: List all teams in an organization.
  - *Args*: `org` (string, required), `per_page` (integer, optional, default 30)
- **`get_team_members`**: List members of a specific team.
  - *Args*: `org` (string, required), `team_slug` (string, required), `role` (string, optional - "member", "maintainer", "all"), `per_page` (integer, optional)
- **`manage_team_repos`**: Add or remove repository access for a team.
  - *Args*: `org` (string, required), `team_slug` (string, required), `owner` (string, required), `repo` (string, required), `permission` (string, optional - "pull", "push", "admin"), `action` (string, required - "add" or "remove")

### Projects & Advanced Features
*Note: Some of these tools are placeholders for future enhancements.*
- **`list_repo_projects`**: List repository projects (classic projects).
- **`code_quality_checks`**: Placeholder for future code quality analysis.
- **`custom_dashboards`**: Placeholder for custom dashboard creation.
- **`automated_reporting`**: Placeholder for automated report generation.
- **`notification_management`**: Placeholder for notification settings.
- **`release_management`**: Placeholder for release management features.
- **`dependency_analysis`**: Placeholder for dependency scanning.

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
- "Get detailed information about the `microsoft/vscode` repository."
- "Show me the contents of the `src/main.js` file in microsoft/vscode on the `develop` branch."
- "Show me the contents of the `src/main.js` file in the default repository on the `develop` branch." *(requires default repo set)*
- "List all collaborators for `my-org/my-repo` who have admin permissions."
- "Search for repositories matching 'tensorflow examples language:python' and sort by stars."

### Advanced Issue Management
- "Create an issue in `my-org/my-repo` with title 'Urgent: UI Bug' and body 'The login button is broken on mobile.' Assign it to `user1` and `user2` and add the `bug` label."
- "Create an issue with title 'Feature Request' and add the `enhancement` label." *(requires default repo set)*
- "Upload a screenshot from `/Users/me/screenshots/bug_report.png` to issue #42 in microsoft/vscode."
- "Upload a screenshot from `/Users/me/screenshots/bug_report.png` to issue #42 in the default repository." *(requires default repo set)*
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
- "List all labels in `my-org/my-repo` to see current organization system."
- "List all labels in the default repository to see current organization system." *(requires default repo set)*
- "Create a new label called 'urgent' with red color (#ff0000) and description 'Requires immediate attention'."
- "Edit the 'bug' label to change its color to orange (#FFA500) and update the description."
- "Delete the outdated 'legacy' label from the repository."
- "List all open milestones in `my-org/project-x` sorted by due date."
- "Create a milestone 'v2.0 Release' with due date '2025-12-31T23:59:59Z' and description 'Major version release'."
- "Edit milestone #3 to change the title to 'Q2 Goals' and extend the due date."
- "Delete milestone #5 as it's no longer relevant to the project."

### Pull Request & Collaboration
- "List all open pull requests for `microsoft/vscode`."
- "List all open pull requests for the default repository." *(requires default repo set)*
- "Show me closed pull requests from the last month for `my-org/project-x`."
- "Get my GitHub user profile information."
- "Get user profile details for `github_username`."

### Branch & Commit Management
- "List all branches in `my-org/my-repo` and show their protection status."
- "List all branches in the default repository and show their protection status." *(requires default repo set)*
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
   - **Default Repository**: If you set `GH_DEFAULT_OWNER` and `GH_DEFAULT_REPO` environment variables, verify they're correct and the repository exists

3. **Permission Issues**:
   - Ensure your token has the required scopes:
     - `repo` or `public_repo` (for repository access)
     - `user` (for user information)
     - `read:org` (for organization access, if needed)
   - **Default Repository Access**: If using a default repository, ensure your token has access to that specific repository

### Default Repository Configuration Issues
- **Environment Variables Not Working**: Double-check spelling of `GH_DEFAULT_OWNER` and `GH_DEFAULT_REPO` in your MCP client config
- **Command Line Arguments**: Ensure proper syntax when using `--default-owner` and `--default-repo` flags
- **Tool Call Issues**: Use exact repository names: `owner/repo` format in the `set_default_repo` tool
- **Override Behavior**: Remember that runtime tool calls can override environment variables, and command line args override both

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