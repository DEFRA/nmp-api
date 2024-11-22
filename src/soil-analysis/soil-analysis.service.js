const { AppDataSource } = require("../db/data-source");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { BaseService } = require("../base/base.service");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");

class SoilAnalysesService extends BaseService {
  constructor() {
    super(SoilAnalysisEntity);
    this.repository = AppDataSource.getRepository(SoilAnalysisEntity);
    this.pkBalanceRepository = AppDataSource.getRepository(PKBalanceEntity);
  }

  async createSoilAnalysis(soilAnalysisBody, userId) {
    return await AppDataSource.transaction(
      async (transactionalManager) => {
        const soilAnalysis = await transactionalManager.save(
          SoilAnalysisEntity,
          {
            ...soilAnalysisBody,
            CreatedByID: userId,
          }
        );
        return soilAnalysis;
      }
    );
  }

  async updateSoilAnalysis(
    updatedSoilAnalysisData,
    userId,
    soilAnalysisId,
    pKBalanceData
  ) {
    return await AppDataSource.transaction(
      async (transactionalManager) => {
        const { CreatedByID, CreatedOn, ...updatedData } =
          updatedSoilAnalysisData;

        // Update SoilAnalysis
        const result = await transactionalManager.update(
          SoilAnalysisEntity,
          soilAnalysisId,
          {
            ...updatedData,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
          }
        );

        if (result.affected === 0) {
          throw new Error(`Soil Analysis with ID ${soilAnalysisId} not found`);
        }

        const SoilAnalysis = await transactionalManager.findOne(
          SoilAnalysisEntity,
          {
            where: { ID: soilAnalysisId },
          }
        );

        // Check for PK Balance entry
        let pkBalanceEntry = await transactionalManager.find(
          PKBalanceEntity,
          {
            where: {
              Year: SoilAnalysis.Date.Year,
              FieldID: SoilAnalysis.FieldID,
            },
          }
        );

        let newPKBalanceData = null;

        if (SoilAnalysis.Potassium != null || SoilAnalysis.Phosphorus != null) {
          if (pkBalanceEntry.length === 0 && pKBalanceData) {
            let { CreatedByID, CreatedOn, ...updatedPKBalanceData } =
              pKBalanceData;
            newPKBalanceData = await transactionalManager.save(
              PKBalanceEntity,
              {
                ...updatedPKBalanceData,
                CreatedByID: userId,
              }
            );
          }
        } else {
          // Delete PK Balance entry if applicable
          await transactionalManager.delete(PKBalanceEntity, {
            Year: SoilAnalysis.Date.Year,
            FieldID: SoilAnalysis.FieldID,
          });
        }

        // Retrieve the updated PKBalance entry
        let PKBalance = await transactionalManager.findOne(
          PKBalanceEntity,
          {
            where: {
              Year: SoilAnalysis.Date.Year,
              FieldID: SoilAnalysis.FieldID,
            },
          }
        );

        return { SoilAnalysis, PKBalance };
      }
    );
  }
}

module.exports = { SoilAnalysesService };
