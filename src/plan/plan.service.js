const { LessThanOrEqual, Between, In, Not } = require("typeorm");
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
const boom = require("@hapi/boom");
const { NutrientsMapper } = require("../constants/nutrient-mapper");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const {
  UpdateRecommendation,
} = require("../shared/updateRecommendation.service");
const RB209SoilService = require("../vendors/rb209/soil/soil.service");
const RB209FieldService = require("../vendors/rb209/field/field.service");
const { CountryEntity } = require("../db/entity/country.entity");
const { NutrientMapperNames } = require("../constants/nutrient-mapper-names");
const {
  ExcessRainfallsEntity,
} = require("../db/entity/excess-rainfalls.entity");
const {
  GrassGrowthService,
} = require("../grass-growth-plan/grass-growth-plan.service");
const {
  UpdateRecommendationChanges,
} = require("../shared/updateRecommendationsChanges");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const {
  PreviousGrassIdMappingEntity,
} = require("../db/entity/previous-grass-Id-mapping.entity");
const {
  PreviousGrassesEntity,
} = require("../db/entity/previous-grasses-entity");
const {
  CropGroupCategoriesEntity,
} = require("../db/entity/crop-group-categories.entity");
const {
  GrassHistoryIdMappingEntity,
} = require("../db/entity/grass-history-id-mapping-entity");
const {
  SoilGroupCategoriesEntity,
} = require("../db/entity/soil-group-categories-entity");
const {
  CalculateGrassHistoryAndPreviousGrass,
} = require("../shared/calculate-previous-grass-id.service");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { FieldTypeMapper } = require("../constants/field-type-mapper");
const { CropOrderMapper } = require("../constants/crop-order-mapper");
const {
  CalculateNextDefoliationService,
} = require("../shared/calculate-next-defoliation-totalN");
const {
  CalculateTotalAvailableNForNextYear,
} = require("../shared/calculate-next-year-available-n");
const {
  CalculateMannerOutputService,
} = require("../shared/calculate-manner-output-service");
const { CalculateCropsSnsAnalysisService } = require("../shared/calculate-crops-sns-analysis-service");
const { CropTypeLinkingEntity } = require("../db/entity/crop-type-linking.entity");
const { CalculatePKBalanceOther } = require("../shared/calculate-pk-balance-other");
const { PreviousCroppingEntity } = require("../db/entity/previous-cropping.entity");
const { CalculatePreviousCropService } = require("../shared/previous-year-crop-service");
const { FieldAboveOrBelowSeaLevelMapper } = require("../constants/field-is-above-sea-level");
const { StaticStrings } = require("../shared/static.string");
const { GenerateRecommendations } = require("../shared/generate-recomendations-service");
const { UpdatingFutureRecommendations } = require("../shared/updating-future-recommendations-service");
const { CurrentAndFuture } = require("../shared/generate-current-and-future-recommendations-service");

