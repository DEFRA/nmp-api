const { Between } = require("typeorm");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");

const SOIL_ANALYSIS_VALIDATION_YEARS = 5;

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

  async checkSoilAnalysisForYearRange(fieldID, year, transactionalManager) {
    try {
      const fiveYearsAgo = year - (SOIL_ANALYSIS_VALIDATION_YEARS - 1);

      const soilAnalysisRecords = await transactionalManager.find(
        SoilAnalysisEntity,
        {
          where: {
            FieldID: fieldID,
            Year: Between(fiveYearsAgo, year),
          },
        },
      );

      return {
        exists: soilAnalysisRecords && soilAnalysisRecords.length > 0,
        recordCount: soilAnalysisRecords?.length ?? 0,
        yearRange: { from: fiveYearsAgo, to: year },
        records: soilAnalysisRecords ?? [],
      };
    } catch (error) {
      console.error(
        `Error checking soil analysis for field ${fieldID} in year ${year}:`,
        error
      );
      throw error;
    }
  }

  async validateSoilAnalysisExists(fieldID, year, transactionalManager) {
    try {
      const fiveYearsAgo = year - (SOIL_ANALYSIS_VALIDATION_YEARS - 1);
      
      const soilAnalysisRecords = await transactionalManager.find(
        SoilAnalysisEntity,
        {
          where: {
            FieldID: fieldID,
            Year: Between(fiveYearsAgo, year),
          },
        },
      );

      if (!soilAnalysisRecords || soilAnalysisRecords.length === 0) {
        console.warn(
          `No soil analysis found for field ID ${fieldID} in year range ${fiveYearsAgo}-${year}. ` +
          "Will save PK balance with 0 values."
        );
        return {
          exists: false,
          recordCount: 0,
          yearRange: { from: fiveYearsAgo, to: year },
          records: [],
        };
      }

      return {
        exists: true,
        recordCount: soilAnalysisRecords.length,
        yearRange: { from: fiveYearsAgo, to: year },
        records: soilAnalysisRecords,
      };
    } catch (error) {
      console.error(
        `Error validating soil analysis for field ${fieldID} in year ${year}:`,
        error
      );
      return {
        exists: false,
        recordCount: 0,
        yearRange: { from: year - (SOIL_ANALYSIS_VALIDATION_YEARS - 1), to: year },
        records: [],
      };
    }
  }

  async resetPKBalanceToZero(fieldID, year, userId, transactionalManager) {
    try {
      const pkBalance = await transactionalManager.findOne(PKBalanceEntity, {
        where: {
          FieldID: fieldID,
          Year: year,
        },
      });

      if (!pkBalance) {
        return null;
      }

      const resetBalance = {
        ...pkBalance,
        PBalance: 0,
        KBalance: 0,
        ModifiedOn: new Date(),
        ModifiedByID: userId,
      };

      await transactionalManager.save(PKBalanceEntity, resetBalance);

      return resetBalance;
    } catch (error) {
      console.error("Error resetting PK Balance to zero:", error);
      throw error;
    }
  }
}

module.exports = { SoilAnalysisHelper };
