const { CropEntity } = require("../db/entity/crop.entity");
const { ManagementPeriodEntity } = require("../db/entity/management-period.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");



class CalculateTotalAvailableNForNextYear {
  constructor() {}

  async calculateAvailableNForPreviousYear(fieldID, year, transactionalManager) {
    let totalAvailableN = null;
  
    // Step 1: Get crops for fieldID and year - 1, ordered by CropOrder DESC
    const crops = await transactionalManager.find(CropEntity, {
      where: { FieldID: fieldID, Year: year - 1 },
      order: { CropOrder: "DESC" },
    });
  
    for (const crop of crops) {
      // Step 2: Get management periods for the crop
      const managementPeriods = await transactionalManager.find(ManagementPeriodEntity, {
        where: { CropID: crop.ID },
      });
  
      for (const period of managementPeriods) {
        // Step 3: Get organic manures for each management period
        const organicManures = await transactionalManager.find(OrganicManureEntity, {
          where: { ManagementPeriodID: period.ID },
        });
  
        // Step 4: Sum AvailableNForNextYear
        for (const manure of organicManures) {
          totalAvailableN += manure.AvailableNForNextYear || 0;
        }
      }
    }
    return totalAvailableN
}
}

module.exports = {
  CalculateTotalAvailableNForNextYear,
};
