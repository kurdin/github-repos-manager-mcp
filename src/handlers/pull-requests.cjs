class PullRequestHandlers {
  constructor(apiService) {
    this.api = apiService;
    this.defaultOwner = null;
    this.defaultRepo = null;
  }

  setDefaultRepo(owner, repo) {
    this.defaultOwner = owner;
    this.defaultRepo = repo;
  }

  async listPRs(args) {
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

    const prs = await this.api.makeGitHubRequest(
      `/repos/${owner}/${repo}/pulls?${params}`
    );

    if (prs.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No ${state} pull requests found in ${owner}/${repo}`,
          },
        ],
      };
    }

    const formatted = prs
      .map(
        (pr) =>
          `**#${pr.number}** ${pr.title}\n` +
          `State: ${pr.state} | Author: ${pr.user.login}\n` +
          `Base: ${pr.base.ref} ← Head: ${pr.head.ref}\n` +
          `Created: ${new Date(pr.created_at).toLocaleDateString()}\n` +
          `URL: ${pr.html_url}\n`
      )
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${prs.length} ${state} pull requests in ${owner}/${repo}:\n\n${formatted}`,
        },
      ],
    };
  }
}

module.exports = PullRequestHandlers;
