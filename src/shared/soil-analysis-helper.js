const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");

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
