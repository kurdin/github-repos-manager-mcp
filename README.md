# GitHub Repos Manager MCP Server

A Model Context Protocol (MCP) server that enables your MCP client (e.g., Claude Desktop, Roo Code, etc.) to interact with GitHub repositories using your GitHub personal access token.

This server is built using Node.js and provides a comprehensive set of tools for repository management, issue tracking, and more, all while leveraging the GitHub API.

## Key Advantages of This Approach

✅ **Direct API calls** - No dependency on `gh` CLI  
✅ **Uses your existing `GH_TOKEN`** - Leverages what you already have set up  
✅ **More features** - Includes file/directory browsing  
✅ **Faster** - Direct HTTP requests instead of CLI subprocess calls

## Enhanced Features

- **Smart repository listing** with filtering by visibility and sorting
- **File browsing** - Can read files and list directory contents
- **Better issue management** - Create and edit issues with labels, assignees, and image uploads (by providing a full local file path).
- **Advanced search** - Repository search with sorting options
- **User profiles** - Get detailed user information
- **Rate limit handling** - Proper GitHub API rate limit management

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
mkdir github-mcp-server
cd github-mcp-server
# Save the server.cjs, package.json, and README.md files into this directory.
npm install
chmod +x server.cjs # Make the server script executable
```

### 2. Configure Your MCP Client (e.g., Claude Desktop)
Add the following configuration to your MCP client.
- Replace `/full/path/to/your/project/github-mcp-server/server.cjs` with the actual absolute path to the `server.cjs` script.
- **Crucially, replace `"ghp_YOUR_ACTUAL_TOKEN_HERE"` with your GitHub Personal Access Token within the `env` block.** This is how the server receives the token.

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["/full/path/to/your/project/github-mcp-server/server.cjs"],
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


## Available Tools

The server provides a comprehensive set of tools:

### Repository Management
- **`set_default_repo`**: Set a default owner and repository for subsequent commands.
  - *Args*: `owner` (string, required), `repo` (string, required)
- **`list_repos`**: List GitHub repositories for the authenticated user.
  - *Args*: `per_page` (number, optional, default 10), `visibility` (string, optional, enum: "all", "public", "private", default "all"), `sort` (string, optional, enum: "created", "updated", "pushed", "full_name", default "updated")
- **`get_repo_info`**: Get detailed information about a specific repository.
  - *Args*: `owner` (string, required if no default), `repo` (string, required if no default)
- **`search_repos`**: Search for repositories on GitHub.
  - *Args*: `query` (string, required), `per_page` (number, optional, default 10), `sort` (string, optional, enum: "stars", "forks", "help-wanted-issues", "updated", default "stars")
- **`get_repo_contents`**: Get contents of a file or directory in a repository.
  - *Args*: `owner` (string, required if no default), `repo` (string, required if no default), `path` (string, optional, default ""), `ref` (string, optional, e.g., branch name)
- **`list_repo_collaborators`**: List collaborators for a repository.
 - *Args*: `owner` (string, optional), `repo` (string, optional), `affiliation` (string, optional, default "all"), `permission` (string, optional), `per_page` (integer, optional, default 30)

### Issue Management
- **`list_issues`**: List issues for a repository.
  - *Args*: `owner` (string, required if no default), `repo` (string, required if no default), `state` (string, optional, enum: "open", "closed", "all", default "open"), `per_page` (number, optional, default 10)
- **`create_issue`**: Create a new issue in a repository.
  - *Args*: `owner` (string, required if no default), `repo` (string, required if no default), `title` (string, required), `body` (string, optional), `image_path` (string, optional, full local path to image), `labels` (array of strings, optional), `assignees` (array of strings, optional)
- **`edit_issue`**: Edit an existing issue.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `issue_number` (integer, required), `title` (string, optional), `body` (string, optional), `state` (string, optional, enum: "open", "closed"), `image_path` (string, optional, full local path to image), `labels` (array of strings, optional), `assignees` (array of strings, optional)
- **`get_issue_details`**: Get detailed information about a single issue.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `issue_number` (integer, required)
- **`list_issue_comments`**: List comments for an issue.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `issue_number` (integer, required), `per_page` (integer, optional, default 30), `since` (string, optional, ISO 8601 format date-time)
- **`create_issue_comment`**: Create a new comment on an issue.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `issue_number` (integer, required), `body` (string, required)
- **`edit_issue_comment`**: Edit an existing comment on an issue.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `comment_id` (integer, required), `body` (string, required)
- **`delete_issue_comment`**: Delete a comment on an issue.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `comment_id` (integer, required)
- **`lock_issue`**: Lock an issue.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `issue_number` (integer, required), `lock_reason` (string, optional, enum: "off-topic", "too heated", "resolved", "spam")
- **`unlock_issue`**: Unlock an issue.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `issue_number` (integer, required)
- **`add_assignees_to_issue`**: Add assignees to an issue.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `issue_number` (integer, required), `assignees` (array of strings, required)
- **`remove_assignees_from_issue`**: Remove assignees from an issue.
  - *Args*: `owner` (string, optional), `repo` (string, optional), `issue_number` (integer, required), `assignees` (array of strings, required)

### Pull Request Management
- **`list_prs`**: List pull requests for a repository.
  - *Args*: `owner` (string, required if no default), `repo` (string, required if no default), `state` (string, optional, enum: "open", "closed", "all", default "open"), `per_page` (number, optional, default 10)

### User Information
- **`get_user_info`**: Get information about the authenticated user or a specific user.
  - *Args*: `username` (string, optional)

## Usage Examples

Once configured, you can ask your MCP client (e.g., Claude) to perform actions like:

- "List my GitHub repositories, sort by creation date."
- "Set default repository to `octocat/Spoon-Knife`."
- "Show me the open issues for the default repository."
- "Create an issue in `my-org/my-repo` with title 'Urgent: UI Bug' and body 'The login button is broken on mobile.' and assign it to `user1` and `user2`. Add the label `bug`."
- "Upload an image from `/Users/me/screenshots/bug_report.png` to issue #42 in `my-org/my-repo`."
- "Edit issue #15 in `another-org/project-x`: change title to 'Feature Request: Dark Mode' and add the label `enhancement`."
- "Search for repositories matching 'tensorflow examples language:python' and sort by stars."
- "Get information about the `my-org/internal-tooling` repository."
- "Show me the contents of the `src/main.js` file in the `octocat/Spoon-Knife` repository on the `develop` branch."
- "List the recent pull requests for `my-org/my-repo`."
- "Get my GitHub user profile."
- "Get user profile for `github_username`."
- "Add a comment 'This looks great!' to issue #7 in `octocat/Spoon-Knife`."
- "List collaborators for `my-org/my-repo` who have admin permissions."

## Troubleshooting

1. **Token Issues**:
   - Double-check that the `GH_TOKEN` value in your MCP client's configuration for this server is correct and does not have typos.
   - Ensure the token has not expired or been revoked.
   - You can verify a token's validity (if you have it handy) using `curl` by temporarily setting it as an environment variable:
     ```bash
     export TEMP_TOKEN="ghp_YOUR_TOKEN_TO_TEST"
     curl -H "Authorization: token $TEMP_TOKEN" https://api.github.com/user
     unset TEMP_TOKEN
     ```
     This should return your GitHub user information.
2. **Token in MCP Configuration**: Verify the `GH_TOKEN` is correctly placed within the `env` object in your MCP client's server configuration (see "Configure Your MCP Client" section).
3. **Token Permissions**: Ensure your token has the right scopes:
   - `repo` or `public_repo`
   - `user`

4. **Path Issues**: Verify the path in your Claude Desktop config is correct and absolute

5. **Node.js Version**: Ensure you're using Node.js 18 or higher:
   ```bash
   node --version
   ```

6. **Rate Limits**: GitHub API has rate limits (5,000 requests/hour for authenticated users). If you hit limits, wait or use a different token.

## Development

When developing or modifying `server.cjs`:

1.  **Using an MCP Client for Testing**: The easiest way is to have your MCP client (e.g., Claude Desktop) configured to point to your development version of `server.cjs` with the `GH_TOKEN` set in the client's config. Changes to `server.cjs` will require restarting the server (which usually means restarting the MCP client's connection to it or the client itself).
2.  **Direct Script Execution (for quick checks)**:
    ```bash
    # Temporarily set GH_TOKEN in your shell for this direct test
    export GH_TOKEN="ghp_YOUR_DEVELOPMENT_TOKEN"

    # Run the server (e.g., if you have a dev script in package.json for nodemon)
    npm run dev
    # Or directly:
    # node server.cjs

    # Important: Unset the temporary token if you don't want it lingering in your shell session
    unset GH_TOKEN
    ```

The server will start and listen on stdio for MCP communication from your client.

## Security Notes

- **Never commit your token**: Keep your `GH_TOKEN` secure and never commit it to version control
- **Token scope**: Use the minimum required scopes for your use case
- **MCP Client Configuration**: The recommended way to provide the token to this server is via the `env` block in your MCP client's configuration for this server. Avoid hardcoding it directly into `server.cjs`.
- **Rotation**: Regularly rotate your GitHub tokens for security

## API Rate Limits

- GitHub API allows 5,000 requests per hour for authenticated users
- The server includes error handling for rate limit responses
- Consider caching if you need to make many requests

## License

MIT License