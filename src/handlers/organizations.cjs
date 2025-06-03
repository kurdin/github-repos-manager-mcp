const githubApi = require("../services/github-api.cjs");
const { handleError, logError } = require("../utils/shared-utils.cjs");
const { validateRequiredParams } = require("../utils/validators.cjs");

/**
 * @typedef {import('../services/github-api').GitHubError} GitHubError
 * @typedef {import('../services/github-api').Octokit} Octokit
 * @typedef {import('../services/github-api').OctokitResponse} OctokitResponse
 */

/**
 * Lists repositories for an organization.
 *
 * @param {Octokit} octokit - The Octokit instance.
 * @param {object} params - The parameters for listing organization repositories.
 * @param {string} params.org - The organization name.
 * @param {string} [params.type] - The type of repositories to list. Can be one of: all, public, private, forks, sources, member. Default: all.
 * @param {string} [params.sort] - The property to sort the results by. Can be one of: created, updated, pushed, full_name. Default: created.
 * @param {string} [params.direction] - The direction to sort the results by. Can be one of: asc, desc. Default: when using full_name: asc, otherwise desc.
 * @param {number} [params.per_page=30] - The number of results per page (max 100).
 * @param {number} [params.page=1] - The page number of the results to fetch.
 * @returns {Promise<OctokitResponse<any> | { error: string, details?: any }>} The list of organization repositories or an error object.
 */
async function listOrgRepos(octokit, params) {
  try {
    validateRequiredParams(params, ["org"]);
    return await githubApi.listOrgRepositories(octokit, params);
  } catch (error) {
    logError(error, "Error in listOrgRepos handler");
    return handleError(error, "Failed to list organization repositories.");
  }
}

/**
 * Lists members of an organization.
 *
 * @param {Octokit} octokit - The Octokit instance.
 * @param {object} params - The parameters for listing organization members.
 * @param {string} params.org - The organization name.
 * @param {string} [params.filter] - Filter members returned in the list. Can be one of: 2fa_disabled, all. Default: all.
 * @param {string} [params.role] - Filter members returned by their role. Can be one of: all, admin, member. Default: all.
 * @param {number} [params.per_page=30] - The number of results per page (max 100).
 * @param {number} [params.page=1] - The page number of the results to fetch.
 * @returns {Promise<OctokitResponse<any> | { error: string, details?: any }>} The list of organization members or an error object.
 */
async function listOrgMembers(octokit, params) {
  try {
    validateRequiredParams(params, ["org"]);
    return await githubApi.listOrgMembers(octokit, params);
  } catch (error) {
    logError(error, "Error in listOrgMembers handler");
    return handleError(error, "Failed to list organization members.");
  }
}

/**
 * Gets information about an organization.
 *
 * @param {Octokit} octokit - The Octokit instance.
 * @param {object} params - The parameters for getting organization information.
 * @param {string} params.org - The organization name.
 * @returns {Promise<OctokitResponse<any> | { error: string, details?: any }>} The organization information or an error object.
 */
async function getOrgInfo(octokit, params) {
  try {
    validateRequiredParams(params, ["org"]);
    return await githubApi.getOrgDetails(octokit, params.org);
  } catch (error) {
    logError(error, "Error in getOrgInfo handler");
    return handleError(error, "Failed to get organization information.");
  }
}

/**
 * Lists teams in an organization.
 *
 * @param {Octokit} octokit - The Octokit instance.
 * @param {object} params - The parameters for listing organization teams.
 * @param {string} params.org - The organization name.
 * @param {number} [params.per_page=30] - The number of results per page (max 100).
 * @param {number} [params.page=1] - The page number of the results to fetch.
 * @returns {Promise<OctokitResponse<any> | { error: string, details?: any }>} The list of organization teams or an error object.
 */
async function listOrgTeams(octokit, params) {
  try {
    validateRequiredParams(params, ["org"]);
    return await githubApi.listOrgTeams(octokit, params);
  } catch (error) {
    logError(error, "Error in listOrgTeams handler");
    return handleError(error, "Failed to list organization teams.");
  }
}

/**
 * Gets members of a team.
 *
 * @param {Octokit} octokit - The Octokit instance.
 * @param {object} params - The parameters for getting team members.
 * @param {string} params.org - The organization name.
 * @param {string} params.team_slug - The slug of the team name.
 * @param {string} [params.role] - Filters members returned by their role in the team. Can be one of: member, maintainer, all. Default: all.
 * @param {number} [params.per_page=30] - The number of results per page (max 100).
 * @param {number} [params.page=1] - The page number of the results to fetch.
 * @returns {Promise<OctokitResponse<any> | { error: string, details?: any }>} The list of team members or an error object.
 */
async function getTeamMembers(octokit, params) {
  try {
    validateRequiredParams(params, ["org", "team_slug"]);
    return await githubApi.listTeamMembers(octokit, params);
  } catch (error) {
    logError(error, "Error in getTeamMembers handler");
    return handleError(error, "Failed to get team members.");
  }
}

/**
 * Manages repository access for a team.
 * This can add, update, or remove a team's access to a repository.
 *
 * @param {Octokit} octokit - The Octokit instance.
 * @param {object} params - The parameters for managing team repository access.
 * @param {string} params.org - The organization name.
 * @param {string} params.team_slug - The slug of the team name.
 * @param {string} params.owner - The owner of the repository.
 * @param {string} params.repo - The name of the repository.
 * @param {string} [params.permission] - The permission to grant to the team for this repository.
 *                                      Can be one of: pull, push, admin, maintain, triage.
 *                                      If not provided, the team's access to the repository is removed.
 * @returns {Promise<OctokitResponse<any> | { error: string, details?: any }>} The result of the operation or an error object.
 */
async function manageTeamRepos(octokit, params) {
  try {
    validateRequiredParams(params, ["org", "team_slug", "owner", "repo"]);
    const { org, team_slug, owner, repo, permission } = params;

    if (permission) {
      // Add or update team repository permissions
      return await githubApi.addOrUpdateTeamRepoPermissions(octokit, {
        org,
        team_slug,
        owner,
        repo,
        permission,
      });
    } else {
      // Remove team repository access
      return await githubApi.removeTeamRepo(octokit, {
        org,
        team_slug,
        owner,
        repo,
      });
    }
  } catch (error) {
    logError(error, "Error in manageTeamRepos handler");
    return handleError(error, "Failed to manage team repository access.");
  }
}

module.exports = {
  listOrgRepos,
  listOrgMembers,
  getOrgInfo,
  listOrgTeams,
  getTeamMembers,
  manageTeamRepos,
};
