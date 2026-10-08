const { CountryMapper } = require("../../../constants/country-mapper");
const RB209BaseService = require("../base.service");
const CacheManager = require("../cacheManager");
const { randomInt } = require("crypto");

const cacheManager = new CacheManager();
class RB209GrassService extends RB209BaseService {
  constructor() {
    super(cacheManager);
  }

  static #ESTABLISHMENT_KEYWORD = "establishment";

  static #SUPPORTED_CUT_TYPES = new Set(["silage", "grazing", "hay"]);

  static #NORMAL_YIELD_MIN = 8;

  static #NORMAL_YIELD_MAX = 25;

  static #DEFOLIATION_CODE_TO_TYPE = {
    E: "Establishment",
    S: "Silage",
    G: "Grazing",
    H: "Hay",
  };

  #extractDefoliationTypes(record) {
    if (!record) {
      return [];
    }

    if (record.defoliationSequenceDescription) {
      return record.defoliationSequenceDescription
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    }

    if (record.defoliationSequence) {
      return String(record.defoliationSequence)
        .split("")
        .map((value) => RB209GrassService.#DEFOLIATION_CODE_TO_TYPE[value])
        .filter(Boolean);
    }

    return [];
  }

  #getRandomYield() {
    const min = RB209GrassService.#NORMAL_YIELD_MIN;
    const max = RB209GrassService.#NORMAL_YIELD_MAX;

    return randomInt(min, max + 1);
  }

  #getDefaultYieldForType(type) {
    const normalizedType = String(type).trim().toLowerCase();

    if (normalizedType === RB209GrassService.#ESTABLISHMENT_KEYWORD) {
      return null;
    }

    if (RB209GrassService.#SUPPORTED_CUT_TYPES.has(normalizedType)) {
      return this.#getRandomYield();
    }

    return null;
  }

  async getDefaultYieldsByDefoliationSequenceId(defoliationSequenceId) {
    const record = await this.getData(
      `Grass/DefoliationSequence/${defoliationSequenceId}`,
    );

    const defoliationTypes = this.#extractDefoliationTypes(record);
    const defaultYields = defoliationTypes.map((type) => {
      const defaultYield = this.#getDefaultYieldForType(type);

      return {
        [type]: defaultYield,
      };
    });

    return {
      defaultYields,
    };
  }

  async getSwardTypesFilterByCountryId(countryId) {
    const records = await this.getData("Grass/SwardTypes");
    return records.filter(
      (record) =>
        record.countryId === CountryMapper.WELSH || record.countryId === countryId,
    );
  }
}

module.exports = RB209GrassService;
