const { In } = require("typeorm");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { CropOrderMapper } = require("../constants/crop-order-mapper");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  PreviousCroppingEntity,
} = require("../db/entity/previous-cropping.entity");
const { CropTypeMapper } = require("../constants/crop-type-mapper");

class CalculatePreviousCropService {
  pickCropFromList(crops) {
    if (crops.length > 1) {
      return (
        crops.find((crop) => crop.CropOrder === CropOrderMapper.SECONDCROP) ||
        null
      );
    }

    if (crops.length === 1) {
      return crops[0];
    }

    console.warn(`No crop found in CropEntity for FieldID`);
    return null;
  }

  async findCropForYear(fieldID, year, transactionalManager) {
    const yearCrops = await transactionalManager.find(CropEntity, {
      where: { FieldID: fieldID, Year: year },
    });

    const selectedCrop = this.pickCropFromList(yearCrops);

    if (selectedCrop) {
      return selectedCrop;
    }

    return transactionalManager.findOne(PreviousCroppingEntity, {
      where: { FieldID: fieldID, HarvestYear: year },
    });
  }

  async getPreviousYearCrop(fieldID, currentYear, transactionalManager) {
    const previousYear = currentYear - 1;
    const previousYearCrops = await transactionalManager.find(CropEntity, {
      where: { FieldID: fieldID, Year: previousYear },
    });

    if (previousYearCrops.length === 0) {
      return transactionalManager.findOne(PreviousCroppingEntity, {
        where: { FieldID: fieldID, HarvestYear: previousYear },
      });
    }

    return this.pickCropFromList(previousYearCrops);
  }

  async findPreviousCrop(fieldID, currentYear, transactionalManager) {
    const yearOne = 1,
      yearTwo = 2,
      yearThree = 3;
    const yearsToCheck = [
      currentYear - yearOne,
      currentYear - yearTwo,
      currentYear - yearThree,
    ];
    const collectedCrops = [];

    for (const year of yearsToCheck) {
      const selectedCrop = await this.findCropForYear(
        fieldID,
        year,
        transactionalManager,
      );
      collectedCrops.push(selectedCrop || null);
    }

    const lastYearCrop = collectedCrops[0];
    const secondLastYearCrop = collectedCrops[1];
    const thirdLastYearCrop = collectedCrops[2];

    if (!lastYearCrop || !secondLastYearCrop || !thirdLastYearCrop) {
      return null;
    }

    return this.getPreviousYearCrop(fieldID, currentYear, transactionalManager);
  }
}

module.exports = { CalculatePreviousCropService };
