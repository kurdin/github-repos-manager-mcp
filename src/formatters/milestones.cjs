// src/formatters/milestones.cjs

function formatListMilestonesOutput(milestones, owner, repo, state) {
  if (!Array.isArray(milestones)) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not retrieve ${state} milestones for ${owner}/${repo}.`,
        },
      ],
      isError: true,
    };
  }
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

function formatCreateMilestoneOutput(milestone, owner, repo) {
  if (!milestone || typeof milestone !== "object" || !milestone.number) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not create milestone in ${owner}/${repo}.`,
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

function formatEditMilestoneOutput(updatedMilestone, owner, repo) {
  if (
    !updatedMilestone ||
    typeof updatedMilestone !== "object" ||
    !updatedMilestone.number
  ) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not update milestone in ${owner}/${repo}.`,
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
          `Updated milestone "${updatedMilestone.title}" (#${updatedMilestone.number}) in ${owner}/${repo}:\n` +
          `State: ${updatedMilestone.state}\n` +
          `Description: ${updatedMilestone.description || "No description"}\n` +
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

function formatDeleteMilestoneOutput(milestone_number, owner, repo) {
  return {
    content: [
      {
        type: "text",
        text: `Successfully deleted milestone #${milestone_number} from ${owner}/${repo}`,
      },
    ],
  };
}

module.exports = {
  formatListMilestonesOutput,
  formatCreateMilestoneOutput,
  formatEditMilestoneOutput,
  formatDeleteMilestoneOutput,
};
