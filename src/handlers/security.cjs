const { getOwnerRepo } = require("../utils/shared-utils.cjs");

/**
 * @typedef {import('../services/github-api.cjs').GitHubRepo} GitHubRepo
 */

/**
 * Lists repository deploy keys.
 * @param {object} args - The arguments for the tool.
 * @param {string} [args.owner] - Repository owner.
 * @param {string} [args.repo] - Repository name.
 * @param {number} [args.per_page=30] - Number of deploy keys per page.
 * @param {object} apiService - The GitHub API service instance.
 * @returns {Promise<object>} - The result of the operation.
 */
async function list_deploy_keys(args, apiService) {
  try {
    const { owner, repo } = getOwnerRepo(args, {});
    const { per_page } = args;
    const keys = await apiService.listDeployKeys(owner, repo, per_page);
    return { success: true, data: keys };
  } catch (error) {
    return { success: false, message: error.message, error: error.stack };
  }
}

/**
 * Adds a new deploy key to a repository.
 * @param {object} args - The arguments for the tool.
 * @param {string} [args.owner] - Repository owner.
 * @param {string} [args.repo] - Repository name.
 * @param {string} args.title - A name for the key.
 * @param {string} args.key - The public SSH key.
 * @param {boolean} [args.read_only=false] - If true, the key will only have read-only access.
 * @param {GitHubRepo} defaultRepo - The default repository.
 * @returns {Promise<object>} - The result of the operation.
 */
async function create_deploy_key(args, apiService) {
  try {
    const { owner, repo } = getOwnerRepo(args, {});
    const { title, key, read_only } = args;
    if (!title || !key) {
      return {
        success: false,
        message: "Missing required arguments: title and key.",
      };
    }
    const newKey = await apiService.createDeployKey(
      owner,
      repo,
      title,
      key,
      read_only
    );
    return { success: true, data: newKey };
  } catch (error) {
    return { success: false, message: error.message, error: error.stack };
  }
}

/**
 * Removes a deploy key from a repository.
 * @param {object} args - The arguments for the tool.
 * @param {string} [args.owner] - Repository owner.
 * @param {string} [args.repo] - Repository name.
 * @param {number} args.key_id - The ID of the key to delete.
 * @param {GitHubRepo} defaultRepo - The default repository.
 * @returns {Promise<object>} - The result of the operation.
 */
async function delete_deploy_key(args, apiService) {
  try {
    const { owner, repo } = getOwnerRepo(args, {});
    const { key_id } = args;
    if (!key_id) {
      return { success: false, message: "Missing required argument: key_id." };
    }
    await apiService.deleteDeployKey(owner, repo, key_id);
    return {
      success: true,
      message: `Deploy key ${key_id} deleted successfully.`,
    };
  } catch (error) {
    return { success: false, message: error.message, error: error.stack };
  }
}

/**
 * Lists repository webhooks.
 * @param {object} args - The arguments for the tool.
 * @param {string} [args.owner] - Repository owner.
 * @param {string} [args.repo] - Repository name.
 * @param {number} [args.per_page=30] - Number of webhooks per page.
 * @param {GitHubRepo} defaultRepo - The default repository.
 * @returns {Promise<object>} - The result of the operation.
 */
async function list_webhooks(args, apiService) {
  try {
    const { owner, repo } = getOwnerRepo(args, {});
    const { per_page } = args;
    const webhooks = await apiService.listWebhooks(owner, repo, per_page);
    return { success: true, data: webhooks };
  } catch (error) {
    return { success: false, message: error.message, error: error.stack };
  }
}

/**
 * Creates a new webhook for a repository.
 * @param {object} args - The arguments for the tool.
 * @param {string} [args.owner] - Repository owner.
 * @param {string} [args.repo] - Repository name.
 * @param {object} args.config - Webhook configuration.
 * @param {string} args.config.url - The URL to which the payloads will be delivered.
 * @param {string} [args.config.content_type="json"] - The media type used to serialize the payloads.
 * @param {string} [args.config.secret] - Secret for HMAC digest.
 * @param {string|number} [args.config.insecure_ssl="0"] - Whether to verify SSL.
 * @param {string[]} [args.events=["push"]] - Events the hook is triggered for.
 * @param {boolean} [args.active=true] - Whether the webhook is active.
 * @param {GitHubRepo} defaultRepo - The default repository.
 * @returns {Promise<object>} - The result of the operation.
 */
async function create_webhook(args, apiService) {
  try {
    const { owner, repo } = getOwnerRepo(args, {});
    const { config, events, active } = args;
    if (!config || !config.url) {
      return {
        success: false,
        message: "Missing required argument: config.url.",
      };
    }
    // TODO: Add webhook signature validation logic if secret is provided (potentially in a utility)
    const newWebhook = await apiService.createWebhook(
      owner,
      repo,
      config,
      events,
      active
    );
    return { success: true, data: newWebhook };
  } catch (error) {
    return { success: false, message: error.message, error: error.stack };
  }
}

