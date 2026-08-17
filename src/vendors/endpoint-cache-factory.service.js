const DEFAULT_ENDPOINT_CACHE_TTL_SECONDS = 60 * 60;

const isDefinedValue = (value) => value !== undefined && value !== null;

const validateFactoryOptions = ({
  envVarName,
  getCachedValueByKey,
  setCachedValueByKey,
  deleteCachedValueByKey,
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
};

const getTtlSecondsFromEnv = (envVarName, defaultTtlSeconds) => {
  const ttlValue = Number(process.env[envVarName]);
  if (ttlValue === 0) {
    return null;
  }
  if (!Number.isFinite(ttlValue) || ttlValue <= 0) {
    return defaultTtlSeconds;
  }

  return Math.floor(ttlValue);
};

const parseCacheFetchOptions = (options, getEndpointCacheTtlSeconds) => {
  const {
    cacheKey,
    fetcher,
    forceRefresh = false,
    ttlSeconds = getEndpointCacheTtlSeconds(),
    isCachedValueValid = isDefinedValue,
    shouldCache = isDefinedValue,
    onCacheHit,
    onInFlightJoin,
    onFetchStart,
    onFetchSuccess,
    onFetchError,
  } = options ?? {};

  return {
    cacheKey,
    fetcher,
    forceRefresh,
    ttlSeconds,
    isCachedValueValid,
    shouldCache,
    onCacheHit,
    onInFlightJoin,
    onFetchStart,
    onFetchSuccess,
    onFetchError,
  };
};

const validateCacheFetchOptions = ({
  cacheKey,
  fetcher,
  cacheKeyErrorFactory,
}) => {
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
};

const tryGetCachedOrInFlightValue = async ({
  cacheKey,
  forceRefresh,
  getCachedValueByKey,
  isCachedValueValid,
  inFlightCacheRequests,
  onCacheHit,
  onInFlightJoin,
}) => {
  if (forceRefresh) {
    return undefined;
  }

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

  return undefined;
};

const createFetchPromise = ({
  cacheKey,
  fetcher,
  shouldCache,
  ttlSeconds,
  setCachedValueByKey,
  onFetchStart,
  onFetchSuccess,
  onFetchError,
  inFlightCacheRequests,
}) =>
  (async () => {
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

const createEndpointCacheService = ({
  envVarName,
  getCachedValueByKey,
  setCachedValueByKey,
  deleteCachedValueByKey,
  cacheKeyErrorFactory = (message) => new TypeError(message),
  defaultTtlSeconds = DEFAULT_ENDPOINT_CACHE_TTL_SECONDS,
}) => {
  validateFactoryOptions({
    envVarName,
    getCachedValueByKey,
    setCachedValueByKey,
    deleteCachedValueByKey,
  });

  const inFlightCacheRequests = new Map();

  const getEndpointCacheTtlSeconds = () =>
    getTtlSecondsFromEnv(envVarName, defaultTtlSeconds);

  const getCachedEndpointData = async (options) => {
    const parsedOptions = parseCacheFetchOptions(
      options,
      getEndpointCacheTtlSeconds,
    );
    const { cacheKey, fetcher } = parsedOptions;

    validateCacheFetchOptions({
      cacheKey,
      fetcher,
      cacheKeyErrorFactory,
    });

    const cachedOrInFlightValue = await tryGetCachedOrInFlightValue({
      ...parsedOptions,
      getCachedValueByKey,
      inFlightCacheRequests,
    });

    if (cachedOrInFlightValue !== undefined) {
      return cachedOrInFlightValue;
    }

    const fetchPromise = createFetchPromise({
      ...parsedOptions,
      setCachedValueByKey,
      inFlightCacheRequests,
    });

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
