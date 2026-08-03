const RB209ArableService = require("../vendors/rb209/arable/arable.service");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const {
  CalculatePreviousCropService,
} = require("./previous-year-crop-service");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { CalculatePKBalanceOther } = require("./calculate-pk-balance-other");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const {
  GrassGrowthService,
} = require("../grass-growth-plan/grass-growth-plan.service");
const {
  RB209RecommendationService,
} = require("../vendors/rb209/recommendation/recommendation.service");
const { AppDataSource } = require("../db/data-source");
const {
  SavingRecommendationService,
} = require("./saving-recommendation-service");
const { CalculatePKBalance } = require("./calculate-pk-balance-service");
const {
  TotalFertiliserByField,
} = require("./calculate-total-fertiliser-field-service");
const {
  SavingOtherCropRecommendations,
} = require("./saving-recommendations-other-crop-service");
const { FieldRelated } = require("./fetch-field-related-data-service");
const {
  HanldeMannerAndAnalysis,
} = require("./handle-manner-and-analysis-service");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  CalculateGrassHistoryAndPreviousGrass,
} = require("./calculate-previous-grass-id.service");
const {
  recommendationRequestHelpers,
} = require("./generate-recommendations-request-helpers");
const {
  recommendationOtherCropHelpers,
} = require("./generate-recommendations-other-crop-helpers");
const { logRecordLogs } = require("./yearly-log-service");
const { StatusCodeMapper } = require("../constants/http-status-codes-mapper");
const MannerRainfallPostApplicationService = require("../vendors/manner/rainfall-post-application/rainfall-post-application.service");

const RECOMMENDATION_LOG_ENDPOINT = "Recommendation/Recommendations";
const SERVICE_NAME = "generate-recomendations-service.js";

const buildRb209FailureError = (response, cropId) => {
  const error = new Error("RB209 recommendation request failed");
  error.statusCode = response?.status ?? StatusCodeMapper.INTERNAL_SERVER_ERROR;
  error.response = response;
  error.cropId = cropId;
  return error;
};

const buildRecommendationRequestFingerprint = (requestBody) => {
  if (!requestBody || typeof requestBody !== "object") {
    return "invalid-request-body";
  }

  const normalizedBody = {
    ...requestBody,
    referenceValue: "fingerprint",
  };

  return JSON.stringify(normalizedBody);
};

class GenerateRecommendations {
  constructor() {
    this.rB209ArableService = new RB209ArableService();
    this.rB209RecommendationService = new RB209RecommendationService();
    this.CalculatePreviousCropService = new CalculatePreviousCropService();
    this.organicManureRepository =
      AppDataSource.getRepository(OrganicManureEntity);
    this.CalculatePKBalanceOther = new CalculatePKBalanceOther();
    this.RecommendationRepository =
      AppDataSource.getRepository(RecommendationEntity);
    this.grassGrowthClass = new GrassGrowthService();
    this.calculateGrassId = new CalculateGrassHistoryAndPreviousGrass();
    this.savingRecommendationService = new SavingRecommendationService();
    this.CalculatePKBalance = new CalculatePKBalance();
    this.totalFertiliserByField = new TotalFertiliserByField();
    this.savingOtherCropRecommendations = new SavingOtherCropRecommendations();
    this.fieldRelated = new FieldRelated();
    this.HanldeMannerAndAnalysis = new HanldeMannerAndAnalysis();
    this.MannerRainfallPostApplicationService =
      new MannerRainfallPostApplicationService();
  }

  async getGenerateRecommendationsContext(fieldID, Year, transactionalManager) {
  
    const cropTypesList =
      await this.rB209ArableService.getData("/Arable/CropTypes");
    const fieldRelatedData = await this.fieldRelated.getFieldAndCountryData(
      fieldID,
      transactionalManager
    );
    const crops = await transactionalManager.find(CropEntity, {
      where: { FieldID: fieldID, Year: Year },
    });
    const fertiliserData =
      await this.totalFertiliserByField.getTotalFertiliserByFieldAndYear(
        transactionalManager,
        fieldID,
        Year,
      );
    return { cropTypesList, fieldRelatedData, crops, fertiliserData };
  }

