// src/handlers/file-management.cjs
const { getOwnerRepo } = require("../utils/shared-utils.cjs");

async function createFileHandler(params, defaultRepo, apiService) {
  try {
    const { owner, repo } = getOwnerRepo(params, defaultRepo);
    const {
      path: filePath,
      content,
      message,
      branch,
      is_binary,
    } = params;
    
    if (!filePath || !content || !message) {
      throw new Error("File path, content, and message are required for creating a file.");
    }
    
    let fileContent = content;
    if (is_binary) {
      // Assuming content for binary is already base64 encoded by the client or a previous step
      // If not, this is where encoding from a local path or raw binary data would happen.
      // For now, we trust `content` is base64 if `is_binary` is true.
    } else {
      // For text files, ensure content is a string and then base64 encode it for the API
      fileContent = Buffer.from(String(content)).toString("base64");
    }
    
    const result = await apiService.createOrUpdateFile(
      owner,
      repo,
      filePath,
      message,
      fileContent,
      null, // sha is null for creating new files
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

async function updateFileHandler(params, defaultRepo, apiService) {
  try {
    const { owner, repo } = getOwnerRepo(params, defaultRepo);
    const {
      path: filePath,
      content,
      message,
      sha,
      branch,
      is_binary,
    } = params;
    
    if (!filePath || !content || !message || !sha) {
      throw new Error("File path, content, message, and SHA are required for updating a file.");
    }
    
    let fileContent = content;
    if (is_binary) {
      // As with create, assuming content is base64 if is_binary.
    } else {
      fileContent = Buffer.from(String(content)).toString("base64");
    }
    
    const result = await apiService.createOrUpdateFile(
      owner,
      repo,
      filePath,
      message,
      fileContent,
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

async function uploadFileHandler(params, defaultRepo, apiService) {
  try {
    const { owner, repo } = getOwnerRepo(params, defaultRepo);
    const {
      path_in_repo: filePathInRepo,
      local_file_path: localFilePath,
      message,
      branch,
    } = params;
    
    if (!filePathInRepo || !localFilePath || !message) {
      throw new Error("Repository path, local file path, and message are required for uploading a file.");
    }
    
    // Read and encode file content
    const fs = require("fs").promises;
    const fileContent = await fs.readFile(localFilePath);
    const base64Content = Buffer.from(fileContent).toString("base64");
    
    // Check if file exists to get SHA for update, otherwise create
    let sha = null;
    try {
      const existingFile = await apiService.getRepoContents(
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
    
    const result = await apiService.createOrUpdateFile(
      owner,
      repo,
      filePathInRepo,
      message,
      base64Content,
      sha,
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

async function deleteFileHandler(params, defaultRepo, apiService) {
  try {
    const { owner, repo } = getOwnerRepo(params, defaultRepo);
    const { path: filePath, message, sha, branch } = params;
    
    if (!filePath || !message || !sha) {
      throw new Error("File path, message, and SHA are required for deleting a file.");
    }
    
    const result = await apiService.deleteFileFromRepo(
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
