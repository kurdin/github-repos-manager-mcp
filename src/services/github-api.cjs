const fs = require("node:fs").promises;
const path = require("node:path");

class GitHubAPIService {
  constructor(token) {
    this.token = token;
    if (!this.token) {
      console.error(
        "Error: GH_TOKEN environment variable is not set or empty after trim"
      );
      process.exit(1);
    }
  }

  async makeGraphQLRequest(query, variables = {}) {
    const url = `https://api.github.com/graphql`;
    const headers = {
      Authorization: `bearer ${this.token}`, // GraphQL uses 'bearer'
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "node-fetch",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `GitHub GraphQL API error: ${response.status} ${response.statusText}\n${errorData}`
        );
      }
      const responseJson = await response.json();
      if (responseJson.errors) {
        throw new Error(
          `GitHub GraphQL API errors: ${JSON.stringify(responseJson.errors)}`
        );
      }
      return responseJson.data;
    } catch (error) {
      console.error(`GraphQL request failed: ${error.message}`);
      throw error;
    }
  }

  async makeGitHubRequest(endpoint, options = {}) {
    console.error("makeGitHubRequest method entered.");
    const url = `https://api.github.com${endpoint}`;
    const headers = {
      Authorization: `token ${this.token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "node-fetch",
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 204) {
        return {
          success: true,
          message: `Operation successful (${response.status})`,
        };
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText}\n${errorData}`
        );
      }

      // For other successful responses, try to parse JSON
      const responseText = await response.text();
      if (responseText) {
        return JSON.parse(responseText);
      }
      return {
        success: true,
        message: `Operation successful (${response.status})`,
      };
    } catch (error) {
      console.error(`API request failed: ${error.message}`);
      throw error;
    }
  }

  async createOrUpdateFile(
    owner,
    repo,
    filePathInRepo,
    commitMessage,
    base64Content,
    sha, // Optional: Required for updates
    branch // Optional: Specify a branch
  ) {
    let endpoint = `/repos/${owner}/${repo}/contents/${filePathInRepo}`;
    console.error(
      `Attempting to create/update file at: ${endpoint} on branch: ${branch}`
    );

    const payload = {
      message: commitMessage,
      content: base64Content,
    };

    if (sha) {
      payload.sha = sha; // Required for updating an existing file
    }

    if (branch) {
      payload.branch = branch;
    }

    try {
      const result = await this.makeGitHubRequest(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      return result;
    } catch (error) {
      console.error(
        `Failed to create/update file '${filePathInRepo}': ${error.message}`
      );
      throw error;
    }
  }

  async deleteFileFromRepo(
    owner,
    repo,
    filePathInRepo,
    commitMessage,
    sha, // Required for deleting a file
    branch // Optional: Specify a branch
  ) {
    let endpoint = `/repos/${owner}/${repo}/contents/${filePathInRepo}`;
    console.error(
      `Attempting to delete file at: ${endpoint} on branch: ${branch}`
    );

    const payload = {
      message: commitMessage,
      sha: sha, // Required
    };

    if (branch) {
      payload.branch = branch;
    }

    try {
      const result = await this.makeGitHubRequest(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      return result; // GitHub API returns 200 with commit details or 204 if no content
    } catch (error) {
      console.error(
        `Failed to delete file '${filePathInRepo}': ${error.message}`
      );
      throw error;
    }
  }

  async getRepoContents(owner, repo, filePath, ref) {
    let endpoint = `/repos/${owner}/${repo}/contents/${filePath}`;
    if (ref) {
      endpoint += `?ref=${encodeURIComponent(ref)}`;
    }
    console.error(`Attempting to get contents for: ${endpoint}`);
    try {
      const result = await this.makeGitHubRequest(endpoint);
      return result;
    } catch (error) {
      // If it's a 404, it means the file/path doesn't exist, which can be normal.
      // The makeGitHubRequest method throws for non-ok statuses, so we catch here.
      if (error.message && error.message.includes("404")) {
        // console.error(`File or path not found (404): ${endpoint}`);
        // Re-throw as a more specific error or return a specific value if preferred by consumers
      } else {
        console.error(
          `Failed to get repo contents for '${filePath}': ${error.message}`
        );
      }
      throw error; // Re-throw to be handled by the caller
    }
  }

  async testAuthentication() {
    try {
      const user = await this.makeGitHubRequest("/user");
      console.error(`Authenticated as: ${user.login}`);
      return user;
    } catch (error) {
      console.error("Authentication failed:", error.message);
      throw error;
    }
  }

  // --- Pull Request Methods ---

  async createPullRequest(owner, repo, title, head, base, body) {
    const endpoint = `/repos/${owner}/${repo}/pulls`;
    const payload = { title, head, base };
    if (body) {
      payload.body = body;
    }
    return this.makeGitHubRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  }

  async updatePullRequest(owner, repo, pullNumber, data) {
    const endpoint = `/repos/${owner}/${repo}/pulls/${pullNumber}`;
    // Filter out undefined values from data to avoid sending them in the payload
    const payload = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    return this.makeGitHubRequest(endpoint, {
      method: "PATCH",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  }

  async getPullRequest(owner, repo, pullNumber) {
    const endpoint = `/repos/${owner}/${repo}/pulls/${pullNumber}`;
    return this.makeGitHubRequest(endpoint);
  }

  async listPullRequestReviews(
    owner,
    repo,
    pullNumber,
    per_page = 30,
    page = 1
  ) {
    const endpoint = `/repos/${owner}/${repo}/pulls/${pullNumber}/reviews?per_page=${per_page}&page=${page}`;
    return this.makeGitHubRequest(endpoint);
  }

  async createPullRequestReview(owner, repo, pullNumber, reviewData) {
    const endpoint = `/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`;
    // Filter out undefined values
    const payload = Object.fromEntries(
      Object.entries(reviewData).filter(([_, v]) => v !== undefined)
    );
    return this.makeGitHubRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  }

  async listPullRequestFiles(owner, repo, pullNumber, per_page = 30, page = 1) {
    const endpoint = `/repos/${owner}/${repo}/pulls/${pullNumber}/files?per_page=${per_page}&page=${page}`;
    return this.makeGitHubRequest(endpoint);
  }

  // --- Security & Access Management Methods ---

  async listDeployKeys(owner, repo, per_page = 30) {
    const endpoint = `/repos/${owner}/${repo}/keys?per_page=${per_page}`;
    return this.makeGitHubRequest(endpoint);
  }

  async createDeployKey(owner, repo, title, key, read_only = false) {
    const endpoint = `/repos/${owner}/${repo}/keys`;
    const payload = { title, key, read_only };
    return this.makeGitHubRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  }

  async deleteDeployKey(owner, repo, keyId) {
    const endpoint = `/repos/${owner}/${repo}/keys/${keyId}`;
    return this.makeGitHubRequest(endpoint, {
      method: "DELETE",
    });
  }

  async listWebhooks(owner, repo, per_page = 30) {
    const endpoint = `/repos/${owner}/${repo}/hooks?per_page=${per_page}`;
    return this.makeGitHubRequest(endpoint);
  }

  async createWebhook(owner, repo, config, events = ["push"], active = true) {
    const endpoint = `/repos/${owner}/${repo}/hooks`;
    const payload = { name: "web", active, events, config };
    return this.makeGitHubRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  }

  async updateWebhook(owner, repo, hookId, data) {
    const endpoint = `/repos/${owner}/${repo}/hooks/${hookId}`;
    // Filter out undefined values from data to avoid sending them in the payload
    const payload = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    return this.makeGitHubRequest(endpoint, {
      method: "PATCH",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  }

  async deleteWebhook(owner, repo, hookId) {
    const endpoint = `/repos/${owner}/${repo}/hooks/${hookId}`;
    return this.makeGitHubRequest(endpoint, {
      method: "DELETE",
    });
  }

  async listSecrets(owner, repo, per_page = 30) {
    const endpoint = `/repos/${owner}/${repo}/actions/secrets?per_page=${per_page}`;
    return this.makeGitHubRequest(endpoint);
  }

  async createOrUpdateSecret(owner, repo, secretName, encryptedValue, keyId) {
    const endpoint = `/repos/${owner}/${repo}/actions/secrets/${secretName}`;
    const payload = {
      encrypted_value: encryptedValue,
      key_id: keyId,
    };
    return this.makeGitHubRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  }

  async getRepoPublicKey(owner, repo) {
    const endpoint = `/repos/${owner}/${repo}/actions/secrets/public-key`;
    return this.makeGitHubRequest(endpoint);
  }

  // --- GitHub Actions & Workflows Methods ---

  async listWorkflows(owner, repo, per_page = 30, page = 1) {
    const endpoint = `/repos/${owner}/${repo}/actions/workflows?per_page=${per_page}&page=${page}`;
    return this.makeGitHubRequest(endpoint);
  }

  async listWorkflowRuns(owner, repo, workflow_id, params = {}) {
    // params can include: actor, branch, event, status, per_page, page, created, exclude_pull_requests, check_suite_id, head_sha
    const queryParams = new URLSearchParams();
    if (params.actor) queryParams.append("actor", params.actor);
    if (params.branch) queryParams.append("branch", params.branch);
    if (params.event) queryParams.append("event", params.event);
    if (params.status) queryParams.append("status", params.status);
    queryParams.append("per_page", params.per_page || 30);
    queryParams.append("page", params.page || 1);
    if (params.created) queryParams.append("created", params.created);
    if (params.exclude_pull_requests !== undefined)
      queryParams.append("exclude_pull_requests", params.exclude_pull_requests);
    if (params.check_suite_id)
      queryParams.append("check_suite_id", params.check_suite_id);
    if (params.head_sha) queryParams.append("head_sha", params.head_sha);

    const endpoint = `/repos/${owner}/${repo}/actions/workflows/${workflow_id}/runs?${queryParams.toString()}`;
    return this.makeGitHubRequest(endpoint);
  }

  async getWorkflowRunDetails(
    owner,
    repo,
    run_id,
    exclude_pull_requests = false
  ) {
    const queryParams = new URLSearchParams();
    if (exclude_pull_requests) {
      queryParams.append("exclude_pull_requests", "true");
    }
    const queryString = queryParams.toString();
    const endpoint = `/repos/${owner}/${repo}/actions/runs/${run_id}${
      queryString ? `?${queryString}` : ""
    }`;
    return this.makeGitHubRequest(endpoint);
  }

  async triggerWorkflow(owner, repo, workflow_id, ref, inputs = {}) {
    const endpoint = `/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`;
    const payload = { ref, inputs };
    return this.makeGitHubRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  }

  async downloadWorkflowArtifact(
    owner,
    repo,
    artifact_id,
    archive_format = "zip"
  ) {
    // This endpoint returns a 302 redirect to the artifact download URL.
    // makeGitHubRequest is not designed to return the Location header directly.
    // We need a slightly different approach here.
    const endpoint = `/repos/${owner}/${repo}/actions/artifacts/${artifact_id}/${archive_format}`;
    const url = `https://api.github.com${endpoint}`;
    const headers = {
      Authorization: `token ${this.token}`,
      Accept: "application/vnd.github.v3+json", // Though for 302, this might not be strictly necessary
      "User-Agent": "node-fetch",
    };

    try {
      const response = await fetch(url, {
        method: "GET", // GitHub docs specify GET, but it's a redirect
        headers,
        redirect: "manual", // Important: we want to handle the redirect ourselves to get the URL
      });

      if (response.status === 302) {
        const location = response.headers.get("Location");
        if (location) {
          return { download_url: location, success: true };
        }
        throw new Error(
          "Artifact download redirect (302) received, but no Location header found."
        );
      }

      // Handle other non-successful statuses if not a 302
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `GitHub API error for artifact download: ${response.status} ${response.statusText}\n${errorData}`
        );
      }
      // Should not happen if redirect is manual and status is 302
      return {
        success: false,
        message: `Unexpected response status: ${response.status}`,
      };
    } catch (error) {
      console.error(
        `Failed to get workflow artifact download URL for artifact ID '${artifact_id}': ${error.message}`
      );
      throw error;
    }
  }

  async cancelWorkflowRun(owner, repo, run_id) {
    const endpoint = `/repos/${owner}/${repo}/actions/runs/${run_id}/cancel`;
    // This API returns a 202 Accepted on success
    return this.makeGitHubRequest(endpoint, {
      method: "POST",
      // No body required for this POST request
    });
  }

  // --- Repository Analytics & Insights Methods ---

  async getRepositoryTrafficViews(owner, repo, per = "day") {
    // per can be 'day' or 'week'
    const endpoint = `/repos/${owner}/${repo}/traffic/views?per=${per}`;
    return this.makeGitHubRequest(endpoint);
  }

  async getRepositoryTrafficClones(owner, repo, per = "day") {
    // per can be 'day' or 'week'
    const endpoint = `/repos/${owner}/${repo}/traffic/clones?per=${per}`;
    return this.makeGitHubRequest(endpoint);
  }

  async getRepositoryPopularReferrers(owner, repo) {
    const endpoint = `/repos/${owner}/${repo}/traffic/popular/referrers`;
    return this.makeGitHubRequest(endpoint);
  }

  async getRepositoryPopularPaths(owner, repo) {
    const endpoint = `/repos/${owner}/${repo}/traffic/popular/paths`;
    return this.makeGitHubRequest(endpoint);
  }

  async listRepositoryTopics(owner, repo) {
    const endpoint = `/repos/${owner}/${repo}/topics`;
    return this.makeGitHubRequest(endpoint, {
      headers: { Accept: "application/vnd.github.mercy-preview+json" }, // Required for topics API
    });
  }

  async updateRepositoryTopics(owner, repo, names) {
    const endpoint = `/repos/${owner}/${repo}/topics`;
    const payload = { names };
    return this.makeGitHubRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.github.mercy-preview+json", // Required for topics API
      },
    });
  }

  async getRepositoryLanguages(owner, repo) {
    const endpoint = `/repos/${owner}/${repo}/languages`;
    return this.makeGitHubRequest(endpoint);
  }

  async listStargazers(owner, repo, per_page = 30, page = 1) {
    const endpoint = `/repos/${owner}/${repo}/stargazers?per_page=${per_page}&page=${page}`;
    // To get stargazer timestamps, a different media type is needed:
    // Accept: application/vnd.github.v3.star+json
    // For now, sticking to default to keep it simple, can be enhanced later.
    return this.makeGitHubRequest(endpoint);
  }

  async listWatchers(owner, repo, per_page = 30, page = 1) {
    // Watchers are subscribers in the API
    const endpoint = `/repos/${owner}/${repo}/subscribers?per_page=${per_page}&page=${page}`;
    return this.makeGitHubRequest(endpoint);
  }

  async listForks(owner, repo, sort = "newest", per_page = 30, page = 1) {
    const endpoint = `/repos/${owner}/${repo}/forks?sort=${sort}&per_page=${per_page}&page=${page}`;
    return this.makeGitHubRequest(endpoint);
  }

  // --- Search Methods ---

  async searchIssues(octokit, { query, sort, order, per_page = 30, page = 1 }) {
    const q = query; // query is already the full search string
    const params = { q, sort, order, per_page, page };
    // Filter out undefined params
    Object.keys(params).forEach(
      (key) => params[key] === undefined && delete params[key]
    );
    const endpoint = `/search/issues?${new URLSearchParams(params).toString()}`;
    return this.makeGitHubRequest(endpoint);
  }

  async searchCommits(
    octokit,
    { query, sort, order, per_page = 30, page = 1 }
  ) {
    const q = query;
    const params = { q, sort, order, per_page, page };
    Object.keys(params).forEach(
      (key) => params[key] === undefined && delete params[key]
    );
    // The 'Accept' header is crucial for commit search
    const endpoint = `/search/commits?${new URLSearchParams(
      params
    ).toString()}`;
    return this.makeGitHubRequest(endpoint, {
      headers: { Accept: "application/vnd.github.cloak-preview+json" },
    });
  }

  async searchCode(octokit, { query, sort, order, per_page = 30, page = 1 }) {
    const q = query;
    const params = { q, sort, order, per_page, page };
    Object.keys(params).forEach(
      (key) => params[key] === undefined && delete params[key]
    );
    const endpoint = `/search/code?${new URLSearchParams(params).toString()}`;
    return this.makeGitHubRequest(endpoint);
  }

  async searchUsers(octokit, { query, sort, order, per_page = 30, page = 1 }) {
    const q = query;
    const params = { q, sort, order, per_page, page };
    Object.keys(params).forEach(
      (key) => params[key] === undefined && delete params[key]
    );
    const endpoint = `/search/users?${new URLSearchParams(params).toString()}`;
    return this.makeGitHubRequest(endpoint);
  }

  async searchTopics(octokit, { query, sort, order, per_page = 30, page = 1 }) {
    // GitHub's topic search is actually a repository search filtered by topic.
    // The 'q' parameter should include 'topic:your-topic' or just 'your-topic'
    // and the API will infer.
    const q = query; // Assuming query is already formatted or just the topic names
    const params = { q, sort, order, per_page, page };
    Object.keys(params).forEach(
      (key) => params[key] === undefined && delete params[key]
    );
    const endpoint = `/search/repositories?${new URLSearchParams(
      params
    ).toString()}`;
    // The 'Accept' header might be needed for topic search, using mercy-preview as it's common for topics.
    return this.makeGitHubRequest(endpoint, {
      headers: { Accept: "application/vnd.github.mercy-preview+json" },
    });
  }

  // --- Organization Management Methods ---

  async listOrgRepositories(octokit, params) {
    // octokit is not used here as we are using the internal makeGitHubRequest
    const {
      org,
      type = "all",
      sort = "created",
      direction,
      per_page = 30,
      page = 1,
    } = params;
    const queryParams = new URLSearchParams({ type, sort, per_page, page });
    if (direction) {
      queryParams.append("direction", direction);
    }
    const endpoint = `/orgs/${org}/repos?${queryParams.toString()}`;
    return this.makeGitHubRequest(endpoint);
  }

  async listOrgMembers(octokit, params) {
    const {
      org,
      filter = "all",
      role = "all",
      per_page = 30,
      page = 1,
    } = params;
    const queryParams = new URLSearchParams({ filter, role, per_page, page });
    const endpoint = `/orgs/${org}/members?${queryParams.toString()}`;
    return this.makeGitHubRequest(endpoint);
  }

  async getOrgDetails(octokit, org) {
    const endpoint = `/orgs/${org}`;
    return this.makeGitHubRequest(endpoint);
  }

  async listOrgTeams(octokit, params) {
    const { org, per_page = 30, page = 1 } = params;
    const queryParams = new URLSearchParams({ per_page, page });
    const endpoint = `/orgs/${org}/teams?${queryParams.toString()}`;
    return this.makeGitHubRequest(endpoint);
  }

  async listTeamMembers(octokit, params) {
    const { org, team_slug, role = "all", per_page = 30, page = 1 } = params;
    const queryParams = new URLSearchParams({ role, per_page, page });
    const endpoint = `/orgs/${org}/teams/${team_slug}/members?${queryParams.toString()}`;
    return this.makeGitHubRequest(endpoint);
  }

  async addOrUpdateTeamRepoPermissions(octokit, params) {
    const { org, team_slug, owner, repo, permission } = params;
    // Note: The 'owner' in the URL is the org, the 'owner' in the payload is the repo owner (can be different for forks)
    // However, for typical org repos, org and owner (of repo) are the same.
    // The API endpoint is /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}
    // but the Octokit documentation and common usage imply owner/repo for the repository itself.
    // Let's assume 'owner' param refers to the repository's owner, which is often the 'org'.
    const endpoint = `/orgs/${org}/teams/${team_slug}/repos/${owner}/${repo}`;
    const payload = { permission }; // e.g., 'push', 'pull', 'admin'
    return this.makeGitHubRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  }

  async removeTeamRepo(octokit, params) {
    const { org, team_slug, owner, repo } = params;
    const endpoint = `/orgs/${org}/teams/${team_slug}/repos/${owner}/${repo}`;
    return this.makeGitHubRequest(endpoint, {
      method: "DELETE",
    });
  }

  // --- Projects V2 (GraphQL) Methods ---

  async listProjectsV2({
    owner,
    repo,
    per_page = 10,
    state = "open",
    afterCursor = null,
  }) {
    // If 'repo' is provided, we assume listing projects for that specific repository.
    // If only 'owner' is provided, it could be for an organization or a user.
    // The query needs to be adapted based on whether 'owner' is a user or org,
    // and whether 'repo' is specified.
    // This is a simplified placeholder.
    let ownerIdQuery = `user(login: "${owner}")`;
    if (repo) {
      // Assuming owner is a user if repo is specified for simplicity here
      ownerIdQuery = `repository(owner: "${owner}", name: "${repo}")`;
    } else {
      // Could also be organization(login: "${owner}") - needs logic to determine
    }

    const query = `
      query ListProjects($ownerLogin: String!, $repoName: String, $first: Int!, $states: [ProjectV2State!], $after: String) {
        owner: user(login: $ownerLogin) { # Or organization(login: $ownerLogin)
          ... on ProjectV2Owner {
            projectsV2(first: $first, states: $states, after: $after, orderBy: {field: UPDATED_AT, direction: DESC}) {
              nodes {
                id
                title
                number
                url
                state
                closedAt
                createdAt
                updatedAt
                readme
                public
                creator { login }
                owner { __typename id }
              }
              pageInfo {
                endCursor
                hasNextPage
              }
              totalCount
            }
          }
        }
        # If repo specific:
        # repository(owner: $ownerLogin, name: $repoName) {
        #   projectsV2(first: $first, states: $states, after: $after, orderBy: {field: UPDATED_AT, direction: DESC}) {
        #     # ... same fields as above
        #   }
        # }
      }
    `;
    // This is a very basic placeholder. Actual query depends on whether it's user/org projects
    // or repository-specific projects.
    console.warn(
      "listProjectsV2 is a placeholder and needs a more robust query based on owner type and repo presence."
    );
    // return this.makeGraphQLRequest(query, { ownerLogin: owner, repoName: repo, first: per_page, states: [state.toUpperCase()], after: afterCursor });
    return {
      status: "pending",
      message: "listProjectsV2 GraphQL not fully implemented.",
    };
  }

  async createProjectV2({ owner, title, body, repoName }) {
    // owner here is the node ID of the user or organization that will own the project.
    // First, need to get the owner's Node ID (user or organization)
    // This is a simplified placeholder.
    const getOwnerIdQuery = `
      query GetOwnerId($login: String!) {
        user(login: $login) { id }
        organization(login: $login) { id }
      }
    `;
    // const ownerIdData = await this.makeGraphQLRequest(getOwnerIdQuery, { login: owner });
    // const ownerNodeId = ownerIdData.user ? ownerIdData.user.id : ownerIdData.organization.id;
    // if (!ownerNodeId) throw new Error(`Could not find user or organization with login: ${owner}`);

    const mutation = `
      mutation CreateProject($ownerId: ID!, $title: String!, $repositoryId: ID) {
        createProjectV2(input: {ownerId: $ownerId, title: $title, repositoryId: $repositoryId}) {
          projectV2 {
            id
            title
            number
            url
          }
        }
      }
    `;
    // If repoName is provided, need to get repository's Node ID first.
    // This is a placeholder and needs more logic.
    console.warn(
      "createProjectV2 is a placeholder and needs owner/repo Node ID fetching."
    );
    // return this.makeGraphQLRequest(mutation, { ownerId: "USER_OR_ORG_NODE_ID", title, repositoryId: "REPO_NODE_ID_IF_ANY" });
    return {
      status: "pending",
      message: "createProjectV2 GraphQL not fully implemented.",
    };
  }

  async listProjectFieldsV2({ project_id, per_page = 30, afterCursor = null }) {
    // Corresponds to list_project_columns
    const query = `
      query ListProjectFields($projectId: ID!, $first: Int!, $after: String) {
        node(id: $projectId) {
          ... on ProjectV2 {
            fields(first: $first, after: $after) {
              nodes {
                id
                name
                dataType # TEXT, NUMBER, DATE, SINGLE_SELECT, ITERATION
                ... on ProjectV2SingleSelectField {
                  options { id name }
                }
                # ... other field types as needed
              }
              pageInfo {
                endCursor
                hasNextPage
              }
              totalCount
            }
          }
        }
      }
    `;
    // return this.makeGraphQLRequest(query, { projectId: project_id, first: per_page, after: afterCursor });
    return {
      status: "pending",
      message: "listProjectFieldsV2 GraphQL not fully implemented.",
    };
  }

  async listProjectItemsV2({ project_id, per_page = 30, afterCursor = null }) {
    // Corresponds to list_project_cards
    const query = `
      query ListProjectItems($projectId: ID!, $first: Int!, $after: String) {
        node(id: $projectId) {
          ... on ProjectV2 {
            items(first: $first, after: $after) {
              nodes {
                id
                type # DRAFT_ISSUE, ISSUE, PULL_REQUEST
                createdAt
                updatedAt
                content {
                  ... on DraftIssue { title body }
                  ... on Issue { title number url repository { nameWithOwner } assignees(first:5){nodes{login}} labels(first:5){nodes{name color}} }
                  ... on PullRequest { title number url repository {ครื่องWithOwner } assignees(first:5){nodes{login}} labels(first:5){nodes{name color}} }
                }
                # To get field values (like status):
                # fieldValues(first: 10) {
                #   nodes {
                #     ... on ProjectV2ItemFieldSingleSelectValue {
                #       name # Status name
                #       optionId # Status option ID
                #       field { ... on ProjectV2SingleSelectField { name id } }
                #     }
                #   }
                # }
              }
              pageInfo {
                endCursor
                hasNextPage
              }
              totalCount
            }
          }
        }
      }
    `;
    // return this.makeGraphQLRequest(query, { projectId: project_id, first: per_page, after: afterCursor });
    return {
      status: "pending",
      message: "listProjectItemsV2 GraphQL not fully implemented.",
    };
  }

  async createProjectItemV2({ project_id, content_id, note }) {
    // content_id is the Node ID of an existing Issue or PullRequest
    // note is for creating a new DraftIssue
    let mutation;
    let variables;

    if (content_id) {
      mutation = `
        mutation AddItemToProject($projectId: ID!, $contentId: ID!) {
          addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
            item {
              id
              type
            }
          }
        }
      `;
      variables = { projectId: project_id, contentId: content_id };
    } else if (note) {
      mutation = `
        mutation AddDraftIssueToProject($projectId: ID!, $title: String!) { # Assuming note is the title for simplicity
          addProjectV2DraftIssue(input: {projectId: $projectId, title: $title}) {
            projectItem {
              id
              type
              content { ... on DraftIssue { title }}
            }
          }
        }
      `;
      variables = { projectId: project_id, title: note }; // Simplified, might need body too
    } else {
      throw new Error(
        "Either content_id (for Issue/PR) or note (for DraftIssue) must be provided."
      );
    }
    // return this.makeGraphQLRequest(mutation, variables);
    return {
      status: "pending",
      message: "createProjectItemV2 GraphQL not fully implemented.",
    };
  }

  async updateProjectItemFieldV2({ project_id, item_id, field_id, option_id }) {
    // Corresponds to move_project_card. Updates a single select field (like Status).
    // project_id: Project's Node ID
    // item_id: Project Item's Node ID
    // field_id: Node ID of the Single Select Field (e.g., "Status" field)
    // option_id: Node ID of the new Option for that field (e.g., "Done" option for "Status" field)
    const mutation = `
      mutation UpdateProjectItemField($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
        updateProjectV2ItemFieldValue(
          input: {
            projectId: $projectId
            itemId: $itemId
            fieldId: $fieldId
            value: {
              singleSelectOptionId: $optionId
            }
          }
        ) {
          projectV2Item {
            id
            # You can query updated field values here if needed
          }
        }
      }
    `;
    // return this.makeGraphQLRequest(mutation, { projectId: project_id, itemId: item_id, fieldId: field_id, optionId: option_id });
    return {
      status: "pending",
      message: "updateProjectItemFieldV2 GraphQL not fully implemented.",
    };
  }

  // --- Placeholder Methods for Advanced Features ---

  async runCodeQualityChecks(owner, repo, tool_name, config_path) {
    console.log(
      "Placeholder: GitHubAPIService.runCodeQualityChecks called with:",
      owner,
      repo,
      tool_name,
      config_path
    );
    // In a real implementation, this might involve:
    // - Triggering a GitHub Action that runs linters/scanners.
    // - Fetching results from a third-party code quality service API.
    // - Analyzing repository contents directly if the tool can be run locally/on-the-fly.
    return Promise.resolve({
      status: "pending_implementation",
      message: "Code quality check feature not yet implemented.",
      details: { tool_name, config_path },
    });
  }

  async manageCustomDashboard(owner, repo, dashboard_id, action, settings) {
    console.log(
      "Placeholder: GitHubAPIService.manageCustomDashboard called with:",
      owner,
      repo,
      dashboard_id,
      action,
      settings
    );
    // This would likely involve interacting with a custom datastore or a
    // visualization service API, rather than directly with GitHub's primary API.
    // Or, it could involve fetching various GitHub stats and composing them.
    return Promise.resolve({
      status: "pending_implementation",
      message: "Custom dashboard feature not yet implemented.",
      details: { dashboard_id, action },
    });
  }

  async generateAutomatedReport(owner, repo, report_type, output_format) {
    console.log(
      "Placeholder: GitHubAPIService.generateAutomatedReport called with:",
      owner,
      repo,
      report_type,
      output_format
    );
    // This would involve:
    // - Fetching various data points from GitHub (issues, PRs, commits, traffic).
    // - Aggregating and formatting this data into the specified report_type and output_format.
    return Promise.resolve({
      status: "pending_implementation",
      message: "Automated reporting feature not yet implemented.",
      details: { report_type, output_format },
    });
  }

  async manageNotifications(action, thread_id, options = {}) {
    console.log(
      "Placeholder: GitHubAPIService.manageNotifications called with:",
      action,
      thread_id,
      options
    );
    // This would use GitHub's Notifications API.
    // Example for listing notifications:
    // const endpoint = `/notifications?all=${options.all}&participating=${options.participating}`;
    // Example for marking a thread as read:
    // const endpoint = `/notifications/threads/${thread_id}`; method: 'PATCH'
    return Promise.resolve({
      status: "pending_implementation",
      message: "Notification management feature not yet implemented.",
      details: { action, thread_id },
    });
  }

  async manageRelease(owner, repo, action, releaseData = {}) {
    console.log(
      "Placeholder: GitHubAPIService.manageRelease called with:",
      owner,
      repo,
      action,
      releaseData
    );
    // This would use GitHub's Releases API.
    // Examples:
    // List: GET /repos/{owner}/{repo}/releases
    // Create: POST /repos/{owner}/{repo}/releases with body: { tag_name, target_commitish, name, body, draft, prerelease }
    // Get: GET /repos/{owner}/{repo}/releases/{release_id} or /tags/{tag_name}
    // Update: PATCH /repos/{owner}/{repo}/releases/{release_id}
    // Delete: DELETE /repos/{owner}/{repo}/releases/{release_id}
    // Upload Asset: POST to release.upload_url
    return Promise.resolve({
      status: "pending_implementation",
      message: "Release management feature not yet implemented.",
      details: {
        action,
        release_id: releaseData.release_id,
        tag_name: releaseData.tag_name,
      },
    });
  }

  async analyzeDependencies(owner, repo, report_type, depth) {
    console.log(
      "Placeholder: GitHubAPIService.analyzeDependencies called with:",
      owner,
      repo,
      report_type,
      depth
    );
    // This could involve:
    // - Using GitHub's Dependency Graph API (GraphQL).
    // - Fetching dependency files (e.g., package.json, pom.xml) and analyzing them.
    // - Integrating with GitHub Advanced Security features like Dependabot alerts API.
    return Promise.resolve({
      status: "pending_implementation",
      message: "Dependency analysis feature not yet implemented.",
      details: { report_type, depth },
    });
  }
}

module.exports = GitHubAPIService;
