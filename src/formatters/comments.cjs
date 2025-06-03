// src/formatters/comments.cjs

function formatListIssueCommentsOutput(comments, issue_number) {
  if (!Array.isArray(comments)) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not retrieve comments for issue #${issue_number}.`,
        },
      ],
      isError: true,
    };
  }

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

function formatCreateIssueCommentOutput(comment, issue_number) {
  if (!comment || typeof comment !== "object" || !comment.id) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not create comment on issue #${issue_number}.`,
        },
      ],
      isError: true,
    };
  }
  return {
    content: [
      {
        type: "text",
        text: `Comment created on issue #${issue_number}:\nID: ${comment.id}\nURL: ${comment.html_url}`,
      },
    ],
  };
}

function formatEditIssueCommentOutput(updatedComment) {
  if (
    !updatedComment ||
    typeof updatedComment !== "object" ||
    !updatedComment.id
  ) {
    return {
      content: [{ type: "text", text: "Error: Could not edit comment." }],
      isError: true,
    };
  }
  return {
    content: [
      {
        type: "text",
        text: `Comment ID ${updatedComment.id} updated:\nURL: ${updatedComment.html_url}`,
      },
    ],
  };
}

function formatDeleteIssueCommentOutput(comment_id) {
  return {
    content: [
      {
        type: "text",
        text: `Comment ID ${comment_id} deleted successfully.`,
      },
    ],
  };
}

module.exports = {
  formatListIssueCommentsOutput,
  formatCreateIssueCommentOutput,
  formatEditIssueCommentOutput,
  formatDeleteIssueCommentOutput,
};
