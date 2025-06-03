# Refactoring Plan: Class Handlers to Flat Exports & Centralized Formatting/Configuration

**Overall Goal:**
Transition from class-based handlers (e.g., `new RepositoryHandlers(this.api)`) to flat, exported functions (e.g., `require('./handlers/repository.cjs').listRepos`). Formatting logic will be moved to a new `src/formatters` directory. The `defaultOwner` and `defaultRepo` state will be managed directly by the `GitHubMCPServer` instance in `src/index.cjs`. Additionally, a feature to disable specific tools via configuration will be implemented.

---

## Phase 1: Server-Level Configuration and Logic in `GitHubMCPServer` (`src/index.cjs`)

This phase focuses on modifying `src/index.cjs` to manage default repository context and tool availability at the server level.

### 1.A: Centralize Default Repository Logic

1.  **Update `GitHubMCPServer` Constructor:**
    *   At the beginning of the `constructor` in `src/index.cjs`, explicitly initialize:
        *   `this.defaultOwner = null;`
        *   `this.defaultRepo = null;`
    *   The existing logic that reads `config.defaultOwner`, `process.env.GH_DEFAULT_OWNER`, `config.defaultRepo`, and `process.env.GH_DEFAULT_REPO` will proceed. If these values are found, it calls `this.setDefaultRepo(defaultOwner, defaultRepo)`, which will then populate `this.defaultOwner` and `this.defaultRepo`.

2.  **Modify `setDefaultRepo` Method:**
    *   In `src/index.cjs`, change the `setDefaultRepo(owner, repo)` method to:
        *   Set `this.defaultOwner = owner;`
        *   Set `this.defaultRepo = repo;`
    *   Remove all lines that call `setDefaultRepo` on individual handler instances (e.g., `this.repoHandler.setDefaultRepo(owner, repo);`, etc.), as these instances will be removed or will no longer manage this state.

3.  **Modify `getHandlerArgs` Method:**
    *   In `src/index.cjs`, update the `getHandlerArgs(args)` method:
    *   It should construct a context object based on `this.defaultOwner` and `this.defaultRepo` *only if they are set (not null)*.
        ```javascript
        // In getHandlerArgs method
        const defaultRepoContext = {};
        if (this.defaultOwner) {
          defaultRepoContext.owner = this.defaultOwner;
        }
        if (this.defaultRepo) {
          defaultRepoContext.repo = this.defaultRepo;
        }
        // Args passed to the tool should override the defaults
        return { ...defaultRepoContext, ...(args || {}) };
        ```
    *   Handler functions will then need to check for the presence of `owner` and `repo` in their `args` and throw an error if they are required but missing.

### 1.B: Implement Tool Disabling Feature

1.  **Update `GitHubMCPServer` Constructor:**
    *   Initialize `this.disabledTools = new Set();`.
    *   Process `config.disabledTools` (e.g., a comma-separated string from CLI or an array from MCP config) and `process.env.GH_DISABLED_TOOLS`. Add tool names to `this.disabledTools`.
    *   Example for parsing a comma-separated string:
        ```javascript
        // In constructor
        const disabledToolsString = config.disabledTools || process.env.GH_DISABLED_TOOLS;
        if (disabledToolsString) {
          disabledToolsString.split(',').forEach(toolName => this.disabledTools.add(toolName.trim()));
        }
        ```

2.  **Modify `ListToolsRequestSchema` Handler (in `setupToolHandlers`):**
    *   Change the handler to filter out disabled tools from the list returned to the client:
        ```javascript
        // In ListToolsRequestSchema handler
        const allTools = Object.values(toolsConfig); // Assuming toolsConfig holds all tool definitions
        const availableTools = allTools.filter(tool => !this.disabledTools.has(tool.name));
        return { tools: availableTools };
        ```

3.  **Modify `CallToolRequestSchema` Handler (in `setupToolHandlers`):**
    *   At the beginning of the `try` block, before the `switch (name)` statement, add a check:
        ```javascript
        // In CallToolRequestSchema handler, before switch
        if (this.disabledTools.has(name)) {
          throw new Error(`Tool '${name}' is disabled by server configuration.`);
        }
        ```
    *   This will cause the existing `catch` block to return an error message if a disabled tool is called.

4.  **Update Server Startup Message (in `run()` method):**
    *   Modify the `run()` method in `GitHubMCPServer` (around the `console.error("GitHub Repos Manager MCP Server is running...");` line).
    *   After successfully connecting, calculate the total number of tools defined in `toolsConfig`.
    *   Log information about available/disabled tools:
        *   If `this.disabledTools` is empty, log something like: "All X tools are available."
        *   If `this.disabledTools` has entries, log:
            *   "Y out of X tools are available."
            *   "Disabled tools (Z): tool_name1, tool_name2, ..." (listing the names of disabled tools).
        ```javascript
        // In run() method, after server.connect()
        console.error("GitHub Repos Manager MCP Server is running...");

        const totalToolsCount = Object.keys(toolsConfig).length;
        const disabledToolsCount = this.disabledTools.size;
        const availableToolsCount = totalToolsCount - disabledToolsCount;

        if (disabledToolsCount === 0) {
          console.error(`All ${totalToolsCount} tools are available.`);
        } else {
          console.error(`${availableToolsCount} out of ${totalToolsCount} tools are available.`);
          const disabledToolNames = Array.from(this.disabledTools).join(', ');
          console.error(`Disabled tools (${disabledToolsCount}): ${disabledToolNames}`);
        }
        ```

