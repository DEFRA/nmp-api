const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const boom = require("@hapi/boom");

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
  async checkExist(farmId, year, storeName) {
    const record = await this.repository.findOne({
      where: { FarmID: farmId, Year: year, StoreName: storeName },
    });

    return !!record; // true if exists, false if not
  }
  async createStoreCapacities(payload, userId) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      const {
        FarmID,
        Year,
        StoreName,
        CreatedByID,
        CreatedOn,
        ...cleanPayload
      } = payload;
      const existingRecord = await transactionalManager.findOne(
        StoreCapacitiesEntity,
        { where: { FarmID: FarmID, Year: Year, StoreName: StoreName } }
      );

      if (existingRecord) {
        throw boom.conflict(
          `Record with FarmID ${FarmID}, Year ${Year}, and StoreName ${StoreName} already exists`
        );
      }

      const newRecord = transactionalManager.create(StoreCapacitiesEntity, {
        ...cleanPayload,
        FarmID: FarmID,
        Year: Year,
        StoreName:StoreName,
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
