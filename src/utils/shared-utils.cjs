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
function getOwnerRepo(args, defaultRepo) {
  const owner = args.owner || (defaultRepo && defaultRepo.owner);
  const repo = args.repo || (defaultRepo && defaultRepo.repo);

  if (!owner || !repo) {
    throw new Error(
      "Repository owner and name must be provided either in arguments or as a default."
    );
  }
  return { owner, repo };
}

module.exports = {
  getOwnerRepo,
};
