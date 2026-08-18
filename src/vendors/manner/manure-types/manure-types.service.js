const MannerBaseService = require("../base.service");
const { getCachedEndpointData } = require("../endpoint-cache.service");

const MANURE_TYPES_CACHE_KEY = "manner-manure-types-list";

const extractManureTypeItems = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return null;
};

const withFilteredItems = (payload, filteredItems) => {
  if (Array.isArray(payload)) {
    return filteredItems;
  }

  if (payload && typeof payload === "object" && Array.isArray(payload.data)) {
    return {
      ...payload,
      data: filteredItems,
    };
  }

  return payload;
};

const getManureTypeIdValue = (manureType) =>
  manureType?.id ?? manureType?.manureTypeId ?? manureType?.manureTypeID;

const normalizeOptionalQueryValue = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return undefined;
  }

  const loweredValue = trimmedValue.toLowerCase();
  if (loweredValue === "undefined" || loweredValue === "null") {
    return undefined;
  }

  const hasSingleQuotes =
    trimmedValue.startsWith("'") && trimmedValue.endsWith("'");
  const hasDoubleQuotes =
    trimmedValue.startsWith('"') && trimmedValue.endsWith('"');

  if (hasSingleQuotes || hasDoubleQuotes) {
    const unquotedValue = trimmedValue.slice(1, -1).trim();
    return unquotedValue || undefined;
  }

  return trimmedValue;
};

const normalizeBooleanQueryValue = (value) => {
  const normalizedValue = normalizeOptionalQueryValue(value);

  if (normalizedValue === undefined) {
    return undefined;
  }

  if (normalizedValue === true || normalizedValue === false) {
    return normalizedValue;
  }

  if (typeof normalizedValue === "string") {
    const normalized = normalizedValue.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
  }

  return undefined;
};

const normalizeQueryFilters = (query = {}) => ({
  id: normalizeOptionalQueryValue(query.id),
  name: normalizeOptionalQueryValue(query.name),
  manureGroupId: normalizeOptionalQueryValue(query.manureGroupId),
  manureTypeCategoryId: normalizeOptionalQueryValue(query.manureTypeCategoryId),
  countryId: normalizeOptionalQueryValue(query.countryId),
  highReadilyAvailableNitrogen: normalizeOptionalQueryValue(
    query.highReadilyAvailableNitrogen,
  ),
  isLiquid: normalizeOptionalQueryValue(query.isLiquid),
});

const matchesOptionalIdField = (actualValue, queryValue) =>
  queryValue === undefined || String(actualValue) === String(queryValue);

const matchesOptionalBooleanField = (actualValue, queryValue) => {
  const normalizedQueryValue = normalizeBooleanQueryValue(queryValue);
  return (
    normalizedQueryValue === undefined ||
    Boolean(actualValue) === normalizedQueryValue
  );
};

const matchesQuery = (manureType, rawQuery = {}) => {
  const query = normalizeQueryFilters(rawQuery);

  if (query.id !== undefined) {
    return Number(getManureTypeIdValue(manureType)) === Number(query.id);
  }

  if (query.name !== undefined) {
    const normalizedName = String(query.name).trim().toLowerCase();
    const manureTypeName = String(manureType?.name ?? "")
      .trim()
      .toLowerCase();
    return manureTypeName === normalizedName;
  }

  const readFieldValue = (fieldNames) =>
    fieldNames
      .map((fieldName) => manureType?.[fieldName])
      .find((value) => value !== undefined && value !== null);

  if (query.manureGroupId !== undefined) {
    const fieldValue = readFieldValue(["manureGroupId", "manureGroupID"]);
    return matchesOptionalIdField(fieldValue, query.manureGroupId);
  }

  if (query.manureTypeCategoryId !== undefined) {
    const fieldValue = readFieldValue([
      "manureTypeCategoryId",
      "manureTypeCategoryID",
    ]);
    return matchesOptionalIdField(fieldValue, query.manureTypeCategoryId);
  }

  if (query.countryId !== undefined) {
    const fieldValue = readFieldValue(["countryId", "countryID"]);
    return matchesOptionalIdField(fieldValue, query.countryId);
  }

  if (query.highReadilyAvailableNitrogen !== undefined) {
    return matchesOptionalBooleanField(
      manureType?.highReadilyAvailableNitrogen,
      query.highReadilyAvailableNitrogen,
    );
  }

  if (query.isLiquid !== undefined) {
    return matchesOptionalBooleanField(manureType?.isLiquid, query.isLiquid);
  }

  return true;
};

class MannerManureTypesService extends MannerBaseService {
  async getAllManureTypesList(request, options = {}) {
    const { forceRefresh = false } = options;

    return getCachedEndpointData({
      cacheKey: MANURE_TYPES_CACHE_KEY,
      forceRefresh,
      isCachedValueValid: (cachedManureTypes) => {
        const cachedItems = extractManureTypeItems(cachedManureTypes);
        return Array.isArray(cachedItems) && cachedItems.length > 0;
      },
      shouldCache: (manureTypes) =>
        Array.isArray(extractManureTypeItems(manureTypes)),
      fetcher: async () => this.getData("/manure-types", request),
    });
  }

  async getAllManureTypesByQuery(request, query = {}) {
    const manureTypes = await this.getAllManureTypesList(request);
    const manureTypeItems = extractManureTypeItems(manureTypes);

    if (!Array.isArray(manureTypeItems)) {
      return manureTypes;
    }

    const filteredItems = manureTypeItems.filter((manureType) =>
      matchesQuery(manureType, query),
    );

    return withFilteredItems(manureTypes, filteredItems);
  }

  async getManureTypeById(id, request) {
    const manureTypes = await this.getAllManureTypesList(request);
    const manureTypeItems = extractManureTypeItems(manureTypes);
    const normalizedId = Number(id);

    if (Array.isArray(manureTypeItems) && Number.isFinite(normalizedId)) {
      const cachedMatch = manureTypeItems.find(
        (manureType) =>
          Number(getManureTypeIdValue(manureType)) === normalizedId,
      );

      if (cachedMatch) {
        return cachedMatch;
      }
    }

    return this.getData(`/manure-types/${id}`, request);
  }
}

module.exports = MannerManureTypesService;
