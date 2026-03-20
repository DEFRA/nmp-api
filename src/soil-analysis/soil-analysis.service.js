const { AppDataSource } = require("../db/data-source");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { BaseService } = require("../base/base.service");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { MoreThan } = require("typeorm");
const { CropEntity } = require("../db/entity/crop.entity");
const { GenerateRecommendations } = require("../shared/generate-recomendations-service");
const { UpdatingFutureRecommendations } = require("../shared/updating-future-recommendations-service");

class SoilAnalysesService extends BaseService {
  constructor() {
    super(SoilAnalysisEntity);
    this.repository = AppDataSource.getRepository(SoilAnalysisEntity);
    this.pkBalanceRepository = AppDataSource.getRepository(PKBalanceEntity);
    this.generateRecommendations = new GenerateRecommendations();
    this.updatingFutureRecommendations = new UpdatingFutureRecommendations();
  }

  async createSoilAnalysis(soilAnalysisBody, userId, pKBalanceData, request) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      const soilAnalysis = await transactionalManager.save(SoilAnalysisEntity, {
        ...soilAnalysisBody,
        CreatedByID: userId,
        CreatedOn: new Date(),
      });

      // Check for PK Balance entry
      let pkBalanceEntry = await transactionalManager.find(PKBalanceEntity, {
        where: {
          Year: soilAnalysis.Year,
          FieldID: soilAnalysis.FieldID,
        },
      });
     
      if (
        soilAnalysis.Potassium != null ||
        soilAnalysis.Phosphorus != null ||
        soilAnalysis.PotassiumIndex != null ||
        soilAnalysis.PhosphorusIndex != null
      ) {
        if (pkBalanceEntry.length === 0 && pKBalanceData) {
          let { CreatedByID, CreatedOn, ...updatedPKBalanceData } =
            pKBalanceData;
           await transactionalManager.save(PKBalanceEntity, {
            ...updatedPKBalanceData,
            CreatedByID: userId,
            CreatedOn: new Date()
          });
        }
      } else {
        // Delete PK Balance entry if applicable
        await transactionalManager.delete(PKBalanceEntity, {
          Year: soilAnalysis.Year,
          FieldID: soilAnalysis.FieldID,
        });
      }

      // Retrieve the updated PKBalance entry

      let PKBalance = await transactionalManager.findOne(PKBalanceEntity, {
        where: {
          Year: soilAnalysis.Year,
          FieldID: soilAnalysis.FieldID,
        },
      });

      if (
        soilAnalysis.Potassium != null ||
        soilAnalysis.Phosphorus != null ||
        soilAnalysis.PotassiumIndex != null ||
        soilAnalysis.PhosphorusIndex != null
      ) {
        if (PKBalance) {
          const updateData = {
            Year: PKBalance.Year,
            FieldID: PKBalance.FieldID,
            PBalance: 0,
            KBalance: 0,
          };

          const saveAndUpdatePKBalance = {
            ...PKBalance,
            ...updateData,
            ModifiedOn: new Date(),
            ModifiedByID: userId,
          };

          if (saveAndUpdatePKBalance) {
            await transactionalManager.save(
              PKBalanceEntity,
              saveAndUpdatePKBalance
            );
          }
        }
      } 

      const newOrganicManure = null;
        await this.generateRecommendations.generateRecommendations(
          soilAnalysis.FieldID,
          soilAnalysis.Year,
          newOrganicManure,
          transactionalManager,
          request,
          userId
        );

        const nextAvailableCrop = await transactionalManager.findOne(
          CropEntity,
          {
            where: {
              FieldID: soilAnalysis.FieldID,
              Year: MoreThan(soilAnalysis.Year),
            },
            order: { Year: "ASC" },
          }
        );
        if (nextAvailableCrop) {
          this.updatingFutureRecommendations.updateRecommendationsForField(
              soilAnalysis.FieldID,
              nextAvailableCrop.Year,
              request,
              userId
            )
        }

