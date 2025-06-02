#!/usr/bin/env node

// Import the refactored server from the src directory
const GitHubMCPServer = require("./src/index.cjs");

// Start the server
const server = new GitHubMCPServer();
server.run().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
