const { MoreThan } = require("typeorm");
const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");
const RB209ArableService = require("../vendors/rb209/arable/arable.service");
const {
  RB209RecommendationService,
} = require("../vendors/rb209/recommendation/recommendation.service");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const {
  RecommendationCommentEntity,
} = require("../db/entity/recommendation-comment.entity");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const RB209SoilService = require("../vendors/rb209/soil/soil.service");
const RB209FieldService = require("../vendors/rb209/field/field.service");
const { CountryEntity } = require("../db/entity/country.entity");
const {
  ExcessRainfallsEntity,
} = require("../db/entity/excess-rainfalls.entity");
const {
  GrassGrowthService,
} = require("../grass-growth-plan/grass-growth-plan.service");
const {
  CalculateGrassHistoryAndPreviousGrass,
} = require("../shared/calculate-previous-grass-id.service");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const {
  CalculateNextDefoliationService,
} = require("../shared/calculate-next-defoliation-totalN");
const {
  CalculateTotalAvailableNForNextYear,
} = require("../shared/calculate-next-year-available-n");
const {
  CalculateMannerOutputService,
} = require("../shared/calculate-manner-output-service");
const {
  CalculateCropsSnsAnalysisService,
} = require("../shared/calculate-crops-sns-analysis-service");
const {
  CalculatePKBalanceOther,
} = require("../shared/calculate-pk-balance-other");
const {
  CalculatePreviousCropService,
} = require("../shared/previous-year-crop-service");
const {
  GenerateRecommendations,
} = require("../shared/generate-recomendations-service");
const {
  UpdatingFutureRecommendations,
} = require("../shared/updating-future-recommendations-service");
const {
  CurrentAndFuture,
} = require("../shared/generate-current-and-future-recommendations-service");

class PlanService extends BaseService {
  constructor() {
    super(RecommendationEntity);
    this.repository = AppDataSource.getRepository(RecommendationEntity);
    this.managementPeriodRepository = AppDataSource.getRepository(
      ManagementPeriodEntity,
    );
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.fieldRepository = AppDataSource.getRepository(FieldEntity);
    this.farmRepository = AppDataSource.getRepository(FarmEntity);
    this.recommendationCommentRepository = AppDataSource.getRepository(
      RecommendationCommentEntity,
    );
    this.soilAnalysisRepository =
      AppDataSource.getRepository(SoilAnalysisEntity);
    this.rB209ArableService = new RB209ArableService();
    this.rB209RecommendationService = new RB209RecommendationService();
    this.RB209SoilService = new RB209SoilService();
    this.RB209FieldService = new RB209FieldService();
    this.snsAnalysisRepository = AppDataSource.getRepository(SnsAnalysesEntity);
    this.pkBalanceRepository = AppDataSource.getRepository(PKBalanceEntity);
    this.fertiliserRepository = AppDataSource.getRepository(
      FertiliserManuresEntity,
    );
    this.countryRepository = AppDataSource.getRepository(CountryEntity);
    this.excessRainfallRepository = AppDataSource.getRepository(
      ExcessRainfallsEntity,
    );
    this.grassGrowthClass = new GrassGrowthService();
    this.calculateGrassId = new CalculateGrassHistoryAndPreviousGrass();
    this.CalculateNextDefoliationService =
      new CalculateNextDefoliationService();
    this.CalculateTotalAvailableNForPreviousYear =
      new CalculateTotalAvailableNForNextYear();
    this.CalculateMannerOutput = new CalculateMannerOutputService();
    this.CalculateCropsSnsAnalysis = new CalculateCropsSnsAnalysisService();
    this.CalculatePKBalanceOther = new CalculatePKBalanceOther();
    this.CalculatePreviousCropService = new CalculatePreviousCropService();
    this.generateRecommendations = new GenerateRecommendations();
    this.updatingFutureRecommendations = new UpdatingFutureRecommendations();
    this.currentAndFuture = new CurrentAndFuture();
  }

  async getManagementPeriods(id) {
    const data = await this.managementPeriodRepository.findOne({
      where: {
        CropID: id,
      },
    });

    return data;
  }

  async handleFieldValidation(fieldId) {
    const errors = [];

    const field = await this.fieldRepository.findOneBy({
      ID: fieldId,
    });

    if (!field) {
      errors.push(`Please add field data for fieldId ${fieldId}`);
    }

    if (field.SoilTypeID === null) {
      errors.push(`SoilTypeID is required in field ${field.Name}`);
    }
    return { field, errors };
  }

  async handleFarmValidation(farmId) {
    const errors = [];

    const farm = await this.farmRepository.findOneBy({
      ID: farmId,
    });

    if (!farm) {
      errors.push(`Please add farm data data for farmId ${farmId}`);
    }

    const farmRequiredKeys = [
      "TotalFarmArea",
      "Postcode",
      "Rainfall",
      "EnglishRules",
      "CountryID",
    ];
    farmRequiredKeys.forEach((key) => {
      if (farm[key] === null) {
        errors.push(`${key} is required in farm ${farm.Name}`);
      }
    });
    return { farm, errors };
  }

