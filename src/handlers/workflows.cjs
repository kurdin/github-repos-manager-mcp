// const githubApiService = require("../services/github-api"); // Will be passed in as apiService
const { getRepoOwnerAndName } = require("../utils/shared-utils.cjs"); // Corrected path

async function list_workflows(params, apiService) {
  // Changed octokit to apiService
  const { owner: paramOwner, repo: paramRepo, per_page, page } = params;
  try {
    const { owner, repo } = await getRepoOwnerAndName(
      paramOwner,
      paramRepo,
      apiService.octokit // Assuming getRepoOwnerAndName needs octokit instance from the apiService
    );
    const result = await apiService.listWorkflows(
      // Use passed-in apiService
      owner,
      repo,
      per_page,
      page
    );
    return result;
  } catch (error) {
    console.error("Error in list_workflows handler:", error.message);
    return { error: error.message };
  }
}

async function list_workflow_runs(params, apiService) {
  // Changed octokit to apiService
  const {
    owner: paramOwner,
    repo: paramRepo,
    workflow_id,
    ...otherParams
  } = params;
  try {
    const { owner, repo } = await getRepoOwnerAndName(
      paramOwner,
      paramRepo,
      apiService.octokit // Assuming getRepoOwnerAndName needs octokit instance
    );
    const result = await apiService.listWorkflowRuns(
      // Use passed-in apiService
      owner,
      repo,
      workflow_id,
      otherParams
    );
    return result;
  } catch (error) {
    console.error("Error in list_workflow_runs handler:", error.message);
    return { error: error.message };
  }
}

async function get_workflow_run_details(params, apiService) {
  // Changed octokit to apiService
  const {
    owner: paramOwner,
    repo: paramRepo,
    run_id,
    exclude_pull_requests,
  } = params;
  try {
    const { owner, repo } = await getRepoOwnerAndName(
      paramOwner,
      paramRepo,
      apiService.octokit // Assuming getRepoOwnerAndName needs octokit instance
    );
    const result = await apiService.getWorkflowRunDetails(
      // Use passed-in apiService
      owner,
      repo,
      run_id,
      exclude_pull_requests
    );
    return result;
  } catch (error) {
    console.error("Error in get_workflow_run_details handler:", error.message);
    return { error: error.message };
  }
}

async function trigger_workflow(params, apiService) {
  // Changed octokit to apiService
  const {
    owner: paramOwner,
    repo: paramRepo,
    workflow_id,
    ref,
    inputs,
  } = params;
  try {
    const { owner, repo } = await getRepoOwnerAndName(
      paramOwner,
      paramRepo,
      apiService.octokit // Assuming getRepoOwnerAndName needs octokit instance
    );
    const result = await apiService.triggerWorkflow(
      // Use passed-in apiService
      owner,
      repo,
      workflow_id,
      ref,
      inputs
    );
    return result;
  } catch (error) {
    console.error("Error in trigger_workflow handler:", error.message);
    return { error: error.message };
  }
}

async function download_workflow_artifacts(params, apiService) {
  // Changed octokit to apiService
  const {
    owner: paramOwner,
    repo: paramRepo,
    artifact_id,
    archive_format,
  } = params;
  try {
    const { owner, repo } = await getRepoOwnerAndName(
      paramOwner,
      paramRepo,
      apiService.octokit // Assuming getRepoOwnerAndName needs octokit instance
    );
    const result = await apiService.downloadWorkflowArtifact(
      // Use passed-in apiService
      owner,
      repo,
      artifact_id,
      archive_format
    );
    return result;
  } catch (error) {
    console.error(
      "Error in download_workflow_artifacts handler:",
      error.message
    );
    return { error: error.message };
  }
}

async function cancel_workflow_run(params, apiService) {
  // Changed octokit to apiService
  const { owner: paramOwner, repo: paramRepo, run_id } = params;
  try {
    const { owner, repo } = await getRepoOwnerAndName(
      paramOwner,
      paramRepo,
      apiService.octokit // Assuming getRepoOwnerAndName needs octokit instance
    );
    const result = await apiService.cancelWorkflowRun(
      // Use passed-in apiService
      owner,
      repo,
      run_id
    );
    return result;
  } catch (error) {
    console.error("Error in cancel_workflow_run handler:", error.message);
    return { error: error.message };
  }
}

module.exports = {
  list_workflows,
  list_workflow_runs,
  get_workflow_run_details,
  trigger_workflow,
  download_workflow_artifacts,
  cancel_workflow_run,
};
