const crypto = require("crypto");

/**
 * Validates a GitHub webhook signature.
 * @param {string} secret - The webhook secret configured in GitHub.
 * @param {string} payloadBody - The raw request body string.
 * @param {string} signatureHeader - The value of the 'X-Hub-Signature-256' header.
 * @returns {boolean} - True if the signature is valid, false otherwise.
 */
function isValidWebhookSignature(secret, payloadBody, signatureHeader) {
  if (!secret || !payloadBody || !signatureHeader) {
    console.error("Webhook signature validation missing required parameters.");
    return false;
  }

  const signature = signatureHeader.startsWith("sha256=")
    ? signatureHeader.substring(7)
    : signatureHeader;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payloadBody, "utf-8");
  const expectedSignature = hmac.digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
}

/**
 * Placeholder for permission checking logic.
 * This would need to be expanded based on specific permission requirements
 * for different tools and user roles/contexts if the MCP server itself
 * needs to enforce permissions beyond what the GitHub token provides.
 *
 * @param {object} userContext - Information about the user/caller.
 * @param {string} toolName - The name of the tool being called.
 * @param {object} args - The arguments for the tool.
 * @param {object} defaultRepo - The default repository context.
 * @returns {Promise<boolean>} - True if permission is granted, false otherwise.
 */
async function checkPermissions(userContext, toolName, args, defaultRepo) {
  // TODO: Implement actual permission checking logic.
  // For now, assume permission is granted if the GitHub token is valid for the operation.
  console.warn(
    `Permission check for tool '${toolName}' is a placeholder and currently always returns true.`
  );
  return true;
}

module.exports = {
  isValidWebhookSignature,
  checkPermissions,
};
