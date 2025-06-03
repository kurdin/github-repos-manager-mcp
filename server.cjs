#!/usr/bin/env node

// Import the refactored server from the src directory
const GitHubMCPServer = require("./src/index.cjs");

// Parse command line arguments for config
const args = process.argv.slice(2);
const config = {};

// Support command line arguments for default repository
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--default-owner" && args[i + 1]) {
    config.defaultOwner = args[i + 1];
    i++;
  } else if (args[i] === "--default-repo" && args[i + 1]) {
    config.defaultRepo = args[i + 1];
    i++;
  } else if (args[i] === "--disabled-tools" && args[i + 1]) {
    config.disabledTools = args[i + 1]
      .split(",")
      .map((tool) => tool.trim())
      .filter((tool) => tool);
    i++;
  } else if (args[i] === "--allowed-tools" && args[i + 1]) {
    config.allowedTools = args[i + 1]
      .split(",")
      .map((tool) => tool.trim())
      .filter((tool) => tool);
    i++;
  } else if (args[i] === "--allowed-repos" && args[i + 1]) {
    config.allowedRepos = args[i + 1]
      .split(",")
      .map((repo) => repo.trim())
      .filter((repo) => repo);
    i++;
  }
}

// Start the server with config
async function main() {
  try {
    const { Server } = await import(
      "@modelcontextprotocol/sdk/server/index.js"
    );
    const { StdioServerTransport } = await import(
      "@modelcontextprotocol/sdk/server/stdio.js"
    );
    const { CallToolRequestSchema, ListToolsRequestSchema } = await import(
      "@modelcontextprotocol/sdk/types.js"
    );

    const sdkModules = {
      Server,
      StdioServerTransport,
      CallToolRequestSchema,
      ListToolsRequestSchema,
    };

    const server = new GitHubMCPServer(config, sdkModules);
    await server.run();
  } catch (error) {
    console.error("Server error:", error);
    process.exit(1);
  }
}

main();
