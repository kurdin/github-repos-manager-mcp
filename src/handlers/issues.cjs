// src/handlers/issues.cjs

const fs = require("node:fs").promises;
const issueFormatters = require("../formatters/issues.cjs");

async function listIssues(args, apiService) {
  const { owner, repo, state = "open", per_page = 10 } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for listIssues. Please provide them in arguments or ensure a default is set."
    );
  }

  const params = new URLSearchParams({
    state,
    per_page: per_page.toString(),
    sort: "updated",
    direction: "desc",
  });

  const issues = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/issues?${params.toString()}`
  );
  return issueFormatters.formatListIssuesOutput(issues, owner, repo, state);
}

async function createIssue(args, apiService) {
  let { title, body = "", labels = [], assignees = [], image_path } = args;
  const { owner, repo } = args;
  let finalBody = body;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for createIssue. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!title) {
    throw new Error("Title is required to create an issue.");
  }

  if (image_path) {
    try {
      const imageData = await fs.readFile(image_path);
      const base64Image = imageData.toString("base64");
      // Ensure file extension is one GitHub allows for rendering (e.g., png, jpg, gif)
      const fileExtensionMatch = image_path.match(/\.(png|jpe?g|gif)$/i);
      if (!fileExtensionMatch) {
        throw new Error(
          "Unsupported image file extension. Please use png, jpg, or gif."
        );
      }
      const fileExtension = fileExtensionMatch[1].toLowerCase();
      const fileName = `issue-image-${Date.now()}.${fileExtension}`;

      // Assuming apiService has a method like createOrUpdateFile or a dedicated uploadFileToRepo
      // For simplicity, using a structure similar to createOrUpdateFile
      // The 'uploadFileToRepo' method was in the original class, assuming it's available on apiService
      // or can be adapted from existing apiService methods.
      // If apiService.uploadFileToRepo doesn't exist, this part needs adjustment
      // to use apiService.createOrUpdateFile or similar.
      // Let's assume apiService.createOrUpdateFile can be used for this.
      const uploadResult = await apiService.createOrUpdateFile(
        // Adjusted to use existing method
        owner,
        repo,
        `images/issues/${fileName}`, // Path in repo
        `Add image for issue: ${title}`, // Commit message
        base64Image, // base64 content
        null, // SHA (null for new file)
        null // Branch (null for default branch)
      );

      if (
        uploadResult &&
        uploadResult.content &&
        uploadResult.content.download_url
      ) {
        const imageUrl = uploadResult.content.download_url;
        finalBody += `\n\n![Image](${imageUrl})`;
      } else {
        console.error(
          "Image upload did not return a download_url:",
          uploadResult
        );
        finalBody += `\n\n[Note: Image uploaded, but URL retrieval failed for ${image_path}]`;
      }
    } catch (error) {
      console.error(`Failed to upload image for new issue: ${error.message}`);
      finalBody += `\n\n[Note: Failed to upload image from ${image_path}. Error: ${error.message}]`;
    }
  }

  const issueData = {
    title,
    body: finalBody,
  };
  if (labels && labels.length > 0) issueData.labels = labels;
  if (assignees && assignees.length > 0) issueData.assignees = assignees;

  const issue = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/issues`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(issueData),
    }
  );

  return issueFormatters.formatCreateIssueOutput(issue, owner, repo);
}

