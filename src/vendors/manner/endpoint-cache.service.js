const inMemoryCache = new Map();
const inFlightCacheRequests = new Map();
const DEFAULT_ENDPOINT_CACHE_TTL_SECONDS = 60 * 60;

const getEndpointCacheTtlSeconds = () => {
  const ttlValue = Number(process.env.MANNER_ENDPOINT_CACHE_TTL_SECONDS);
  if (ttlValue === 0) {
    return null;
  }
  if (!Number.isFinite(ttlValue) || ttlValue <= 0) {
    return DEFAULT_ENDPOINT_CACHE_TTL_SECONDS;
  }

  return Math.floor(ttlValue);
};

const getCachedEndpointData = async (options) => {
  const {
    cacheKey,
    fetcher,
    forceRefresh = false,
    ttlSeconds = getEndpointCacheTtlSeconds(),
    isCachedValueValid = (cachedValue) =>
      cachedValue !== undefined && cachedValue !== null,
    shouldCache = (fetchedValue) =>
      fetchedValue !== undefined && fetchedValue !== null,
    onCacheHit,
    onInFlightJoin,
    onFetchStart,
    onFetchSuccess,
    onFetchError,
  } = options ?? {};

  if (!cacheKey || typeof cacheKey !== "string") {
    throw new Error("cacheKey is required for getCachedEndpointData");
  }

  if (typeof fetcher !== "function") {
    throw new Error("fetcher function is required for getCachedEndpointData");
  }

  if (!forceRefresh) {
    const cachedValue = inMemoryCache.get(cacheKey);
    if (isCachedValueValid(cachedValue)) {
      if (typeof onCacheHit === "function") {
        onCacheHit(cachedValue);
      }
      return cachedValue;
    }

    if (inFlightCacheRequests.has(cacheKey)) {
      if (typeof onInFlightJoin === "function") {
        onInFlightJoin();
      }
      return inFlightCacheRequests.get(cacheKey);
    }
  }

  const fetchPromise = (async () => {
    try {
      if (typeof onFetchStart === "function") {
        onFetchStart();
      }

      const fetchedValue = await fetcher();

      if (shouldCache(fetchedValue)) {
        inMemoryCache.set(cacheKey, fetchedValue);

        if (Number.isFinite(ttlSeconds) && ttlSeconds > 0) {
          setTimeout(() => {
            inMemoryCache.delete(cacheKey);
          }, ttlSeconds * 1000);
        }
      }

      if (typeof onFetchSuccess === "function") {
        onFetchSuccess(fetchedValue);
      }

      return fetchedValue;
    } catch (error) {
      if (typeof onFetchError === "function") {
        onFetchError(error);
      }
      throw error;
    } finally {
      inFlightCacheRequests.delete(cacheKey);
    }
  })();

  inFlightCacheRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
};

const getCachedValue = async (cacheKey) => inMemoryCache.get(cacheKey);

const resetCachedEndpointData = async (cacheKey) => {
  inFlightCacheRequests.delete(cacheKey);
  return inMemoryCache.delete(cacheKey);
};

const isCacheRequestInFlight = (cacheKey) =>
  inFlightCacheRequests.has(cacheKey);

module.exports = {
  getEndpointCacheTtlSeconds,
  getCachedEndpointData,
  getCachedValue,
  resetCachedEndpointData,
  isCacheRequestInFlight,
};
