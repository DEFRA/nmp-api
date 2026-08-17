const {
  createEndpointCacheService,
} = require("../endpoint-cache-factory.service");

const inMemoryCache = new Map();

const {
  getEndpointCacheTtlSeconds,
  getCachedEndpointData,
  getCachedValue,
  resetCachedEndpointData,
  isCacheRequestInFlight,
} = createEndpointCacheService({
  envVarName: "MANNER_ENDPOINT_CACHE_TTL_SECONDS",
  getCachedValueByKey: async (cacheKey) => inMemoryCache.get(cacheKey),
  setCachedValueByKey: async (cacheKey, value, ttlSeconds) => {
    inMemoryCache.set(cacheKey, value);
    if (Number.isFinite(ttlSeconds) && ttlSeconds > 0) {
      setTimeout(() => {
        inMemoryCache.delete(cacheKey);
      }, ttlSeconds * 1000);
    }
  },
  deleteCachedValueByKey: async (cacheKey) => inMemoryCache.delete(cacheKey),
});

module.exports = {
  getEndpointCacheTtlSeconds,
  getCachedEndpointData,
  getCachedValue,
  resetCachedEndpointData,
  isCacheRequestInFlight,
};