/**
 * Modifies an existing webhook's configuration.
 * @param {object} args - The arguments for the tool.
 * @param {string} [args.owner] - Repository owner.
 * @param {string} [args.repo] - Repository name.
 * @param {number} args.hook_id - The ID of the webhook to update.
 * @param {object} [args.config] - Webhook configuration to update.
 * @param {string[]} [args.events] - Replaces existing events.
 * @param {string[]} [args.add_events] - Events to add.
 * @param {string[]} [args.remove_events] - Events to remove.
 * @param {boolean} [args.active] - Whether the webhook is active.
 * @param {GitHubRepo} defaultRepo - The default repository.
 * @returns {Promise<object>} - The result of the operation.
 */
async function edit_webhook(args, apiService) {
  try {
    const { owner, repo } = getOwnerRepo(args, {});
    const { hook_id, config, events, add_events, remove_events, active } = args;
    if (!hook_id) {
      return { success: false, message: "Missing required argument: hook_id." };
    }
    const updateData = { config, events, add_events, remove_events, active };
    // Filter out undefined properties from updateData
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(filteredUpdateData).length === 0) {
      return {
        success: false,
        message: "No update parameters provided for the webhook.",
      };
    }

    const updatedWebhook = await apiService.updateWebhook(
      owner,
      repo,
      hook_id,
      filteredUpdateData
    );
    return { success: true, data: updatedWebhook };
  } catch (error) {
    return { success: false, message: error.message, error: error.stack };
  }
}

/**
 * Removes a webhook from a repository.
 * @param {object} args - The arguments for the tool.
 * @param {string} [args.owner] - Repository owner.
 * @param {string} [args.repo] - Repository name.
 * @param {number} args.hook_id - The ID of the webhook to delete.
 * @param {GitHubRepo} defaultRepo - The default repository.
 * @returns {Promise<object>} - The result of the operation.
 */
async function delete_webhook(args, apiService) {
  try {
    const { owner, repo } = getOwnerRepo(args, {});
    const { hook_id } = args;
    if (!hook_id) {
      return { success: false, message: "Missing required argument: hook_id." };
    }
    await apiService.deleteWebhook(owner, repo, hook_id);
    return {
      success: true,
      message: `Webhook ${hook_id} deleted successfully.`,
    };
  } catch (error) {
    return { success: false, message: error.message, error: error.stack };
  }
}

/**
 * Lists repository secrets (names only).
 * @param {object} args - The arguments for the tool.
 * @param {string} [args.owner] - Repository owner.
 * @param {string} [args.repo] - Repository name.
 * @param {number} [args.per_page=30] - Number of secrets per page.
 * @param {GitHubRepo} defaultRepo - The default repository.
 * @returns {Promise<object>} - The result of the operation.
 */
async function list_secrets(args, apiService) {
  try {
    const { owner, repo } = getOwnerRepo(args, {});
    const { per_page } = args;
    const secrets = await apiService.listSecrets(owner, repo, per_page);
    // Ensure secret values are not returned, only names and metadata
    return { success: true, data: secrets };
  } catch (error) {
    return { success: false, message: error.message, error: error.stack };
  }
}

/**
 * Creates or updates a repository secret.
 * @param {object} args - The arguments for the tool.
 * @param {string} [args.owner] - Repository owner.
 * @param {string} [args.repo] - Repository name.
 * @param {string} args.secret_name - The name of the secret.
 * @param {string} args.encrypted_value - Value for your secret, encrypted with LibSodium.
 * @param {string} args.key_id - ID of the key used to encrypt the secret.
 * @param {GitHubRepo} defaultRepo - The default repository.
 * @returns {Promise<object>} - The result of the operation.
 */
async function update_secret(args, apiService) {
  try {
    const { owner, repo } = getOwnerRepo(args, {});
    const { secret_name, encrypted_value, key_id } = args;
    if (!secret_name || !encrypted_value || !key_id) {
      return {
        success: false,
        message:
          "Missing required arguments: secret_name, encrypted_value, and key_id.",
      };
    }
    // The API call itself handles create or update.
    // GitHub API for creating/updating secrets does not return the secret value, only status.
    await apiService.createOrUpdateSecret(
      owner,
      repo,
      secret_name,
      encrypted_value,
      key_id
    );
    return {
      success: true,
      message: `Secret ${secret_name} updated successfully.`,
    };
  } catch (error) {
    return { success: false, message: error.message, error: error.stack };
  }
}

module.exports = {
  list_deploy_keys,
  create_deploy_key,
  delete_deploy_key,
  list_webhooks,
  create_webhook,
  edit_webhook,
  delete_webhook,
  list_secrets,
  update_secret,
};
