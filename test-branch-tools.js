#!/usr/bin/env node

// Quick test script to verify the branch/commit tools are properly integrated
const toolsConfig = require("./src/utils/tools-config.cjs");

console.log("=== Testing Branch & Commit Tools Integration ===\n");

// Check if all new tools are in the config
const branchCommitTools = [
  "list_branches",
  "create_branch",
  "list_commits",
  "get_commit_details",
  "compare_commits",
];

console.log("Checking tool definitions in toolsConfig:");
branchCommitTools.forEach((toolName) => {
  if (toolsConfig[toolName]) {
    console.log(`✅ ${toolName}: ${toolsConfig[toolName].description}`);
  } else {
    console.log(`❌ ${toolName}: Not found in toolsConfig`);
  }
});

console.log("\n=== Tool Details ===\n");

branchCommitTools.forEach((toolName) => {
  if (toolsConfig[toolName]) {
    console.log(`Tool: ${toolName}`);
    console.log(`Description: ${toolsConfig[toolName].description}`);
    console.log(
      `Required params: ${JSON.stringify(
        toolsConfig[toolName].inputSchema.required || []
      )}`
    );
    console.log("---");
  }
});

console.log("\n=== Testing Server Import ===\n");

try {
  const GitHubMCPServer = require("./src/index.cjs");
  console.log("✅ Server module imports successfully");

  // Test instantiation
  // Pass a dummy sdkModules object as it's now required by the constructor
  const dummySdkModules = {
    Server: function () {},
    StdioServerTransport: function () {},
    CallToolRequestSchema: {},
    ListToolsRequestSchema: {},
  };
  const server = new GitHubMCPServer({}, dummySdkModules);
  console.log("✅ Server instantiates successfully");

  // Note: The server.branchCommitHandler check might need adjustment
  // if its initialization depends on a fully functional SDK setup.
  // For now, assuming it's set up in the constructor regardless of SDK.
  if (server.branchCommitHandler) {
    console.log("✅ Branch/Commit handler is properly initialized");
  } else {
    console.log("❌ Branch/Commit handler is missing");
  }
} catch (error) {
  console.log("❌ Server import failed:", error.message);
}

console.log("\n=== Test Complete ===");