---

## Phase 2: Refactor `RepositoryHandlers` (`src/handlers/repository.cjs`)

This phase serves as a template for refactoring other class-based handlers.

1.  **Create Formatter File (`src/formatters/repository.cjs`):**
    *   Create a new file: `src/formatters/repository.cjs`.
    *   For each method in the current `src/handlers/repository.cjs` that produces formatted output (e.g., `listRepos`, `getRepoInfo`), create a corresponding exported function in `src/formatters/repository.cjs`.
    *   These functions will take the raw API response data as input and return the MCP `content` block.
    *   Example for `listRepos`:
        ```javascript
        // src/formatters/repository.cjs
        function formatListReposOutput(reposData) {
          const formatted = reposData.map((repo) => ({ /* ... mapping logic ... */ }));
          return {
            content: [
              {
                type: "text",
                text: `Found ${reposData.length} repositories:\n\n${formatted.map(repo => `**${repo.name}** ...`).join("\n")}`,
              },
            ],
          };
        }

        module.exports = {
          formatListReposOutput,
          // ... other formatting functions for getRepoInfo, searchRepos, etc.
        };
        ```
    *   Move the existing formatting logic from `src/handlers/repository.cjs` into these new functions.

2.  **Refactor Handler File (`src/handlers/repository.cjs`):**
    *   Modify `src/handlers/repository.cjs`:
        *   Remove the class definition (`class RepositoryHandlers { ... }`).
        *   Remove the `constructor` and the `setDefaultRepo` method.
        *   Convert each method of the old class into an exported `async` function.
            *   These functions will now take `(args, apiService)` as parameters. `args` will contain `owner`, `repo` (potentially resolved by `GitHubMCPServer.getHandlerArgs`). `apiService` is the instance of `GitHubAPIService`.
        *   Import the necessary formatting functions from `src/formatters/repository.cjs`.
    *   Example for `listRepos`:
        ```javascript
        // src/handlers/repository.cjs
        const repositoryFormatters = require('../formatters/repository.cjs');

        async function listRepos(args, apiService) {
          // owner/repo might not be used if endpoint is /user/repos
          const { per_page = 10, visibility = "all", sort = "updated" } = args;
          // ... logic to build params for API call ...
          const reposData = await apiService.makeGitHubRequest(`/user/repos?${params.toString()}`); // Ensure params is defined
          return repositoryFormatters.formatListReposOutput(reposData);
        }

        async function getRepoInfo(args, apiService) {
          const { owner, repo } = args; // owner/repo are essential here
          if (!owner || !repo) {
            throw new Error("Owner and repository name are required.");
          }
          const repoData = await apiService.makeGitHubRequest(`/repos/${owner}/${repo}`);
          return repositoryFormatters.formatGetRepoInfoOutput(repoData); // Assuming formatGetRepoInfoOutput exists
        }

        // ... other refactored handler functions ...

        module.exports = {
          listRepos,
          getRepoInfo,
          // ... other exported functions: searchRepos, getRepoContents, listRepoCollaborators
        };
        ```

3.  **Update `GitHubMCPServer` (`src/index.cjs`) for Refactored `RepositoryHandlers`:**
    *   Change the import:
        *   From: `const RepositoryHandlers = require("./handlers/repository.cjs");`
        *   To: `const repositoryHandlerFunctions = require("./handlers/repository.cjs");`
    *   Remove the instantiation: `this.repoHandler = new RepositoryHandlers(this.api);`.
    *   In `setupToolHandlers()`, update the calls for repository tools:
        *   Example for `list_repos`:
            *   From: `return await this.repoHandler.listRepos(args || {});`
            *   To: `return await repositoryHandlerFunctions.listRepos(this.getHandlerArgs(args), this.api);`
        *   Apply similar changes for `get_repo_info`, `search_repos`, `get_repo_contents`, and `list_repo_collaborators`.
        *   The `set_default_repo` case will now directly use `this.setDefaultRepo(args.owner, args.repo);` which modifies the server's own state.

---

## Phase 3: Refactor Remaining Class-Based Handlers

