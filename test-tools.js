#!/usr/bin/env node

// Simple test to verify all tools are properly wired up
const toolsConfig = require("./src/utils/tools-config.cjs");

async function testTools() {
  try {
    const tools = Object.values(toolsConfig);

    console.log(`✅ Found ${tools.length} tools defined:`);
    tools.forEach((tool) => {
      console.log(`  - ${tool.name}: ${tool.description.substring(0, 50)}...`);
    });

    // Check that all expected tools are present
    const expectedTools = [
      "list_repos",
      "get_repo_info",
      "search_repos",
      "get_repo_contents",
      "set_default_repo",
      "list_repo_collaborators",
      "list_issues",
      "create_issue",
      "edit_issue",
      "get_issue_details",
      "lock_issue",
      "unlock_issue",
      "add_assignees_to_issue",
      "remove_assignees_from_issue",
      "list_prs",
      "get_user_info",
      "list_issue_comments",
      "create_issue_comment",
      "edit_issue_comment",
      "delete_issue_comment",
      "list_repo_labels",
      "create_label",
      "edit_label",
      "delete_label",
      "list_milestones",
      "create_milestone",
      "edit_milestone",
      "delete_milestone",
      "list_branches",
      "create_branch",
      "list_commits",
      "get_commit_details",
      "compare_commits",
    ];

    const toolNames = tools.map((tool) => tool.name);
    const missing = expectedTools.filter((name) => !toolNames.includes(name));
    const extra = toolNames.filter((name) => !expectedTools.includes(name));

    if (missing.length > 0) {
      console.log(`❌ Missing tools: ${missing.join(", ")}`);
    }

    if (extra.length > 0) {
      console.log(`ℹ️  Extra tools: ${extra.join(", ")}`);
    }

    if (missing.length === 0) {
      console.log(
        `✅ All ${expectedTools.length} expected tools are properly configured!`
      );
    }

    console.log(`\n🎯 Total tools available: ${tools.length}`);
  } catch (error) {
    console.error("❌ Error testing tools:", error.message);
  }
}

testTools();
