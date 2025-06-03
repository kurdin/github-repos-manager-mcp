// src/handlers/repository.cjs

const repositoryFormatters = require("../formatters/repository.cjs");

async function listRepos(args, apiService) {
  // owner/repo from args are not typically used for /user/repos, but included for consistency if needed elsewhere
  const { per_page = 10, visibility = "all", sort = "updated" } = args;
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
  const { owner, repo } = args; // owner/repo are essential here
  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for getRepoInfo. Please provide them in arguments or ensure a default is set."
    );
  }
  const repoData = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}`
  );
  return repositoryFormatters.formatGetRepoInfoOutput(repoData);
}

async function searchRepos(args, apiService) {
  const { query, per_page = 10, sort = "stars" } = args;
  if (!query) {
    throw new Error("A search query is required for searchRepos.");
  }
  const params = new URLSearchParams({
    q: query,
    per_page: per_page.toString(),
    sort,
    order: "desc",
  });

  const results = await apiService.makeGitHubRequest(
    `/search/repositories?${params.toString()}` // .toString() for URLSearchParams
  );
  return repositoryFormatters.formatSearchReposOutput(results, query);
}

async function getRepoContents(args, apiService) {
  const { owner, repo, path = "", ref } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for getRepoContents. Please provide them in arguments or ensure a default is set."
    );
  }

  let endpoint = `/repos/${owner}/${repo}/contents/${path.replace(/^\//, "")}`; // Ensure path doesn't start with /

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
  const { owner, repo, affiliation = "all", permission, per_page = 30 } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for listRepoCollaborators. Please provide them in arguments or ensure a default is set."
    );
  }

  const params = new URLSearchParams({
    affiliation,
    per_page: per_page.toString(),
  });
  if (permission) {
    params.append("permission", permission);
  }

  const collaborators = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/collaborators?${params.toString()}` // .toString() for URLSearchParams
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
