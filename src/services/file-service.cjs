// src/services/file-service.cjs
const githubApi = require("./github-api.cjs");
const fs = require("fs").promises;
const path = require("path");

// Helper function to encode file content to base64
async function encodeFileToBase64(filePath) {
  const content = await fs.readFile(filePath);
  return Buffer.from(content).toString("base64");
}

async function createFile(owner, repo, filePath, content, message, branch) {
  // For text files, content is a string. For binary, it should be base64 encoded.
  // This service assumes content is already appropriately formatted.
  return githubApi.createOrUpdateFile(
    owner,
    repo,
    filePath,
    message,
    content,
    null,
    branch
  );
}

async function updateFile(
  owner,
  repo,
  filePath,
  content,
  message,
  sha,
  branch
) {
  // For text files, content is a string. For binary, it should be base64 encoded.
  // This service assumes content is already appropriately formatted.
  return githubApi.createOrUpdateFile(
    owner,
    repo,
    filePath,
    message,
    content,
    sha,
    branch
  );
}

async function uploadBinaryFile(
  owner,
  repo,
  filePathInRepo,
  localFilePath,
  message,
  branch
) {
  const content = await encodeFileToBase64(localFilePath);
  // Check if file exists to get SHA for update, otherwise create
  let sha = null;
  try {
    const existingFile = await githubApi.getRepoContents(
      owner,
      repo,
      filePathInRepo,
      branch
    );
    if (existingFile && existingFile.sha) {
      sha = existingFile.sha;
    }
  } catch (error) {
    // If file not found, it's a new file, SHA remains null
    if (error.status !== 404) {
      throw error; // Re-throw other errors
    }
  }
  return githubApi.createOrUpdateFile(
    owner,
    repo,
    filePathInRepo,
    message,
    content,
    sha,
    branch
  );
}

async function deleteFile(owner, repo, filePath, message, sha, branch) {
  return githubApi.deleteFileFromRepo(
    owner,
    repo,
    filePath,
    message,
    sha,
    branch
  );
}

module.exports = {
  createFile,
  updateFile,
  uploadBinaryFile,
  deleteFile,
  encodeFileToBase64, // Exporting for potential direct use in handlers if needed
};
