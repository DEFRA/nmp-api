const RB209BaseService = require("../base.service");
const CacheManager = require("../cacheManager");
const { ARABLE } = require("../../../constants/rb209-endpoints-mapper");
const {
  getCachedEndpointData,
  getCachedValue,
  resetCachedEndpointData,
  isCacheRequestInFlight,
  getEndpointCacheTtlSeconds,
} = require("../endpoint-cache.service");

const cacheManager = new CacheManager();
const CROP_TYPES_CACHE_KEY = "rb209-arable-crop-types-list";

const cropTypesMetrics = {
  totalRequests: 0,
  thirdPartyCalls: 0,
  cacheHits: 0,
  inFlightJoins: 0,
  lastFetchedAt: null,
};

class RB209ArableService extends RB209BaseService {
  constructor() {
    super(cacheManager);
  }

  async getCropTypesList(options = {}) {
    const { forceRefresh = false } = options;
    cropTypesMetrics.totalRequests += 1;

    return getCachedEndpointData({
      cacheKey: CROP_TYPES_CACHE_KEY,
      forceRefresh,
      isCachedValueValid: (cachedCropTypes) =>
        Array.isArray(cachedCropTypes) && cachedCropTypes.length > 0,
      shouldCache: (cropTypes) => Array.isArray(cropTypes),
      onCacheHit: () => {
        cropTypesMetrics.cacheHits += 1;
      },
      onInFlightJoin: () => {
        cropTypesMetrics.inFlightJoins += 1;
      },
      onFetchStart: () => {
        cropTypesMetrics.thirdPartyCalls += 1;
      },
      onFetchSuccess: (cropTypes) => {
        if (Array.isArray(cropTypes)) {
          cropTypesMetrics.lastFetchedAt = new Date().toISOString();
        }
      },
      fetcher: async () => this.getData(ARABLE.ALL_ARABLE_CROP_TYPES_ENDPOINT),
    });
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

  async getCropTypeByCropTypeId(cropTypeId) {
    const cropTypes = await this.getCropTypesList();
    const normalizedCropTypeId = Number(cropTypeId);

    if (Array.isArray(cropTypes) && Number.isFinite(normalizedCropTypeId)) {
      const cachedMatch = cropTypes.find(
        ({ cropTypeId: listCropTypeId }) =>
          Number(listCropTypeId) === normalizedCropTypeId,
      );

      if (cachedMatch) {
        return {
          cropTypeName:
            cachedMatch.cropType ?? cachedMatch.cropTypeName ?? null,
        };
      }
    }

    const fallbackCropType = await this.getData(
      `/Arable/CropType/${cropTypeId}`,
    );

    if (
      fallbackCropType &&
      typeof fallbackCropType === "object" &&
      "cropTypeName" in fallbackCropType
    ) {
      return fallbackCropType;
    }

    return {
      cropTypeName:
        fallbackCropType?.cropType ?? fallbackCropType?.cropTypeName ?? null,
    };
  }

  async getCropTypesMetrics() {
    const cachedCropTypes = await getCachedValue(CROP_TYPES_CACHE_KEY);
    const cachedItems = Array.isArray(cachedCropTypes)
      ? cachedCropTypes.length
      : 0;

    return {
      ...cropTypesMetrics,
      cacheTtlSeconds: getEndpointCacheTtlSeconds(),
      hasCachedCropTypes: cachedItems > 0,
      cachedItems,
      hasInFlightRequest: isCacheRequestInFlight(CROP_TYPES_CACHE_KEY),
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
    await resetCachedEndpointData(CROP_TYPES_CACHE_KEY);

    return {
      message: "Crop type cache reset successfully",
    };
  }
}

module.exports = RB209ArableService;
