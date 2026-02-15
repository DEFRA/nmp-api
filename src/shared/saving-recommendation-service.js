const { CropTypeMapper } = require("../constants/crop-type-mapper");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const {
  RecommendationCommentEntity,
} = require("../db/entity/recommendation-comment.entity");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const { CalculateNextDefoliationService } = require("./calculate-next-defoliation-totalN");
const { CalculateTotalAvailableNForNextYear } = require("./calculate-next-year-available-n");

class SavingRecommendationService {
  constructor() {
    this.CalculateNextDefoliationService =
      new CalculateNextDefoliationService();
    this.CalculateTotalAvailableNForPreviousYear =
      new CalculateTotalAvailableNForNextYear();
  }
  /* ============================================================
     BUILD CROP RECOMMENDATION DATA
  ============================================================ */

  async filterBySingleSequenceId(data, sequenceId) {
    const filteredCalculations = data?.calculations?.filter(
      (item) => item.sequenceId === sequenceId,
    );

    const filteredAdviceNotes = data?.adviceNotes?.filter(
      (item) => item.sequenceId === sequenceId,
    );

    return {
      ...data,
      calculations: filteredCalculations,
      adviceNotes: filteredAdviceNotes,
    };
  }

  async buildCropRecommendationData(
    cropData,
    latestSoilAnalysis,
    nutrientRecommendationsData,
    transactionalManager,
    userId,
    mannerOutputs,
  ) {
    const filteredData = await this.filterBySingleSequenceId(
      nutrientRecommendationsData,
      cropData.CropOrder,
    );

    if (!filteredData?.calculations?.length) {
      return [];
    }

    const defoliationIds = this.getUniqueDefoliationIds(
      filteredData.calculations,
    );

    const results = [];

    for (const defoliationId of defoliationIds) {
      const recommendation = await this.processDefoliationGroup(
        cropData,
        defoliationId,
        filteredData,
        latestSoilAnalysis,
        transactionalManager,
        userId,
        mannerOutputs,
      );

      if (recommendation) {
        results.push(recommendation);
      }
    }

    return results;
  }

  getUniqueDefoliationIds(calculations) {
    return [...new Set(calculations.map((c) => c.defoliationId))];
  }

  async extractNutrientData(calculations, defoliationId) {
    return calculations?.filter((c) => c.defoliationId === defoliationId);
  }

  async processDefoliationGroup(
    cropData,
    defoliationId,
    filteredData,
    latestSoilAnalysis,
    transactionalManager,
    userId,
    mannerOutputs,
  ) {
    const defoliationData = await this.extractNutrientData(
      filteredData.calculations,
      defoliationId,
    );

    if (!defoliationData?.length) {
      return null;
    }

    const cropRecData = this.initializeRecommendationData(latestSoilAnalysis);

    const managementPeriod = await this.getManagementPeriod(
      transactionalManager,
      cropData.ID,
      defoliationId,
    );
    await this.applyNutrientCalculations(
      cropRecData,
      defoliationData,
      mannerOutputs,
      managementPeriod,
      cropData,
      transactionalManager,
      defoliationId,
    );

    if (!managementPeriod) {
      return null;
    }

    return this.saveOrUpdateRecommendation(
      transactionalManager,
      managementPeriod,
      cropRecData,
      filteredData,
      userId,
    );
  }

  initializeRecommendationData(latestSoilAnalysis) {
    return {
      CropN: null,
      NBalance: null,
      CropP2O5: null,
      PBalance: null,
      CropK2O: null,
      KBalance: null,
      CropMgO: null,
      MgBalance: null,
      CropSO3: null,
      SBalance: null,
      CropNa2O: null,
      NaBalance: null,
      CropLime: null,
      LimeBalance: null,
      FertilizerN: null,
      FertilizerP2O5: null,
      FertilizerK2O: null,
      FertilizerMgO: null,
      FertilizerSO3: null,
      FertilizerNa2O: null,
      FertilizerLime: null,
      PH: latestSoilAnalysis?.PH?.toString() ?? null,
      SNSIndex: latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString() ?? null,
      PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString() ?? null,
      KIndex: latestSoilAnalysis?.PotassiumIndex?.toString() ?? null,
      MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString() ?? null,
      SIndex: null,
      NIndex: null,
    };
  }

