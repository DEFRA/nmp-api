const { AppDataSource } = require("../db/data-source");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { BaseService } = require("../base/base.service");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { MoreThan } = require("typeorm");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  GenerateRecommendations,
} = require("../shared/generate-recomendations-service");
const {
  UpdatingFutureRecommendations,
} = require("../shared/updating-future-recommendations-service");

class SoilAnalysesService extends BaseService {
  constructor() {
    super(SoilAnalysisEntity);
    this.repository = AppDataSource.getRepository(SoilAnalysisEntity);
    this.pkBalanceRepository = AppDataSource.getRepository(PKBalanceEntity);
    this.generateRecommendations = new GenerateRecommendations();
    this.updatingFutureRecommendations = new UpdatingFutureRecommendations();
  }

  async createSoilAnalysis(soilAnalysisBody, userId, pKBalanceData, request) {
    return AppDataSource.transaction(async (transactionalManager) => {
      const soilAnalysis = await this.saveSoilAnalysisHelper(
        transactionalManager,
        soilAnalysisBody,
        userId,
      );

      const PKBalance = await this.processPkBalanceForSoilAnalysisHelper(
        transactionalManager,
        soilAnalysis,
        pKBalanceData,
        userId,
      );

      await this.generateRecommendationsForSoilAnalysisHelper(
        transactionalManager,
        soilAnalysis,
        request,
        userId,
      );

      return { soilAnalysis, PKBalance };
    });
  }

  async saveSoilAnalysisHelper(transactionalManager, soilAnalysisBody, userId) {
    return transactionalManager.save(SoilAnalysisEntity, {
      ...soilAnalysisBody,
      CreatedByID: userId,
      CreatedOn: new Date(),
    });
  }

  async processPkBalanceForSoilAnalysisHelper(
    transactionalManager,
    soilAnalysis,
    pKBalanceData,
    userId,
  ) {
    const pkBalanceEntry = await transactionalManager.find(PKBalanceEntity, {
      where: {
        Year: soilAnalysis.Year,
        FieldID: soilAnalysis.FieldID,
      },
    });

    if (this.hasSoilAnalysisPkValuesHelper(soilAnalysis)) {
      if (pkBalanceEntry.length === 0 && pKBalanceData) {
        const { CreatedByID, CreatedOn, ...updatedPKBalanceData } =
          pKBalanceData;
        await transactionalManager.save(PKBalanceEntity, {
          ...updatedPKBalanceData,
          CreatedByID: userId,
          CreatedOn: new Date(),
        });
      }

      await this.updateExistingPkBalanceIfNeededHelper(
        transactionalManager,
        soilAnalysis,
        userId,
      );
    } else {
      await transactionalManager.delete(PKBalanceEntity, {
        Year: soilAnalysis.Year,
        FieldID: soilAnalysis.FieldID,
      });
    }

    return transactionalManager.findOne(PKBalanceEntity, {
      where: {
        Year: soilAnalysis.Year,
        FieldID: soilAnalysis.FieldID,
      },
    });
  }

  hasSoilAnalysisPkValuesHelper(soilAnalysis) {
    return (
      soilAnalysis.Potassium != null ||
      soilAnalysis.Phosphorus != null ||
      soilAnalysis.PotassiumIndex != null ||
      soilAnalysis.PhosphorusIndex != null
    );
  }

  async updateExistingPkBalanceIfNeededHelper(
    transactionalManager,
    soilAnalysis,
    userId,
  ) {
    const PKBalance = await transactionalManager.findOne(PKBalanceEntity, {
      where: {
        Year: soilAnalysis.Year,
        FieldID: soilAnalysis.FieldID,
      },
    });

    if (!PKBalance) {
      return;
    }

    await transactionalManager.save(PKBalanceEntity, {
      ...PKBalance,
      PBalance: 0,
      KBalance: 0,
      ModifiedOn: new Date(),
      ModifiedByID: userId,
    });
  }

  async generateRecommendationsForSoilAnalysisHelper(
    transactionalManager,
    soilAnalysis,
    request,
    userId,
  ) {
    const newOrganicManure = null;
    await this.generateRecommendations.generateRecommendations(
      soilAnalysis.FieldID,
      soilAnalysis.Year,
      newOrganicManure,
      transactionalManager,
      request,
      userId,
    );

    const nextAvailableCrop = await this.findNextAvailableCropHelper(
      transactionalManager,
      soilAnalysis.FieldID,
      soilAnalysis.Year,
    );

    if (nextAvailableCrop) {
      this.updatingFutureRecommendations.updateRecommendationsForField(
        soilAnalysis.FieldID,
        nextAvailableCrop.Year,
        request,
        userId,
      );
    }
  }

