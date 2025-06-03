/**
 * @typedef {import('../services/github-api.cjs').GitHubRepo} GitHubRepo
 */

/**
 * Determines the owner and repository to use for an operation.
 * Uses provided args if available, otherwise falls back to the defaultRepo.
 * Throws an error if owner or repo cannot be determined.
 * @param {object} args - The arguments object, potentially containing owner and repo.
 * @param {string} [args.owner] - Repository owner from arguments.
 * @param {string} [args.repo] - Repository name from arguments.
 * @param {GitHubRepo} defaultRepo - The default repository object.
 * @param {string} [defaultRepo.owner] - Default repository owner.
 * @param {string} [defaultRepo.repo] - Default repository name.
 * @returns {{owner: string, repo: string}} - The determined owner and repository.
 * @throws {Error} If owner or repo is missing.
 */
function getOwnerRepo(args = {}, defaultRepo = {}) {
  const owner = args.owner || (defaultRepo && defaultRepo.owner);
  const repo = args.repo || (defaultRepo && defaultRepo.repo);

  if (!owner || typeof owner !== 'string' || owner.trim() === '') {
    throw new Error(
      "Repository owner must be provided either in arguments or as a default."
    );
  }
  
  if (!repo || typeof repo !== 'string' || repo.trim() === '') {
    throw new Error(
      "Repository name must be provided either in arguments or as a default."
    );
  }
  
  return { owner: owner.trim(), repo: repo.trim() };
}

/**
 * Determines the owner and repository to use for an operation (alternative implementation).
 * This function is used by some handlers that expect different parameter order.
 * @param {object|string} argsOrOwner - The arguments object or owner string.
 * @param {object|string} defaultRepoOrRepo - The default repository object or repo string.
 * @param {object} [octokit] - The octokit instance (not used, kept for compatibility).
 * @returns {{owner: string, repo: string}} - The determined owner and repository.
 * @throws {Error} If owner or repo is missing.
 */
function getRepoOwnerAndName(argsOrOwner, defaultRepoOrRepo, octokit) {
  try {
    // Handle when called with (args, defaultRepo, octokit)
    if (typeof argsOrOwner === 'object' && argsOrOwner !== null && !Array.isArray(argsOrOwner)) {
      return getOwnerRepo(argsOrOwner, defaultRepoOrRepo);
    }
    
    // Handle when called with (owner, repo, octokit)
    if (typeof argsOrOwner === 'string' && typeof defaultRepoOrRepo === 'string') {
      const owner = argsOrOwner.trim();
      const repo = defaultRepoOrRepo.trim();
      
      if (!owner || !repo) {
        throw new Error("Owner and repo must be non-empty strings");
      }
      
      return { owner, repo };
    }
    
    throw new Error("Invalid parameters passed to getRepoOwnerAndName");
  } catch (error) {
    // Re-throw with better error message
    throw new Error(`getRepoOwnerAndName error: ${error.message}`);
  }
}

/**
 * Log an error message to the console.
 * @param {string} message - The error message.
 * @param {Error} [error] - The error object (optional).
 */
function logError(message, error) {
  console.error(message);
  if (error && error.stack) {
    console.error("Stack trace:", error.stack);
  }
}

/**
 * Log an info message to the console.
 * @param {string} message - The info message.
 */
function logInfo(message) {
  console.log(message);
}

/**
 * Handle an error by logging it and re-throwing.
 * @param {Error} error - The error object.
 * @param {string} message - Additional context message.
 * @throws {Error} Always throws the original error.
 */
function handleError(error, message) {
  logError(`${message}: ${error.message}`, error);
  throw error;
}

/**
 * Validate that required parameters are present.
 * @param {object} params - The parameters object to validate.
 * @param {string[]} required - Array of required parameter names.
 * @throws {Error} If any required parameter is missing.
 */
function validateRequiredParams(params, required) {
  const missing = required.filter(param => !params[param]);
  if (missing.length > 0) {
    throw new Error(`Missing required parameters: ${missing.join(', ')}`);
  }
}

module.exports = {
  getOwnerRepo,
  getRepoOwnerAndName,
  logError,
  logInfo,
  handleError,
  validateRequiredParams,
};