      return { soilAnalysis, PKBalance };
      // return soilAnalysis;
    });
  }

  async updateSoilAnalysis(
    updatedSoilAnalysisData,
    userId,
    soilAnalysisId,
    pKBalanceData,
    request
  ) {
    return await AppDataSource.transaction(async (transactionalManager) => {
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
      let pkBalanceEntry = await transactionalManager.find(PKBalanceEntity, {
        where: {
          Year: SoilAnalysis.Date.Year,
          FieldID: SoilAnalysis.FieldID,
        },
      });

      let newPKBalanceData = null;

      if (
        SoilAnalysis.Potassium != null ||
        SoilAnalysis.Phosphorus != null ||
        SoilAnalysis.PotassiumIndex != null ||
        SoilAnalysis.PhosphorusIndex != null
      ) {
        if (pkBalanceEntry.length === 0 && pKBalanceData) {
          let { CreatedByID, CreatedOn, ...updatedPKBalanceData } =
            pKBalanceData;
          newPKBalanceData = await transactionalManager.save(PKBalanceEntity, {
            ...updatedPKBalanceData,
            CreatedByID: userId,
          });
        }
      } else {
        // Delete PK Balance entry if applicable
        await transactionalManager.delete(PKBalanceEntity, {
          Year: SoilAnalysis.Year,
          FieldID: SoilAnalysis.FieldID,
        });
      }

      // Retrieve the updated PKBalance entry

      let PKBalance = await transactionalManager.findOne(PKBalanceEntity, {
        where: {
          Year: SoilAnalysis.Date.Year,
          FieldID: SoilAnalysis.FieldID,
        },
      });
      if (
        (SoilAnalysis.Potassium != null ||
          SoilAnalysis.Phosphorus != null ||
          SoilAnalysis.PotassiumIndex != null ||
          SoilAnalysis.PhosphorusIndex != null) &&
          PKBalance
      ) {
          const updateData = {
            Year: PKBalance.Year,
            FieldID: PKBalance.FieldID,
            PBalance: 0,
            KBalance: 0,
          };

          const saveAndUpdatePKBalance = {
            ...PKBalance,
            ...updateData,
            ModifiedOn: new Date(),
            ModifiedByID: userId,
          };

          if (saveAndUpdatePKBalance) {
            await transactionalManager.save(
              PKBalanceEntity,
              saveAndUpdatePKBalance
            );
          }
        
      }
      const newOrganicManure= null;
      await this.generateRecommendations.generateRecommendations(
        updatedSoilAnalysisData.FieldID,
        updatedSoilAnalysisData.Year,
        newOrganicManure,
        transactionalManager,
        request,
        userId
      );

      const nextAvailableCrop = await transactionalManager.findOne(CropEntity, {
        where: {
          FieldID: updatedSoilAnalysisData.FieldID,
          Year: MoreThan(updatedSoilAnalysisData.Year),
        },
        order: { Year: "ASC" },
      });

      if (nextAvailableCrop) {
        this.updatingFutureRecommendations.updateRecommendationsForField(
            updatedSoilAnalysisData.FieldID,
            nextAvailableCrop.Year,
            request,
            userId
          )
          .then((res) => {
            if (res === undefined) {
              console.log(
                "updateRecommendationAndOrganicManure returned undefined",
              );
            } else {
              console.log("updateRecommendationAndOrganicManure result:", res);
            }
          })
          .catch((error) => {
            console.error(
              "Error updating recommendation and organic manure:",
              error,
            );
          });
      }

      return { SoilAnalysis, PKBalance };
    });
  }

  async deleteSoilAnalysis(soilAnalysisId, userId, request) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      // Check if the soilAnalysis exists
      const soilAnalysisToDelete = await transactionalManager.findOne(
        SoilAnalysisEntity,
        {
          where: { ID: soilAnalysisId },
        }
      );

      // If the soilAnalysis does not exist, throw a not found error
      if (soilAnalysisToDelete == null) {
        console.log(`soilAnalysis with ID ${soilAnalysisId} not found`);
      }

      try {
        // Call the stored procedure to delete the soilAnalysisId and related entities
        const storedProcedure =
          "EXEC spSoilAnalyses_DeleteSoilAnalyses @SoilAnalysesID = @0";
        await AppDataSource.query(storedProcedure, [soilAnalysisId]);

        this.updatingFutureRecommendations.updateRecommendationsForField(
            soilAnalysisToDelete.FieldID,
            soilAnalysisToDelete.Year,
            request,
            userId,
          )
          .then((res) => {
            if (res === undefined) {
              console.log(
                "updateRecommendationAndOrganicManure returned undefined",
              );
            } else {
              console.log("updateRecommendationAndOrganicManure result:", res);
            }
          })
          .catch((error) => {
            console.error(
              "Error updating recommendation and organic manure:",
              error,
            );
          });
      } catch (error) {
        // Log the error and throw an internal server error
        console.error("Error deleting SoilAnalyses:", error);
      }
    });
  }
}

module.exports = { SoilAnalysesService };