  async applyNutrientCalculations(
    cropRecData,
    calculations,
    mannerOutputs,
    managementPeriod,
    cropData,
    transactionalManager,
    defoliationId
  ) {
    let availableNForNextDefoliation = null,nextCropAvailableN = null;
    if (!mannerOutputs || mannerOutputs.length === 0) {
      availableNForNextDefoliation = await this.CalculateNextDefoliationService.calculateAvailableNForNextDefoliation(transactionalManager,managementPeriod,cropData);
      if (defoliationId === 1) {
        nextCropAvailableN = await this.CalculateTotalAvailableNForPreviousYear.calculateAvailableNForPreviousYear(
            cropData.FieldID,
            cropData.Year,
            transactionalManager
          );
      }
    }
    const nutrientHandlers = {
      0: (c) => {
        cropRecData.CropN = c.recommendation;
        cropRecData.FertilizerN = c.cropNeed;
        cropRecData.ManureN = c.manures;
        // If no manner outputs, add extra N
        if (!mannerOutputs || mannerOutputs.length === 0) {
          cropRecData.ManureN =
            (availableNForNextDefoliation || 0) + (nextCropAvailableN || 0);
        }
        cropRecData.NBalance = c.pkBalance;
        cropRecData.NIndex = c.indexpH;
      },
      1: (c) => {
        cropRecData.CropP2O5 = c.recommendation;
        cropRecData.ManureP2O5 = c.manures;
        cropRecData.PBalance = c.pkBalance;
        cropRecData.FertilizerP2O5 = c.cropNeed;
      },
      2: (c) => {
        cropRecData.CropK2O = c.recommendation;
        cropRecData.ManureK2O = c.manures;
        cropRecData.KBalance = c.pkBalance;
        cropRecData.FertilizerK2O = c.cropNeed;
      },
      3: (c) => {
        cropRecData.CropMgO = c.recommendation;
        cropRecData.MgBalance = c.pkBalance;
        cropRecData.FertilizerMgO = c.cropNeed;
      },
      4: (c) => {
        cropRecData.CropNa2O = c.recommendation;
        cropRecData.NaBalance = c.pkBalance;
        cropRecData.FertilizerNa2O = c.cropNeed;
      },
      5: (c) => {
        cropRecData.CropSO3 = c.recommendation;
        cropRecData.ManureSO3 = c.manures;
        cropRecData.SBalance = c.pkBalance;
        cropRecData.FertilizerSO3 = c.cropNeed;
      },
      6: (c) => {
        cropRecData.CropLime = c.recommendation;
        cropRecData.LimeBalance = c.pkBalance;
        cropRecData.FertilizerLime = c.cropNeed;
      },
    };
    for (const calc of calculations) {
      const handler = nutrientHandlers[calc.nutrientId];
      if (handler) { handler(calc)}
    }
  }

  async getManagementPeriod(transactionalManager, cropID, defoliationId) {
    const record = await transactionalManager.findOne(ManagementPeriodEntity, {
      where: { CropID: cropID, Defoliation: defoliationId },
    });
    return record ?? null;
  }

  async saveOrUpdateRecommendation(
    transactionalManager,
    managementPeriod,
    cropRecData,
    filteredData,
    userId,
  ) {
    const existing = await transactionalManager.findOne(RecommendationEntity, {
      where: { ManagementPeriodID: managementPeriod.ID },
    });

    const baseData = {
      ...cropRecData,
      Comments: `Reference Value: ${filteredData.referenceValue}\nVersion: ${filteredData.versionNumber}`,
    };

    if (existing) {
      return transactionalManager.save(RecommendationEntity, {
        ...existing,
        ...baseData,
        ModifiedByID: userId,
        ModifiedOn: new Date(),
      });
    }

    return transactionalManager.save(RecommendationEntity, {
      ...baseData,
      ManagementPeriodID: managementPeriod.ID,
      CreatedByID: userId,
      CreatedOn: new Date(),
    });
  }

  /* ==================SAVE MULTIPLE RECOMMENDATION COMMENTS ================ */

  async saveMultipleRecommendation(
    Recommendations,
    savedCrop,
    cropSaveData,
    transactionalManager,
    nutrientRecommendationsData,
    userId
  ) {
    const cropNotes = await this.getCropNotes(
      savedCrop,
      transactionalManager,
      nutrientRecommendationsData,
    );

    const groupedNotes = this.groupNotesByNutrientId(cropNotes);

    const savedComments = await this.saveOrUpdateComments(
      groupedNotes,
      cropSaveData,
      transactionalManager,
      userId,
    );

    Recommendations.push({
      Recommendation: cropSaveData,
      RecommendationComments: savedComments,
    });

    return Recommendations;
  }

