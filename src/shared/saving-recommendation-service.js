const { CropTypeMapper } = require("../constants/crop-type-mapper");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const {
  RecommendationCommentEntity,
} = require("../db/entity/recommendation-comment.entity");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const { CountryMapper } = require("../constants/country-mapper");
const {
  CalculateNextDefoliationService,
} = require("./calculate-next-defoliation-totalN");
const {
  CalculateTotalAvailableNForNextYear,
} = require("./calculate-next-year-available-n");

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
    if (!filteredData?.calculations?.length) { return []}
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
        { transactionalManager, userId },
        mannerOutputs,
        defoliationIds,
      );
      if (recommendation) {results.push(recommendation)}
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
    userIdTransactionManager,
    mannerOutputs,
    defoliationIds,
  ) {
    const { transactionalManager, userId } = userIdTransactionManager;
    const defoliationData = await this.extractNutrientData(
      filteredData.calculations,
      defoliationId,
    );
    if (!defoliationData?.length) {return null};
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
      { defoliationId, defoliationIds, latestSoilAnalysis },
    );
    if (!managementPeriod) {return null};
    return this.saveOrUpdateRecommendation(
      transactionalManager,
      managementPeriod,
      cropRecData,
      filteredData,
      userId,
      latestSoilAnalysis,
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
      PH: null,
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
    allMannerOutputs,
    managementPeriod,
    cropData,
    transactionalManager,
    defoliations,
  ) {
    const { defoliationId, defoliationIds, latestSoilAnalysis } = defoliations;
    const countryId = await this.getCountryIdForCrop(
      transactionalManager,
      cropData.ID,
    );
    const soilAnalysisFlags = this.getSoilAnalysisFlags(latestSoilAnalysis);
    const mannerOutputs = this.getMannerOutputsForDefoliation(allMannerOutputs,defoliationId);
    const fallbackManureN = await this.getFallbackManureNValues(mannerOutputs,defoliationIds,defoliationId,transactionalManager,managementPeriod,cropData);
    const nutrientHandlers = this.createNutrientHandlers(cropRecData,countryId,latestSoilAnalysis,soilAnalysisFlags,mannerOutputs,fallbackManureN);
    this.applyCalculationsWithHandlers(calculations, nutrientHandlers);
  }

  async getCountryIdForCrop(transactionalManager, cropId) {
    const record = await transactionalManager.findOne(CropEntity, {
      where: { ID: cropId },
      relations: { Field: { Farm: true } },
    });
    return record?.Field?.Farm?.CountryID;
  }

  getSoilAnalysisFlags(latestSoilAnalysis) {
    const hasNitrogenSoilAnalysisInput = latestSoilAnalysis?.SoilNitrogenSupplyIndex != null;
    const hasPhosphorusSoilAnalysisInput = latestSoilAnalysis?.PhosphorusIndex != null;
    const hasPotassiumSoilAnalysisInput = latestSoilAnalysis?.PotassiumIndex != null;
    const hasMagnesiumSoilAnalysisInput =latestSoilAnalysis?.MagnesiumIndex != null;
    return {hasNitrogenSoilAnalysisInput,hasPhosphorusSoilAnalysisInput,hasPotassiumSoilAnalysisInput,hasMagnesiumSoilAnalysisInput,
      hasAnySoilAnalysisNutrientInput:
        hasNitrogenSoilAnalysisInput ||
        hasPhosphorusSoilAnalysisInput ||
        hasPotassiumSoilAnalysisInput ||
        hasMagnesiumSoilAnalysisInput
    };
  }

  getMannerOutputsForDefoliation(allMannerOutputs, defoliationId) {
    return (allMannerOutputs ?? []).filter((item) => item.defoliationId === defoliationId);
  }

  async getFallbackManureNValues(mannerOutputs,defoliationIds,defoliationId,transactionalManager,managementPeriod,cropData) {
    let availableNForNextDefoliation = null;
    let nextCropAvailableN = null;
    if (!mannerOutputs.length) {
      if (defoliationIds.length > 1) {
        availableNForNextDefoliation =await this.CalculateNextDefoliationService.calculateAvailableNForNextDefoliation(
            transactionalManager,
            managementPeriod,
            cropData,
          );
      }
      if (defoliationId === 1) {
        nextCropAvailableN =await this.CalculateTotalAvailableNForPreviousYear.calculateAvailableNForPreviousYear(
            cropData.FieldID,
            cropData.Year,
            transactionalManager,
          );
      }
    }
    return { availableNForNextDefoliation, nextCropAvailableN };
  }

  createNutrientHandlers(
    cropRecData,
    countryId,
    latestSoilAnalysis,
    soilAnalysisFlags,
    mannerOutputs,
    fallbackManureN,
  ) {
    return {
      0: (c) =>
        this.applyNitrogenCalculation(
          c,
          cropRecData,
          mannerOutputs,
          fallbackManureN,
        ),
      1: (c) =>
        this.applyPhosphorusCalculation(
          c,
          cropRecData,
          soilAnalysisFlags,
          countryId,
          latestSoilAnalysis,
        ),
      2: (c) =>
        this.applyPotassiumCalculation(
          c,
          cropRecData,
          soilAnalysisFlags,
          countryId,
          latestSoilAnalysis,
        ),
      3: (c) =>
        this.applyMagnesiumCalculation(
          c,
          cropRecData,
          soilAnalysisFlags,
          countryId,
          latestSoilAnalysis,
        ),
      4: (c) => this.applySodiumCalculation(c, cropRecData, soilAnalysisFlags),
      5: (c) => this.applySulphurCalculation(c, cropRecData, soilAnalysisFlags),
      6: (c) => this.applyLimeCalculation(c, cropRecData),
    };
  }

  applyNitrogenCalculation(c, cropRecData, mannerOutputs, fallbackManureN) {
    const { availableNForNextDefoliation, nextCropAvailableN } =
      fallbackManureN;
    cropRecData.CropN = c.recommendation;
    cropRecData.FertilizerN = c.cropNeed;
    cropRecData.ManureN = c.manures;
    if (!mannerOutputs.length){cropRecData.ManureN =(availableNForNextDefoliation || 0) + (nextCropAvailableN || 0)};
    cropRecData.NBalance = c.pkBalance;
    cropRecData.NIndex = c.index;
  }

  applyPhosphorusCalculation(c,cropRecData,soilAnalysisFlags,countryId,latestSoilAnalysis) {
    cropRecData.CropP2O5 = c.recommendation;
    cropRecData.ManureP2O5 = this.normalizeManure(c.manures);
    cropRecData.PBalance = c.pkBalance;
    cropRecData.FertilizerP2O5 = c.cropNeed;
    cropRecData.PIndex = this.resolveIndexedNutrientValue(soilAnalysisFlags.hasPhosphorusSoilAnalysisInput,countryId,latestSoilAnalysis?.PhosphorusMethodologyID,c);
  }

  applyPotassiumCalculation(c,cropRecData,soilAnalysisFlags,countryId,latestSoilAnalysis) {
    cropRecData.CropK2O = c.recommendation;
    cropRecData.ManureK2O = this.normalizeManure(c.manures);
    cropRecData.KBalance = c.pkBalance;
    cropRecData.FertilizerK2O = c.cropNeed;
    cropRecData.KIndex = this.resolveIndexedNutrientValue(soilAnalysisFlags.hasPotassiumSoilAnalysisInput,countryId,latestSoilAnalysis?.PotassiumMethodologyID,c);
  }
  applyMagnesiumCalculation(
    c,
    cropRecData,
    soilAnalysisFlags,
    countryId,
    latestSoilAnalysis,
  ) {
    cropRecData.CropMgO = c.recommendation;
    cropRecData.MgBalance = c.pkBalance;
    cropRecData.FertilizerMgO = c.cropNeed;
    cropRecData.MgIndex = this.resolveIndexedNutrientValue(
      soilAnalysisFlags.hasMagnesiumSoilAnalysisInput,
      countryId,
      latestSoilAnalysis?.MagnesiumMethodologyID,
      c,
    );
  }

  applySodiumCalculation(c, cropRecData, soilAnalysisFlags) {
    cropRecData.CropNa2O = c.recommendation;
    cropRecData.NaBalance = c.pkBalance;
    cropRecData.FertilizerNa2O = c.cropNeed;
    cropRecData.NaIndex = soilAnalysisFlags.hasAnySoilAnalysisNutrientInput
      ? c.index
      : null;
  }

  applySulphurCalculation(c, cropRecData, soilAnalysisFlags) {
    cropRecData.CropSO3 = c.recommendation;
    cropRecData.ManureSO3 = this.normalizeManure(c.manures);
    cropRecData.SBalance = c.pkBalance;
    cropRecData.FertilizerSO3 = c.cropNeed;
    cropRecData.SIndex = soilAnalysisFlags.hasAnySoilAnalysisNutrientInput
      ? c.index
      : null;
  }

  applyLimeCalculation(c, cropRecData) {
    cropRecData.CropLime = c.recommendation;
    cropRecData.LimeBalance = c.pkBalance;
    cropRecData.FertilizerLime = c.cropNeed;
    cropRecData.PH = c?.soilpH != null ? c.soilpH.toString() : null;
  }

  normalizeManure(value) {
    return value === 0 ? null : value;
  }

  resolveIndexedNutrientValue(
    hasSoilAnalysisInput,
    countryId,
    methodologyId,
    calc,
  ) {
    if (!hasSoilAnalysisInput) {return null};
    const isScotlandSacMethodology =
      countryId === CountryMapper.SCOTLAND && methodologyId === 2;
    return isScotlandSacMethodology ? calc.indexText : calc.index;
  }

  applyCalculationsWithHandlers(calculations, nutrientHandlers) {
    for (const calc of calculations) {
      const handler = nutrientHandlers[calc.nutrientId];
      if (handler) {handler(calc)};
    }
  }

  async getManagementPeriod(transactionalManager, cropID, defoliationId) {
    const record = await transactionalManager.findOne(ManagementPeriodEntity, {
      where: { CropID: cropID, Defoliation: defoliationId },
    });
    return record ?? null;
  }

  async saveOrUpdateRecommendation(transactionalManager,managementPeriod,cropRecData,filteredData,userId,latestSoilAnalysis) {
    const existing = await transactionalManager.findOne(RecommendationEntity, {
      where: { ManagementPeriodID: managementPeriod.ID },
    });
    const baseData = {
      ...cropRecData,
      Comments: `Reference Value: ${filteredData.referenceValue}\nVersion: ${filteredData.versionNumber}`,
      IsSacMethodology: latestSoilAnalysis?.PotassiumMethodologyID === 2,
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
    userId,
  ) {
    const cropNotes = await this.getCropNotes(savedCrop,transactionalManager,nutrientRecommendationsData);
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
    if (!hasDefoliation){
      return adviceNotes.filter((note) => note.sequenceId === savedCrop.CropOrder);
    }
    const managementPeriod = await transactionalManager.findOne(
      ManagementPeriodEntity,
      { where: { ID: savedCrop.ManagementPeriodID } },
    );
    if (!managementPeriod) {return []};
    return adviceNotes.filter(
      (note) =>
        note.defoliationId === managementPeriod.Defoliation &&
        note.sequenceId === savedCrop.CropOrder,
    );
  }

  groupNotesByNutrientId(notes) {
    return notes.reduce((acc, note) => {
      const nutrientId = note.nutrientId;
      if (!acc[nutrientId]){acc[nutrientId] = []};
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
      { where: { RecommendationID: savedCrop?.ID } },
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
            RecommendationID: savedCrop?.ID,
            CreatedOn: new Date(),
            CreatedByID: userId,
          }),
        );
      }
    }
    const toDelete = existingComments.filter(
      (c) => !processedNutrients.includes(c.Nutrient),
    );
    if (toDelete.length){await transactionalManager.remove(RecommendationCommentEntity, toDelete)};
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
    const recommendationsToSave = this.resolveRecommendationsToSave(
      cropData,
      savedRecommendations,
      context.hasDefoliationNotes,
    );
    if (!recommendationsToSave.length) {return []};
    const recomendationsAndComments = [];
    for (const recommendation of recommendationsToSave) {
      if (!recommendation) {continue};
      const recommendationsNotes = await this.saveMultipleRecommendation(
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
    const recommendations = [],
      finalRecommendations = [];
    if (!dataMultipleCrops?.length) {return recommendations};
    if (!Array.isArray(nutrientRecommendationsData?.calculations)) {return finalRecommendations};
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
    if (!savedRecommendations?.length) {return []};
    const isGrass = this.isGrassCrop(cropData);
    if (isGrass && hasDefoliationNotes) {return savedRecommendations};
    return [savedRecommendations[0]];
  }
}

module.exports = { SavingRecommendationService };
