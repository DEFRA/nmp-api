const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");
const { FarmAverageYieldsEntity } = require("../db/entity/farm-average-yield-entity");


class FarmAverageYieldsService extends BaseService {
  constructor() {
    super(FarmAverageYieldsEntity);
    this.repository = AppDataSource.getRepository(FarmAverageYieldsEntity);

  }

  async getByFarmIdAndHarvestYear(farmID, harvestYear) {
    return await this.repository.find({
      where: {
        FarmID: farmID,
        HarvestYear: harvestYear
      },
    });
  }

  async createFarmAverageYield(payload, userId) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      const entity = transactionalManager.create(FarmAverageYieldsEntity, {
        ...payload,
        CreatedByID: userId,
        ModifiedByID: userId,
        CreatedOn: new Date(),
        ModifiedOn: new Date(),
      });

      const savedEntity = await transactionalManager.save(entity);

      return savedEntity;
    });
  }
}

module.exports = { FarmAverageYieldsService };
