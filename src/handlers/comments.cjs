class CommentHandlers {
  constructor(apiService) {
    this.api = apiService;
    this.defaultOwner = null;
    this.defaultRepo = null;
  }

  setDefaultRepo(owner, repo) {
    this.defaultOwner = owner;
    this.defaultRepo = repo;
  }

  async listIssueComments(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const issue_number = args.issue_number;
    const { per_page = 30, since } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }
    if (!issue_number) {
      throw new Error("issue_number is required");
    }

    const params = new URLSearchParams();
    params.append("per_page", per_page.toString());
    if (since) {
      params.append("since", since);
    }

    const comments = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/${issue_number}/comments?${params}`
    );

    const formatted = comments
      .map(
        (c) =>
          `**Comment ID: ${c.id} by @${c.user.login} on ${new Date(
            c.created_at
          ).toLocaleDateString()}**\n${c.body}\nURL: ${c.html_url}`
      )
      .join("\n\n---\n\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${
            comments.length
          } comments for issue #${issue_number}:\n\n${
            formatted || "No comments found."
          }`,
        },
      ],
    };
  }

  async createIssueComment(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const issue_number = args.issue_number;
    const { body } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }
    if (!issue_number) {
      throw new Error("issue_number is required");
    }
    if (!body) {
      throw new Error("body is required");
    }

    const comment = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/${issue_number}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      }
    );

    return {
      content: [
        {
          type: "text",
          text: `Comment created on issue #${issue_number}:\nID: ${comment.id}\nURL: ${comment.html_url}`,
        },
      ],
    };
  }

  async editIssueComment(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const comment_id = args.comment_id;
    const { body } = args;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }
    if (!comment_id) {
      throw new Error("comment_id is required");
    }
    if (!body) {
      throw new Error("body is required");
    }

    const updatedComment = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/comments/${comment_id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      }
    );

    return {
      content: [
        {
          type: "text",
          text: `Comment ID ${updatedComment.id} updated:\nURL: ${updatedComment.html_url}`,
        },
      ],
    };
  }

  async deleteIssueComment(args) {
    const owner = args.owner || this.defaultOwner;
    const repo = args.repo || this.defaultRepo;
    const comment_id = args.comment_id;

    if (!owner || !repo) {
      throw new Error(
        "Owner and repository name are required. Use set_default_repo tool or provide them as arguments."
      );
    }
    if (!comment_id) {
      throw new Error("comment_id is required");
    }

    await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/issues/comments/${comment_id}`,
      { method: "DELETE" }
    );

    return {
      content: [
        {
          type: "text",
          text: `Comment ID ${comment_id} deleted successfully.`,
        },
      ],
    };
  }
}

module.exports = CommentHandlers;
