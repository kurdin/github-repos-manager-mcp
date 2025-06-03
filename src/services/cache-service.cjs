// src/services/cache-service.cjs
// This service will implement caching logic for popular analytics data
// to avoid hitting GitHub API rate limits and improve response times.

const NodeCache = require("node-cache");

// Initialize cache with a standard TTL (e.g., 1 hour)
// and checkperiod (e.g., 10 minutes)
const DEFAULT_TTL = 3600; // 1 hour in seconds
const CHECK_PERIOD = 600; // 10 minutes in seconds

const analyticsCache = new NodeCache({
  stdTTL: DEFAULT_TTL,
  checkperiod: CHECK_PERIOD,
});

/**
 * Retrieves data from cache.
 * @param {string} key - The cache key.
 * @returns {*} The cached data, or undefined if not found or expired.
 */
function getFromCache(key) {
  const value = analyticsCache.get(key);
  if (value) {
    console.log(`Cache HIT for key: ${key}`);
    return value;
  }
  console.log(`Cache MISS for key: ${key}`);
  return undefined;
}

/**
 * Stores data in cache.
 * @param {string} key - The cache key.
 * @param {*} value - The data to cache.
 * @param {number} [ttl=DEFAULT_TTL] - Optional TTL for this specific key in seconds.
 * @returns {boolean} True if the data was cached successfully.
 */
function setToCache(key, value, ttl = DEFAULT_TTL) {
  console.log(`Setting cache for key: ${key} with TTL: ${ttl}s`);
  return analyticsCache.set(key, value, ttl);
}

/**
 * Deletes data from cache.
 * @param {string} key - The cache key.
 */
function deleteFromCache(key) {
  console.log(`Deleting cache for key: ${key}`);
  analyticsCache.del(key);
}

/**
 * Flushes all data from cache.
 */
function flushAllCache() {
  console.log("Flushing all analytics cache");
  analyticsCache.flushAll();
}

/**
 * Generates a cache key for repository-specific data.
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {string} dataType - The type of data (e.g., 'traffic', 'languages').
 * @returns {string} The generated cache key.
 */
function generateRepoCacheKey(owner, repo, dataType) {
  return `repo:${owner}:${repo}:${dataType}`;
}

module.exports = {
  getFromCache,
  setToCache,
  deleteFromCache,
  flushAllCache,
  generateRepoCacheKey,
  analyticsCache, // Exporting the instance directly for more advanced use if needed
};
