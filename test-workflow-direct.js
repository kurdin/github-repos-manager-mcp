#!/usr/bin/env node

// Direct test of workflow handlers

const GitHubAPIService = require('./src/services/github-api.cjs');
const workflowHandlers = require('./src/handlers/workflows.cjs');

async function testWorkflowHandlers() {
  console.log('Testing workflow handlers directly...\n');
  
  if (!process.env.GH_TOKEN) {
    console.error('Error: GH_TOKEN environment variable is not set');
    process.exit(1);
  }
  
  const api = new GitHubAPIService(process.env.GH_TOKEN);
  
  // Test 1: List workflows
  console.log('=== Test 1: List workflows ===');
  try {
    const result = await workflowHandlers.list_workflows({
      owner: 'microsoft',
      repo: 'vscode',
      per_page: 5
    }, api);
    
    if (result.error) {
      console.log('Error:', result.error);
    } else {
      console.log('Success! Found workflows:');
      if (result.workflows) {
        result.workflows.forEach(wf => {
          console.log(`- ${wf.name} (${wf.path})`);
        });
      } else {
        console.log('Raw result:', JSON.stringify(result, null, 2).substring(0, 500));
      }
    }
  } catch (error) {
    console.log('Exception:', error.message);
  }
  
  console.log('\n=== Test 2: List workflow runs ===');
  try {
    // First, get a workflow ID
    const workflowsResult = await api.listWorkflows('microsoft', 'vscode', 1);
    if (workflowsResult.workflows && workflowsResult.workflows.length > 0) {
      const firstWorkflow = workflowsResult.workflows[0];
      console.log(`Using workflow: ${firstWorkflow.name} (ID: ${firstWorkflow.id})`);
      
      const runsResult = await workflowHandlers.list_workflow_runs({
        owner: 'microsoft',
        repo: 'vscode',
        workflow_id: firstWorkflow.id,
        per_page: 3
      }, api);
      
      if (runsResult.error) {
        console.log('Error:', runsResult.error);
      } else {
        console.log('Success! Found workflow runs:');
        if (runsResult.workflow_runs) {
          runsResult.workflow_runs.forEach(run => {
            console.log(`- Run #${run.run_number}: ${run.status} (${run.created_at})`);
          });
        } else {
          console.log('Raw result:', JSON.stringify(runsResult, null, 2).substring(0, 500));
        }
      }
    }
  } catch (error) {
    console.log('Exception:', error.message);
  }
}

testWorkflowHandlers().catch(console.error);