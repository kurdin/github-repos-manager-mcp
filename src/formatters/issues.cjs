// src/formatters/issues.cjs

function formatListIssuesOutput(issues, owner, repo, state) {
  if (!Array.isArray(issues)) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not retrieve ${state} issues for ${owner}/${repo}.`,
        },
      ],
      isError: true,
    };
  }
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
        `**#${issue.number} ${issue.title}**\n` +
        `State: ${issue.state} | Author: ${issue.user.login}\n` +
        `Created: ${new Date(issue.created_at).toLocaleDateString()}\n` +
        `URL: ${issue.html_url}\n` +
        `Labels: ${issue.labels.map((l) => l.name).join(", ") || "None"}\n` +
        `Assignees: ${issue.assignees.map((a) => a.login).join(", ") || "None"}`
    )
    .join("\n\n"); // Changed from \n to \n\n for better readability between issues

  return {
    content: [
      {
        type: "text",
        text: `Found ${issues.length} ${state} issues in ${owner}/${repo}:\n\n${formatted}`,
      },
    ],
  };
}

function formatCreateIssueOutput(issue, owner, repo) {
  if (!issue || typeof issue !== "object" || !issue.number) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not create issue in ${owner}/${repo}.`,
        },
      ],
      isError: true,
    };
  }
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

function formatEditIssueOutput(updatedIssue, owner, repo) {
  if (
    !updatedIssue ||
    typeof updatedIssue !== "object" ||
    !updatedIssue.number
  ) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not edit issue in ${owner}/${repo}.`,
        },
      ],
      isError: true,
    };
  }
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

function formatGetIssueDetailsOutput(issue, owner, repo) {
  if (!issue || typeof issue !== "object" || !issue.number) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not retrieve details for issue in ${owner}/${repo}.`,
        },
      ],
      isError: true,
    };
  }
  const details = `
**Issue #${issue.number}: ${issue.title}**
Status: ${issue.state} ${issue.locked ? "(Locked)" : ""}
Repository: ${owner}/${repo}
Author: @${issue.user.login}
Created: ${new Date(issue.created_at).toLocaleString()}
Updated: ${new Date(issue.updated_at).toLocaleString()}
${
  issue.closed_at
    ? `Closed: ${new Date(issue.closed_at).toLocaleString()} by @${
        issue.closed_by?.login || "N/A"
      }`
    : ""
}

Labels: ${
    issue.labels.length > 0
      ? issue.labels.map((l) => l.name).join(", ")
      : "None"
  }
Assignees: ${
    issue.assignees.length > 0
      ? issue.assignees.map((a) => `@${a.login}`).join(", ")
      : "None"
  }
Milestone: ${issue.milestone ? issue.milestone.title : "None"}

URL: ${issue.html_url}

**Body:**
${issue.body || "No description provided."}
  `.trim();

  return {
    content: [{ type: "text", text: details }],
  };
}

function formatLockIssueOutput(issue_number, lock_reason) {
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

function formatUnlockIssueOutput(issue_number) {
  return {
    content: [
      { type: "text", text: `Issue #${issue_number} unlocked successfully.` },
    ],
  };
}

function formatAddAssigneesToIssueOutput(updatedIssue, issue_number) {
  if (!updatedIssue || !Array.isArray(updatedIssue.assignees)) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not update assignees for issue #${issue_number}.`,
        },
      ],
      isError: true,
    };
  }
  const assignedNames = updatedIssue.assignees.map((a) => a.login).join(", ");
  return {
    content: [
      {
        type: "text",
        text: `Successfully added/updated assignees for issue #${issue_number}. Current assignees: ${
          assignedNames || "None"
        }`, // GitHub API for add assignees returns the full issue object with all current assignees
      },
    ],
  };
}

function formatRemoveAssigneesFromIssueOutput(updatedIssue, issue_number) {
  if (!updatedIssue || !Array.isArray(updatedIssue.assignees)) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not update assignees for issue #${issue_number}.`,
        },
      ],
      isError: true,
    };
  }
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

module.exports = {
  formatListIssuesOutput,
  formatCreateIssueOutput,
  formatEditIssueOutput,
  formatGetIssueDetailsOutput,
  formatLockIssueOutput,
  formatUnlockIssueOutput,
  formatAddAssigneesToIssueOutput,
  formatRemoveAssigneesFromIssueOutput,
};
