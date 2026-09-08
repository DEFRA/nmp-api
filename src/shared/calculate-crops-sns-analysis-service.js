const { In } = require("typeorm");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { CropOrderMapper } = require("../constants/crop-order-mapper");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { CropEntity } = require("../db/entity/crop.entity");

class CalculateCropsSnsAnalysisService {
  async getCropsSnsAnalyses(
    transactionalManager,
    fieldId,
    year,
    allCrops = [],
    prefetchedSnsByCropId = null,
  ) {
    // Step 1: find crops by field and year

    const crops =
      allCrops.length > 0
        ? allCrops
        : await transactionalManager.find(CropEntity, {
            where: {
              FieldID: fieldId,
              Year: year,
            },
          });

    const result = [];

    // Step 2: loop crops and fetch sns analysis for each
    for (const crop of crops) {
      const snsAnalysis = await this.getSnsAnalysesData(
        transactionalManager,
        crop.ID,
        prefetchedSnsByCropId,
      );

      if (snsAnalysis) {
        result.push({
          ...snsAnalysis,
          SNSCropOrder: crop.CropOrder,
        });
      }
    }

    return result;
  }

  // Helper method with transactional manager
  async getSnsAnalysesData(
    transactionalManager,
    cropId,
    prefetchedSnsByCropId = null,
  ) {
    if (prefetchedSnsByCropId instanceof Map) {
      return prefetchedSnsByCropId.get(cropId) ?? null;
    }

    const snsAnalysesData = await transactionalManager.findOne(
      SnsAnalysesEntity,
      {
        where: { CropID: cropId },
      },
    );
    return snsAnalysesData;
  }
}

module.exports = { CalculateCropsSnsAnalysisService };
