class MilestonesHandlers {
  constructor(apiService) {
    this.api = apiService;
    this.defaultOwner = null;
    this.defaultRepo = null;
  }

  setDefaultRepo(owner, repo) {
    this.defaultOwner = owner;
    this.defaultRepo = repo;
  }

  async listMilestones(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const {
      state = "open",
      sort = "due_on",
      direction = "asc",
      per_page = 30,
    } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    const params = new URLSearchParams({
      state,
      sort,
      direction,
      per_page: per_page.toString(),
    });

    const milestones = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/milestones?${params}`
    );

    if (milestones.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No ${state} milestones found in ${owner}/${repo}`,
          },
        ],
      };
    }

    const formatted = milestones
      .map(
        (milestone) =>
          `**${milestone.title}** (#${milestone.number})\n` +
          `State: ${milestone.state}\n` +
          `Description: ${milestone.description || "No description"}\n` +
          `Due: ${
            milestone.due_on
              ? new Date(milestone.due_on).toLocaleDateString()
              : "No due date"
          }\n` +
          `Progress: ${milestone.closed_issues}/${
            milestone.closed_issues + milestone.open_issues
          } issues closed\n` +
          `Created: ${new Date(milestone.created_at).toLocaleDateString()}\n` +
          `URL: ${milestone.html_url}`
      )
      .join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${milestones.length} ${state} milestones in ${owner}/${repo}:\n\n${formatted}`,
        },
      ],
    };
  }

  async createMilestone(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { title, state = "open", description, due_on } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    if (!title) {
      throw new Error("Milestone title is required");
    }

    const milestoneData = {
      title,
      state,
      description: description || "",
    };

    if (due_on) {
      milestoneData.due_on = due_on;
    }

    const milestone = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/milestones`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(milestoneData),
      }
    );

    return {
      content: [
        {
          type: "text",
          text:
            `Created milestone "${milestone.title}" (#${milestone.number}) in ${owner}/${repo}:\n` +
            `State: ${milestone.state}\n` +
            `Description: ${milestone.description || "No description"}\n` +
            `Due: ${
              milestone.due_on
                ? new Date(milestone.due_on).toLocaleDateString()
                : "No due date"
            }\n` +
            `URL: ${milestone.html_url}`,
        },
      ],
    };
  }

  async editMilestone(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { milestone_number, title, state, description, due_on } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    if (!milestone_number) {
      throw new Error("milestone_number is required");
    }

    const payload = {};
    if (title !== undefined) payload.title = title;
    if (state !== undefined) payload.state = state;
    if (description !== undefined) payload.description = description;
    if (due_on !== undefined) payload.due_on = due_on;

    if (Object.keys(payload).length === 0) {
      throw new Error("At least one field to update must be provided");
    }

    const updatedMilestone = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/milestones/${milestone_number}`,
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
            `Updated milestone "${updatedMilestone.title}" (#${updatedMilestone.number}) in ${owner}/${repo}:\n` +
            `State: ${updatedMilestone.state}\n` +
            `Description: ${
              updatedMilestone.description || "No description"
            }\n` +
            `Due: ${
              updatedMilestone.due_on
                ? new Date(updatedMilestone.due_on).toLocaleDateString()
                : "No due date"
            }\n` +
            `Progress: ${updatedMilestone.closed_issues}/${
              updatedMilestone.closed_issues + updatedMilestone.open_issues
            } issues closed\n` +
            `URL: ${updatedMilestone.html_url}`,
        },
      ],
    };
  }

  async deleteMilestone(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { milestone_number } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    if (!milestone_number) {
      throw new Error("milestone_number is required");
    }

    await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/milestones/${milestone_number}`,
      {
        method: "DELETE",
      }
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted milestone #${milestone_number} from ${owner}/${repo}`,
        },
      ],
    };
  }
}

module.exports = MilestonesHandlers;
