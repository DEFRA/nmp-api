const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");
const { FarmAverageYieldsEntity } = require("../db/entity/farm-average-yield-entity");
const { ProcessFutureManuresForWarnings } = require("../shared/process-future-warning-calculations-service");


class FarmAverageYieldsService extends BaseService {
  constructor() {
    super(FarmAverageYieldsEntity);
    this.repository = AppDataSource.getRepository(FarmAverageYieldsEntity);
    this.ProcessFutureManuresForWarnings =
      new ProcessFutureManuresForWarnings();
  }

  async getByFarmIdAndHarvestYear(farmID, harvestYear) {
    return this.repository.find({
      where: {
        FarmID: farmID,
        HarvestYear: harvestYear,
      },
    });
  }

  async mergeFarmAverageYields(payload, userId) {
    return AppDataSource.transaction(async (transactionalManager) => {
      const results = [];

      for (const item of payload) {
        await this.processSingleRecord(
          transactionalManager,
          item,
          userId,
          results,
        );
      }
      return results;
    });
  }

  async processWarningForCrop(cropID, userId, transactionalManager) {
    return this.ProcessFutureManuresForWarnings.processNMaxWarningsByCrop(
      cropID,
      userId,
      transactionalManager
    );
  }

  async procssingNMaxWarningMessages(farmID, harvestYear, userId, transactionalManager) {
    // Single optimized query (JOIN instead of multiple calls)
    const query = `
    SELECT c.ID as CropID
    FROM Fields f
    INNER JOIN Crops c ON c.FieldID = f.ID
    WHERE f.FarmID = @0
      AND c.Year = @1
  `;

    const cropRecords = await AppDataSource.query(query, [farmID, harvestYear]);

    // Loop through crops
    for (const record of cropRecords) {
      await this.processWarningForCrop(
        record.CropID,
        userId,
        transactionalManager
      );
    }

    return {
      message: "Warnings processed successfully",
      totalProcessed: cropRecords.length,
    };
  }
  //  Main handler per record
  async processSingleRecord(transactionalManager, item, userId, results) {
    const existing = await this.findExisting(transactionalManager, item);
    let result;

    if (item?.AverageYield != null) {
      if (existing) {
        result = await this.updateRecord(
          transactionalManager,
          existing,
          item,
          userId,
          results,
        );
      } else {
        result = await this.insertRecord(
          transactionalManager,
          item,
          userId,
          results,
        );
      }

      await this.procssingNMaxWarningMessages(
        item.FarmID,
        item.HarvestYear,
        userId,
        transactionalManager
      );
    } else if (existing) {
      result = await this.deleteRecord(
        transactionalManager,
        existing,
        item,
        results,
      );
    } else {
      result = null;
    }

    return result;
  }

  //  Find existing by composite PK
  async findExisting(transactionalManager, item) {
    const { FarmID, HarvestYear, CropTypeID } = item;

    return transactionalManager.findOne(FarmAverageYieldsEntity, {
      where: { FarmID, HarvestYear, CropTypeID },
    });
  }

  // DELETE
  async deleteRecord(transactionalManager, existing, item, results) {
    if (!existing) {
      return;
    }

    await transactionalManager.remove(FarmAverageYieldsEntity, existing);

    results.push({
      FarmID: item.FarmID,
      HarvestYear: item.HarvestYear,
      CropTypeID: item.CropTypeID,
    });
  }

  //  UPDATE
  async updateRecord(transactionalManager, existing, item, userId, results) {
    existing.AverageYield = item.AverageYield;
    existing.ModifiedByID = userId;
    existing.ModifiedOn = new Date();

    const updated = await transactionalManager.save(FarmAverageYieldsEntity, existing);

    results.push({
      FarmID: updated.FarmID,
      HarvestYear: updated.HarvestYear,
      CropTypeID: updated.CropTypeID,
      AverageYield: updated.AverageYield,
    });
  }

  //  INSERT
  async insertRecord(transactionalManager, item, userId, results) {
    const entity = this.repository.create({
      FarmID: item.FarmID,
      HarvestYear: item.HarvestYear,
      CropTypeID: item.CropTypeID,
      AverageYield: item.AverageYield,
      CreatedByID: userId,
      CreatedOn: new Date(),
    });

    const inserted = await transactionalManager.save(
      FarmAverageYieldsEntity,
      entity
    );

    results.push({
      FarmID: inserted.FarmID,
      HarvestYear: inserted.HarvestYear,
      CropTypeID: inserted.CropTypeID,
      AverageYield: inserted.AverageYield,
    });
  }
}



module.exports = { FarmAverageYieldsService };