  async getCropNotes(savedCrop, transactionalManager, nutrientData) {
    const adviceNotes = nutrientData.adviceNotes ?? [];

    const hasDefoliation = adviceNotes.some((note) => "defoliationId" in note);

    if (!hasDefoliation) {
      return adviceNotes.filter(
        (note) => note.sequenceId === savedCrop.CropOrder,
      );
    }
    const managementPeriod = await transactionalManager.findOne(
      ManagementPeriodEntity,
      { where: { ID: savedCrop.ManagementPeriodID } },
    );

    if (!managementPeriod){ 
      return [];
    }
    return adviceNotes.filter(
      (note) =>
        note.defoliationId === managementPeriod.Defoliation &&
        note.sequenceId === savedCrop.CropOrder,
    );
  }

  groupNotesByNutrientId(notes) {
    return notes.reduce((acc, note) => {
      const nutrientId = note.nutrientId;
      if (!acc[nutrientId]) {
        acc[nutrientId] = [];
      }
      acc[nutrientId].push(note.note);
      return acc;
    }, {});
  }

  async saveOrUpdateComments(
    notesByNutrientId,
    savedCrop,
    transactionalManager,
    userId,
  ) {
    const existingComments = await transactionalManager.find(
      RecommendationCommentEntity,
      { where: { RecommendationID: savedCrop.ID } },
    );

    const processedNutrients = [];
    const results = [];

    for (const nutrientId of Object.keys(notesByNutrientId)) {
      const nutrient = Number(nutrientId);
      const commentText = notesByNutrientId[nutrientId].join(" <br/>");

      processedNutrients.push(nutrient);

      const existing = existingComments.find((c) => c.Nutrient === nutrient);

      if (existing) {
        existing.Comment = commentText;
        existing.ModifiedOn = new Date();
        existing.ModifiedByID = userId;
        results.push(
          await transactionalManager.save(
            RecommendationCommentEntity,
            existing,
          ),
        );
      } else {
        results.push(
          await transactionalManager.save(RecommendationCommentEntity, {
            Nutrient: nutrient,
            Comment: commentText,
            RecommendationID: savedCrop.ID,
            CreatedOn: new Date(),
            CreatedByID: userId,
          }),
        );
      }
    }

    const toDelete = existingComments.filter(
      (c) => !processedNutrients.includes(c.Nutrient),
    );

    if (toDelete.length) {
      await transactionalManager.remove(RecommendationCommentEntity, toDelete);
    }

    return results;
  }

  async processSingleCrop(cropData, context, Recommendations, mannerOutputs) {
    const savedRecommendations = await this.buildCropRecommendationData(
      cropData,
      context.latestSoilAnalysis,
      context.nutrientRecommendationsData,
      context.transactionalManager,
      context.userId,
      mannerOutputs,
    );

    if (!savedRecommendations?.length) {
      return;
    }

    const recommendationsToSave = this.resolveRecommendationsToSave(
      cropData,
      savedRecommendations,
      context.hasDefoliationNotes,
    );
   const recomendationsAndComments = []
    for (const recommendation of recommendationsToSave) {
      const recommendationsNotes= await this.saveMultipleRecommendation(
        Recommendations,
        cropData,
        recommendation,
        context.transactionalManager,
        context.nutrientRecommendationsData,
        context.userId,
      );

      recomendationsAndComments.push(recommendationsNotes);
    }
    return recomendationsAndComments;
  }

  isGrassCrop(cropData) {
    return cropData.CropTypeID === CropTypeMapper.GRASS;
  }

  hasDefoliationAdviceNotes(nutrientRecommendationsData) {
    return nutrientRecommendationsData?.adviceNotes?.some(
      (note) => "defoliationId" in note,
    );
  }

  async processAndSaveRecommendations(
    dataMultipleCrops,
    latestSoilAnalysis,
    nutrientRecommendationsData,
    transactionalManager,
    userId,
    mannerOutputs,
  ) {
    const recommendations = [],finalRecommendations=[];

    if (!dataMultipleCrops?.length) {
      return recommendations;
    }

    const hasDefoliationNotes = this.hasDefoliationAdviceNotes(
      nutrientRecommendationsData,
    );

    for (const cropData of dataMultipleCrops) {
      const recommendationsAndNotes = await this.processSingleCrop(
        cropData,
        {
          latestSoilAnalysis,
          nutrientRecommendationsData,
          transactionalManager,
          userId,
          hasDefoliationNotes,
        },
        recommendations,
        mannerOutputs,
      );
      finalRecommendations.push(recommendationsAndNotes);
    }

    return finalRecommendations;
  }

  resolveRecommendationsToSave(
    cropData,
    savedRecommendations,
    hasDefoliationNotes,
  ) {
    const isGrass = this.isGrassCrop(cropData);

    if (isGrass && hasDefoliationNotes) {
      return savedRecommendations;
    }

    return [savedRecommendations[0]];
  }
}

module.exports = { SavingRecommendationService };
