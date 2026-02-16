const { In } = require("typeorm");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { CropOrderMapper } = require("../constants/crop-order-mapper");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const { PreviousCroppingEntity } = require("../db/entity/previous-cropping.entity");
const { CropTypeMapper } = require("../constants/crop-type-mapper");

class CalculatePreviousCropService {
  async findPreviousCrop(fieldID, currentYear, transactionalManager) {
    const yearsToCheck = [currentYear - 1, currentYear - 2, currentYear - 3];
    const collectedCrops = [];

    // 1️⃣ COLLECT CROPS FOR LAST THREE YEARS
    for (const year of yearsToCheck) {
      // Fetch from CropEntity first
      let yearCrops = await transactionalManager.find(CropEntity, {
        where: { FieldID: fieldID, Year: year },
      });

      let selectedCrop = null;

      if (yearCrops.length > 1) {
        // If two crops — pick SECOND CROP
        selectedCrop = yearCrops.find(
          (crop) => crop.CropOrder === CropOrderMapper.SECONDCROP
        );
      } else if (yearCrops.length === 1) {
        // If one crop — pick it
        selectedCrop = yearCrops[0];
      }

      if (!selectedCrop) {
        // Fallback to PreviousCroppingEntity
        selectedCrop = await transactionalManager.findOne(
          PreviousCroppingEntity,
          {
            where: { FieldID: fieldID, HarvestYear: year },
          }
        );
      }

      collectedCrops.push(selectedCrop || null);
    }

    // ✔ Renamed variables
    const lastYearCrop = collectedCrops[0]; // Year - 1
    const secondLastYearCrop = collectedCrops[1]; // Year - 2
    const thirdLastYearCrop = collectedCrops[2]; // Year - 3

    // 2️⃣ VALIDATIONS
    if (!lastYearCrop || !secondLastYearCrop || !thirdLastYearCrop) {
      return null;
    }


    // 3️⃣ GET PREVIOUS YEAR CROP (Y-1 AGAIN) FOR FINAL RETURN
    let previousYearCrops = await transactionalManager.find(CropEntity, {
      where: { FieldID: fieldID, Year: currentYear - 1 },
    });

    if (previousYearCrops.length === 0) {
      return await transactionalManager.findOne(PreviousCroppingEntity, {
        where: { FieldID: fieldID, HarvestYear: currentYear - 1 },
      });
    }

    if (previousYearCrops.length > 1) {
      return previousYearCrops.find(
        (crop) => crop.CropOrder === CropOrderMapper.SECONDCROP
      );
    }

    return previousYearCrops[0] || null;
  }
}

module.exports = { CalculatePreviousCropService };
