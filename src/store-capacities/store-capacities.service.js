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
  async createStoreCapacities(payload, userId) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      const { FarmID, Year,CreatedByID,CreatedOn, ...cleanPayload } = payload;
      const newRecord = transactionalManager.create(StoreCapacitiesEntity, {
        ...cleanPayload,
        FarmID:FarmID,
        Year:Year,
        CreatedOn: new Date(),
        CreatedByID: userId,
      });

      const saved = await transactionalManager.save(
        StoreCapacitiesEntity,
        newRecord
      );

      const savedRecord = await transactionalManager.findOne(
        StoreCapacitiesEntity,
        { where: { FarmID: FarmID, Year: Year } }
      );

      return savedRecord;
    });
  }
}

module.exports = { StoreCapacitiesService };
