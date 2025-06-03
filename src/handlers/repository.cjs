// src/handlers/repository.cjs

const repositoryFormatters = require("../formatters/repository.cjs");
const { validateRequired } = require("../utils/error-handler.cjs");

async function listRepos(args = {}, apiService) {
  // Provide safe defaults and validate parameters
  const { per_page = 10, visibility = "all", sort = "updated" } = args;
  
  // Validate per_page is reasonable
  if (per_page < 1 || per_page > 100) {
    throw new Error('per_page must be between 1 and 100');
  }
  
  // Validate visibility
  const validVisibility = ["all", "public", "private"];
  if (!validVisibility.includes(visibility)) {
    throw new Error(`visibility must be one of: ${validVisibility.join(', ')}`);
  }
  
  // Validate sort
  const validSort = ["created", "updated", "pushed", "full_name"];
  if (!validSort.includes(sort)) {
    throw new Error(`sort must be one of: ${validSort.join(', ')}`);
  }
  
  const params = new URLSearchParams({
    per_page: per_page.toString(),
    sort,
    direction: "desc",
  });

  if (visibility !== "all") {
    params.append("visibility", visibility);
  }

  const reposData = await apiService.makeGitHubRequest(
    `/user/repos?${params.toString()}`
  );
  
  return repositoryFormatters.formatListReposOutput(reposData);
}

async function getRepoInfo(args, apiService) {
  // Validate required parameters
  validateRequired(args, ['owner', 'repo'], 'getRepoInfo');
  
  const { owner, repo } = args;
  
  const repoData = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}`
  );
  return repositoryFormatters.formatGetRepoInfoOutput(repoData);
}

async function searchRepos(args, apiService) {
  // Validate required parameters
  validateRequired(args, ['query'], 'searchRepos');
  
  const { query, per_page = 10, sort = "stars" } = args;
  
  // Validate parameters
  if (per_page < 1 || per_page > 100) {
    throw new Error('per_page must be between 1 and 100');
  }
  
  const validSort = ["stars", "forks", "help-wanted-issues", "updated"];
  if (!validSort.includes(sort)) {
    throw new Error(`sort must be one of: ${validSort.join(', ')}`);
  }
  
  const params = new URLSearchParams({
    q: query,
    per_page: per_page.toString(),
    sort,
    order: "desc",
  });

  const results = await apiService.makeGitHubRequest(
    `/search/repositories?${params.toString()}`
  );
  return repositoryFormatters.formatSearchReposOutput(results, query);
}

async function getRepoContents(args, apiService) {
  // Validate required parameters
  validateRequired(args, ['owner', 'repo'], 'getRepoContents');
  
  const { owner, repo, path = "", ref } = args;
  
  let endpoint = `/repos/${owner}/${repo}/contents/${path.replace(/^\//, "")}`;

  if (ref) {
    endpoint += `?ref=${encodeURIComponent(ref)}`;
  }

  const contents = await apiService.makeGitHubRequest(endpoint);
  return repositoryFormatters.formatGetRepoContentsOutput(
    contents,
    owner,
    repo,
    path
  );
}

async function listRepoCollaborators(args, apiService) {
  // Validate required parameters
  validateRequired(args, ['owner', 'repo'], 'listRepoCollaborators');
  
  const { owner, repo, affiliation = "all", permission, per_page = 30 } = args;
  
  // Validate parameters
  if (per_page < 1 || per_page > 100) {
    throw new Error('per_page must be between 1 and 100');
  }

  const params = new URLSearchParams({
    affiliation,
    per_page: per_page.toString(),
  });
  if (permission) {
    params.append("permission", permission);
  }

  const collaborators = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/collaborators?${params.toString()}`
  );
  return repositoryFormatters.formatListRepoCollaboratorsOutput(
    collaborators,
    owner,
    repo
  );
}

module.exports = {
  listRepos,
  getRepoInfo,
  searchRepos,
  getRepoContents,
  listRepoCollaborators,
};
