const DEFAULT_ENDPOINT_CACHE_TTL_SECONDS = 60 * 60;

const createEndpointCacheService = ({
  envVarName,
  getCachedValueByKey,
  setCachedValueByKey,
  deleteCachedValueByKey,
  cacheKeyErrorFactory = (message) => new TypeError(message),
  defaultTtlSeconds = DEFAULT_ENDPOINT_CACHE_TTL_SECONDS,
}) => {
  if (!envVarName || typeof envVarName !== "string") {
    throw new TypeError(
      "envVarName is required for createEndpointCacheService",
    );
  }

  if (typeof getCachedValueByKey !== "function") {
    throw new TypeError(
      "getCachedValueByKey function is required for createEndpointCacheService",
    );
  }

  if (typeof setCachedValueByKey !== "function") {
    throw new TypeError(
      "setCachedValueByKey function is required for createEndpointCacheService",
    );
  }

  if (typeof deleteCachedValueByKey !== "function") {
    throw new TypeError(
      "deleteCachedValueByKey function is required for createEndpointCacheService",
    );
  }

  const inFlightCacheRequests = new Map();

  const getEndpointCacheTtlSeconds = () => {
    const ttlValue = Number(process.env[envVarName]);
    if (ttlValue === 0) {
      return null;
    }
    if (!Number.isFinite(ttlValue) || ttlValue <= 0) {
      return defaultTtlSeconds;
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
      throw cacheKeyErrorFactory(
        "cacheKey is required for getCachedEndpointData",
      );
    }

    if (typeof fetcher !== "function") {
      throw new TypeError(
        "fetcher function is required for getCachedEndpointData",
      );
    }

    if (!forceRefresh) {
      const cachedValue = await getCachedValueByKey(cacheKey);
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
          await setCachedValueByKey(cacheKey, fetchedValue, ttlSeconds);
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

  const getCachedValue = async (cacheKey) => getCachedValueByKey(cacheKey);

  const resetCachedEndpointData = async (cacheKey) => {
    inFlightCacheRequests.delete(cacheKey);
    return deleteCachedValueByKey(cacheKey);
  };

  const isCacheRequestInFlight = (cacheKey) =>
    inFlightCacheRequests.has(cacheKey);

  return {
    getEndpointCacheTtlSeconds,
    getCachedEndpointData,
    getCachedValue,
    resetCachedEndpointData,
    isCacheRequestInFlight,
  };
};

module.exports = {
  createEndpointCacheService,
  DEFAULT_ENDPOINT_CACHE_TTL_SECONDS,
};
