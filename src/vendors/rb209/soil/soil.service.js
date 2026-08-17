const RB209BaseService = require("../base.service");
const CacheManager = require("../cacheManager");
const { getCachedEndpointData } = require("../endpoint-cache.service");

const cacheManager = new CacheManager();
const SOIL_TYPES_CACHE_KEY = "rb209-soil-types-list";

class RB209SoilService extends RB209BaseService {
  constructor() {
    super(cacheManager);
  }

  async getSoilTypesList(options = {}) {
    const { forceRefresh = false } = options;

    return getCachedEndpointData({
      cacheKey: SOIL_TYPES_CACHE_KEY,
      forceRefresh,
      isCachedValueValid: (cachedSoilTypes) =>
        Array.isArray(cachedSoilTypes) && cachedSoilTypes.length > 0,
      shouldCache: (soilTypes) => Array.isArray(soilTypes),
      fetcher: async () => this.getData("/Soil/SoilTypes"),
    });
  }

  async getSoilTypeBySoilTypeId(soilTypeId) {
    const soilTypes = await this.getSoilTypesList();
    const normalizedSoilTypeId = Number(soilTypeId);

    if (Array.isArray(soilTypes) && Number.isFinite(normalizedSoilTypeId)) {
      const cachedMatch = soilTypes.find(
        ({ soilTypeId: listSoilTypeId }) =>
          Number(listSoilTypeId) === normalizedSoilTypeId,
      );

      if (cachedMatch) {
        return {
          soilType: cachedMatch.soilType ?? null,
        };
      }
    }

    const fallbackSoilType = await this.getData(`/Soil/SoilType/${soilTypeId}`);

    if (
      fallbackSoilType &&
      typeof fallbackSoilType === "object" &&
      "soilType" in fallbackSoilType
    ) {
      return fallbackSoilType;
    }

    return {
      soilType: fallbackSoilType?.soilType ?? null,
    };
  }
}

module.exports = RB209SoilService;
