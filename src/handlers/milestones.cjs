// src/handlers/milestones.cjs

const milestoneFormatters = require("../formatters/milestones.cjs");

async function listMilestones(args, apiService) {
  const {
    owner,
    repo,
    state = "open",
    sort = "due_on",
    direction = "asc",
    per_page = 30,
  } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for listMilestones. Please provide them in arguments or ensure a default is set."
    );
  }

  const params = new URLSearchParams({
    state,
    sort,
    direction,
    per_page: per_page.toString(),
  });

  const milestones = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/milestones?${params.toString()}`
  );
  return milestoneFormatters.formatListMilestonesOutput(
    milestones,
    owner,
    repo,
    state
  );
}

async function createMilestone(args, apiService) {
  const { owner, repo, title, state = "open", description, due_on } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for createMilestone. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!title) {
    throw new Error("Milestone title is required for createMilestone.");
  }

  const milestoneData = {
    title,
    state,
    description: description || "",
  };

  if (due_on) {
    // Ensure due_on is in YYYY-MM-DDTHH:MM:SSZ format if provided
    milestoneData.due_on = due_on;
  }

  const milestone = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/milestones`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(milestoneData),
    }
  );
  return milestoneFormatters.formatCreateMilestoneOutput(
    milestone,
    owner,
    repo
  );
}

async function editMilestone(args, apiService) {
  const { owner, repo, milestone_number, title, state, description, due_on } =
    args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for editMilestone. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!milestone_number) {
    throw new Error("milestone_number is required for editMilestone.");
  }

  const payload = {};
  if (title !== undefined) payload.title = title;
  if (state !== undefined) payload.state = state;
  if (description !== undefined) payload.description = description;
  if (due_on !== undefined) payload.due_on = due_on; // Ensure due_on is in YYYY-MM-DDTHH:MM:SSZ format or null

  if (Object.keys(payload).length === 0) {
    throw new Error(
      "At least one field to update (title, state, description, due_on) must be provided for editMilestone."
    );
  }

  const updatedMilestone = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/milestones/${milestone_number}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  return milestoneFormatters.formatEditMilestoneOutput(
    updatedMilestone,
    owner,
    repo
  );
}

async function deleteMilestone(args, apiService) {
  const { owner, repo, milestone_number } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for deleteMilestone. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!milestone_number) {
    throw new Error("milestone_number is required for deleteMilestone.");
  }

  await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/milestones/${milestone_number}`,
    {
      method: "DELETE",
    }
  );
  return milestoneFormatters.formatDeleteMilestoneOutput(
    milestone_number,
    owner,
    repo
  );
}

module.exports = {
  listMilestones,
  createMilestone,
  editMilestone,
  deleteMilestone,
};
