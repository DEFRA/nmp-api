const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { ExcessRainfallsEntity } = require("../db/entity/excess-rainfalls.entity");

class ExcessRainfallService extends BaseService {
  constructor() {
    super(ExcessRainfallsEntity);
    this.repository = AppDataSource.getRepository(ExcessRainfallsEntity);
  }
  async getExcessRainfallByFarmIdAndYear(fieldId, year) {
    const excessRainfall = await this.repository.findOneBy({
      FarmID: fieldId,
      Year: year,
    });
    return {
      ExcessRainfall: excessRainfall,
    };
  }
}

module.exports = { ExcessRainfallService };
