// src/handlers/comments.cjs

const commentFormatters = require("../formatters/comments.cjs");

async function listIssueComments(args, apiService) {
  const { owner, repo, issue_number, per_page = 30, since } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for listIssueComments. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!issue_number) {
    throw new Error("issue_number is required for listIssueComments.");
  }

  const params = new URLSearchParams();
  params.append("per_page", per_page.toString());
  if (since) {
    params.append("since", since);
  }

  const comments = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/issues/${issue_number}/comments?${params.toString()}`
  );
  return commentFormatters.formatListIssueCommentsOutput(
    comments,
    issue_number
  );
}

async function createIssueComment(args, apiService) {
  const { owner, repo, issue_number, body } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for createIssueComment. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!issue_number) {
    throw new Error("issue_number is required for createIssueComment.");
  }
  if (!body) {
    throw new Error("body is required for createIssueComment.");
  }

  const comment = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/issues/${issue_number}/comments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    }
  );
  return commentFormatters.formatCreateIssueCommentOutput(
    comment,
    issue_number
  );
}

async function editIssueComment(args, apiService) {
  const { owner, repo, comment_id, body } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for editIssueComment. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!comment_id) {
    throw new Error("comment_id is required for editIssueComment.");
  }
  if (!body) {
    throw new Error("body is required for editIssueComment.");
  }

  const updatedComment = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/issues/comments/${comment_id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    }
  );
  return commentFormatters.formatEditIssueCommentOutput(updatedComment);
}

async function deleteIssueComment(args, apiService) {
  const { owner, repo, comment_id } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for deleteIssueComment. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!comment_id) {
    throw new Error("comment_id is required for deleteIssueComment.");
  }

  await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/issues/comments/${comment_id}`,
    { method: "DELETE" }
  );
  return commentFormatters.formatDeleteIssueCommentOutput(comment_id);
}

module.exports = {
  listIssueComments,
  createIssueComment,
  editIssueComment,
  deleteIssueComment,
};
