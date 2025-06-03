// src/formatters/pull-requests.cjs

function formatListPRsOutput(prs, owner, repo, state) {
  if (!Array.isArray(prs)) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not retrieve ${state} pull requests for ${owner}/${repo}.`,
        },
      ],
      isError: true,
    };
  }
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
    .join("\n\n"); // Changed from \n to \n\n for better readability

  return {
    content: [
      {
        type: "text",
        text: `Found ${prs.length} ${state} pull requests in ${owner}/${repo}:\n\n${formatted}`,
      },
    ],
  };
}

module.exports = {
  formatListPRsOutput,
};
