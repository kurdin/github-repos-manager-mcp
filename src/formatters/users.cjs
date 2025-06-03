// src/formatters/users.cjs

function formatGetUserInfoOutput(user) {
  if (!user || typeof user !== "object" || !user.login) {
    return {
      content: [
        { type: "text", text: "Error: Could not retrieve user information." },
      ],
      isError: true,
    };
  }
  const info = `
**${user.login}** ${user.name ? `(${user.name})` : ""}

**Bio:** ${user.bio || "No bio"}
**Company:** ${user.company || "N/A"}
**Location:** ${user.location || "N/A"}
**Email:** ${user.email || "Not public"}
**Blog:** ${user.blog || "N/A"}
**Twitter:** ${user.twitter_username ? `@${user.twitter_username}` : "N/A"}

**Public Repos:** ${user.public_repos}
**Public Gists:** ${user.public_gists}
**Followers:** ${user.followers}
**Following:** ${user.following}

**Account Created:** ${new Date(user.created_at).toLocaleDateString()}
**Profile URL:** ${user.html_url}
  `.trim();

  return {
    content: [
      {
        type: "text",
        text: info,
      },
    ],
  };
}

module.exports = {
  formatGetUserInfoOutput,
};
