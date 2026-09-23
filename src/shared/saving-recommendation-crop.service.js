const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const { CountryMapper } = require("../constants/country-mapper");

const cropRecommendationMethods = {
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
  },

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
        { transactionalManager, userId },
        mannerOutputs,
        defoliationIds,
      );

      if (recommendation) {
        results.push(recommendation);
      }
    }

    return results;
  },

  getUniqueDefoliationIds(calculations) {
    return [...new Set(calculations.map((c) => c.defoliationId))];
  },

  async extractNutrientData(calculations, defoliationId) {
    return calculations?.filter((c) => c.defoliationId === defoliationId);
  },

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
      { defoliationId, defoliationIds, latestSoilAnalysis },
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
      latestSoilAnalysis,
    );
  },

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
  },

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
    const mannerOutputs = this.getMannerOutputsForDefoliation(
      allMannerOutputs,
      defoliationId,
    );
    const fallbackManureN = await this.getFallbackManureNValues(
      mannerOutputs,
      defoliationIds,
      defoliationId,
      transactionalManager,
      managementPeriod,
      cropData,
    );

    const nutrientHandlers = this.createNutrientHandlers(
      cropRecData,
      countryId,
      latestSoilAnalysis,
      soilAnalysisFlags,
      mannerOutputs,
      fallbackManureN,
    );

    this.applyCalculationsWithHandlers(calculations, nutrientHandlers);
  },

  async getCountryIdForCrop(transactionalManager, cropId) {
    const record = await transactionalManager.findOne(CropEntity, {
      where: { ID: cropId },
      relations: { Field: { Farm: true } },
    });

    return record?.Field?.Farm?.CountryID;
  },

  getSoilAnalysisFlags(latestSoilAnalysis) {
    const hasNitrogenSoilAnalysisInput =
      latestSoilAnalysis?.SoilNitrogenSupplyIndex != null;
    const hasPhosphorusSoilAnalysisInput =
      latestSoilAnalysis?.PhosphorusIndex != null;
    const hasPotassiumSoilAnalysisInput =
      latestSoilAnalysis?.PotassiumIndex != null;
    const hasMagnesiumSoilAnalysisInput =
      latestSoilAnalysis?.MagnesiumIndex != null;
    const hasPhSoilAnalysisInput = latestSoilAnalysis?.PH != null;

    return {
      hasNitrogenSoilAnalysisInput,
      hasPhosphorusSoilAnalysisInput,
      hasPotassiumSoilAnalysisInput,
      hasMagnesiumSoilAnalysisInput,
      hasPhSoilAnalysisInput,
      hasAnySoilAnalysisNutrientInput:
        hasNitrogenSoilAnalysisInput ||
        hasPhosphorusSoilAnalysisInput ||
        hasPotassiumSoilAnalysisInput ||
        hasMagnesiumSoilAnalysisInput,
    };
  },

  getMannerOutputsForDefoliation(allMannerOutputs, defoliationId) {
    return (allMannerOutputs ?? []).filter(
      (item) => item.defoliationId === defoliationId,
    );
  },

  async getFallbackManureNValues(
    mannerOutputs,
    defoliationIds,
    defoliationId,
    transactionalManager,
    managementPeriod,
    cropData,
  ) {
    let availableNForNextDefoliation = null;
    let nextCropAvailableN = null;

    if (!mannerOutputs.length) {
      if (defoliationIds.length > 1) {
        availableNForNextDefoliation =
          await this.CalculateNextDefoliationService.calculateAvailableNForNextDefoliation(
            transactionalManager,
            managementPeriod,
            cropData,
          );
      }

      if (defoliationId === 1) {
        nextCropAvailableN =
          await this.CalculateTotalAvailableNForPreviousYear.calculateAvailableNForPreviousYear(
            cropData.FieldID,
            cropData.Year,
            transactionalManager,
          );
      }
    }

    return { availableNForNextDefoliation, nextCropAvailableN };
  },

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
      6: (c) => this.applyLimeCalculation(c, cropRecData, soilAnalysisFlags),
    };
  },

  applyNitrogenCalculation(c, cropRecData, mannerOutputs, fallbackManureN) {
    const { availableNForNextDefoliation, nextCropAvailableN } =
      fallbackManureN;

    cropRecData.CropN = c.recommendation;
    cropRecData.FertilizerN = c.cropNeed;
    cropRecData.ManureN = c.manures;

    if (!mannerOutputs.length) {
      cropRecData.ManureN =
        (availableNForNextDefoliation || 0) + (nextCropAvailableN || 0);
    }

    cropRecData.NBalance = c.pkBalance;
    cropRecData.NIndex = c.index;
  },

  applyPhosphorusCalculation(
    c,
    cropRecData,
    soilAnalysisFlags,
    countryId,
    latestSoilAnalysis,
  ) {
    cropRecData.CropP2O5 = c.recommendation;
    cropRecData.ManureP2O5 = this.normalizeManure(c.manures);
    cropRecData.PBalance = c.pkBalance;
    cropRecData.FertilizerP2O5 = c.cropNeed;
    cropRecData.PIndex = this.resolveIndexedNutrientValue(
      soilAnalysisFlags.hasPhosphorusSoilAnalysisInput,
      countryId,
      latestSoilAnalysis?.PhosphorusMethodologyID,
      c,
    );
  },

  applyPotassiumCalculation(
    c,
    cropRecData,
    soilAnalysisFlags,
    countryId,
    latestSoilAnalysis,
  ) {
    cropRecData.CropK2O = c.recommendation;
    cropRecData.ManureK2O = this.normalizeManure(c.manures);
    cropRecData.KBalance = c.pkBalance;
    cropRecData.FertilizerK2O = c.cropNeed;
    cropRecData.KIndex = this.resolveIndexedNutrientValue(
      soilAnalysisFlags.hasPotassiumSoilAnalysisInput,
      countryId,
      latestSoilAnalysis?.PotassiumMethodologyID,
      c,
    );
  },

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
  },

  applySodiumCalculation(c, cropRecData, _soilAnalysisFlags) {
    cropRecData.CropNa2O = c.recommendation;
    cropRecData.NaBalance = c.pkBalance;
    cropRecData.FertilizerNa2O = c.cropNeed;
    cropRecData.NaIndex = null;
  },

  applySulphurCalculation(c, cropRecData, _soilAnalysisFlags) {
    cropRecData.CropSO3 = c.recommendation;
    cropRecData.ManureSO3 = this.normalizeManure(c.manures);
    cropRecData.SBalance = c.pkBalance;
    cropRecData.FertilizerSO3 = c.cropNeed;
    cropRecData.SIndex = null;
  },

  applyLimeCalculation(c, cropRecData, soilAnalysisFlags) {
    cropRecData.CropLime = c.recommendation;
    cropRecData.LimeBalance = c.pkBalance;
    cropRecData.FertilizerLime = c.cropNeed;
    cropRecData.PH =
      soilAnalysisFlags.hasPhSoilAnalysisInput && c?.soilpH != null
        ? c.soilpH.toString()
        : null;
  },

  normalizeManure(value) {
    return value === 0 ? null : value;
  },

  resolveIndexedNutrientValue(
    hasSoilAnalysisInput,
    countryId,
    methodologyId,
    calc,
  ) {
    if (!hasSoilAnalysisInput) {
      return null;
    }

    const isScotlandSacMethodology =
      countryId === CountryMapper.SCOTLAND && methodologyId === 2;

    return isScotlandSacMethodology ? calc.indexText : calc.index;
  },

  applyCalculationsWithHandlers(calculations, nutrientHandlers) {
    for (const calc of calculations) {
      const handler = nutrientHandlers[calc.nutrientId];
      if (handler) {
        handler(calc);
      }
    }
  },

  async getManagementPeriod(transactionalManager, cropID, defoliationId) {
    const record = await transactionalManager.findOne(ManagementPeriodEntity, {
      where: { CropID: cropID, Defoliation: defoliationId },
    });

    return record ?? null;
  },

  async saveOrUpdateRecommendation(
    transactionalManager,
    managementPeriod,
    cropRecData,
    filteredData,
    userId,
    latestSoilAnalysis,
  ) {
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
  },
};

module.exports = { cropRecommendationMethods };
