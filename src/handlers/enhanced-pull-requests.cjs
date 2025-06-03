/**
 * Creates a new pull request.
 * @param {object} params - The parameters for creating the pull request.
 * @param {string} params.owner - The owner of the repository.
 * @param {string} params.repo - The name of the repository.
 * @param {string} params.title - The title of the pull request.
 * @param {string} params.head - The name of the branch where your changes are implemented.
 * @param {string} params.base - The name of the branch you want the changes pulled into.
 * @param {string} [params.body] - The body of the pull request.
 * @param {object} apiService - The GitHub API service instance.
 * @returns {Promise<object>} The created pull request object.
 */
async function create_pull_request({ owner, repo, title, head, base, body }, apiService) {
  return apiService.createPullRequest(
    owner,
    repo,
    title,
    head,
    base,
    body
  );
}

/**
 * Edits an existing pull request.
 * @param {object} params - The parameters for editing the pull request.
 * @param {string} params.owner - The owner of the repository.
 * @param {string} params.repo - The name of the repository.
 * @param {number} params.pull_number - The number of the pull request to edit.
 * @param {string} [params.title] - The new title of the pull request.
 * @param {string} [params.body] - The new body of the pull request.
 * @param {string} [params.state] - The new state of the pull request (e.g., 'open', 'closed').
 * @param {string} [params.base] - The new base branch for the pull request.
 * @param {boolean} [params.maintainer_can_modify] - Whether maintainers can modify the pull request.
 * @returns {Promise<object>} The updated pull request object.
 */
async function edit_pull_request({
  owner,
  repo,
  pull_number,
  title,
  body,
  state,
  base,
  maintainer_can_modify,
}, apiService) {
  return apiService.updatePullRequest(owner, repo, pull_number, {
    title,
    body,
    state,
    base,
    maintainer_can_modify,
  });
}

/**
 * Gets detailed information about a specific pull request.
 * @param {object} params - The parameters for getting pull request details.
 * @param {string} params.owner - The owner of the repository.
 * @param {string} params.repo - The name of the repository.
 * @param {number} params.pull_number - The number of the pull request.
 * @returns {Promise<object>} The pull request object with detailed information.
 */
async function get_pr_details({ owner, repo, pull_number }, apiService) {
  return apiService.getPullRequest(owner, repo, pull_number);
}

/**
 * Lists reviews for a pull request.
 * @param {object} params - The parameters for listing pull request reviews.
 * @param {string} params.owner - The owner of the repository.
 * @param {string} params.repo - The name of the repository.
 * @param {number} params.pull_number - The number of the pull request.
 * @param {number} [params.per_page=30] - The number of results per page.
 * @param {number} [params.page=1] - The page number of the results to fetch.
 * @returns {Promise<Array<object>>} A list of review objects.
 */
async function list_pr_reviews({
  owner,
  repo,
  pull_number,
  per_page = 30,
  page = 1,
}, apiService) {
  return apiService.listPullRequestReviews(
    owner,
    repo,
    pull_number,
    per_page,
    page
  );
}

/**
 * Creates a new review for a pull request.
 * @param {object} params - The parameters for creating the pull request review.
 * @param {string} params.owner - The owner of the repository.
 * @param {string} params.repo - The name of the repository.
 * @param {number} params.pull_number - The number of the pull request.
 * @param {string} [params.commit_id] - The SHA of the commit that needs a review.
 * @param {string} [params.body] - The body text of the review.
 * @param {string} [params.event] - The review action ('APPROVE', 'REQUEST_CHANGES', or 'COMMENT').
 * @param {Array<object>} [params.comments] - Array of review comment objects.
 * @returns {Promise<object>} The created review object.
 */
async function create_pr_review({
  owner,
  repo,
  pull_number,
  commit_id,
  body,
  event,
  comments,
}, apiService) {
  return apiService.createPullRequestReview(owner, repo, pull_number, {
    commit_id,
    body,
    event,
    comments,
  });
}

/**
 * Lists files changed in a pull request.
 * @param {object} params - The parameters for listing pull request files.
 * @param {string} params.owner - The owner of the repository.
 * @param {string} params.repo - The name of the repository.
 * @param {number} params.pull_number - The number of the pull request.
 * @param {number} [params.per_page=30] - The number of results per page.
 * @param {number} [params.page=1] - The page number of the results to fetch.
 * @returns {Promise<Array<object>>} A list of file objects with diff stats.
 */
async function list_pr_files({
  owner,
  repo,
  pull_number,
  per_page = 30,
  page = 1,
}, apiService) {
  return apiService.listPullRequestFiles(
    owner,
    repo,
    pull_number,
    per_page,
    page
  );
}

module.exports = {
  create_pull_request,
  edit_pull_request,
  get_pr_details,
  list_pr_reviews,
  create_pr_review,
  list_pr_files,
};
