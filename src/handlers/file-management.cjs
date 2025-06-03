// src/handlers/file-management.cjs
const fileService = require("../services/file-service.cjs");

async function createFileHandler(params) {
  const {
    owner,
    repo,
    path: filePath,
    content,
    message,
    branch,
    is_binary,
  } = params;
  if (!filePath || !content || !message) {
    return {
      success: false,
      message:
        "File path, content, and message are required for creating a file.",
    };
  }
  try {
    let fileContent = content;
    if (is_binary) {
      // Assuming content for binary is already base64 encoded by the client or a previous step
      // If not, this is where encoding from a local path or raw binary data would happen.
      // For now, we trust `content` is base64 if `is_binary` is true.
    } else {
      // For text files, ensure content is a string and then base64 encode it for the API
      fileContent = Buffer.from(String(content)).toString("base64");
    }
    const result = await fileService.createFile(
      owner,
      repo,
      filePath,
      fileContent,
      message,
      branch
    );
    return {
      success: true,
      message: `File '${filePath}' created successfully.`,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error creating file: ${error.message}`,
      error: error.toString(),
    };
  }
}

async function updateFileHandler(params) {
  const {
    owner,
    repo,
    path: filePath,
    content,
    message,
    sha,
    branch,
    is_binary,
  } = params;
  if (!filePath || !content || !message || !sha) {
    return {
      success: false,
      message:
        "File path, content, message, and SHA are required for updating a file.",
    };
  }
  try {
    let fileContent = content;
    if (is_binary) {
      // As with create, assuming content is base64 if is_binary.
    } else {
      fileContent = Buffer.from(String(content)).toString("base64");
    }
    const result = await fileService.updateFile(
      owner,
      repo,
      filePath,
      fileContent,
      message,
      sha,
      branch
    );
    return {
      success: true,
      message: `File '${filePath}' updated successfully.`,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error updating file: ${error.message}`,
      error: error.toString(),
    };
  }
}

async function uploadFileHandler(params) {
  // This handler expects a local path to the file to be uploaded.
  // The service layer will handle reading and base64 encoding.
  const {
    owner,
    repo,
    path_in_repo: filePathInRepo,
    local_file_path: localFilePath,
    message,
    branch,
  } = params;
  if (!filePathInRepo || !localFilePath || !message) {
    return {
      success: false,
      message:
        "Repository path, local file path, and message are required for uploading a file.",
    };
  }
  try {
    const result = await fileService.uploadBinaryFile(
      owner,
      repo,
      filePathInRepo,
      localFilePath,
      message,
      branch
    );
    return {
      success: true,
      message: `File '${localFilePath}' uploaded to '${filePathInRepo}' successfully.`,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error uploading file: ${error.message}`,
      error: error.toString(),
    };
  }
}

async function deleteFileHandler(params) {
  const { owner, repo, path: filePath, message, sha, branch } = params;
  if (!filePath || !message || !sha) {
    return {
      success: false,
      message: "File path, message, and SHA are required for deleting a file.",
    };
  }
  try {
    const result = await fileService.deleteFile(
      owner,
      repo,
      filePath,
      message,
      sha,
      branch
    );
    return {
      success: true,
      message: `File '${filePath}' deleted successfully.`,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error deleting file: ${error.message}`,
      error: error.toString(),
    };
  }
}

module.exports = {
  createFileHandler,
  updateFileHandler,
  uploadFileHandler,
  deleteFileHandler,
};
