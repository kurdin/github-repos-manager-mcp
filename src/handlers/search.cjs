const githubApiService = require("../services/github-api.cjs");
const { logError, logInfo } = require("../utils/shared-utils.cjs");

/**
 * @typedef {import('../services/github-api.cjs').GitHubAuthenticatedOctokit} GitHubAuthenticatedOctokit
 * @typedef {import('../services/github-api.cjs').GitHubRepoInfo} GitHubRepoInfo
 */

/**
 * Handler for searching issues.
 * @param {GitHubAuthenticatedOctokit} octokit - The authenticated Octokit instance.
 * @param {GitHubRepoInfo} defaultRepo - Default repository information.
 * @param {object} args - Tool arguments.
 * @param {string} args.query - The search query.
 * @param {string} [args.sort] - Sort field (e.g., 'comments', 'created', 'updated').
 * @param {string} [args.order] - Sort order ('asc' or 'desc').
 * @param {number} [args.per_page=30] - Results per page.
 * @param {number} [args.page=1] - Page number.
 * @returns {Promise<object>} The search results.
 */
async function search_issues(octokit, defaultRepo, args) {
  try {
    logInfo(`Searching issues with query: ${args.query}`);
    const results = await githubApiService.searchIssues(octokit, args);
    return results;
  } catch (error) {
    logError(`Error in search_issues: ${error.message}`, error);
    throw error;
  }
}

/**
 * Handler for searching commits.
 * @param {GitHubAuthenticatedOctokit} octokit - The authenticated Octokit instance.
 * @param {GitHubRepoInfo} defaultRepo - Default repository information.
 * @param {object} args - Tool arguments.
 * @param {string} args.query - The search query.
 * @param {string} [args.sort] - Sort field (e.g., 'author-date', 'committer-date').
 * @param {string} [args.order] - Sort order ('asc' or 'desc').
 * @param {number} [args.per_page=30] - Results per page.
 * @param {number} [args.page=1] - Page number.
 * @returns {Promise<object>} The search results.
 */
async function search_commits(octokit, defaultRepo, args) {
  try {
    logInfo(`Searching commits with query: ${args.query}`);
    const results = await githubApiService.searchCommits(octokit, args);
    return results;
  } catch (error) {
    logError(`Error in search_commits: ${error.message}`, error);
    throw error;
  }
}

/**
 * Handler for searching code.
 * @param {GitHubAuthenticatedOctokit} octokit - The authenticated Octokit instance.
 * @param {GitHubRepoInfo} defaultRepo - Default repository information.
 * @param {object} args - Tool arguments.
 * @param {string} args.query - The search query.
 * @param {string} [args.sort] - Sort field (e.g., 'indexed').
 * @param {string} [args.order] - Sort order ('asc' or 'desc').
 * @param {number} [args.per_page=30] - Results per page.
 * @param {number} [args.page=1] - Page number.
 * @returns {Promise<object>} The search results.
 */
async function search_code(octokit, defaultRepo, args) {
  try {
    logInfo(`Searching code with query: ${args.query}`);
    const results = await githubApiService.searchCode(octokit, args);
    return results;
  } catch (error) {
    logError(`Error in search_code: ${error.message}`, error);
    throw error;
  }
}

/**
 * Handler for searching users.
 * @param {GitHubAuthenticatedOctokit} octokit - The authenticated Octokit instance.
 * @param {GitHubRepoInfo} defaultRepo - Default repository information.
 * @param {object} args - Tool arguments.
 * @param {string} args.query - The search query.
 * @param {string} [args.sort] - Sort field (e.g., 'followers', 'repositories', 'joined').
 * @param {string} [args.order] - Sort order ('asc' or 'desc').
 * @param {number} [args.per_page=30] - Results per page.
 * @param {number} [args.page=1] - Page number.
 * @returns {Promise<object>} The search results.
 */
async function search_users(octokit, defaultRepo, args) {
  try {
    logInfo(`Searching users with query: ${args.query}`);
    const results = await githubApiService.searchUsers(octokit, args);
    return results;
  } catch (error) {
    logError(`Error in search_users: ${error.message}`, error);
    throw error;
  }
}

/**
 * Handler for searching topics.
 * @param {GitHubAuthenticatedOctokit} octokit - The authenticated Octokit instance.
 * @param {GitHubRepoInfo} defaultRepo - Default repository information.
 * @param {object} args - Tool arguments.
 * @param {string} args.query - The search query.
 * @param {string} [args.sort] - Sort field (e.g., 'stars', 'forks', 'updated').
 * @param {string} [args.order] - Sort order ('asc' or 'desc').
 * @param {number} [args.per_page=30] - Results per page.
 * @param {number} [args.page=1] - Page number.
 * @returns {Promise<object>} The search results.
 */
async function search_topics(octokit, defaultRepo, args) {
  try {
    logInfo(`Searching topics with query: ${args.query}`);
    // Note: GitHub API for topics search is actually a search for repositories by topic.
    // The endpoint is search/repositories with a q parameter like "topic:your-topic"
    // We will adapt the searchRepositories function or create a specific one if needed.
    // For now, assuming a direct githubApiService.searchTopics exists or will be created.
    const results = await githubApiService.searchTopics(octokit, args);
    return results;
  } catch (error) {
    logError(`Error in search_topics: ${error.message}`, error);
    throw error;
  }
}

module.exports = {
  search_issues,
  search_commits,
  search_code,
  search_users,
  search_topics,
};
