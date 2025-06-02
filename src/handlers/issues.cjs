const fs = require("node:fs").promises;

class IssueHandlers {
  constructor(apiService) {
    this.api = apiService;
    this.defaultOwner = null;
    this.defaultRepo = null;
  }

  setDefaultRepo(owner, repo) {
    this.defaultOwner = owner;
    this.defaultRepo = repo;
  }

  async listIssues(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const { state = "open", per_page = 10 } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    const params = new URLSearchParams({
      state,
      per_page: per_page.toString(),
      sort: "updated",
      direction: "desc",
    });

    const issues = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues?${params}`
    );

    if (issues.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No ${state} issues found in ${owner}/${repo}`,
          },
        ],
      };
    }

    const formatted = issues
      .map(
        (issue) =>
          `**#${issue.number}** ${issue.title}\n` +
          `State: ${issue.state} | Author: ${issue.user.login}\n` +
          `Created: ${new Date(issue.created_at).toLocaleDateString()}\n` +
          `URL: ${issue.html_url}\n` +
          `Labels: ${issue.labels.map((l) => l.name).join(", ") || "None"}\n`
      )
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${issues.length} ${state} issues in ${owner}/${repo}:\n\n${formatted}`,
        },
      ],
    };
  }

  async createIssue(args) {
    let { title, body = "", labels = [], assignees = [], image_path } = args;
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    let finalBody = body;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }

    if (image_path) {
      try {
        const imageData = await fs.readFile(image_path);
        const base64Image = imageData.toString("base64");
        const fileExtension = image_path.split(".").pop().toLowerCase();
        const fileName = `issue-image-${Date.now()}.${fileExtension}`;

        const uploadResult = await this.api.uploadFileToRepo(
          owner,
          repo,
          `images/${fileName}`,
          base64Image,
          `Add image for issue: ${title}`
        );

        if (uploadResult && uploadResult.content) {
          const imageUrl = uploadResult.content.download_url;
          finalBody += `\n\n![Image](${imageUrl})`;
        }
      } catch (error) {
        console.error(`Failed to upload image: ${error.message}`);
        finalBody += `\n\n[Note: Failed to upload image from ${image_path}]`;
      }
    }

    const issueData = {
      title,
      body: finalBody,
      labels,
      assignees,
    };

    const issue = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(issueData),
      }
    );

    return {
      content: [
        {
          type: "text",
          text:
            `Created issue #${issue.number} in ${owner}/${repo}:\n\n` +
            `**${issue.title}**\n` +
            `URL: ${issue.html_url}\n` +
            `State: ${issue.state}\n` +
            `Created: ${new Date(issue.created_at).toLocaleDateString()}`,
        },
      ],
    };
  }

  async editIssue(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const issue_number = args.issue_number;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }
    if (!issue_number) {
      throw new Error("issue_number is required");
    }

    const payload = {};
    if (args.title !== undefined) payload.title = args.title;
    if (args.state !== undefined) payload.state = args.state;
    if (args.labels !== undefined) payload.labels = args.labels;
    if (args.assignees !== undefined) payload.assignees = args.assignees;

    let currentBody = args.body;
    // Handle image upload and appending
    if (args.image_path) {
      try {
        const imageData = await fs.readFile(args.image_path);
        const base64Image = imageData.toString("base64");
        const fileExtension = args.image_path.split(".").pop().toLowerCase();
        const fileName = `issue-image-${Date.now()}.${fileExtension}`;

        const uploadResult = await this.api.uploadFileToRepo(
          owner,
          repo,
          `images/${fileName}`,
          base64Image,
          `Add image for issue #${issue_number}`
        );

        if (uploadResult && uploadResult.content) {
          const imageUrl = uploadResult.content.download_url;
          currentBody = (currentBody || "") + `\n\n![Image](${imageUrl})`;
        }
      } catch (error) {
        console.error(`Failed to upload image: ${error.message}`);
        currentBody =
          (currentBody || "") +
          `\n\n[Note: Failed to upload image from ${args.image_path}]`;
      }
    }

    if (currentBody !== undefined) payload.body = currentBody;

    if (Object.keys(payload).length === 0) {
      throw new Error("At least one field to update must be provided");
    }

    console.error(
      `Editing issue #${issue_number} in ${owner}/${repo} with payload:`,
      payload
    );
    const updatedIssue = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/${issue_number}`,
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
            `Successfully edited issue #${updatedIssue.number} in ${owner}/${repo}:\n\n` +
            `**${updatedIssue.title}**\n` +
            `URL: ${updatedIssue.html_url}\n` +
            `State: ${updatedIssue.state}`,
        },
      ],
    };
  }

  async getIssueDetails(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const issue_number = args.issue_number;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }
    if (!issue_number) {
      throw new Error("issue_number is required");
    }

    const issue = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/${issue_number}`
    );

    return {
      content: [{ type: "text", text: JSON.stringify(issue, null, 2) }],
    };
  }

  async lockIssue(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const issue_number = args.issue_number;
    const { lock_reason } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }
    if (!issue_number) {
      throw new Error("issue_number is required");
    }

    const payload = {};
    if (lock_reason) payload.lock_reason = lock_reason;

    await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/${issue_number}/lock`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    return {
      content: [
        {
          type: "text",
          text: `Issue #${issue_number} locked successfully.${
            lock_reason ? ` Reason: ${lock_reason}` : ""
          }`,
        },
      ],
    };
  }

  async unlockIssue(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const issue_number = args.issue_number;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }
    if (!issue_number) {
      throw new Error("issue_number is required");
    }

    await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/${issue_number}/lock`,
      { method: "DELETE" }
    );

    return {
      content: [
        { type: "text", text: `Issue #${issue_number} unlocked successfully.` },
      ],
    };
  }

  async addAssigneesToIssue(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const issue_number = args.issue_number;
    const { assignees } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }
    if (!issue_number) {
      throw new Error("issue_number is required");
    }
    if (!assignees || assignees.length === 0) {
      throw new Error("assignees array is required and cannot be empty");
    }

    const updatedIssue = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/${issue_number}/assignees`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignees }),
      }
    );

    const assignedNames = updatedIssue.assignees.map((a) => a.login).join(", ");
    return {
      content: [
        {
          type: "text",
          text: `Successfully added assignees to issue #${issue_number}. Current assignees: ${
            assignedNames || "None"
          }`,
        },
      ],
    };
  }

  async removeAssigneesFromIssue(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const issue_number = args.issue_number;
    const { assignees } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }
    if (!issue_number) {
      throw new Error("issue_number is required");
    }
    if (!assignees || assignees.length === 0) {
      throw new Error("assignees array is required and cannot be empty");
    }

    const updatedIssue = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/${issue_number}/assignees`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignees }),
      }
    );

    const remainingAssignees = updatedIssue.assignees
      ? updatedIssue.assignees.map((a) => a.login).join(", ")
      : "None";
    return {
      content: [
        {
          type: "text",
          text: `Successfully removed assignees from issue #${issue_number}. Remaining assignees: ${remainingAssignees}`,
        },
      ],
    };
  }
}

module.exports = IssueHandlers;
