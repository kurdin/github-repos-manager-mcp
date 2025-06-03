// src/handlers/labels.cjs

const labelFormatters = require("../formatters/labels.cjs");

async function listRepoLabels(args, apiService) {
  const { owner, repo, per_page = 30 } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for listRepoLabels. Please provide them in arguments or ensure a default is set."
    );
  }

  const params = new URLSearchParams({
    per_page: per_page.toString(),
  });

  const labels = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/labels?${params.toString()}`
  );
  return labelFormatters.formatListRepoLabelsOutput(labels, owner, repo);
}

async function createLabel(args, apiService) {
  const { owner, repo, name, color = "f29513", description } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for createLabel. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!name) {
    throw new Error("Label name is required for createLabel.");
  }

  const labelData = {
    name,
    color: color.replace("#", ""), // Ensure color is without #
    description: description || "",
  };

  const label = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/labels`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(labelData),
    }
  );
  return labelFormatters.formatCreateLabelOutput(label, owner, repo);
}

async function editLabel(args, apiService) {
  const { owner, repo, current_name, name, color, description } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for editLabel. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!current_name) {
    throw new Error(
      "current_name is required to identify the label to edit for editLabel."
    );
  }

  const payload = {};
  if (name !== undefined) payload.new_name = name; // GitHub API uses 'new_name' for renaming
  if (color !== undefined) payload.color = color.replace("#", "");
  if (description !== undefined) payload.description = description;

  if (Object.keys(payload).length === 0) {
    throw new Error(
      "At least one field to update (name, color, description) must be provided for editLabel."
    );
  }

  const updatedLabel = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/labels/${encodeURIComponent(current_name)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  return labelFormatters.formatEditLabelOutput(updatedLabel, owner, repo);
}

async function deleteLabel(args, apiService) {
  const { owner, repo, name } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for deleteLabel. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!name) {
    throw new Error("Label name is required for deleteLabel.");
  }

  await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/labels/${encodeURIComponent(name)}`,
    {
      method: "DELETE",
    }
  );
  return labelFormatters.formatDeleteLabelOutput(name, owner, repo);
}

module.exports = {
  listRepoLabels,
  createLabel,
  editLabel,
  deleteLabel,
};
