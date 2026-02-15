const { In } = require("typeorm");
const { ManagementPeriodEntity } = require("../db/entity/management-period.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const { FertiliserManuresEntity } = require("../db/entity/fertiliser-manures.entity");

class TotalFertiliserByField {
  constructor() {}

  async getP205AndK20fromfertiliser(transactionalManager, managementPeriodIds) {
    // Normalize to array
    const ids = Array.isArray(managementPeriodIds)
      ? managementPeriodIds
      : [managementPeriodIds];

    let sumOfP205 = 0;
    let sumOfK20 = 0;

    if (ids.length === 0) {
      return { p205: 0, k20: 0 };
    }

    const fertiliserData = await transactionalManager.find(
      FertiliserManuresEntity,
      {
        where: {
          ManagementPeriodID: In(ids),
        },
        select: {
          P2O5: true,
          K2O: true,
        },
      },
    );
    for (const fertiliser of fertiliserData) {
      sumOfP205 += fertiliser.P2O5 ?? 0;
      sumOfK20 += fertiliser.K2O ?? 0;
    }

    return { p205: sumOfP205, k20: sumOfK20 };
  }

  async getTotalFertiliserByFieldAndYear(transactionalManager, fieldID, year) {
    // Find all crops for field + year
    const crops = await transactionalManager.find(CropEntity, {
      where: {
        FieldID: fieldID,
        Year: year
      },
      select: { ID: true }
    });

    if (!crops.length) {
      return { p205: 0, k20: 0 };
    }

    const cropIds = crops.map((crop) => crop.ID);

    // Find all management periods for those crop IDs
    const managementPeriods = await transactionalManager.find(
      ManagementPeriodEntity,
      {
        where: {
          CropID: In(cropIds),
        },
        select: { ID: true },
      },
    );

    if (!managementPeriods.length) {
      return { p205: 0, k20: 0 };
    }

    const managementPeriodIds = managementPeriods.map((mp) => mp.ID);

    // Reuse your existing function
    return await this.getP205AndK20fromfertiliser(
      transactionalManager,
      managementPeriodIds,
    );
  }
}

module.exports = { TotalFertiliserByField };