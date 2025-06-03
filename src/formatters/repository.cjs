// src/formatters/repository.cjs

function formatListReposOutput(reposData) {
  if (!Array.isArray(reposData)) {
    console.error(
      "formatListReposOutput: reposData is not an array",
      reposData
    );
    // Potentially return an error structure or an empty list message
    return {
      content: [
        { type: "text", text: "Error: Could not retrieve repository list." },
      ],
      isError: true,
    };
  }
  const formatted = reposData.map((repo) => ({
    name: repo.full_name,
    description: repo.description || "No description",
    private: repo.private,
    language: repo.language || "N/A",
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    updated: repo.updated_at,
    url: repo.html_url,
  }));

  return {
    content: [
      {
        type: "text",
        text: `Found ${reposData.length} repositories:\n\n${formatted
          .map(
            (repo) =>
              `**${repo.name}** ${repo.private ? "(private)" : "(public)"}\n` +
              `Description: ${repo.description}\n` +
              `Language: ${repo.language} | Stars: ${repo.stars} | Forks: ${repo.forks}\n` +
              `Updated: ${new Date(repo.updated).toLocaleDateString()}\n` +
              `URL: ${repo.url}\n`
          )
          .join("\n")}`,
      },
    ],
  };
}

function formatGetRepoInfoOutput(repoData) {
  if (!repoData || typeof repoData !== "object") {
    return {
      content: [
        {
          type: "text",
          text: "Error: Could not retrieve repository information.",
        },
      ],
      isError: true,
    };
  }
  const info = `
**${repoData.full_name}** ${repoData.private ? "(private)" : "(public)"}

**Description:** ${repoData.description || "No description"}
**Language:** ${repoData.language || "N/A"}
**Stars:** ${repoData.stargazers_count}
**Forks:** ${repoData.forks_count}
**Watchers:** ${repoData.watchers_count}
**Open Issues:** ${repoData.open_issues_count}
**Default Branch:** ${repoData.default_branch}
**Created:** ${new Date(repoData.created_at).toLocaleDateString()}
**Updated:** ${new Date(repoData.updated_at).toLocaleDateString()}
**Size:** ${repoData.size} KB

**Clone URL:** ${repoData.clone_url}
**Web URL:** ${repoData.html_url}

${repoData.homepage ? `**Homepage:** ${repoData.homepage}` : ""}
${
  repoData.license && repoData.license.name
    ? `**License:** ${repoData.license.name}`
    : ""
}
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

function formatSearchReposOutput(results, query) {
  if (!results || !results.items) {
    return {
      content: [
        {
          type: "text",
          text: `Error searching for repositories with query: "${query}"`,
        },
      ],
      isError: true,
    };
  }
  if (results.total_count === 0) {
    return {
      content: [
        {
          type: "text",
          text: `No repositories found for query: "${query}"`,
        },
      ],
    };
  }

  const formatted = results.items
    .map(
      (repo) =>
        `**${repo.full_name}** ${repo.private ? "(private)" : "(public)"}\n` +
        `Description: ${repo.description || "No description"}\n` +
        `Language: ${repo.language || "N/A"} | Stars: ${
          repo.stargazers_count
        } | Forks: ${repo.forks_count}\n` +
        `Updated: ${new Date(repo.updated_at).toLocaleDateString()}\n` +
        `URL: ${repo.html_url}\n`
    )
    .join("\n");

  return {
    content: [
      {
        type: "text",
        text: `Found ${results.total_count} repositories (showing ${results.items.length}):\n\n${formatted}`,
      },
    ],
  };
}

function formatGetRepoContentsOutput(contents, owner, repo, path) {
  if (!contents) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not retrieve contents for ${owner}/${repo}${
            path ? `/${path}` : ""
          }`,
        },
      ],
      isError: true,
    };
  }
  if (Array.isArray(contents)) {
    // Directory listing
    const formatted = contents
      .map(
        (item) =>
          `${item.type === "dir" ? "📁" : "📄"} **${item.name}** (${
            item.type
          })\n` +
          `Size: ${item.size || 0} bytes\n` +
          `URL: ${item.html_url}`
      )
      .join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: `Contents of ${owner}/${repo}${
            path ? `/${path}` : ""
          }:\n\n${formatted}`,
        },
      ],
    };
  } else {
    // Single file
    const fileContent = contents.content
      ? Buffer.from(contents.content, "base64").toString("utf-8")
      : "Binary file or empty";

    return {
      content: [
        {
          type: "text",
          text:
            `File: ${contents.name}\n` +
            `Size: ${contents.size} bytes\n` +
            `Encoding: ${contents.encoding}\n` +
            `URL: ${contents.html_url}\n\n` +
            `Content:\n\`\`\`\n${fileContent}\n\`\`\``,
        },
      ],
    };
  }
}

function formatListRepoCollaboratorsOutput(collaborators, owner, repo) {
  if (!Array.isArray(collaborators)) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not retrieve collaborators for ${owner}/${repo}`,
        },
      ],
      isError: true,
    };
  }
  const formatted = collaborators
    .map((c) => {
      const permissions = [];
      if (c.permissions.admin) permissions.push("admin");
      if (c.permissions.maintain) permissions.push("maintain");
      if (c.permissions.push) permissions.push("push");
      if (c.permissions.triage) permissions.push("triage");
      if (c.permissions.pull) permissions.push("pull");

      return `**${c.login}** (${c.type})\nPermissions: ${permissions.join(
        ", "
      )}\nURL: ${c.html_url}`;
    })
    .join("\n\n");

  return {
    content: [
      {
        type: "text",
        text: `Found ${
          collaborators.length
        } collaborators for ${owner}/${repo}:\n${
          formatted || "No collaborators found."
        }`,
      },
    ],
  };
}

module.exports = {
  formatListReposOutput,
  formatGetRepoInfoOutput,
  formatSearchReposOutput,
  formatGetRepoContentsOutput,
  formatListRepoCollaboratorsOutput,
};
