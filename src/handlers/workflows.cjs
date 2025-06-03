async function list_workflows(params, apiService) {
  const { owner, repo, per_page, page } = params;
  
  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for list_workflows. Please provide them in arguments or ensure a default is set."
    );
  }
  
  try {
    const result = await apiService.listWorkflows(
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
  const {
    owner,
    repo,
    workflow_id,
    ...otherParams
  } = params;
  
  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for list_workflow_runs. Please provide them in arguments or ensure a default is set."
    );
  }
  
  if (!workflow_id) {
    throw new Error("workflow_id is required for list_workflow_runs.");
  }
  
  try {
    const result = await apiService.listWorkflowRuns(
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
  const {
    owner,
    repo,
    run_id,
    exclude_pull_requests,
  } = params;
  
  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for get_workflow_run_details. Please provide them in arguments or ensure a default is set."
    );
  }
  
  if (!run_id) {
    throw new Error("run_id is required for get_workflow_run_details.");
  }
  
  try {
    const result = await apiService.getWorkflowRunDetails(
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
  const {
    owner,
    repo,
    workflow_id,
    ref,
    inputs,
  } = params;
  
  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for trigger_workflow. Please provide them in arguments or ensure a default is set."
    );
  }
  
  if (!workflow_id) {
    throw new Error("workflow_id is required for trigger_workflow.");
  }
  
  if (!ref) {
    throw new Error("ref (branch or tag) is required for trigger_workflow.");
  }
  
  try {
    const result = await apiService.triggerWorkflow(
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
  const {
    owner,
    repo,
    artifact_id,
    archive_format,
  } = params;
  
  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for download_workflow_artifacts. Please provide them in arguments or ensure a default is set."
    );
  }
  
  if (!artifact_id) {
    throw new Error("artifact_id is required for download_workflow_artifacts.");
  }
  
  try {
    const result = await apiService.downloadWorkflowArtifact(
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
  const { owner, repo, run_id } = params;
  
  if (!owner || !repo) {
    throw new Error(
      "Owner and repository name are required for cancel_workflow_run. Please provide them in arguments or ensure a default is set."
    );
  }
  
  if (!run_id) {
    throw new Error("run_id is required for cancel_workflow_run.");
  }
  
  try {
    const result = await apiService.cancelWorkflowRun(
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
