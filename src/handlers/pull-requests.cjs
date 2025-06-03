// src/handlers/pull-requests.cjs

const pullRequestFormatters = require("../formatters/pull-requests.cjs");

async function listPRs(args, apiService) {
  const { owner, repo, state = "open", per_page = 10 } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for listPRs. Please provide them in arguments or ensure a default is set."
    );
  }

  const params = new URLSearchParams({
    state,
    per_page: per_page.toString(),
    sort: "updated",
    direction: "desc",
  });

  const prs = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/pulls?${params.toString()}`
  );
  return pullRequestFormatters.formatListPRsOutput(prs, owner, repo, state);
}

module.exports = {
  listPRs,
};
