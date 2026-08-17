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

const matchesOptionalIdField = (actualValue, queryValue) =>
  queryValue === undefined || String(actualValue) === String(queryValue);

const matchesOptionalBooleanField = (actualValue, queryValue) => {
  const normalizedQueryValue = normalizeBooleanQueryValue(queryValue);
  return (
    normalizedQueryValue === undefined ||
    Boolean(actualValue) === normalizedQueryValue
  );
};

const matchesQuery = (manureType, query = {}) => {
  const idFieldMappings = [
    ["manureGroupId", "manureGroupId"],
    ["manureTypeCategoryId", "manureTypeCategoryId"],
    ["countryId", "countryId"],
  ];

  const hasMatchingIdFields = idFieldMappings.every(
    ([manureTypeField, queryField]) =>
      matchesOptionalIdField(manureType?.[manureTypeField], query[queryField]),
  );

  if (!hasMatchingIdFields) {
    return false;
  }

  return (
    matchesOptionalBooleanField(
      manureType?.highReadilyAvailableNitrogen,
      query.highReadilyAvailableNitrogen,
    ) && matchesOptionalBooleanField(manureType?.isLiquid, query.isLiquid)
  );
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
