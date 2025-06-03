// src/handlers/branches-commits.cjs

const branchCommitFormatters = require("../formatters/branches-commits.cjs");

async function listBranches(args, apiService) {
  const { owner, repo, protected_only = false, per_page = 30 } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for listBranches. Please provide them in arguments or ensure a default is set."
    );
  }

  const params = new URLSearchParams({
    per_page: per_page.toString(),
  });

  if (protected_only) {
    params.append("protected", "true");
  }

  const branches = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/branches?${params.toString()}`
  );
  return branchCommitFormatters.formatListBranchesOutput(branches, owner, repo);
}

async function createBranch(args, apiService) {
  const { owner, repo, branch_name, source_branch = "main", source_sha } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for createBranch. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!branch_name) {
    throw new Error("branch_name is required for createBranch.");
  }

  let shaToUse = source_sha;

  if (!shaToUse) {
    try {
      const sourceBranchData = await apiService.makeGitHubRequest(
        `/repos/${owner}/${repo}/branches/${encodeURIComponent(source_branch)}`
      );
      shaToUse = sourceBranchData.commit.sha;
    } catch (error) {
      throw new Error(
        `Failed to get SHA for source branch '${source_branch}': ${error.message}`
      );
    }
  }
  if (!shaToUse) {
    // Double check after attempting to fetch
    throw new Error(
      `Could not determine source SHA for new branch '${branch_name}' from source '${source_branch}'.`
    );
  }

  const branchData = {
    ref: `refs/heads/${branch_name}`,
    sha: shaToUse,
  };

  const newBranch = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/git/refs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(branchData),
    }
  );
  return branchCommitFormatters.formatCreateBranchOutput(
    newBranch,
    branch_name,
    owner,
    repo,
    source_sha,
    source_branch
  );
}

async function listCommits(args, apiService) {
  const { owner, repo, sha, path, author, since, until, per_page = 30 } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for listCommits. Please provide them in arguments or ensure a default is set."
    );
  }

  const params = new URLSearchParams({
    per_page: per_page.toString(),
  });

  if (sha) params.append("sha", sha); // branch name, tag name or commit SHA
  if (path) params.append("path", path);
  if (author) params.append("author", author); // GitHub login or email address
  if (since) params.append("since", since); // ISO 8601 date string
  if (until) params.append("until", until); // ISO 8601 date string

  const commits = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/commits?${params.toString()}`
  );
  return branchCommitFormatters.formatListCommitsOutput(commits, owner, repo);
}

async function getCommitDetails(args, apiService) {
  const { owner, repo, commit_sha } = args; // 'commit_sha' is preferred over 'ref' for specific commit

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for getCommitDetails. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!commit_sha) {
    throw new Error(
      "commit_sha (commit SHA) is required for getCommitDetails."
    );
  }

  const commit = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/commits/${encodeURIComponent(commit_sha)}`
  );
  return branchCommitFormatters.formatGetCommitDetailsOutput(commit);
}

async function compareCommits(args, apiService) {
  const { owner, repo, base, head } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for compareCommits. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!base || !head) {
    throw new Error(
      "Both base and head (branch names, tags, or commit SHAs) are required for compareCommits."
    );
  }

  const comparison = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/compare/${encodeURIComponent(
      base
    )}...${encodeURIComponent(head)}`
  );
  return branchCommitFormatters.formatCompareCommitsOutput(
    comparison,
    base,
    head
  );
}

module.exports = {
  listBranches,
  createBranch,
  listCommits,
  getCommitDetails,
  compareCommits,
};
