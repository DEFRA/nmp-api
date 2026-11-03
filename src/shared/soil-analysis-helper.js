const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");

class SoilAnalysisHelper {
  async checkSoilAnalysisExists(fieldID, year, transactionalManager) {
    try {
      const soilAnalysis = await transactionalManager.findOne(
        SoilAnalysisEntity,
        {
          where: {
            FieldID: fieldID,
            Year: year,
          },
        },
      );

      return !!soilAnalysis;
    } catch (error) {
      console.error("Error checking soil analysis existence:", error);
      throw error;
    }
  }
}

module.exports = { SoilAnalysisHelper };
