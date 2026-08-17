const MannerBaseService = require("../base.service");
const { getCachedEndpointData } = require("../endpoint-cache.service");

const MANURE_TYPES_CACHE_KEY = "manner-manure-types-list";

const normalizeBooleanQueryValue = (value) => {
  if (value === true || value === false) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
  }

  return undefined;
};

const matchesQuery = (manureType, query = {}) => {
  if (query.manureGroupId !== undefined) {
    if (String(manureType?.manureGroupId) !== String(query.manureGroupId)) {
      return false;
    }
  }

  if (query.manureTypeCategoryId !== undefined) {
    if (
      String(manureType?.manureTypeCategoryId) !==
      String(query.manureTypeCategoryId)
    ) {
      return false;
    }
  }

  if (query.countryId !== undefined) {
    if (String(manureType?.countryId) !== String(query.countryId)) {
      return false;
    }
  }

  const highRanFilter = normalizeBooleanQueryValue(
    query.highReadilyAvailableNitrogen,
  );
  if (
    highRanFilter !== undefined &&
    Boolean(manureType?.highReadilyAvailableNitrogen) !== highRanFilter
  ) {
    return false;
  }

  const isLiquidFilter = normalizeBooleanQueryValue(query.isLiquid);
  if (
    isLiquidFilter !== undefined &&
    Boolean(manureType?.isLiquid) !== isLiquidFilter
  ) {
    return false;
  }

  return true;
};

class MannerManureTypesService extends MannerBaseService {
  async getAllManureTypesList(request, options = {}) {
    const { forceRefresh = false } = options;

    return getCachedEndpointData({
      cacheKey: MANURE_TYPES_CACHE_KEY,
      forceRefresh,
      isCachedValueValid: (cachedManureTypes) =>
        Array.isArray(cachedManureTypes) && cachedManureTypes.length > 0,
      shouldCache: (manureTypes) => Array.isArray(manureTypes),
      fetcher: async () => this.getData("/manure-types", request),
    });
  }

  async getAllManureTypesByQuery(request, query = {}) {
    const manureTypes = await this.getAllManureTypesList(request);
    if (!Array.isArray(manureTypes)) {
      return manureTypes;
    }

    return manureTypes.filter((manureType) => matchesQuery(manureType, query));
  }

  async getManureTypeById(id, request) {
    const manureTypes = await this.getAllManureTypesList(request);
    const normalizedId = Number(id);

    if (Array.isArray(manureTypes) && Number.isFinite(normalizedId)) {
      const cachedMatch = manureTypes.find(
        (manureType) => Number(manureType?.id) === normalizedId,
      );

      if (cachedMatch) {
        return cachedMatch;
      }
    }

    return this.getData(`/manure-types/${id}`, request);
  }
}

module.exports = MannerManureTypesService;
