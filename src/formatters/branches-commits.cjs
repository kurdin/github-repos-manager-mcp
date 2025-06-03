// src/formatters/branches-commits.cjs

function formatListBranchesOutput(branches, owner, repo) {
  if (!Array.isArray(branches)) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not retrieve branches for ${owner}/${repo}.`,
        },
      ],
      isError: true,
    };
  }
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
        // `Commit Message: ${branch.commit.commit.message.split("\n")[0]}\n` + // commit.commit.message might not exist on branch list
        // `Author: ${branch.commit.commit.author.name}\n` + // commit.commit.author might not exist
        // `Date: ${new Date(branch.commit.commit.author.date).toLocaleDateString()}`
        `Last commit URL: ${branch.commit.url}` // Simpler, more reliable info from branch list
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

function formatCreateBranchOutput(
  newBranch,
  branch_name,
  owner,
  repo,
  source_sha,
  source_branch
) {
  if (!newBranch || typeof newBranch !== "object" || !newBranch.ref) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not create branch "${branch_name}" in ${owner}/${repo}.`,
        },
      ],
      isError: true,
    };
  }
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
          `URL: ${newBranch.url}`, // This URL is for the ref itself, not the branch page.
      },
    ],
  };
}

function formatListCommitsOutput(commits, owner, repo) {
  if (!Array.isArray(commits)) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not retrieve commits for ${owner}/${repo}.`,
        },
      ],
      isError: true,
    };
  }
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
        `Date: ${new Date(commit.commit.author.date).toLocaleDateString()}\n` +
        // `Files changed: ${commit.files ? commit.files.length : "N/A"}\n` + // 'files' is not part of list commits response
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

function formatGetCommitDetailsOutput(commit) {
  if (!commit || typeof commit !== "object" || !commit.sha) {
    return {
      content: [
        { type: "text", text: "Error: Could not retrieve commit details." },
      ],
      isError: true,
    };
  }
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
**Date:** ${new Date(commit.commit.author.date).toLocaleString()}

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

function formatCompareCommitsOutput(comparison, base, head) {
  if (!comparison || typeof comparison !== "object" || !comparison.status) {
    return {
      content: [
        { type: "text", text: `Error: Could not compare ${base}...${head}.` },
      ],
      isError: true,
    };
  }
  const stats = comparison.stats || {}; // stats might not exist on comparison object directly
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

**Merge Base Commit:** ${comparison.merge_base_commit.sha.substring(0, 7)}

**Recent Commits in Range (up to 5):**
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

module.exports = {
  formatListBranchesOutput,
  formatCreateBranchOutput,
  formatListCommitsOutput,
  formatGetCommitDetailsOutput,
  formatCompareCommitsOutput,
};
