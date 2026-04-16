const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");
const { FarmAverageYieldsEntity } = require("../db/entity/farm-average-yield-entity");


class FarmAverageYieldsService extends BaseService {
  constructor() {
    super(FarmAverageYieldsEntity);
    this.repository = AppDataSource.getRepository(FarmAverageYieldsEntity);
  }

  async getByFarmIdAndHarvestYear(farmID, harvestYear) {
    return this.repository.find({
      where: {
        FarmID: farmID,
        HarvestYear: harvestYear
      },
    });
  }

 

  async mergeFarmAverageYields(payload, userId) {
    return AppDataSource.transaction(async (manager) => {
      const results = [];

      for (const item of payload) {
        await this.processSingleRecord(manager, item, userId, results);
      }
      return results;
    });
  }

  //  Main handler per record
  async processSingleRecord(manager, item, userId, results) {
    const existing = await this.findExisting(manager, item);

    if (item?.isDelete) {
      return this.deleteRecord(manager, existing, item, results);
    }

    if (existing) {
      return this.updateRecord(manager, existing, item, userId, results);
    }

    return this.insertRecord(manager, item, userId, results);
  }

  //  Find existing by composite PK
  async findExisting(manager, item) {
    const { FarmID, HarvestYear , CropTypeID } = item;

    return  manager.findOne(FarmAverageYieldsEntity, {
      where: { FarmID, HarvestYear, CropTypeID },
    });
  }

  // DELETE
  async deleteRecord(manager, existing, item, results) {
    if (!existing) {return};

    await manager.remove(FarmAverageYieldsEntity,existing);

    results.push({
      action: "DELETED",
      FarmID: item.FarmID,
      HarvestYear: item.HarvestYear,
      CropTypeID: item.CropTypeID,
    });
  }

  //  UPDATE
  async updateRecord(manager, existing, item, userId, results) {
    existing.AverageYield = item.AverageYield;
    existing.ModifiedByID = userId;
    existing.ModifiedOn = new Date();

    const updated = await manager.save(FarmAverageYieldsEntity,existing);

    results.push({
      action: "UPDATED",
      data: updated
    });
  }

  //  INSERT
  async insertRecord(manager, item, userId, results) {
    const entity = this.repository.create({
      FarmID: item.FarmID,
      HarvestYear: item.HarvestYear,
      CropTypeID: item.CropTypeID,
      AverageYield: item.AverageYield,
      CreatedByID: userId,
      CreatedOn: new Date()
    });

    const inserted = await manager.save(FarmAverageYieldsEntity,entity);

    results.push({
      action: "INSERTED",
      data: inserted
    });
  }
}



module.exports = { FarmAverageYieldsService };
