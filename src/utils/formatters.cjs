// src/utils/formatters.cjs
// This file will contain functions for formatting analytics data,
// potentially for better display or data visualization preparation.

/**
 * Formats raw traffic data into a more readable format.
 * @param {object} trafficData - Raw traffic data from GitHub API.
 * @returns {object} Formatted traffic data.
 */
function formatTrafficData(trafficData) {
  // TODO: Implement actual formatting logic
  return {
    summary: `Total views: ${trafficData.views.count}, Unique visitors: ${trafficData.views.uniques}`,
    dailyViews: trafficData.views.map((view) => ({
      date: view.timestamp,
      views: view.count,
      unique: view.uniques,
    })),
    // Add more formatted data as needed
  };
}

/**
 * Formats repository language data.
 * @param {object} languagesData - Raw language data from GitHub API.
 * @returns {object} Formatted language data (e.g., for charts).
 */
function formatLanguagesData(languagesData) {
  // TODO: Implement actual formatting logic
  const totalBytes = Object.values(languagesData).reduce(
    (sum, bytes) => sum + bytes,
    0
  );
  if (totalBytes === 0) {
    return {
      message: "No language data available.",
      breakdown: [],
    };
  }
  const breakdown = Object.entries(languagesData).map(([language, bytes]) => ({
    language,
    bytes,
    percentage: parseFloat(((bytes / totalBytes) * 100).toFixed(2)),
  }));
  return {
    message: `Language breakdown based on ${totalBytes} bytes of code.`,
    breakdown,
  };
}

// Add more formatting functions as needed for other analytics data

module.exports = {
  formatTrafficData,
  formatLanguagesData,
};
