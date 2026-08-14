const RB209BaseService = require("../base.service");
const CacheManager = require("../cacheManager");
const { ARABLE } = require("../../../constants/rb209-endpoints-mapper");

const cacheManager = new CacheManager();
const CROP_TYPES_CACHE_KEY = "rb209-arable-crop-types-list";
const DEFAULT_CROP_TYPES_CACHE_TTL_SECONDS = 60 * 60;

let cropTypesInFlightPromise = null;
const cropTypesMetrics = {
  totalRequests: 0,
  thirdPartyCalls: 0,
  cacheHits: 0,
  inFlightJoins: 0,
  lastFetchedAt: null,
};

const getCropTypesCacheTtlSeconds = () => {
  const ttlValue = Number(
    process.env.RB209_ARABLE_CROP_TYPES_CACHE_TTL_SECONDS,
  );
  if (ttlValue === 0) {
    return null;
  }
  if (!Number.isFinite(ttlValue) || ttlValue <= 0) {
    return DEFAULT_CROP_TYPES_CACHE_TTL_SECONDS;
  }

  return Math.floor(ttlValue);
};

class RB209ArableService extends RB209BaseService {
  constructor() {
    super(cacheManager);
  }

  async getCropTypesList(options = {}) {
    const { forceRefresh = false } = options;
    cropTypesMetrics.totalRequests += 1;

    if (!forceRefresh) {
      const cachedCropTypes = await cacheManager.get(CROP_TYPES_CACHE_KEY);
      if (Array.isArray(cachedCropTypes) && cachedCropTypes.length > 0) {
        cropTypesMetrics.cacheHits += 1;
        return cachedCropTypes;
      }

      if (cropTypesInFlightPromise) {
        cropTypesMetrics.inFlightJoins += 1;
        return cropTypesInFlightPromise;
      }
    }

    cropTypesInFlightPromise = (async () => {
      cropTypesMetrics.thirdPartyCalls += 1;
      const cropTypes = await this.getData(
        ARABLE.ALL_ARABLE_CROP_TYPES_ENDPOINT,
      );
      if (Array.isArray(cropTypes)) {
        const ttlSeconds = getCropTypesCacheTtlSeconds();
        await cacheManager.set(
          CROP_TYPES_CACHE_KEY,
          cropTypes,
          ttlSeconds ? { ttl: ttlSeconds } : undefined,
        );
        cropTypesMetrics.lastFetchedAt = new Date().toISOString();
      }
      return cropTypes;
    })();

    try {
      return await cropTypesInFlightPromise;
    } finally {
      cropTypesInFlightPromise = null;
    }
  }

  async getCropTypeNameById(cropTypeId) {
    const cropTypes = await this.getCropTypesList();
    if (!Array.isArray(cropTypes)) {
      return null;
    }

    const normalizedCropTypeId = Number(cropTypeId);
    const match = cropTypes.find(
      ({ cropTypeId: listCropTypeId }) =>
        Number(listCropTypeId) === normalizedCropTypeId,
    );

    return match?.cropType ?? match?.cropTypeName ?? null;
  }

  async getCropTypesMetrics() {
    const cachedCropTypes = await cacheManager.get(CROP_TYPES_CACHE_KEY);
    const cachedItems = Array.isArray(cachedCropTypes)
      ? cachedCropTypes.length
      : 0;

    return {
      ...cropTypesMetrics,
      cacheTtlSeconds: getCropTypesCacheTtlSeconds(),
      hasCachedCropTypes: cachedItems > 0,
      cachedItems,
      hasInFlightRequest: Boolean(cropTypesInFlightPromise),
    };
  }

  resetCropTypesMetrics() {
    cropTypesMetrics.totalRequests = 0;
    cropTypesMetrics.thirdPartyCalls = 0;
    cropTypesMetrics.cacheHits = 0;
    cropTypesMetrics.inFlightJoins = 0;
    cropTypesMetrics.lastFetchedAt = null;

    return {
      message: "Crop type metrics reset successfully",
    };
  }

  async resetCropTypesCache() {
    await cacheManager.delete(CROP_TYPES_CACHE_KEY);
    cropTypesInFlightPromise = null;

    return {
      message: "Crop type cache reset successfully",
    };
  }
}

module.exports = RB209ArableService;
