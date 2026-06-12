const { CountryMapper } = require("../../../constants/country-mapper");
const RB209BaseService = require("../base.service");
const CacheManager = require("../cacheManager");

const cacheManager = new CacheManager();
class RB209GrassService extends RB209BaseService {
  constructor() {
    super(cacheManager);
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
