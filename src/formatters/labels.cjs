// src/formatters/labels.cjs

function formatListRepoLabelsOutput(labels, owner, repo) {
  if (!Array.isArray(labels)) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not retrieve labels for ${owner}/${repo}.`,
        },
      ],
      isError: true,
    };
  }
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
        text: `Found ${labels.length} labels in ${owner}/${repo}:\n\n${
          formatted || "No labels found."
        }`,
      },
    ],
  };
}

function formatCreateLabelOutput(label, owner, repo) {
  if (!label || typeof label !== "object" || !label.name) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not create label in ${owner}/${repo}.`,
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
          `Created label "${label.name}" in ${owner}/${repo}:\n` +
          `Color: #${label.color}\n` +
          `Description: ${label.description || "No description"}\n` +
          `URL: ${label.url}`,
      },
    ],
  };
}

function formatEditLabelOutput(updatedLabel, owner, repo) {
  if (!updatedLabel || typeof updatedLabel !== "object" || !updatedLabel.name) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Could not update label in ${owner}/${repo}.`,
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
          `Updated label "${updatedLabel.name}" in ${owner}/${repo}:\n` +
          `Color: #${updatedLabel.color}\n` +
          `Description: ${updatedLabel.description || "No description"}\n` +
          `URL: ${updatedLabel.url}`,
      },
    ],
  };
}

function formatDeleteLabelOutput(labelName, owner, repo) {
  return {
    content: [
      {
        type: "text",
        text: `Successfully deleted label "${labelName}" from ${owner}/${repo}`,
      },
    ],
  };
}

module.exports = {
  formatListRepoLabelsOutput,
  formatCreateLabelOutput,
  formatEditLabelOutput,
  formatDeleteLabelOutput,
};
