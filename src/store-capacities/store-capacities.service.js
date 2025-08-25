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


  async getById(farmId, year) {
    const record = await this.repository.findOneBy({
      FarmID: farmId,
      Year: year,
    });
    return record;
  }
}

module.exports = { StoreCapacitiesService };