  handleCropValidation(crop) {
    const errors = [];

    if (!crop) {
      errors.push("Crop is required");
    }

    if (crop.Year === null) {
      errors.push("Year is required in crop");
    }
    if (crop.CropTypeID === null) {
      errors.push("CropTypeId is required in crop");
    }

    if (crop.FieldID === null) {
      errors.push("FieldID is required in crop");
    }

    return errors;
  }

  async savedDefault(cropData, userId, transactionalManager) {
    const ManagementPeriods = [];

    // Save the Crop first (assumed as savedCrop)
    const savedCrop = await transactionalManager.save(
      CropEntity,
      this.cropRepository.create({
        ...cropData.Crop,
        FieldID: cropData.Crop.FieldID, // assuming cropData contains Crop object
        CreatedByID: userId,
        CreatedOn: new Date(),
      }),
    );

    // Iterate over the cropData ManagementPeriods and save them using the transactionalManager
    for (const managementPeriod of cropData.ManagementPeriods) {
      const savedManagementPeriod = await transactionalManager.save(
        ManagementPeriodEntity,
        this.managementPeriodRepository.create({
          ...managementPeriod,
          CropID: savedCrop.ID,
          CreatedByID: userId,
          CreatedOn: new Date(),
        }),
      );
      ManagementPeriods.push(savedManagementPeriod);
    }

    // Return the transaction result with the saved crop and management periods
    return {
      Crop: savedCrop,
      ManagementPeriods,
    };
  }

  async getCropForYear(fieldId, targetYear, transactionalManager) {
    let crop = await transactionalManager.findOne(CropEntity, {
      where: { FieldID: fieldId, Year: targetYear, CropOrder: 2 },
    });
    if (!crop) {
      crop = await transactionalManager.findOne(CropEntity, {
        where: { FieldID: fieldId, Year: targetYear, CropOrder: 1 },
      });
    }
    return crop;
  }

  async createNutrientsRecommendationForField(
    crops,
    userId,
    request,
    transactionalManager,
  ) {
    let savedPlan;
    // ✅ If a global transaction manager is provided, use it.
    if (transactionalManager) {
      savedPlan = await this.createNutrientsRecommendationWithinTransaction(
        crops,
        userId,
        request,
        transactionalManager,
      );
      return savedPlan;
    }

    // ✅ Otherwise, start a new local transaction.
    return AppDataSource.transaction(async (localManager) => {
      savedPlan = await this.createNutrientsRecommendationWithinTransaction(
        crops,
        userId,
        request,
        localManager,
      );
      return savedPlan;
    });
  }

  async validateCropAndField(crop, Errors) {
    const errors = this.handleCropValidation(crop);
    Errors.push(...errors);

    const fieldId = crop.FieldID;
    const { field, errors: fieldErrors } =
      await this.handleFieldValidation(fieldId);
    Errors.push(...fieldErrors);

    if (Errors.length > 0) {
      throw new Error(JSON.stringify(Errors));
    }

    return field;
  }

  async saveDefaultCropPlan(
    cropData,
    crop,
    userId,
    request,
    transactionalManager,
  ) {
    await this.savedDefault(cropData, userId, transactionalManager);
    await this.currentAndFuture.regenerateCurrentAndFutureRecommendations(
      crop,
      transactionalManager,
      request,
      userId,
    );

    return {
      message: "Default crop saved",
      crop: crop.FieldID,
    };
  }

  async saveCropAndManagementPeriods(
    cropData,
    crop,
    userId,
    transactionalManager,
  ) {
    const savedCrop = await transactionalManager.save(
      CropEntity,
      this.cropRepository.create({
        ...crop,
        CreatedByID: userId,
        CreatedOn: new Date(),
      }),
    );

    const ManagementPeriods = [];
    for (const managementPeriod of cropData.ManagementPeriods) {
      const savedManagementPeriod = await transactionalManager.save(
        ManagementPeriodEntity,
        this.managementPeriodRepository.create({
          ...managementPeriod,
          CropID: savedCrop.ID,
          CreatedByID: userId,
          CreatedOn: new Date(),
        }),
      );
      ManagementPeriods.push(savedManagementPeriod);
    }

    return ManagementPeriods;
  }

  async updateNextCropRecommendations(crop, request, userId) {
    const nextAvailableCrop = await this.cropRepository.findOne({
      where: {
        FieldID: crop.FieldID,
        Year: MoreThan(crop.Year),
      },
      order: { Year: "ASC" },
    });

    if (nextAvailableCrop) {
      this.updatingFutureRecommendations.updateRecommendationsForField(
        crop.FieldID,
        nextAvailableCrop.Year,
        request,
        userId,
      );
    }
  }

