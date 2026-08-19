const CacheManager = require("./cacheManager");
const {
  createEndpointCacheService,
} = require("../endpoint-cache-factory.service");

const sharedRb209CacheManager = new CacheManager();

const {
  getEndpointCacheTtlSeconds,
  getCachedEndpointData,
  getCachedValue,
  resetCachedEndpointData,
  isCacheRequestInFlight,
} = createEndpointCacheService({
  envVarName: "RB209_ENDPOINT_CACHE_TTL_SECONDS",
  getCachedValueByKey: (cacheKey) => sharedRb209CacheManager.get(cacheKey),
  setCachedValueByKey: (cacheKey, value, ttlSeconds) => {
    const hasFiniteTtl = Number.isFinite(ttlSeconds) && ttlSeconds > 0;
    return sharedRb209CacheManager.set(
      cacheKey,
      value,
      hasFiniteTtl ? { ttl: Math.floor(ttlSeconds) } : undefined,
    );
  },
  deleteCachedValueByKey: (cacheKey) =>
    sharedRb209CacheManager.delete(cacheKey),
  cacheKeyErrorFactory: (message) => new Error(message),
});

module.exports = {
  sharedRb209CacheManager,
  getEndpointCacheTtlSeconds,
  getCachedEndpointData,
  getCachedValue,
  resetCachedEndpointData,
  isCacheRequestInFlight,
};
