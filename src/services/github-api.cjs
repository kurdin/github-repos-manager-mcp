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
      // Check if file exists first to get SHA
      let sha = null;
      try {
        const existingFile = await this.makeGitHubRequest(endpoint);
        sha = existingFile.sha;
      } catch (error) {
        // File doesn't exist, that's fine for creation
      }

      const payload = {
        message: commitMessage,
        content: base64Content,
      };

      if (sha) {
        payload.sha = sha;
      }

      const result = await this.makeGitHubRequest(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      return result;
    } catch (error) {
      console.error(`Failed to upload file: ${error.message}`);
      throw error;
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
}

module.exports = GitHubAPIService;