Repeat the steps from Phase 2 for each of the following handlers. For each handler:
    1.  Create a corresponding formatter file in `src/formatters/` (e.g., `src/formatters/issues.cjs`).
    2.  Move formatting logic into the new formatter file.
    3.  Refactor the handler file in `src/handlers/` to export flat functions.
    4.  Update `src/index.cjs` to import and use these new flat functions, removing the class instantiation and updating the `setupToolHandlers` switch statement.

**Handlers to Refactor:**
*   `IssueHandlers` (`./handlers/issues.cjs`) -> `src/formatters/issues.cjs`
*   `CommentHandlers` (`./handlers/comments.cjs`) -> `src/formatters/comments.cjs`
*   `PullRequestHandlers` (`./handlers/pull-requests.cjs`) -> `src/formatters/pull-requests.cjs` (Distinct from the already flat `enhanced-pull-requests.cjs`)
*   `UserHandlers` (`./handlers/users.cjs`) -> `src/formatters/users.cjs`
*   `LabelsHandlers` (`./handlers/labels.cjs`) -> `src/formatters/labels.cjs`
*   `MilestonesHandlers` (`./handlers/milestones.cjs`) -> `src/formatters/milestones.cjs`
*   `BranchCommitHandlers` (`./handlers/branches-commits.cjs`) -> `src/formatters/branches-commits.cjs`

---

## Phase 4: Cleanup and Verification

1.  **Review `src/index.cjs`:**
    *   Ensure all old class handler instantiations are removed for the refactored handlers.
    *   Double-check that all tool calls in `setupToolHandlers` correctly use the new flat functions, passing `this.getHandlerArgs(args)` and `this.api` (or `this.api.octokit` where appropriate).
2.  **Test `set_default_repo` and Tool Disabling:**
    *   Verify that using the `set_default_repo` tool correctly updates `this.defaultOwner` and `this.defaultRepo` on the `GitHubMCPServer` instance.
    *   Verify that tools can be disabled via configuration and that attempts to call them or list them behave as expected.
    *   Verify the server startup message correctly reflects the status of available/disabled tools.
3.  **Test Handler Functionality:** Test a few functions from each refactored handler to ensure they work correctly with the new structure, especially regarding API calls, argument handling (including default repository context), and formatted output.
4.  **Code Quality Checks:**
    *   Ensure all `require` statements use the `.cjs` extension for local modules.
    *   Verify that all imports are correct and necessary.
    *   Remove any unused variables or functions to maintain clean code.
5.  **Update and Verify Test Suite:**
    *   Review and update the `test-all-tools.js` script to align with any changes in tool names, arguments, or expected outputs resulting from the refactoring.
    *   Execute `node test-all-tools.js` and ensure all tests pass.
6.  **Verify Server Operation:**
    *   Confirm that the server starts correctly using `node server.cjs`.

---

## Mermaid Diagram of Target Handler/Formatter Architecture

```mermaid
graph TD
    subgraph GitHubMCPServer (src/index.cjs)
        direction LR
        A[Constructor] -- initializes --> API[this.api = new GitHubAPIService()]
        A -- initializes --> DO[this.defaultOwner = null]
        A -- initializes --> DR[this.defaultRepo = null]
        A -- initializes & processes config --> DT[this.disabledTools = new Set()]

        SDR[tool: set_default_repo] -- calls --> ServerSetDefault[this.setDefaultRepo(owner, repo)]
        ServerSetDefault -- updates --> DO
        ServerSetDefault -- updates --> DR

        GHA[this.getHandlerArgs(args)] -- uses --> DO
        GHA -- uses --> DR
        GHA -- returns --> ResolvedArgs[owner, repo, ...otherArgs]

        STH[setupToolHandlers]
        STH -- "tool: list_repos" --> CheckDisabled1["if tool disabled, throw error"]
        CheckDisabled1 -- "else" --> CallListRepos
        CallListRepos["await repoFuncs.listRepos(ResolvedArgs, API)"]

        STH2[setupToolHandlers]
        STH2 -- "ListToolsRequest" --> FilterDisabledTools["Filter tools using this.disabledTools"]
        FilterDisabledTools -- "returns" --> AvailableToolsList
    end

    subgraph "Handler Module (e.g., src/handlers/repository.cjs)"
        direction LR
        RepoFuncsImport["const formatters = require('../formatters/repository.cjs')"]
        ListReposFunc["async listRepos(args, apiService)"]
        ListReposFunc -- "uses" --> apiService
        ListReposFunc -- "calls" --> FormatListRepos["formatters.formatListReposOutput(apiData)"]
        ListReposFunc -- "returns" --> FormattedMCPResponse1["MCP Content Block"]
    end

    subgraph "Formatter Module (e.g., src/formatters/repository.cjs)"
        direction LR
        FormatListReposFunc["formatListReposOutput(apiData)"]
        FormatListReposFunc -- "returns" --> FormattedMCPResponse2["MCP Content Block"]
    end

    GitHubMCPServer -- "imports" --> HandlerModule
    HandlerModule -- "imports" --> FormatterModule