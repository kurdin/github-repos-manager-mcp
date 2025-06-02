class BranchCommitHandlers {
  constructor(apiService) {
    this.api = apiService;
    this.defaultOwner = null;
    this.defaultRepo = null;
  }

  setDefaultRepo(owner, repo) {
    this.defaultOwner = owner;
    this.defaultRepo = repo;
  }

  async listBranches(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { protected_only = false, per_page = 30 } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    const params = new URLSearchParams({
      per_page: per_page.toString(),
    });

    if (protected_only) {
      params.append("protected", "true");
    }

    const branches = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/branches?${params}`
    );

    if (branches.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No branches found in ${owner}/${repo}`,
          },
        ],
      };
    }

    const formatted = branches
      .map(
        (branch) =>
          `**${branch.name}**\n` +
          `Protected: ${branch.protected ? "Yes" : "No"}\n` +
          `Commit SHA: ${branch.commit.sha}\n` +
          `Commit Message: ${branch.commit.commit.message.split("\n")[0]}\n` +
          `Author: ${branch.commit.commit.author.name}\n` +
          `Date: ${new Date(
            branch.commit.commit.author.date
          ).toLocaleDateString()}`
      )
      .join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${branches.length} branches in ${owner}/${repo}:\n\n${formatted}`,
        },
      ],
    };
  }

  async createBranch(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { branch_name, source_branch = "main", source_sha } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    if (!branch_name) {
      throw new Error("branch_name is required");
    }

    let sha = source_sha;

    // If no SHA provided, get the SHA from the source branch
    if (!sha) {
      try {
        const sourceBranchData = await this.api.makeGitHubRequest(
          `/repos/${owner}/${repo}/branches/${source_branch}`
        );
        sha = sourceBranchData.commit.sha;
      } catch (error) {
        throw new Error(
          `Failed to get SHA for source branch '${source_branch}': ${error.message}`
        );
      }
    }

    const branchData = {
      ref: `refs/heads/${branch_name}`,
      sha: sha,
    };

    const newBranch = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/git/refs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(branchData),
      }
    );

    return {
      content: [
        {
          type: "text",
          text:
            `Created branch "${branch_name}" in ${owner}/${repo}:\n\n` +
            `Ref: ${newBranch.ref}\n` +
            `SHA: ${newBranch.object.sha}\n` +
            `Source: ${
              source_sha ? `SHA ${source_sha}` : `branch ${source_branch}`
            }\n` +
            `URL: ${newBranch.url}`,
        },
      ],
    };
  }

  async listCommits(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { sha, path, author, since, until, per_page = 30 } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    const params = new URLSearchParams({
      per_page: per_page.toString(),
    });

    if (sha) params.append("sha", sha);
    if (path) params.append("path", path);
    if (author) params.append("author", author);
    if (since) params.append("since", since);
    if (until) params.append("until", until);

    const commits = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/commits?${params}`
    );

    if (commits.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No commits found in ${owner}/${repo} with the specified filters`,
          },
        ],
      };
    }

    const formatted = commits
      .map(
        (commit) =>
          `**${commit.sha.substring(0, 7)}** ${
            commit.commit.message.split("\n")[0]
          }\n` +
          `Author: ${commit.commit.author.name} <${commit.commit.author.email}>\n` +
          `Date: ${new Date(
            commit.commit.author.date
          ).toLocaleDateString()}\n` +
          `Files changed: ${commit.files ? commit.files.length : "N/A"}\n` +
          `URL: ${commit.html_url}`
      )
      .join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${commits.length} commits in ${owner}/${repo}:\n\n${formatted}`,
        },
      ],
    };
  }

  async getCommitDetails(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { commit_sha } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    if (!commit_sha) {
      throw new Error("commit_sha is required");
    }

    const commit = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/commits/${commit_sha}`
    );

    const stats = commit.stats || {};
    const files = commit.files || [];

    const fileChanges = files
      .map(
        (file) =>
          `**${file.filename}** (${file.status})\n` +
          `+${file.additions} -${file.deletions} changes: ${file.changes}`
      )
      .join("\n");

    const info = `
**Commit Details for ${commit.sha.substring(0, 7)}**

**Message:** ${commit.commit.message}

**Author:** ${commit.commit.author.name} <${commit.commit.author.email}>
**Committer:** ${commit.commit.committer.name} <${
      commit.commit.committer.email
    }>
**Date:** ${new Date(commit.commit.author.date).toLocaleDateString()}

**Statistics:**
- Total files changed: ${stats.total || 0}
- Additions: +${stats.additions || 0}
- Deletions: -${stats.deletions || 0}

**Parents:** ${commit.parents.map((p) => p.sha.substring(0, 7)).join(", ")}

**File Changes:**
${fileChanges || "No file information available"}

**URL:** ${commit.html_url}
    `.trim();

    return {
      content: [
        {
          type: "text",
          text: info,
        },
      ],
    };
  }

  async compareCommits(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { base, head } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    if (!base || !head) {
      throw new Error("Both base and head parameters are required");
    }

    const comparison = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/compare/${base}...${head}`
    );

    const stats = comparison.stats || {};
    const files = comparison.files || [];

    const fileChanges = files
      .slice(0, 20) // Limit to first 20 files to avoid overwhelming output
      .map(
        (file) =>
          `**${file.filename}** (${file.status})\n` +
          `+${file.additions} -${file.deletions} (${file.changes} changes)`
      )
      .join("\n");

    const info = `
**Comparison: ${base}...${head}**

**Status:** ${comparison.status}
**Ahead by:** ${comparison.ahead_by} commits
**Behind by:** ${comparison.behind_by} commits
**Total commits:** ${comparison.total_commits}

**Statistics:**
- Files changed: ${stats.total || 0}
- Additions: +${stats.additions || 0}
- Deletions: -${stats.deletions || 0}

**Recent Commits:**
${comparison.commits
  .slice(0, 5)
  .map(
    (commit) =>
      `• ${commit.sha.substring(0, 7)} ${
        commit.commit.message.split("\n")[0]
      } (${commit.commit.author.name})`
  )
  .join("\n")}

**File Changes${
      files.length > 20 ? ` (showing first 20 of ${files.length})` : ""
    }:**
${fileChanges || "No file changes"}

**URL:** ${comparison.html_url}
    `.trim();

    return {
      content: [
        {
          type: "text",
          text: info,
        },
      ],
    };
  }
}

module.exports = BranchCommitHandlers;
