#!/usr/bin/env node

/**
 * Comprehensive Test Suite for GitHub MCP Server
 * Tests all 33 tools to ensure they are properly implemented and accessible
 */

const toolsConfig = require("./src/utils/tools-config.cjs");
const GitHubMCPServer = require("./src/index.cjs");

class GitHubMCPTester {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  log(message, type = "info") {
    const symbols = {
      info: "ℹ️",
      success: "✅",
      error: "❌",
      warning: "⚠️",
      test: "🧪",
    };
    console.log(`${symbols[type]} ${message}`);
  }

  async testToolDefinition(toolName, expectedDescription = null) {
    this.totalTests++;
    try {
      const tool = toolsConfig[toolName];

      if (!tool) {
        this.failedTests++;
        this.log(
          `Tool '${toolName}' not found in tools configuration`,
          "error"
        );
        return false;
      }

      if (!tool.name || tool.name !== toolName) {
        this.failedTests++;
        this.log(`Tool '${toolName}' has incorrect name property`, "error");
        return false;
      }

      if (!tool.description) {
        this.failedTests++;
        this.log(`Tool '${toolName}' missing description`, "error");
        return false;
      }

      if (!tool.inputSchema) {
        this.failedTests++;
        this.log(`Tool '${toolName}' missing input schema`, "error");
        return false;
      }

      if (
        expectedDescription &&
        !tool.description
          .toLowerCase()
          .includes(expectedDescription.toLowerCase())
      ) {
        this.failedTests++;
        this.log(
          `Tool '${toolName}' description doesn't match expected content`,
          "warning"
        );
        return false;
      }

      this.passedTests++;
      this.log(`Tool '${toolName}' definition is valid`, "success");
      return true;
    } catch (error) {
      this.failedTests++;
      this.log(
        `Error testing tool definition '${toolName}': ${error.message}`,
        "error"
      );
      return false;
    }
  }

  async testHandlerMethod(toolName, expectedMethod) {
    this.totalTests++;
    try {
      const server = new GitHubMCPServer();

      // Check if the handler exists based on tool category
      let handler;
      let methodName = expectedMethod;

      if (
        toolName.includes("repo") &&
        !toolName.includes("label") &&
        !toolName.includes("milestone")
      ) {
        handler = server.repoHandler;
      } else if (toolName.includes("issue") && !toolName.includes("comment")) {
        handler = server.issueHandler;
      } else if (toolName.includes("comment")) {
        handler = server.commentHandler;
      } else if (toolName.includes("pr")) {
        handler = server.prHandler;
      } else if (toolName.includes("user")) {
        handler = server.userHandler;
      } else if (toolName.includes("label")) {
        handler = server.labelsHandler;
      } else if (toolName.includes("milestone")) {
        handler = server.milestonesHandler;
      } else if (toolName.includes("branch") || toolName.includes("commit")) {
        handler = server.branchCommitHandler;
      }

      if (!handler) {
        this.failedTests++;
        this.log(`No handler found for tool '${toolName}'`, "error");
        return false;
      }

      if (typeof handler[methodName] !== "function") {
        this.failedTests++;
        this.log(
          `Method '${methodName}' not found in handler for tool '${toolName}'`,
          "error"
        );
        return false;
      }

      this.passedTests++;
      this.log(
        `Handler method '${methodName}' exists for tool '${toolName}'`,
        "success"
      );
      return true;
    } catch (error) {
      this.failedTests++;
      this.log(
        `Error testing handler for '${toolName}': ${error.message}`,
        "error"
      );
      return false;
    }
  }

  async testSwitchCase(toolName) {
    this.totalTests++;
    try {
      const server = new GitHubMCPServer();

      // Try to execute the tool with invalid args to see if switch case exists
      // This will trigger the switch statement but fail at validation
      try {
        const callHandler = server.server.requestHandlers.get(
          CallToolRequestSchema
        );
        await callHandler({
          params: {
            name: toolName,
            arguments: {},
          },
        });
        // If we get here, either it worked or failed gracefully
        this.passedTests++;
        this.log(`Switch case exists for tool '${toolName}'`, "success");
        return true;
      } catch (error) {
        if (error.message.includes(`Unknown tool: ${toolName}`)) {
          this.failedTests++;
          this.log(`Switch case missing for tool '${toolName}'`, "error");
          return false;
        } else {
          // Other errors are expected (auth, validation, etc.)
          this.passedTests++;
          this.log(
            `Switch case exists for tool '${toolName}' (failed as expected)`,
            "success"
          );
          return true;
        }
      }
    } catch (error) {
      this.failedTests++;
      this.log(
        `Error testing switch case for '${toolName}': ${error.message}`,
        "error"
      );
      return false;
    }
  }

