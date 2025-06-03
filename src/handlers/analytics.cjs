// src/handlers/analytics.cjs

const { getRepoOwnerAndName } = require("../utils/shared-utils.cjs");
const {
  formatTrafficData,
  formatLanguagesData,
} = require("../utils/formatters.cjs");
const CacheService = require("../services/cache-service.cjs");

// Helper function to handle API calls with caching for data that doesn't need special formatting before returning
async function fetchAndCacheGeneric(apiCallBound, cacheKey, ttl, ...apiParams) {
  let data = CacheService.getFromCache(cacheKey);
  if (data) {
    return { success: true, data, source: "cache" };
  }

  data = await apiCallBound(...apiParams);
  CacheService.setToCache(cacheKey, data, ttl);
  return { success: true, data, source: "api" };
}

module.exports = {
  get_repo_stats: async (args, defaultRepoDetails, apiService) => {
    const { owner, repo } = getRepoOwnerAndName(args, defaultRepoDetails);
    const statType = args.type || "traffic";
    const cacheTTL = 1600; // Cache for 10 minutes

    try {
      let result;
      let cacheKey;
      const per = args.per || "day";

      switch (statType) {
        case "clones":
          cacheKey = CacheService.generateRepoCacheKey(
            owner,
            repo,
            `stats_clones_${per}`
          );
          result = await fetchAndCacheGeneric(
            apiService.getRepositoryTrafficClones.bind(apiService),
            cacheKey,
            cacheTTL,
            owner,
            repo,
            per
          );
          break;
        case "views":
          cacheKey = CacheService.generateRepoCacheKey(
            owner,
            repo,
            `stats_views_${per}`
          );
          result = await fetchAndCacheGeneric(
            apiService.getRepositoryTrafficViews.bind(apiService),
            cacheKey,
            cacheTTL,
            owner,
            repo,
            per
          );
          break;
        case "popular_content": // maps to popular paths
          cacheKey = CacheService.generateRepoCacheKey(
            owner,
            repo,
            "stats_popular_paths"
          );
          result = await fetchAndCacheGeneric(
            apiService.getRepositoryPopularPaths.bind(apiService),
            cacheKey,
            cacheTTL,
            owner,
            repo
          );
          break;
        case "traffic":
        default:
          cacheKey = CacheService.generateRepoCacheKey(
            owner,
            repo,
            `stats_traffic_default_views_${per}`
          );
          result = await fetchAndCacheGeneric(
            apiService.getRepositoryTrafficViews.bind(apiService),
            cacheKey,
            cacheTTL,
            owner,
            repo,
            per
          );
          result.message = result.message
            ? result.message +
              " Displaying 'views' data for 'traffic' stat type."
            : "Displaying 'views' data for 'traffic' stat type.";
          break;
      }
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Error in get_repo_stats (${statType}): ${error.message}`,
        error: error.toString(),
      };
    }
  },

  list_repo_topics: async (args, defaultRepoDetails, apiService) => {
    const { owner, repo } = getRepoOwnerAndName(args, defaultRepoDetails);
    const cacheKey = CacheService.generateRepoCacheKey(owner, repo, "topics");
    const cacheTTL = 3600; // 1 hour

    try {
      const result = await fetchAndCacheGeneric(
        apiService.listRepositoryTopics.bind(apiService),
        cacheKey,
        cacheTTL,
        owner,
        repo
      );
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Error listing repository topics: ${error.message}`,
        error: error.toString(),
      };
    }
  },

  update_repo_topics: async (args, defaultRepoDetails, apiService) => {
    const { owner, repo } = getRepoOwnerAndName(args, defaultRepoDetails);
    const { names } = args;

    if (!Array.isArray(names)) {
      return {
        success: false,
        message: "Input 'names' must be an array of topics.",
      };
    }

    try {
      const data = await apiService.updateRepositoryTopics(owner, repo, names);
      const cacheKey = CacheService.generateRepoCacheKey(owner, repo, "topics");
      CacheService.deleteFromCache(cacheKey);
      return {
        success: true,
        data,
        message: "Repository topics updated successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message: `Error updating repository topics: ${error.message}`,
        error: error.toString(),
      };
    }
  },

  get_repo_languages: async (args, defaultRepoDetails, apiService) => {
    const { owner, repo } = getRepoOwnerAndName(args, defaultRepoDetails);
    const cacheKey = CacheService.generateRepoCacheKey(
      owner,
      repo,
      "languages"
    );
    const cacheTTL = 3600 * 6; // 6 hours

    try {
      let rawData = CacheService.getFromCache(cacheKey);
      if (rawData) {
        return {
          success: true,
          data: formatLanguagesData(rawData),
          source: "cache",
        };
      }
      rawData = await apiService.getRepositoryLanguages(owner, repo);
      CacheService.setToCache(cacheKey, rawData, cacheTTL);
      return {
        success: true,
        data: formatLanguagesData(rawData),
        source: "api",
      };
    } catch (error) {
      return {
        success: false,
        message: `Error getting repository languages: ${error.message}`,
        error: error.toString(),
      };
    }
  },

  list_stargazers: async (args, defaultRepoDetails, apiService) => {
    const { owner, repo } = getRepoOwnerAndName(args, defaultRepoDetails);
    const per_page = args.per_page || 30;
    const page = args.page || 1;
    const cacheKey = CacheService.generateRepoCacheKey(
      owner,
      repo,
      `stargazers_p${page}_pp${per_page}`
    );
    const cacheTTL = 3600; // 1 hour

    try {
      const result = await fetchAndCacheGeneric(
        apiService.listStargazers.bind(apiService),
        cacheKey,
        cacheTTL,
        owner,
        repo,
        per_page,
        page
      );
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Error listing stargazers: ${error.message}`,
        error: error.toString(),
      };
    }
  },

  list_watchers: async (args, defaultRepoDetails, apiService) => {
    const { owner, repo } = getRepoOwnerAndName(args, defaultRepoDetails);
    const per_page = args.per_page || 30;
    const page = args.page || 1;
    const cacheKey = CacheService.generateRepoCacheKey(
      owner,
      repo,
      `watchers_p${page}_pp${per_page}`
    );
    const cacheTTL = 3600; // 1 hour

    try {
      const result = await fetchAndCacheGeneric(
        apiService.listWatchers.bind(apiService),
        cacheKey,
        cacheTTL,
        owner,
        repo,
        per_page,
        page
      );
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Error listing watchers: ${error.message}`,
        error: error.toString(),
      };
    }
  },

  list_forks: async (args, defaultRepoDetails, apiService) => {
    const { owner, repo } = getRepoOwnerAndName(args, defaultRepoDetails);
    const sort = args.sort || "newest";
    const per_page = args.per_page || 30;
    const page = args.page || 1;
    const cacheKey = CacheService.generateRepoCacheKey(
      owner,
      repo,
      `forks_s${sort}_p${page}_pp${per_page}`
    );
    const cacheTTL = 3600; // 1 hour

    try {
      const result = await fetchAndCacheGeneric(
        apiService.listForks.bind(apiService),
        cacheKey,
        cacheTTL,
        owner,
        repo,
        sort,
        per_page,
        page
      );
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Error listing forks: ${error.message}`,
        error: error.toString(),
      };
    }
  },

  get_repo_traffic: async (args, defaultRepoDetails, apiService) => {
    const { owner, repo } = getRepoOwnerAndName(args, defaultRepoDetails);
    const dataType = args.data_type || "views";
    const cacheTTL = 3600; // 1 hour
    let cacheKeySuffix;
    const per = args.per || "day";

    try {
      let apiMethodBound;
      let apiParams = [owner, repo];

      switch (dataType) {
        case "views":
          cacheKeySuffix = `traffic_views_${per}`;
          apiMethodBound =
            apiService.getRepositoryTrafficViews.bind(apiService);
          apiParams.push(per);
          break;
        case "clones":
          cacheKeySuffix = `traffic_clones_${per}`;
          apiMethodBound =
            apiService.getRepositoryTrafficClones.bind(apiService);
          apiParams.push(per);
          break;
        case "popular_referrers":
          cacheKeySuffix = "traffic_popular_referrers";
          apiMethodBound =
            apiService.getRepositoryPopularReferrers.bind(apiService);
          break;
        case "popular_paths":
          cacheKeySuffix = "traffic_popular_paths";
          apiMethodBound =
            apiService.getRepositoryPopularPaths.bind(apiService);
          break;
        default:
          return {
            success: false,
            message: `Invalid data_type for get_repo_traffic: ${dataType}`,
          };
      }

      const cacheKey = CacheService.generateRepoCacheKey(
        owner,
        repo,
        cacheKeySuffix
      );

      if (dataType === "views") {
        let rawData = CacheService.getFromCache(cacheKey);
        if (rawData) {
          return {
            success: true,
            data: formatTrafficData(rawData),
            source: "cache",
          };
        }
        rawData = await apiMethodBound(...apiParams);
        CacheService.setToCache(cacheKey, rawData, cacheTTL);
        return {
          success: true,
          data: formatTrafficData(rawData),
          source: "api",
        };
      } else {
        return await fetchAndCacheGeneric(
          apiMethodBound,
          cacheKey,
          cacheTTL,
          ...apiParams
        );
      }
    } catch (error) {
      return {
        success: false,
        message: `Error in get_repo_traffic (${dataType}): ${error.message}`,
        error: error.toString(),
      };
    }
  },
};