  async saveCropPlanWithRecommendations(
    cropData,
    crop,
    field,
    userId,
    request,
    transactionalManager,
  ) {
    const organicManure = null;
    const ManagementPeriods = await this.saveCropAndManagementPeriods(
      cropData,
      crop,
      userId,
      transactionalManager,
    );

    const savedRecommendation =
      await this.generateRecommendations.generateRecommendations(
        field.ID,
        crop.Year,
        organicManure,
        transactionalManager,
        request,
        userId,
      );

    await this.updateNextCropRecommendations(crop, request, userId);

    return {
      message: "crop saved",
      crop: crop.FieldID,
      Recommendations: savedRecommendation,
      ManagementPeriods: ManagementPeriods,
    };
  }

  async createNutrientsRecommendationWithinTransaction(
    crops,
    userId,
    request,
    transactionalManager,
  ) {
    const Recommendations = [];
    const Errors = [];
    for (const cropData of crops) {
      const crop = cropData?.Crop;
      const field = await this.validateCropAndField(crop, Errors);

      const previousCrop =
        await this.CalculatePreviousCropService.findPreviousCrop(
          field.ID,
          crop.Year,
          transactionalManager,
        );

      if (crop.CropTypeID === CropTypeMapper.OTHER || !previousCrop) {
        const savedDefaultCrop = await this.saveDefaultCropPlan(
          cropData,
          crop,
          userId,
          request,
          transactionalManager,
        );
        Recommendations.push(savedDefaultCrop);
      } else {
        const savedCropPlan = await this.saveCropPlanWithRecommendations(
          cropData,
          crop,
          field,
          userId,
          request,
          transactionalManager,
        );
        Recommendations.push(savedCropPlan);
      }
    }

    return {
      Recommendations,
    };
  }

  async getCropsPlanFields(farmId, harvestYear, cropGroupName) {
    try {
      const storedProcedure =
        "EXEC dbo.spCrops_GetCropPlansFieldsByHarvestYear @farmId = @0, @harvestYear = @1, @cropGroupName = @2";
      const plans = await AppDataSource.query(storedProcedure, [
        farmId,
        harvestYear,
        cropGroupName,
      ]);
      return plans;
    } catch (error) {
      console.error(
        "Error while fetching crop plans fields join data using farmId, harvest year and cropGroupName:",
        error,
      );
      throw error;
    }
  }

  async getPlans(farmId, confirm) {
    try {
      const storedProcedure =
        "EXEC dbo.spCrops_GetPlans @farmId = @0, @confirm = @1";
      const farms = await AppDataSource.query(storedProcedure, [
        farmId,
        confirm,
      ]);
      return farms;
    } catch (error) {
      console.error("Error while fetching join data:", error);
      throw error;
    }
  }
  async mapCropTypeIdWithTheirNames(plans) {
    try {
      const unorderedMap = {};
      const cropTypesList = await this.rB209ArableService.getCropTypesList();

      for (const cropType of cropTypesList) {
        unorderedMap[cropType.cropTypeId] = cropType.cropType;
      }

      for (const plan of plans) {
        plan.CropTypeName = unorderedMap[plan.CropTypeID] || null;
      }

      return plans;
    } catch (error) {
      console.error("Error mapping CropTypeId with their names:", error);
      throw error;
    }
  }

  async getPlansByHarvestYear(farmId, harvestYear) {
    try {
      const storedProcedure =
        "EXEC dbo.spCrops_GetPlansByHarvestYear @farmId = @0, @harvestYear = @1";
      const plans = await AppDataSource.query(storedProcedure, [
        farmId,
        harvestYear,
      ]);

      // Assuming mapCropTypeIdWithTheirNames is a method to map cropTypeId with their names
      return await this.mapCropTypeIdWithTheirNames(plans);
    } catch (error) {
      console.error(
        "Error while fetching plans data join data by farmId and harvest year:",
        error,
      );
      throw error;
    }
  }
  async getCropsPlansCropTypesByHarvestYear(farmId, harvestYear) {
    try {
      const storedProcedure =
        "EXEC dbo.spCrops_GetCropPlansCropTypesByHarvestYear @farmId = @0, @harvestYear = @1";
      const plans = await this.executeQuery(storedProcedure, [
        farmId,
        harvestYear,
      ]);

      return await this.mapCropTypeIdWithTheirNames(plans);
    } catch (error) {
      console.error(
        "Error while fetching crop plans croptypes join data by farmId and harvest year:",
        error,
      );
      throw error;
    }
  }
  async getCropsPlansManagementPeriodIds(
    fieldIds,
    harvestYear,
    cropGroupName,
    cropOrder,
  ) {
    try {
      const storedProcedure =
        "EXEC dbo.spCrops_GetCropPlansManagementPeriodByHarvestYear @fieldIds = @0, @harvestYear = @1, @cropGroupName = @2 , @cropOrder = @3";
      const plans = await this.executeQuery(storedProcedure, [
        fieldIds,
        harvestYear,
        cropGroupName,
        cropOrder,
      ]);
      return { ManagementPeriods: plans };
    } catch (error) {
      console.error(
        "Error while fetching crop plans management period ids using fieldIds,  harvest year and crop typeId:",
        error,
      );
      throw error;
    }
  }
}

module.exports = PlanService;