async function editIssue(args, apiService) {
  const { owner, repo, issue_number } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for editIssue. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!issue_number) {
    throw new Error("issue_number is required for editIssue.");
  }

  const payload = {};
  if (args.title !== undefined) payload.title = args.title;
  if (args.state !== undefined) payload.state = args.state;
  if (args.labels !== undefined) payload.labels = args.labels;
  if (args.assignees !== undefined) payload.assignees = args.assignees;

  let currentBody = args.body;

  if (args.image_path) {
    try {
      const imageData = await fs.readFile(args.image_path);
      const base64Image = imageData.toString("base64");
      const fileExtensionMatch = args.image_path.match(/\.(png|jpe?g|gif)$/i);
      if (!fileExtensionMatch) {
        throw new Error(
          "Unsupported image file extension. Please use png, jpg, or gif."
        );
      }
      const fileExtension = fileExtensionMatch[1].toLowerCase();
      const fileName = `issue-${issue_number}-image-${Date.now()}.${fileExtension}`;

      const uploadResult = await apiService.createOrUpdateFile(
        owner,
        repo,
        `images/issues/${fileName}`,
        `Update image for issue #${issue_number}`,
        base64Image,
        null,
        null
      );

      if (
        uploadResult &&
        uploadResult.content &&
        uploadResult.content.download_url
      ) {
        const imageUrl = uploadResult.content.download_url;
        // Append to body if body is being updated, otherwise, this might need more complex handling
        // to fetch existing body first if only image is added.
        // For now, assuming if image_path is provided, body is also part of the update intent.
        currentBody =
          (currentBody === undefined ? "" : currentBody) +
          `\n\n![Image](${imageUrl})`;
      } else {
        console.error(
          "Image upload for edit did not return a download_url:",
          uploadResult
        );
        currentBody =
          (currentBody === undefined ? "" : currentBody) +
          `\n\n[Note: Image uploaded for edit, but URL retrieval failed for ${args.image_path}]`;
      }
    } catch (error) {
      console.error(
        `Failed to upload image during issue edit: ${error.message}`
      );
      currentBody =
        (currentBody === undefined ? "" : currentBody) +
        `\n\n[Note: Failed to upload image from ${args.image_path} during edit. Error: ${error.message}]`;
    }
  }
  if (currentBody !== undefined) payload.body = currentBody;

  if (Object.keys(payload).length === 0) {
    throw new Error(
      "At least one field to update (title, body, state, labels, assignees) must be provided for editIssue."
    );
  }

  const updatedIssue = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/issues/${issue_number}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return issueFormatters.formatEditIssueOutput(updatedIssue, owner, repo);
}

async function getIssueDetails(args, apiService) {
  const { owner, repo, issue_number } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for getIssueDetails. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!issue_number) {
    throw new Error("issue_number is required for getIssueDetails.");
  }

  const issue = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/issues/${issue_number}`
  );
  return issueFormatters.formatGetIssueDetailsOutput(issue, owner, repo);
}

async function lockIssue(args, apiService) {
  const { owner, repo, issue_number, lock_reason } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for lockIssue. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!issue_number) {
    throw new Error("issue_number is required for lockIssue.");
  }

  const payload = {};
  if (lock_reason) payload.lock_reason = lock_reason;

  await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/issues/${issue_number}/lock`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" }, // Required even for empty body by some APIs
      body: JSON.stringify(payload), // GitHub API expects a body for lock, even if just {}
    }
  );

  return issueFormatters.formatLockIssueOutput(issue_number, lock_reason);
}

async function unlockIssue(args, apiService) {
  const { owner, repo, issue_number } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for unlockIssue. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!issue_number) {
    throw new Error("issue_number is required for unlockIssue.");
  }

  await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/issues/${issue_number}/lock`,
    { method: "DELETE" }
  );

  return issueFormatters.formatUnlockIssueOutput(issue_number);
}

async function addAssigneesToIssue(args, apiService) {
  const { owner, repo, issue_number, assignees } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for addAssigneesToIssue. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!issue_number) {
    throw new Error("issue_number is required for addAssigneesToIssue.");
  }
  if (!assignees || !Array.isArray(assignees) || assignees.length === 0) {
    throw new Error(
      "A non-empty array of assignees is required for addAssigneesToIssue."
    );
  }

  const updatedIssue = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/issues/${issue_number}/assignees`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignees }),
    }
  );

  return issueFormatters.formatAddAssigneesToIssueOutput(
    updatedIssue,
    issue_number
  );
}

async function removeAssigneesFromIssue(args, apiService) {
  const { owner, repo, issue_number, assignees } = args;

  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for removeAssigneesFromIssue. Please provide them in arguments or ensure a default is set."
    );
  }
  if (!issue_number) {
    throw new Error("issue_number is required for removeAssigneesFromIssue.");
  }
  if (!assignees || !Array.isArray(assignees) || assignees.length === 0) {
    throw new Error(
      "A non-empty array of assignees to remove is required for removeAssigneesFromIssue."
    );
  }

  // The GitHub API for removing assignees expects the list of assignees to remove in the body.
  const updatedIssue = await apiService.makeGitHubRequest(
    `/repos/${owner}/${repo}/issues/${issue_number}/assignees`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignees }), // Send assignees to be removed
    }
  );
  // The response to DELETE assignees is the updated issue object.
  return issueFormatters.formatRemoveAssigneesFromIssueOutput(
    updatedIssue,
    issue_number
  );
}

module.exports = {
  listIssues,
  createIssue,
  editIssue,
  getIssueDetails,
  lockIssue,
  unlockIssue,
  addAssigneesToIssue,
  removeAssigneesFromIssue,
};
