
const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { CountryEntity } = require("../db/entity/country.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const { FarmsNVZEntity } = require("../db/entity/farms-nvz.entity");

class FarmsNVZService extends BaseService {
  constructor() {
    super(FarmsNVZEntity);
    this.farmRepository = AppDataSource.getRepository(FarmEntity);
  }

  async getFarmAndNvzDetailsByFarmId(farmID) {
    try {
      const result = await this.farmRepository
        .createQueryBuilder("farm")
        .leftJoin(CountryEntity, "country", "country.ID = farm.CountryID")
        .leftJoinAndMapMany(
          "farm.FarmsNvz",
          FarmsNVZEntity,
          "farmsNvz",
          "farmsNvz.FarmID = farm.ID",
        )
        .addSelect("country.RB209CountryID", "RB209CountryID")
        .where("farm.ID = :farmID", { farmID })
        .getRawAndEntities();

      if (!result.entities.length) {
        return null;
      }
      const farm = result.entities[0];
      // attach RB209CountryID
      farm.RB209CountryID = result.raw[0]?.RB209CountryID ?? null;
      // extract NVZ list
      const farmsNvzList = farm.FarmsNvz || [];
      // remove nested duplication
      delete farm.FarmsNvz;
      return {
        Farm: farm,
        FarmsNvz: farmsNvzList,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = { FarmsNVZService };