class PlanService extends BaseService {
  constructor() {
    super(RecommendationEntity);
    this.repository = AppDataSource.getRepository(RecommendationEntity);
    this.managementPeriodRepository = AppDataSource.getRepository(
      ManagementPeriodEntity
    );
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.fieldRepository = AppDataSource.getRepository(FieldEntity);
    this.farmRepository = AppDataSource.getRepository(FarmEntity);
    this.recommendationCommentRepository = AppDataSource.getRepository(
      RecommendationCommentEntity
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
      FertiliserManuresEntity
    );
    this.countryRepository = AppDataSource.getRepository(CountryEntity);
    this.UpdateRecommendation = new UpdateRecommendation();
    this.UpdateRecommendationsChanges = new UpdateRecommendationChanges();
    this.excessRainfallRepository = AppDataSource.getRepository(
      ExcessRainfallsEntity
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
      })
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
        })
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
    transactionalManager
  ) {
    let savedPlan;
    // ✅ If a global transaction manager is provided, use it.
    if (transactionalManager) {
      savedPlan = await this.createNutrientsRecommendationWithinTransaction(
        crops,
        userId,
        request,
        transactionalManager
      );
      return savedPlan;
    }

    // ✅ Otherwise, start a new local transaction.
    return await AppDataSource.transaction(async (localManager) => {
      savedPlan = await this.createNutrientsRecommendationWithinTransaction(
        crops,
        userId,
        request,
        localManager
      );
      return savedPlan;
    });
  }

  async createNutrientsRecommendationWithinTransaction(
    crops,
    userId,
    request,
    transactionalManager
  ) {
    let Recommendations = [];
    const Errors = [];
    for (const cropData of crops) {
      const crop = cropData?.Crop;
      const errors = this.handleCropValidation(crop);
      Errors.push(...errors);
      const fieldId = crop.FieldID;
      const { field, errors: fieldErrors } = await this.handleFieldValidation(
        fieldId
      );
      Errors.push(...fieldErrors);
      if (Errors.length > 0) {
        throw new Error(JSON.stringify(Errors));
      }
    
      const previousCrop =
        await this.CalculatePreviousCropService.findPreviousCrop(
          field.ID,
          crop.Year,
          transactionalManager
        );
       const organicManure = null;
      if (crop.CropTypeID === CropTypeMapper.OTHER || !previousCrop) {
        await this.savedDefault(cropData, userId, transactionalManager);
        await this.currentAndFuture.regenerateCurrentAndFutureRecommendations(
          crop,
          transactionalManager,
          request,
          userId
        );
        Recommendations.push({
          message: "Default crop saved",
          crop: crop.FieldID,
        });
      } else {
        const savedCrop = await transactionalManager.save(
          CropEntity,
          this.cropRepository.create({
            ...crop,
            CreatedByID: userId,
            CreatedOn: new Date(),
          })
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
            })
          );
          ManagementPeriods.push(savedManagementPeriod);
        }
    
      const savedRecommendation = await this.generateRecommendations.generateRecommendations(
        field.ID,
        crop.Year,
        organicManure,
        transactionalManager,
        request,
        userId
      );
       
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
        Recommendations.push({
          message: "crop saved",
          crop: crop.FieldID, // Include additional crop-related info
          Recommendations: savedRecommendation,
          ManagementPeriods: ManagementPeriods
        });
      }
    }

    return {
      Recommendations
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
        error
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
      const cropTypesList = await this.rB209ArableService.getData(
        "/Arable/CropTypes"
      );

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
        error
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
        error
      );
      throw error;
    }
  }
  async getCropsPlansManagementPeriodIds(
    fieldIds,
    harvestYear,
    cropGroupName,
    cropOrder
  ) {
    try {
      //cropOrder = cropOrder || 1;
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
        error
      );
      throw error;
    }
  }

  async createOrUpdatePKBalance(
    fieldId,
    crop,
    calculations,
    pkBalanceData,
    userId,
    latestSoilAnalysis,
    cropPOfftake,
    transactionalManager,
    previousCrop
  ) {
    let fertiliserData = null;
    try {
      let pBalance = 0;
      let kBalance = 0;
      let saveAndUpdatePKBalance;
      if (crop.CropTypeID === CropTypeMapper.OTHER || crop.CropInfo1 === null) {
        const otherPKBalance =
          await this.CalculatePKBalanceOther.calculatePKBalanceOther(
            crop,
            latestSoilAnalysis,
            transactionalManager
          );

        pBalance = otherPKBalance.pBalance;
        kBalance = otherPKBalance.kBalance;
      } else if (crop.IsBasePlan || !previousCrop) {
        if (pkBalanceData) {
          pBalance =
            (fertiliserData == null ? 0 : fertiliserData?.p205) -
            (0 - (pkBalanceData == null ? 0 : pkBalanceData?.PBalance));
          kBalance =
            (fertiliserData == null ? 0 : fertiliserData?.k20) -
            (0 - (pkBalanceData == null ? 0 : pkBalanceData.KBalance));
        } else {
          pBalance = fertiliserData == null ? 0 : fertiliserData?.p205;
          kBalance = fertiliserData == null ? 0 : fertiliserData?.k20;
        }
      } else {
        for (const recommendation of calculations) {
          switch (recommendation.nutrientId) {
            case 1:
              pBalance = pBalance - recommendation.recommendation - cropPOfftake + recommendation.manures+ recommendation.pkBalance;
              break;
            case 2: kBalance = kBalance - recommendation.recommendation + recommendation.manures + recommendation.pkBalance;
              break;
          }
        }
      }

      if (Object.keys(latestSoilAnalysis).length > 0) {
        if (latestSoilAnalysis.PotassiumIndex == null) {
          kBalance = 0;
        }

        if (latestSoilAnalysis.PhosphorusIndex == null) {
          pBalance = 0;
        }
      } else {
        pBalance = 0;
        kBalance = 0;
      }
      if (pkBalanceData) {
        const updateData = {
          Year: crop?.Year,
          FieldID: fieldId,
          PBalance: pBalance,
          KBalance: kBalance,
        };
        saveAndUpdatePKBalance = {
          ...pkBalanceData,
          ...updateData,
          ModifiedOn: new Date(),
          ModifiedByID: userId,
        };
      } else {
        saveAndUpdatePKBalance = {
          Year: crop?.Year,
          FieldID: fieldId,
          PBalance: pBalance,
          KBalance: kBalance,
          CreatedOn: new Date(),
          CreatedByID: userId,
        };
      }
      return { saveAndUpdatePKBalance };
    } catch (error) {
      console.error("Error while saving pkBalance data", error);
      throw error;
    }
  }
}

module.exports = PlanService;
