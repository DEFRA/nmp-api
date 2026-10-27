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
      const existingSoilAnalysis = await this.findSoilAnalysisByIdHelper(
        transactionalManager,
        soilAnalysisId,
      );

      if (!existingSoilAnalysis) {
        console.log(`Soil Analysis with ID ${soilAnalysisId} not found`);
      }

      const { CreatedByID, CreatedOn, ...updatedData } =
        updatedSoilAnalysisData;

      const recommendationStartYear = this.getMinimumYearHelper(
        existingSoilAnalysis.Year,
        updatedData.Year,
      );

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
        console.log(`Soil Analysis with ID ${soilAnalysisId} not found`);
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
        SoilAnalysis,
        recommendationStartYear,
        request,
        userId,
      );

      return { SoilAnalysis, PKBalance };
    });
  }

  getMinimumYearHelper(previousYear, updatedYear) {
    if (previousYear == null) {
      return updatedYear;
    }

    if (updatedYear == null) {
      return previousYear;
    }

    return Math.min(previousYear, updatedYear);
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
        Year: soilAnalysis.Year,
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
        Year: soilAnalysis.Year,
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
    updatedSoilAnalysis,
    recommendationStartYear,
    request,
    userId,
  ) {
    const newOrganicManure = null;
    const yearForRecommendations =
      recommendationStartYear ?? updatedSoilAnalysis.Year;

    await this.generateRecommendations.generateRecommendations(
      updatedSoilAnalysis.FieldID,
      yearForRecommendations,
      newOrganicManure,
      transactionalManager,
      request,
      userId,
    );

    const nextAvailableCrop = await this.findNextAvailableCropHelper(
      transactionalManager,
      updatedSoilAnalysis.FieldID,
      yearForRecommendations,
    );

    if (nextAvailableCrop) {
      await this.updatingFutureRecommendations.updateRecommendationsForField(
        updatedSoilAnalysis.FieldID,
        nextAvailableCrop.Year,
        request,
        userId,
      );
    }
  }

  async findEarliestSoilAnalysisForFieldHelper(
    transactionalManager,
    fieldId,
  ) {
    return transactionalManager.findOne(SoilAnalysisEntity, {
      where: {
        FieldID: fieldId,
      },
      order: { Year: "ASC" },
    });
  }

  async deleteSoilAnalysis(soilAnalysisId, userId, request) {
    return AppDataSource.transaction(async (transactionalManager) => {
      const soilAnalysisToDelete = await transactionalManager.findOne(
        SoilAnalysisEntity,
        {
          where: { ID: soilAnalysisId },
        },
      );

      if (soilAnalysisToDelete == null) {
        console.log(`Soil Analysis with ID ${soilAnalysisId} not found`);
      }

      const storedProcedure =
        "EXEC spSoilAnalyses_DeleteSoilAnalyses @SoilAnalysesID = @0";
      await transactionalManager.query(storedProcedure, [soilAnalysisId]);

      const earliestRemainingSoilAnalysis =
        await this.findEarliestSoilAnalysisForFieldHelper(
          transactionalManager,
          soilAnalysisToDelete.FieldID,
        );

      const recommendationStartYear = this.getMinimumYearHelper(
        soilAnalysisToDelete.Year,
        earliestRemainingSoilAnalysis?.Year,
      );

      await this.updatingFutureRecommendations.updateRecommendationsForField(
        soilAnalysisToDelete.FieldID,
        recommendationStartYear,
        request,
        userId,
      );
    });
  }
}

module.exports = { SoilAnalysesService };
