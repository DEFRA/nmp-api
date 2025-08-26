const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const {
  StoreCapacitiesEntity,
} = require("../db/entity/store-capacities.entity");

class StoreCapacitiesService extends BaseService {
  constructor() {
    super(StoreCapacitiesEntity);
    this.repository = AppDataSource.getRepository(StoreCapacitiesEntity);
  }


  async getByFarmAndYear(farmId, year) {
    const records = await this.repository.find({
      where: {
        FarmID: farmId,
        Year: year,
      },
    });
    return records;
  }

}

module.exports = { StoreCapacitiesService };
