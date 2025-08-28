const { In } = require("typeorm");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { CropOrderMapper } = require("../constants/crop-order-mapper");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { CropEntity } = require("../db/entity/crop.entity");

class CalculateCropsSnsAnalysisService {
  constructor() {}
  async getCropsSnsAnalyses(transactionalManager, fieldId, year) {
    // Step 1: find crops by field and year
    const crops = await transactionalManager.find(CropEntity, {
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
        crop.ID
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
  async getSnsAnalysesData(transactionalManager, cropId) {
    return await transactionalManager.findOne(
      SnsAnalysesEntity,
      {
        where: { CropID: cropId },
      }
    );
  }
}

module.exports = { CalculateCropsSnsAnalysisService };
