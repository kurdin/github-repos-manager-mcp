// src/handlers/users.cjs

const userFormatters = require("../formatters/users.cjs");

async function getUserInfo(args, apiService) {
  const { username } = args; // username is optional; if not provided, fetches authenticated user
  const endpoint = username ? `/users/${username}` : "/user";
  const user = await apiService.makeGitHubRequest(endpoint);

  return userFormatters.formatGetUserInfoOutput(user);
}

module.exports = {
  getUserInfo,
};
