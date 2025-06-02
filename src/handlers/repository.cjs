class RepositoryHandlers {
  constructor(apiService) {
    this.api = apiService;
    this.defaultOwner = null;
    this.defaultRepo = null;
  }

  setDefaultRepo(owner, repo) {
    this.defaultOwner = owner;
    this.defaultRepo = repo;
  }

  async listRepos(args) {
    const { per_page = 10, visibility = "all", sort = "updated" } = args;
    const params = new URLSearchParams({
      per_page: per_page.toString(),
      sort,
      direction: "desc",
    });

    if (visibility !== "all") {
      params.append("visibility", visibility);
    }

    const repos = await this.api.makeGitHubRequest(
      `/user/repos?${params.toString()}`
    );

    const formatted = repos.map((repo) => ({
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
          text: `Found ${repos.length} repositories:\n\n${formatted
            .map(
              (repo) =>
                `**${repo.name}** ${
                  repo.private ? "(private)" : "(public)"
                }\n` +
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

  async getRepoInfo(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    const repoData = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}`
    );

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
${repoData.license ? `**License:** ${repoData.license.name}` : ""}
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

  async searchRepos(args) {
    const { query, per_page = 10, sort = "stars" } = args;
    const params = new URLSearchParams({
      q: query,
      per_page: per_page.toString(),
      sort,
      order: "desc",
    });

    const results = await this.api.makeGitHubRequest(
      `/search/repositories?${params}`
    );

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

  async getRepoContents(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { path = "", ref } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    let endpoint = `/repos/${owner}/${repo}/contents/${path}`;

    if (ref) {
      endpoint += `?ref=${encodeURIComponent(ref)}`;
    }

    const contents = await this.api.makeGitHubRequest(endpoint);

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

  async setDefaultRepo(args) {
    const { owner, repo } = args;
    if (!owner || !repo) {
      throw new Error("Both owner and repo are required");
    }
    this.setDefaultRepo(owner, repo);
    console.error(`Default repository set to: ${owner}/${repo}`);
    return {
      content: [
        {
          type: "text",
          text: `Default repository set to: ${owner}/${repo}`,
        },
      ],
    };
  }

  async listRepoCollaborators(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { affiliation = "all", permission, per_page = 30 } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    const params = new URLSearchParams({
      affiliation,
      per_page: per_page.toString(),
    });
    if (permission) {
      params.append("permission", permission);
    }

    const collaborators = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/collaborators?${params}`
    );

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
}

module.exports = RepositoryHandlers;