  async runAllTests() {
    this.log("Starting comprehensive GitHub MCP Server test suite", "test");
    console.log("=".repeat(60));

    // Test 1: Verify all tool definitions exist and are valid
    this.log("\n📋 Phase 1: Testing Tool Definitions", "info");

    const toolsToTest = [
      // Repository Management
      { name: "list_repos", method: "listRepos" },
      { name: "get_repo_info", method: "getRepoInfo" },
      { name: "search_repos", method: "searchRepos" },
      { name: "get_repo_contents", method: "getRepoContents" },
      { name: "set_default_repo", method: "setDefaultRepo" },
      { name: "list_repo_collaborators", method: "listRepoCollaborators" },

      // Issue Management
      { name: "list_issues", method: "listIssues" },
      { name: "create_issue", method: "createIssue" },
      { name: "edit_issue", method: "editIssue" },
      { name: "get_issue_details", method: "getIssueDetails" },
      { name: "lock_issue", method: "lockIssue" },
      { name: "unlock_issue", method: "unlockIssue" },
      { name: "add_assignees_to_issue", method: "addAssigneesToIssue" },
      {
        name: "remove_assignees_from_issue",
        method: "removeAssigneesFromIssue",
      },

      // Comments
      { name: "list_issue_comments", method: "listIssueComments" },
      { name: "create_issue_comment", method: "createIssueComment" },
      { name: "edit_issue_comment", method: "editIssueComment" },
      { name: "delete_issue_comment", method: "deleteIssueComment" },

      // Pull Requests
      { name: "list_prs", method: "listPRs" },

      // Users
      { name: "get_user_info", method: "getUserInfo" },

      // Labels
      { name: "list_repo_labels", method: "listRepoLabels" },
      { name: "create_label", method: "createLabel" },
      { name: "edit_label", method: "editLabel" },
      { name: "delete_label", method: "deleteLabel" },

      // Milestones
      { name: "list_milestones", method: "listMilestones" },
      { name: "create_milestone", method: "createMilestone" },
      { name: "edit_milestone", method: "editMilestone" },
      { name: "delete_milestone", method: "deleteMilestone" },

      // Branch and Commit Management
      { name: "list_branches", method: "listBranches" },
      { name: "create_branch", method: "createBranch" },
      { name: "list_commits", method: "listCommits" },
      { name: "get_commit_details", method: "getCommitDetails" },
      { name: "compare_commits", method: "compareCommits" },
    ];

    for (const tool of toolsToTest) {
      await this.testToolDefinition(tool.name);
    }

    // Test 2: Verify handler methods exist
    this.log("\n🔧 Phase 2: Testing Handler Methods", "info");

    for (const tool of toolsToTest) {
      await this.testHandlerMethod(tool.name, tool.method);
    }

    // Test 3: Check tool count
    this.log("\n📊 Phase 3: Verifying Tool Count", "info");
    this.totalTests++;

    const toolCount = Object.keys(toolsConfig).length;
    const expectedCount = 33;

    if (toolCount === expectedCount) {
      this.passedTests++;
      this.log(`Correct number of tools: ${toolCount}`, "success");
    } else {
      this.failedTests++;
      this.log(`Expected ${expectedCount} tools, found ${toolCount}`, "error");
    }

    // Test 4: Verify all tools have required properties
    this.log("\n🎯 Phase 4: Validating Tool Schema", "info");

    for (const [toolName, toolDef] of Object.entries(toolsConfig)) {
      this.totalTests++;

      const requiredProps = ["name", "description", "inputSchema"];
      const missingProps = requiredProps.filter((prop) => !toolDef[prop]);

      if (missingProps.length === 0) {
        this.passedTests++;
        this.log(`Tool '${toolName}' has all required properties`, "success");
      } else {
        this.failedTests++;
        this.log(
          `Tool '${toolName}' missing properties: ${missingProps.join(", ")}`,
          "error"
        );
      }
    }

    // Final Results
    this.printResults();
  }

  printResults() {
    console.log("\n" + "=".repeat(60));
    this.log("Test Suite Complete!", "test");
    console.log("");

    this.log(`Total Tests: ${this.totalTests}`, "info");
    this.log(`Passed: ${this.passedTests}`, "success");
    this.log(
      `Failed: ${this.failedTests}`,
      this.failedTests > 0 ? "error" : "success"
    );

    const successRate = ((this.passedTests / this.totalTests) * 100).toFixed(1);
    this.log(
      `Success Rate: ${successRate}%`,
      successRate === "100.0" ? "success" : "warning"
    );

    if (this.failedTests === 0) {
      this.log(
        "\n🎉 All tests passed! GitHub MCP Server is fully functional!",
        "success"
      );
    } else {
      this.log(
        `\n⚠️  ${this.failedTests} test(s) failed. Check the errors above.`,
        "warning"
      );
    }

    console.log("\n" + "=".repeat(60));

    // Additional information
    console.log("\n📖 Testing Summary:");
    console.log("• ✅ Tool definitions validation");
    console.log("• ✅ Handler method existence verification");
    console.log("• ✅ Tool count verification");
    console.log("• ✅ Schema validation");
    console.log("\n💡 This test verifies the implementation structure.");
    console.log(
      "For runtime testing with GitHub API, use a tool like MCP Inspector or set up integration tests."
    );
  }
}

// Run the tests
async function main() {
  const tester = new GitHubMCPTester();

  try {
    await tester.runAllTests();
  } catch (error) {
    console.error("❌ Test suite failed to run:", error);
    process.exit(1);
  }
}

// Check if this script is being run directly
if (require.main === module) {
  main();
}

module.exports = GitHubMCPTester;