  async processStandardCropRecommendation(cropContext) {
    const {
      crop,
      crops,
      soilAnalysisRecords,
      snsAnalysesData,
      mannerOutputs,
      latestSoilAnalysis,
      previousCrop,
      fieldRelatedData,
      request,
      transactionalManager,
      cropTypesList,
      fertiliserData,
      userId,
      cropPOfftake,
      recommendationApiResponseCache,
    } = cropContext;
    const analysis = { soilAnalysisRecords, snsAnalysesData };
    const singleAndMultipleCrops = { crops, crop };
    const nutrientRecommendationnReqBody =
      await this.buildNutrientRecommendationReqBody(
        fieldRelatedData,
        analysis,
        singleAndMultipleCrops,
        mannerOutputs,
        request,
        transactionalManager,
        cropTypesList,
      );
    let nutrientRecommendationsData;

    const requestFingerprint = buildRecommendationRequestFingerprint(
      nutrientRecommendationnReqBody,
    );

    let response = recommendationApiResponseCache.get(requestFingerprint);
    if (!response) {
      response = await this.rB209RecommendationService.postData(
        RECOMMENDATION_LOG_ENDPOINT,
        nutrientRecommendationnReqBody,
      );
      recommendationApiResponseCache.set(requestFingerprint, response);
    }

    const hasValidCalculations =
      Array.isArray(response?.data?.calculations) &&
      response.data.calculations.length > 0;

    if (response.status === StatusCodeMapper.SUCCESS && hasValidCalculations) {
      nutrientRecommendationsData = response.data;
      console.log(
        "RB209 recommendation API call successful. Received data:",
        nutrientRecommendationsData,
      );
    } else {
      console.error(
        "RB209 recommendation API call failed or returned invalid payload:",
        response.status,
        response.data,
        response.statusText,
      );

      const isClientOrPayloadError =
        response?.status === StatusCodeMapper.BAD_REQUEST ||
        response?.status === 413;

      if (isClientOrPayloadError) {
        throw buildRb209FailureError(response, crop.ID);
      }
    }

    const recommendation =
      await this.savingRecommendationService.processAndSaveRecommendations(
        crops,
        latestSoilAnalysis,
        nutrientRecommendationsData,
        transactionalManager,
        userId,
        mannerOutputs,
      );

    const saveAndUpdatePKBalance =
      await this.CalculatePKBalance.createOrUpdatePKBalance(
        crop,
        nutrientRecommendationsData,
        userId,
        fertiliserData,
        transactionalManager,
        { cropPOfftake, latestSoilAnalysis },
        previousCrop,
      );
    if (saveAndUpdatePKBalance) {
      await transactionalManager.save(
        PKBalanceEntity,
        saveAndUpdatePKBalance.saveAndUpdatePKBalance,
      );
    }

    return {
      cropId: crop.ID,
      recommendations: recommendation,
      pkBalance: saveAndUpdatePKBalance ?? null,
    };
  }

  async processCropRecommendation(cropContext) {
    const {
      crop,
      previousCrop,
      mannerOutputs,
      latestSoilAnalysis,
      newOrganicManure,
      transactionalManager,
      userId,
      fertiliserData
    } = cropContext;

    const cropPOfftake = await this.calculateCropPOfftake(
      latestSoilAnalysis,
      crop.CropTypeID,
      crop.Yield,
    );

    if (
      crop.CropTypeID === CropTypeMapper.OTHER ||
      crop?.IsBasePlan ||
      !previousCrop
    ) {
      const otherCropContext = {
        crop,
        previousCrop,
        mannerOutputs,
        latestSoilAnalysis,
        nutrientRecommendationsData: null,
        cropPOfftake,
      };
      const sharedContext = {
        transactionalManager,
        newOrganicManure,
        userId,
        fertiliserData,
      };
      return this.handleOtherCropRecommendation(
        otherCropContext,
        sharedContext,
      );
    }

    return this.processStandardCropRecommendation({
      ...cropContext,
      cropPOfftake,
    });
  }

  async generateRecommendations(
    fieldID,
    Year,
    newOrganicManure,
    transactionalManager,
    request,
    userId,
  ) {
    const { cropTypesList, fieldRelatedData, crops, fertiliserData } =
      await this.getGenerateRecommendationsContext(
        fieldID,
        Year,
        transactionalManager,
      );
      
    const results = [];
    const recommendationApiResponseCache = new Map();
     const rainfall = await this.MannerRainfallPostApplicationService.getData(
       `climates/rainfall-april-to-september/${fieldRelatedData.ClimateDataPostCode}`,
       request,
     );
     fieldRelatedData.summerRainfall = rainfall.data.value;
    for (const crop of crops) {
      const {
        snsAnalysesData,
        latestSoilAnalysis,
        soilAnalysisRecords,
        mannerOutputs,
        previousCrop,
      } = await this.HanldeMannerAndAnalysis.getCropPreCalculationData(
        crop,
        fieldID,
        fieldRelatedData,
        newOrganicManure,
        transactionalManager,
        request,
      );

      const result = await this.processCropRecommendation({
        crop,
        crops,
        snsAnalysesData,
        latestSoilAnalysis,
        soilAnalysisRecords,
        mannerOutputs,
        previousCrop,
        fieldRelatedData,
        request,
        transactionalManager,
        cropTypesList,
        newOrganicManure,
        userId,
        fertiliserData,
        recommendationApiResponseCache,
      });
      results.push(result);
    }

    return results;
  }
}

Object.assign(
  GenerateRecommendations.prototype,
  recommendationRequestHelpers,
  recommendationOtherCropHelpers,
);

module.exports = { GenerateRecommendations };
