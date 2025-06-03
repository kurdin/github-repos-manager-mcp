#!/usr/bin/env node

// Test script for workflow tools

const { spawn } = require("child_process");
const path = require("path");

const serverPath = path.join(__dirname, "server.cjs"); // Changed to point to the main server executable

// Test commands
const testCommands = [
  {
    name: "List workflows",
    command: {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "list_workflows",
        arguments: {
          owner: "microsoft",
          repo: "vscode",
        },
      },
      id: 1,
    },
  },
  {
    name: "List workflow runs",
    command: {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "list_workflow_runs",
        arguments: {
          owner: "microsoft",
          repo: "vscode",
          workflow_id: "ci.yml",
          per_page: 5,
        },
      },
      id: 2,
    },
  },
];

function runTest(testCase) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== Testing: ${testCase.name} ===`);
    console.log("Command:", JSON.stringify(testCase.command, null, 2));

    const server = spawn("node", [serverPath], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env },
    });

    let output = "";
    let error = "";

    server.stdout.on("data", (data) => {
      output += data.toString();
    });

    server.stderr.on("data", (data) => {
      const text = data.toString();
      error += text;
      // Print stderr immediately for debugging
      if (text.trim()) {
        console.log("[STDERR]:", text.trim());
      }
    });

    server.on("close", (code) => {
      if (code !== 0) {
        console.log("Server exited with code:", code);
      }

      try {
        // Parse the output to find the response
        const lines = output.split("\n").filter((line) => line.trim());
        const responseLine = lines.find((line) => {
          try {
            const parsed = JSON.parse(line);
            return (
              parsed.jsonrpc === "2.0" && parsed.id === testCase.command.id
            );
          } catch {
            return false;
          }
        });

        if (responseLine) {
          const response = JSON.parse(responseLine);
          console.log("\nResponse received:");
          if (response.result) {
            console.log("Success!");
            console.log(
              "Result preview:",
              JSON.stringify(response.result, null, 2).substring(0, 500) + "..."
            );
          } else if (response.error) {
            console.log("Error:", response.error);
          }
        } else {
          console.log("No valid response found in output");
          if (error) {
            console.log("Stderr:", error);
          }
        }
      } catch (e) {
        console.log("Failed to parse output:", e.message);
        console.log("Raw output:", output);
        if (error) {
          console.log("Stderr:", error);
        }
      }

      resolve();
    });

    // Send the test command
    server.stdin.write(JSON.stringify(testCase.command) + "\n");

    // Close stdin after a short delay to allow processing
    setTimeout(() => {
      server.stdin.end();
    }, 1000);
  });
}

async function runAllTests() {
  console.log("Starting workflow tools tests...");
  console.log("Make sure you have GH_TOKEN environment variable set.");

  if (!process.env.GH_TOKEN) {
    console.error("Error: GH_TOKEN environment variable is not set");
    process.exit(1);
  }

  for (const testCase of testCommands) {
    await runTest(testCase);
  }

  console.log("\n=== All tests completed ===");
}

runAllTests().catch(console.error);
