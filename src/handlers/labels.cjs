class LabelsHandlers {
  constructor(apiService) {
    this.api = apiService;
    this.defaultOwner = null;
    this.defaultRepo = null;
  }

  setDefaultRepo(owner, repo) {
    this.defaultOwner = owner;
    this.defaultRepo = repo;
  }

  async listRepoLabels(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { per_page = 30 } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    const params = new URLSearchParams({
      per_page: per_page.toString(),
    });

    const labels = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/labels?${params}`
    );

    const formatted = labels
      .map(
        (label) =>
          `**${label.name}** (#${label.color})\n` +
          `Description: ${label.description || "No description"}\n` +
          `URL: ${label.url}`
      )
      .join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${labels.length} labels in ${owner}/${repo}:\n\n${formatted}`,
        },
      ],
    };
  }

  async createLabel(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { name, color = "f29513", description } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    if (!name) {
      throw new Error("Label name is required");
    }

    const labelData = {
      name,
      color: color.replace("#", ""),
      description: description || "",
    };

    const label = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/labels`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(labelData),
      }
    );

    return {
      content: [
        {
          type: "text",
          text:
            `Created label "${label.name}" in ${owner}/${repo}:\n` +
            `Color: #${label.color}\n` +
            `Description: ${label.description || "No description"}\n` +
            `URL: ${label.url}`,
        },
      ],
    };
  }

  async editLabel(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { current_name, name, color, description } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    if (!current_name) {
      throw new Error("current_name is required to identify the label to edit");
    }

    const payload = {};
    if (name !== undefined) payload.name = name;
    if (color !== undefined) payload.color = color.replace("#", "");
    if (description !== undefined) payload.description = description;

    if (Object.keys(payload).length === 0) {
      throw new Error("At least one field to update must be provided");
    }

    const updatedLabel = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/labels/${encodeURIComponent(current_name)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    return {
      content: [
        {
          type: "text",
          text:
            `Updated label "${updatedLabel.name}" in ${owner}/${repo}:\n` +
            `Color: #${updatedLabel.color}\n` +
            `Description: ${updatedLabel.description || "No description"}\n` +
            `URL: ${updatedLabel.url}`,
        },
      ],
    };
  }

  async deleteLabel(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { name } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    if (!name) {
      throw new Error("Label name is required");
    }

    await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/labels/${encodeURIComponent(name)}`,
      {
        method: "DELETE",
      }
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted label "${name}" from ${owner}/${repo}`,
        },
      ],
    };
  }
}

module.exports = LabelsHandlers;
