const DEFAULT_CACHE_TTL_SECONDS = 60 * 60;
const cacheStore = new Map();

const getDefaultTtlSeconds = () => {
  const ttlFromEnv = Number(process.env.DYNAMIC_ENDPOINT_CACHE_TTL_SECONDS);

  if (!Number.isFinite(ttlFromEnv) || ttlFromEnv <= 0) {
    return DEFAULT_CACHE_TTL_SECONDS;
  }

  return Math.floor(ttlFromEnv);
};

const getTtlSeconds = (ttlSeconds) => {
  if (Number.isFinite(ttlSeconds) && ttlSeconds > 0) {
    return Math.floor(ttlSeconds);
  }

  return getDefaultTtlSeconds();
};

const hasCache = (key) => cacheStore.has(key);

const getCache = (key) => {
  if (!key || typeof key !== "string") {
    return undefined;
  }

  return cacheStore.get(key);
};

const setCache = (key, data, ttlSeconds) => {
  if (!key || typeof key !== "string") {
    return;
  }

  cacheStore.set(key, data);

  const ttl = getTtlSeconds(ttlSeconds);
  setTimeout(() => {
    cacheStore.delete(key);
  }, ttl * 1000);
};

const clearCache = (key) => {
  if (!key || typeof key !== "string") {
    return false;
  }

  return cacheStore.delete(key);
};

module.exports = {
  hasCache,
  getCache,
  setCache,
  clearCache,
};