  async findNextAvailableCropHelper(transactionalManager, fieldId, year) {
    return transactionalManager.findOne(CropEntity, {
      where: {
        FieldID: fieldId,
        Year: MoreThan(year),
      },
      order: { Year: "ASC" },
    });
  }

  async updateSoilAnalysis(
    updatedSoilAnalysisData,
    userId,
    soilAnalysisId,
    pKBalanceData,
    request,
  ) {
    return AppDataSource.transaction(async (transactionalManager) => {
      const { CreatedByID, CreatedOn, ...updatedData } =
        updatedSoilAnalysisData;

      const result = await transactionalManager.update(
        SoilAnalysisEntity,
        soilAnalysisId,
        {
          ...updatedData,
          ModifiedByID: userId,
          ModifiedOn: new Date(),
        },
      );

      if (result.affected === 0) {
        throw new Error(`Soil Analysis with ID ${soilAnalysisId} not found`);
      }

      const SoilAnalysis = await this.findSoilAnalysisByIdHelper(
        transactionalManager,
        soilAnalysisId,
      );

      const PKBalance = await this.processPkBalanceForUpdatedSoilAnalysisHelper(
        transactionalManager,
        SoilAnalysis,
        pKBalanceData,
        userId,
      );

      await this.generateRecommendationsForUpdatedSoilAnalysisHelper(
        transactionalManager,
        updatedSoilAnalysisData,
        request,
        userId,
      );

      return { SoilAnalysis, PKBalance };
    });
  }

  async findSoilAnalysisByIdHelper(transactionalManager, soilAnalysisId) {
    return transactionalManager.findOne(SoilAnalysisEntity, {
      where: { ID: soilAnalysisId },
    });
  }

  async processPkBalanceForUpdatedSoilAnalysisHelper(
    transactionalManager,
    soilAnalysis,
    pKBalanceData,
    userId,
  ) {
    if (this.hasSoilAnalysisPkValuesHelper(soilAnalysis)) {
      await this.saveUpdatedPkBalanceIfMissingHelper(
        transactionalManager,
        soilAnalysis,
        pKBalanceData,
        userId,
      );
      await this.updateExistingPkBalanceIfNeededHelper(
        transactionalManager,
        soilAnalysis,
        userId,
      );
    } else {
      await transactionalManager.delete(PKBalanceEntity, {
        Year: soilAnalysis.Year,
        FieldID: soilAnalysis.FieldID,
      });
    }

    return transactionalManager.findOne(PKBalanceEntity, {
      where: {
        Year: soilAnalysis.Date.Year,
        FieldID: soilAnalysis.FieldID,
      },
    });
  }

  async saveUpdatedPkBalanceIfMissingHelper(
    transactionalManager,
    soilAnalysis,
    pKBalanceData,
    userId,
  ) {
    const pkBalanceEntry = await transactionalManager.find(PKBalanceEntity, {
      where: {
        Year: soilAnalysis.Date.Year,
        FieldID: soilAnalysis.FieldID,
      },
    });

    if (pkBalanceEntry.length === 0 && pKBalanceData) {
      const { ...updatedPKBalanceData } = pKBalanceData;
      await transactionalManager.save(PKBalanceEntity, {
        ...updatedPKBalanceData,
        CreatedByID: userId,
        CreatedOn: new Date(),
      });
    }
  }

  async generateRecommendationsForUpdatedSoilAnalysisHelper(
    transactionalManager,
    updatedSoilAnalysisData,
    request,
    userId,
  ) {
    const newOrganicManure = null;
    await this.generateRecommendations.generateRecommendations(
      updatedSoilAnalysisData.FieldID,
      updatedSoilAnalysisData.Year,
      newOrganicManure,
      transactionalManager,
      request,
      userId,
    );

    const nextAvailableCrop = await this.findNextAvailableCropHelper(
      transactionalManager,
      updatedSoilAnalysisData.FieldID,
      updatedSoilAnalysisData.Year,
    );

    if (nextAvailableCrop) {
      this.updatingFutureRecommendations
        .updateRecommendationsForField(
          updatedSoilAnalysisData.FieldID,
          nextAvailableCrop.Year,
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
    }
  }

  async deleteSoilAnalysis(soilAnalysisId, userId, request) {
    return AppDataSource.transaction(async (transactionalManager) => {
      // Check if the soilAnalysis exists
      const soilAnalysisToDelete = await transactionalManager.findOne(
        SoilAnalysisEntity,
        {
          where: { ID: soilAnalysisId },
        },
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

        this.updatingFutureRecommendations
          .updateRecommendationsForField(
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
