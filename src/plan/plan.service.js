const { LessThanOrEqual, Between, In } = require("typeorm");
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
const { ExcessRainfallsEntity } = require("../db/entity/excess-rainfalls.entity");
const { GrassGrowthService } = require("../grass-growth-plan/grass-growth-plan.service");
const { UpdateRecommendationChanges } = require("../shared/updateRecommendationsChanges");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { PreviousGrassIdMappingEntity } = require("../db/entity/previous-grass-Id-mapping.entity");
const { PreviousGrassesEntity } = require("../db/entity/previous-grasses-entity");
const { CropGroupCategoriesEntity } = require("../db/entity/crop-group-categories.entity");
const { GrassHistoryIdMappingEntity } = require("../db/entity/grass-history-id-mapping-entity");
const { SoilGroupCategoriesEntity } = require("../db/entity/soil-group-categories-entity");
const { CalculateGrassHistoryAndPreviousGrass } = require("../shared/calculate-previous-grass-id.service");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { FieldTypeMapper } = require("../constants/field-type-mapper");
const { CropOrderMapper } = require("../constants/crop-order-mapper");

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
  }

  async getManagementPeriods(id) {
    const data = await this.managementPeriodRepository.findOne({
      where: {
        CropID: id,
      },
    });

    return data;
  }

  async getFirstCropData(transactionalManager, FieldID, Year) {
    const data = await transactionalManager.findOne(CropEntity, {
      where: {
        FieldID: FieldID,
        Year: Year,
        Confirm: false, // Or 0 if using numeric
        CropOrder: CropOrderMapper.FIRSTCROP,
      },
    });
    return data;
  }
  async getWinterExcessRainfall(farmId, year) {
    const excessRainfall = await this.excessRainfallRepository.findOne({
      where: {
        FarmID: farmId,
        Year: year,
      },
    });
    if (excessRainfall) {
      return excessRainfall;
    } else {
      return null;
    }
  }

  async buildGrassObject(crop, field, grassGrowthClass, transactionalManager) {
    // Case: Only one crop with CropOrder 1 and CropTypeID 140
    if (
      crop.CropOrder === CropOrderMapper.FIRSTCROP &&
      crop.CropTypeID === CropTypeMapper.GRASS
    ) {
      return {
        cropOrder: crop.CropOrder,
        swardTypeId: crop.SwardTypeID,
        swardManagementId: crop.SwardManagementID,
        defoliationSequenceId: crop.DefoliationSequenceID,
        grassGrowthClassId: grassGrowthClass.grassGrowthClassId,
        yield: crop.Yield,
        seasonId: crop.Establishment,
      };
    }

    // Case: CropOrder is 2 and it's grass
    if (crop.CropOrder === CropOrderMapper.SECONDCROP) {
      if (crop.CropTypeID === CropTypeMapper.GRASS) {
        return {
          cropOrder: crop.CropOrder,
          swardTypeId: crop.SwardTypeID,
          swardManagementId: crop.SwardManagementID,
          defoliationSequenceId: crop.DefoliationSequenceID,
          grassGrowthClassId: grassGrowthClass.grassGrowthClassId,
          yield: crop.Yield,
          seasonId: crop.Establishment,
        };
      } else {
        // Look up CropOrder 1
        const firstCrop = await this.getFirstCropData(
          transactionalManager,
          field.ID,
          crop.Year
        );

        if (firstCrop && firstCrop.CropTypeID === CropTypeMapper.GRASS) {
          return {
            cropOrder: firstCrop.CropOrder,
            swardTypeId: firstCrop.SwardTypeID,
            swardManagementId: firstCrop.SwardManagementID,
            defoliationSequenceId: firstCrop.DefoliationSequenceID,
            grassGrowthClassId: grassGrowthClass.grassGrowthClassId,
            yield: firstCrop.Yield,
            seasonId: firstCrop.Establishment,
          };
        }
      }
    }

    // Default return
    return {};
  }

  async buildArableBody(crop, field, transactionalManager) {
    const arableBody = [];

    // Fetch cropType for the current crop (CropOrder 1 or 2)
    const cropTypesList = await this.rB209ArableService.getData(
      "/Arable/CropTypes"
    );
    const currentCropType = cropTypesList.find(
      (cropType) => cropType.cropTypeId === crop.CropTypeID
    );

    if (!currentCropType || currentCropType.cropGroupId === null) {
      throw new HttpException(
        `Invalid CropTypeId for crop having field name ${field.Name}`,
        HttpStatus.BAD_REQUEST
      );
    }

    // If CropOrder is 1, add only the current crop's data
    if (
      crop.CropOrder === CropOrderMapper.FIRSTCROP &&
      crop.CropTypeID !== CropTypeMapper.GRASS
    ) {
      arableBody.push({
        cropOrder: crop.CropOrder,
        cropGroupId: currentCropType.cropGroupId,
        cropTypeId: crop.CropTypeID,
        cropInfo1Id: crop.CropInfo1,
        cropInfo2Id: crop.CropInfo2,
        sowingDate: crop.SowingDate,
        expectedYield: crop.Yield,
      });
    }

    // If CropOrder is 2, find the crop with CropOrder 1 and add both crops
    if (crop.CropOrder === CropOrderMapper.SECONDCROP) {
      // Find the previous crop with CropOrder 1

      const previousCrop = await this.getFirstCropData(
        transactionalManager,
        field.ID,
        crop.Year
      );

      if (previousCrop && previousCrop.CropTypeID !== CropTypeMapper.GRASS) {
        // Fetch cropType for the previous crop
        const previousCropType = cropTypesList.find(
          (cropType) => cropType.cropTypeId === previousCrop.CropTypeID
        );

        if (!previousCropType || previousCropType.cropGroupId === null) {
          throw new HttpException(
            `Invalid CropTypeId for previous crop having field name ${field.Name}`,
            HttpStatus.BAD_REQUEST
          );
        }

        // Add CropOrder 1 (previous crop)
        arableBody.push({
          cropOrder: previousCrop.CropOrder,
          cropGroupId: previousCropType.cropGroupId,
          cropTypeId: previousCrop.CropTypeID,
          cropInfo1Id: previousCrop.CropInfo1,
          cropInfo2Id: previousCrop.CropInfo2,
          sowingDate: previousCrop.SowingDate,
          expectedYield: previousCrop.Yield,
        });
      }

      if (crop.CropTypeID !== CropTypeMapper.GRASS) {
        // Add CropOrder 2 (current crop)
        arableBody.push({
          cropOrder: crop.CropOrder,
          cropGroupId: currentCropType.cropGroupId,
          cropTypeId: crop.CropTypeID,
          cropInfo1Id: crop.CropInfo1,
          cropInfo2Id: crop.CropInfo2,
          sowingDate: crop.SowingDate,
          expectedYield: crop.Yield,
        });
      }
    }

    return arableBody;
  }
  async findPreviousCrop(fieldID, currentYear, allCropData) {
    // Find all crops matching the previous year and field ID
    // Filter all crops to find those matching the previous year and field ID
    const previousCrops = allCropData.filter(
      (crop) => crop.FieldID === fieldID && crop.Year === currentYear - 1
    );
    // If more than one crop is found, filter for CropOrder = 2
    if (previousCrops.length > 1) {
      return previousCrops.find((crop) => crop.CropOrder === CropOrderMapper.SECONDCROP);
    }

    // Otherwise, return the first crop (or null if none are found)
    return previousCrops[0] || null;
  }

  async isGrassCropPresent(crop, transaction) {
    if (crop.CropOrder === CropOrderMapper.FIRSTCROP) {
      if (crop.CropTypeID === CropTypeMapper.GRASS) {
        return true;
      } else {
        return false;
      }
    } else if (crop.CropOrder === CropOrderMapper.SECONDCROP) {
      if (crop.CropTypeID === CropTypeMapper.GRASS) {
        return true;
      } else {
        const firstCropData = await this.getFirstCropData(
          transaction,
          crop.FieldID,
          crop.Year
        );
        if (firstCropData.CropTypeID === CropTypeMapper.GRASS) {
          return true;
        } else {
          return false;
        }
      }
    }
  }
  async determineFieldType(crop, transactionalManager) {
    let crops;

    // Check if it's a single crop or already an array of crops
    if (Array.isArray(crop)) {
      crops = crop;
    } else {
      // Fetch all crops for the same FieldID and Year
      crops = await transactionalManager.find(CropEntity, {
        where: { FieldID: crop.FieldID, Year: crop.Year },
      });

      // If only one crop found in DB, use it
      if (crops.length === 0 && crop?.CropTypeID) {
        crops = [crop]; // fallback to single crop passed
      }
    }

    if (crops.length === 1) {
      const cropTypeID = crops[0].CropTypeID;
      if (cropTypeID === CropTypeMapper.GRASS) {
        return 2; // Grass
      } else if (cropTypeID !== CropTypeMapper.GRASS && cropTypeID !== CropTypeMapper.OTHER) {
        return 1; // Arable or Horticulture
      }
    }

    if (crops.length === 2) {
      const cropTypeIDs = crops.map((c) => c.CropTypeID);
      const isBothGrass = cropTypeIDs.every(
        (id) => id === CropTypeMapper.GRASS
      );
      const isOneGrass = cropTypeIDs.includes(CropTypeMapper.GRASS);
      const isOtherValid = cropTypeIDs.some(
        (id) => id !== CropTypeMapper.GRASS && id !== CropTypeMapper.GRASS
      );
      const isBothArable = cropTypeIDs.every(
        (id) => id !== CropTypeMapper.GRASS
      );

      if (isBothGrass) return 2; // Both crops are grass
      if (isOneGrass && isOtherValid) return 3; // Mixed
      if (isBothArable) return 1; // Both are arable/horticulture
    }

    return 1; // Default fallback
  }

  async buildNutrientRecommendationReqBody(
    field,
    farm,
    soilAnalysis,
    snsAnalysesData,
    crop,
    allPKBalanceData,
    allCropData,
    rb209CountryId,
    request,
    transactionalManager
  ) {
    const cropTypesList = await this.rB209ArableService.getData(
      "/Arable/CropTypes"
    );

    const grassGrowthClass =
      await this.grassGrowthClass.calculateGrassGrowthClassByFieldId(
        field.ID,
        request
      );
    const cropType = cropTypesList.find(
      (cropType) => cropType.cropTypeId === crop.CropTypeID
    );

    if (!cropType || cropType.cropGroupId === null) {
      throw boom.HttpException(
        `Invalid CropTypeId for crop having field name ${field.Name}`,
        HttpStatus.BAD_REQUEST
      );
    }

    const previousCrop = await this.findPreviousCrop(
      field.ID,
      crop.Year,
      allCropData
    );

    // Use the buildArableBody function to get the arable array
    const arableBody = await this.buildArableBody(
      crop,
      field,
      transactionalManager
    );
    const grassObject = await this.buildGrassObject(
      crop,
      field,
      grassGrowthClass,
      transactionalManager
    );
    const pkBalanceData = allPKBalanceData.find(
      (data) => data.FieldID === field.ID && data.Year === crop.Year - 1
    );
    const excessRainfall = await this.getWinterExcessRainfall(
      farm.ID,
      crop.Year
    );

    const fieldType = await this.determineFieldType(crop, transactionalManager);
    let grassHistoryID = null;
    let previousGrassId = null;
    if (crop.CropTypeID == CropTypeMapper.GRASS) {
      grassHistoryID = await this.calculateGrassId.getGrassHistoryID(
        field,
        crop,
        transactionalManager
      );
    } else {
      previousGrassId = await this.calculateGrassId.getPreviousGrassID(
        crop,
        transactionalManager
      );
    }

    const isCropGrass = await this.isGrassCropPresent(
      crop,
      transactionalManager
    );
    const nutrientRecommendationnReqBody = {
      field: {
        fieldType: fieldType,
        multipleCrops: crop.CropOrder == CropOrderMapper.SECONDCROP ? true : false,
        arable: crop.FieldType == FieldTypeMapper.GRASS ? [] : arableBody,
        grassland: {},
        grass:
          crop.FieldType == FieldTypeMapper.BOTH ||
          crop.FieldType == FieldTypeMapper.GRASS
            ? grassObject
            : {},
        soil: {
          soilTypeId: field.SoilTypeID,
          kReleasingClay: field.SoilReleasingClay,
          nvzActionProgrammeId: field.NVZProgrammeID,
          psc: 0, //TODO:: need to find it
          pkBalance: {
            phosphate: pkBalanceData != null ? pkBalanceData.PBalance : 0,
            potash: pkBalanceData != null ? pkBalanceData.KBalance : 0,
          },
          soilAnalyses: [],
        },
        harvestYear: crop.Year,
        area: field.TotalArea,
        postcode: farm.ClimateDataPostCode,
        altitude: farm.AverageAltitude,
        rainfallAverage: farm.Rainfall,
        excessWinterRainfall:
          excessRainfall?.WinterRainfall != null
            ? excessRainfall.WinterRainfall
            : 0, //TODO:: need to find it
        organicMaterials: [],
        previousCropping: {},
        //countryId: farm.EnglishRules ? 1 : 2,
        countryId: rb209CountryId,
      },
      nutrients: {
        nitrogen: true,
        phosphate: true,
        potash: true,
        magnesium: true,
        sodium: true,
        sulphur: isCropGrass ? false : true,
        lime: isCropGrass ? false : true,
      },
      totals: true,
      referenceValue: `${field.ID}-${crop.ID}-${crop.Year}`,
    };
    if (soilAnalysis) {
      soilAnalysis?.forEach((soilAnalysis) => {
        const soilAnalysisData = {
          ...(soilAnalysis.Date != null && {
            soilAnalysisDate: soilAnalysis.Date,
          }),
          ...(soilAnalysis.PH != null && { soilpH: soilAnalysis.PH }),
          ...(soilAnalysis.SulphurDeficient && {
            sulphurDeficient: soilAnalysis.SulphurDeficient,
          }),
          ...(soilAnalysis.SoilNitrogenSupplyIndex != null && {
            snsIndexId: soilAnalysis.SoilNitrogenSupplyIndex,
            snsMethodologyId: 4,
          }),
          ...(soilAnalysis.PhosphorusIndex != null && {
            pIndexId: soilAnalysis.PhosphorusIndex,
            pMethodologyId: soilAnalysis.PhosphorusMethodologyID,
          }),
          ...(soilAnalysis.PotassiumIndex != null && {
            kIndexId: soilAnalysis.PotassiumIndex,
            kMethodologyId: 4,
          }),
          ...(soilAnalysis.MagnesiumIndex != null && {
            mgIndexId: soilAnalysis.MagnesiumIndex,
            mgMethodologyId: 4,
          }),
        };

        nutrientRecommendationnReqBody.field.soil.soilAnalyses.push(
          soilAnalysisData
        );
      });
    }

    // Add SnsAnalyses data
    // if (snsAnalysesData) {
    //   nutrientRecommendationnReqBody.field.soil.soilAnalyses.push({
    //     soilAnalysisDate: snsAnalysesData.SampleDate, // Using snsAnalysesData.SampleDate
    //     snsIndexId: snsAnalysesData.SoilNitrogenSupplyIndex, // Using snsAnalysesData.SoilNitrogenSupplyIndex
    //     snsMethodologyId: 4,
    //     pMethodologyId: 0,
    //     kMethodologyId: 4,
    //     mgMethodologyId: 4,
    //   });
    // }

    if (previousCrop) {
      const cropType = cropTypesList.find(
        (cropType) => cropType?.cropTypeId === previousCrop?.CropTypeID
      );
      nutrientRecommendationnReqBody.field.previousCropping = {
        previousGrassId: grassHistoryID ? null : previousGrassId,
        previousCropGroupId: grassHistoryID
          ? null
          : cropType?.cropGroupId !== undefined &&
            cropType?.cropGroupId !== null
          ? cropType?.cropGroupId
          : null,
        // previousCropTypeId:
        //   previousCrop?.CropTypeID == 140
        //     ? null
        //     : previousCrop?.CropTypeID !== undefined &&
        //       previousCrop?.CropTypeID !== null
        //     ? previousCrop?.CropTypeID
        //     : null,
        previousCropTypeId: grassHistoryID
          ? null
          : previousCrop?.CropTypeID !== undefined &&
            previousCrop?.CropTypeID !== null
          ? previousCrop?.CropTypeID
          : null,
        grassHistoryId: previousGrassId ? null : grassHistoryID,
        snsId: null,
        smnDepth: null,
        measuredSmn: null,
      };
    } else {
      // If no previousCrop found, assign null except for previousGrassId
      nutrientRecommendationnReqBody.field.previousCropping = {
        previousCropGroupId: null,
        previousCropTypeId: null,
        previousGrassId:
          previousCrop?.CropTypeID == CropTypeMapper.GRASS ? null : 1,
        grassHistoryId: null,
        snsId: null,
        smnDepth: null,
        measuredSmn: null,
      };
    }
    nutrientRecommendationnReqBody.referenceValue = `${field.ID}-${crop.ID}-${crop.Year}`;

    return nutrientRecommendationnReqBody;
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

  async handleSoilAnalysisValidation(fieldId, fieldName, year, rb209CountryId) {
    const errors = [];
    const fiveYearsAgo = year - 4;

    // Fetch all soil analyses for the last 5 years
    const soilAnalysisRecordsFiveYears = await this.soilAnalysisRepository.find(
      {
        where: {
          FieldID: fieldId,
          Year: Between(fiveYearsAgo, year), // Fetch records within 5 years
        },
        order: { Date: "DESC" }, // Order by date, most recent first
      }
    );

    // Define the fields we want the latest values for
    const fieldsToTrack = [
      "PH",
      "SoilNitrogenSupplyIndex",
      "PhosphorusIndex",
      "PotassiumIndex",
      "MagnesiumIndex",
    ];

    // Initialize the latest values object
    const latestSoilAnalysis = {};
    if (soilAnalysisRecordsFiveYears.length > 0) {
      fieldsToTrack.forEach((field) => {
        latestSoilAnalysis[field] = null;

        // Find the first record in descending date order where the field has a value
        const latestRecordWithFieldValue = soilAnalysisRecordsFiveYears.find(
          (record) => record[field] !== null && record[field] !== undefined
        );

        // if (latestRecordWithFieldValue) {

        if (latestRecordWithFieldValue) {
          latestSoilAnalysis[field] = latestRecordWithFieldValue[field];
        } else {
          // Explicitly set the field to null if no value was found
          latestSoilAnalysis[field] = null;
        }
      });
    }
    // Iterate over the fields and find the latest value for each field

    const soilAnalysisRecords = await this.assignIndexIdToSoilRecords(
      soilAnalysisRecordsFiveYears,
      rb209CountryId
    );

    return { latestSoilAnalysis, errors, soilAnalysisRecords };
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

  async getSnsAnalysesData(id) {
    const data = await this.snsAnalysisRepository.findOneBy({
      CropID: id,
    });

    return data;
  }

  async saveRecommendationForMutipleCrops(
    transactionalManager,
    nutrientRecommendationsData,
    allRecommendations,
    allcropData,
    savedCrop,
    firstCropData,
    managementPeriodData,
    ManagementPeriods,
    latestSoilAnalysis,
    snsAnalysesData,
    userId
  ) {
    // Initialize variables for recommendations for both Crop Orders
    let cropOrder1Data = {
      CropN: null,
      ManureN: null,
      FertilizerN: null,
      CropP2O5: null,
      ManureP2O5: null,
      FertilizerP2O5: null,
      CropK2O: null,
      ManureK2O: null,
      FertilizerK2O: null,
      CropMgO: null,
      ManureMgO: null,
      FertilizerMgO: null,
      CropSO3: null,
      ManureSO3: null,
      FertilizerSO3: null,
      CropNa2O: null,
      ManureNa2O: null,
      FertilizerNa2O: null,
      CropLime: null,
      ManureLime: null,
      FertilizerLime: null,
      PH: latestSoilAnalysis?.PH?.toString() || null,
      SNSIndex: latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString() || null,
      PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString() || null,
      KIndex: latestSoilAnalysis?.PotassiumIndex?.toString() || null,
      MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString() || null,
      SIndex: null,
      NIndex: null,
    };

    let cropOrder2Data = {
      CropN: null,
      ManureN: null,
      FertilizerN: null,
      CropP2O5: null,
      ManureP2O5: null,
      FertilizerP2O5: null,
      CropK2O: null,
      ManureK2O: null,
      FertilizerK2O: null,
      CropMgO: null,
      ManureMgO: null,
      FertilizerMgO: null,
      CropSO3: null,
      ManureSO3: null,
      FertilizerSO3: null,
      CropNa2O: null,
      ManureNa2O: null,
      FertilizerNa2O: null,
      CropLime: null,
      ManureLime: null,
      FertilizerLime: null,
      PH: latestSoilAnalysis?.PH?.toString() || null,
      SNSIndex: latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString() || null,
      PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString() || null,
      KIndex: latestSoilAnalysis?.PotassiumIndex?.toString() || null,
      MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString() || null,
      SIndex: null,
      NIndex: null,
    };
    let nIndex;
    // Iterate through the nutrient recommendations data
    for (const calculation of nutrientRecommendationsData.calculations) {
      const nutrientId = calculation.nutrientId;
      const sequenceId = calculation.sequenceId;
      let nIndex;

      switch (nutrientId) {
        case 0:
          // Nitrogen (N) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropN = calculation.recommendation;
            cropOrder1Data.ManureN = null;
            cropOrder1Data.FertilizerN = calculation.cropNeed;
            cropOrder1Data.NIndex = calculation.indexpH;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropN = calculation.recommendation;
            cropOrder2Data.ManureN = null;
            cropOrder2Data.FertilizerN = calculation.cropNeed;
            cropOrder2Data.NIndex = calculation.indexpH;
          }
          break;

        case 1:
          // Phosphorus (P2O5) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropP2O5 = calculation.recommendation;
            cropOrder1Data.ManureP2O5 = null;
            cropOrder1Data.FertilizerP2O5 = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropP2O5 = calculation.recommendation;
            cropOrder2Data.ManureP2O5 = null;
            cropOrder2Data.FertilizerP2O5 = calculation.cropNeed;
          }
          break;

        case 2:
          // Potassium (K2O) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropK2O = calculation.recommendation;
            cropOrder1Data.ManureK2O = null;
            cropOrder1Data.FertilizerK2O = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropK2O = calculation.recommendation;
            cropOrder2Data.ManureK2O = null;
            cropOrder2Data.FertilizerK2O = calculation.cropNeed;
          }
          break;

        case 3:
          // Magnesium (MgO) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropMgO = calculation.recommendation;
            cropOrder1Data.ManureMgO = null;
            cropOrder1Data.FertilizerMgO = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropMgO = calculation.recommendation;
            cropOrder2Data.ManureMgO = null;
            cropOrder2Data.FertilizerMgO = calculation.cropNeed;
          }
          break;

        case 4:
          // Sodium (Na2O) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropNa2O = calculation.recommendation;
            cropOrder1Data.ManureNa2O = null;
            cropOrder1Data.FertilizerNa2O = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropNa2O = calculation.recommendation;
            cropOrder2Data.ManureNa2O = null;
            cropOrder2Data.FertilizerNa2O = calculation.cropNeed;
          }
          break;

        case 5:
          // Sulfur (SO3) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropSO3 = calculation.recommendation;
            cropOrder1Data.ManureSO3 = null;
            cropOrder1Data.FertilizerSO3 = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropSO3 = calculation.recommendation;
            cropOrder2Data.ManureSO3 = null;
            cropOrder2Data.FertilizerSO3 = calculation.cropNeed;
          }
          break;

        case 6:
          // Lime handling
          if (sequenceId === 1) {
            cropOrder1Data.CropLime = calculation.recommendation;
            cropOrder1Data.ManureLime = null;
            cropOrder1Data.FertilizerLime = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropLime = calculation.recommendation;
            cropOrder2Data.ManureLime = null;
            cropOrder2Data.FertilizerLime = calculation.cropNeed;
          }
          break;

        default:
          break;
      }
    }

    let firstCropSaveData = allRecommendations.find(
      (recommendation) =>
        recommendation.ManagementPeriodID === managementPeriodData.ID
    );

    if (firstCropSaveData) {
      // Update existing recommendation
      firstCropSaveData = {
        ...firstCropSaveData,
        ...cropOrder1Data,
        ModifiedByID: userId,
        ModifiedOn: new Date(),
        Comments: `Reference Value: ${nutrientRecommendationsData.referenceValue}\nVersion: ${nutrientRecommendationsData.versionNumber}`,
      };
      await transactionalManager.save(RecommendationEntity, firstCropSaveData);
    } else {
      // Create a new recommendation
      firstCropSaveData = await transactionalManager.save(
        RecommendationEntity,
        this.repository.create({
          ...cropOrder1Data,
          ManagementPeriodID: managementPeriodData.ID,
          Comments: `Reference Value: ${nutrientRecommendationsData.referenceValue}\nVersion: ${nutrientRecommendationsData.versionNumber}`,
          CreatedOn: new Date(),
          CreatedByID: userId,
        })
      );
    }

    let managementPeriodIdSecondCrop = ManagementPeriods[0]?.ID;
    // Save or update for Crop Order 2
    let secondCropSaveData;
    // Create a new recommendation
    secondCropSaveData = await transactionalManager.save(
      RecommendationEntity,
      this.repository.create({
        ...cropOrder2Data,
        ManagementPeriodID: ManagementPeriods[0].ID,
        Comments: `Reference Value: ${nutrientRecommendationsData.referenceValue}\nVersion: ${nutrientRecommendationsData.versionNumber}`,
        CreatedOn: new Date(),
        CreatedByID: userId,
      })
    );
    //}

    return {
      firstCropSaveData,
      secondCropSaveData,
    };
  }

  async saveMultipleRecommendation(
    Recommendations,
    firstCropSaveData, // First crop data
    secondCropSaveData, // Second crop data
    transactionalManager,
    nutrientRecommendationsData,
    userId
  ) {
    const RecommendationComments = [];

    // Separate advice notes by sequenceId for first crop (sequenceId = 1) and second crop (sequenceId = 2)
    const firstCropNotes = nutrientRecommendationsData.adviceNotes?.filter(
      (note) => note.sequenceId === 1
    );
    const secondCropNotes = nutrientRecommendationsData.adviceNotes?.filter(
      (note) => note.sequenceId === 2
    );

    // Helper function to group notes by nutrientId and concatenate them
    const groupNotesByNutrientId = (notes) => {
      return notes.reduce((acc, adviceNote) => {
        const nutrientId = adviceNote.nutrientId;
        if (!acc[nutrientId]) {
          acc[nutrientId] = [];
        }
        acc[nutrientId].push(adviceNote.note); // Group notes by nutrientId
        return acc;
      }, {});
    };

    const firstCropNotesByNutrientId = groupNotesByNutrientId(firstCropNotes);
    const secondCropNotesByNutrientId = groupNotesByNutrientId(secondCropNotes);

    // Track nutrient IDs that are being processed
    const nutrientIdsInData = [];

    // Function to handle saving comments (with updates or creations)
    const saveComments = async (notesByNutrientId, savedCrop) => {
      const existingComments = await transactionalManager.find(
        RecommendationCommentEntity,
        { where: { RecommendationID: savedCrop.ID } }
      );

      for (const nutrientId in notesByNutrientId) {
        const concatenatedNote = notesByNutrientId[nutrientId].join(" <br/>"); // Concatenate notes for the same nutrientId

        // Add nutrientId to the processed list
        nutrientIdsInData.push(parseInt(nutrientId));

        // Check if the comment already exists for this nutrientId in the database
        const existingComment = existingComments.find(
          (comment) => comment.Nutrient === parseInt(nutrientId)
        );

        if (existingComment) {
          // Update existing comment if found
          existingComment.Comment = concatenatedNote;
          existingComment.ModifiedOn = new Date();
          existingComment.ModifiedByID = userId;

          const updatedComment = await transactionalManager.save(
            RecommendationCommentEntity,
            existingComment
          );
          RecommendationComments.push(updatedComment);
        } else {
          // Create a new comment if not found
          const newComment = this.recommendationCommentRepository.create({
            Nutrient: parseInt(nutrientId),
            Comment: concatenatedNote,
            RecommendationID: savedCrop.ID, // Use the correct recommendation ID from the passed crop data
            CreatedOn: new Date(),
            CreatedByID: userId,
          });

          const savedComment = await transactionalManager.save(
            RecommendationCommentEntity,
            newComment
          );
          RecommendationComments.push(savedComment);
        }
      }

      // Remove comments from the database if the nutrientId is not in the new data
      const commentsToDelete = existingComments.filter(
        (comment) => !nutrientIdsInData.includes(comment.Nutrient)
      );

      if (commentsToDelete.length > 0) {
        await transactionalManager.remove(
          RecommendationCommentEntity,
          commentsToDelete
        );
      }
      return RecommendationComments;
    };

    // Handle notes for the first crop (sequenceId = 1)
    await saveComments(firstCropNotesByNutrientId, firstCropSaveData);

    // Handle notes for the second crop (sequenceId = 2)
    await saveComments(secondCropNotesByNutrientId, secondCropSaveData);

    // Push the first crop recommendation and its comments to the final result array
    Recommendations.push({
      Recommendation: firstCropSaveData, // First crop recommendation
      RecommendationComments,
    });

    // Push the second crop recommendation and its comments to the final result array
    Recommendations.push({
      Recommendation: secondCropSaveData, // Second crop recommendation
      RecommendationComments,
    });

    return Recommendations;
  }

  async savedefaultRecommendationCrops(
    transactionalManager,
    managementPeriodID,
    userId
  ) {
    // Initialize variables for recommendations for both Crop Orders
    let cropData = {
      CropN: null,
      ManureN: null,
      FertilizerN: null,
      CropP2O5: null,
      ManureP2O5: null,
      FertilizerP2O5: null,
      CropK2O: null,
      ManureK2O: null,
      FertilizerK2O: null,
      CropMgO: null,
      ManureMgO: null,
      FertilizerMgO: null,
      CropSO3: null,
      ManureSO3: null,
      FertilizerSO3: null,
      CropNa2O: null,
      ManureNa2O: null,
      FertilizerNa2O: null,
      CropLime: null,
      ManureLime: null,
      FertilizerLime: null,
      PH: null,
      SNSIndex: null,
      PIndex: null,
      KIndex: null,
      MgIndex: null,
      SIndex: null,
      NIndex: null,
    };
    await transactionalManager.save(
      RecommendationEntity,
      this.repository.create({
        ...cropData,
        ManagementPeriodID: managementPeriodID,
        Comments: null,
        CreatedOn: new Date(),
        CreatedByID: userId,
      })
    );
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
      })
    );

    // Iterate over the cropData ManagementPeriods and save them using the transactionalManager
    for (const managementPeriod of cropData.ManagementPeriods) {
      const savedManagementPeriod = await transactionalManager.save(
        ManagementPeriodEntity,
        this.managementPeriodRepository.create({
          ...managementPeriod,
          CropID: savedCrop.ID, // Link saved crop with ManagementPeriods
          CreatedByID: userId,
        })
      );
      ManagementPeriods.push(savedManagementPeriod);

      //Call saveRecommendationCrops immediately after saving each ManagementPeriod
      await this.savedefaultRecommendationCrops(
        transactionalManager,
        savedManagementPeriod.ID, // Pass the saved management period's ID
        userId
      );
    }

    // Return the transaction result with the saved crop and management periods
    return {
      Crop: savedCrop,
      ManagementPeriods,
    };
  }
  async saveRecommendationsForMutipleCrops(
    transactionalManager,
    nutrientRecommendationsData,
    savedCrop,
    ManagementPeriods,
    latestSoilAnalysis,
    snsAnalysesData,
    userId
  ) {
    // Initialize variables for recommendations for both Crop Orders
    let cropOrder1Data = {
      CropN: null,
      ManureN: null,
      FertilizerN: null,
      CropP2O5: null,
      ManureP2O5: null,
      FertilizerP2O5: null,
      CropK2O: null,
      ManureK2O: null,
      FertilizerK2O: null,
      CropMgO: null,
      ManureMgO: null,
      FertilizerMgO: null,
      CropSO3: null,
      ManureSO3: null,
      FertilizerSO3: null,
      CropNa2O: null,
      ManureNa2O: null,
      FertilizerNa2O: null,
      CropLime: null,
      ManureLime: null,
      FertilizerLime: null,
      PH: latestSoilAnalysis?.PH?.toString() || null,
      SNSIndex: latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString() || null,
      PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString() || null,
      KIndex: latestSoilAnalysis?.PotassiumIndex?.toString() || null,
      MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString() || null,
      SIndex: null,
      NIndex: null,
    };

    let cropOrder2Data = {
      CropN: null,
      ManureN: null,
      FertilizerN: null,
      CropP2O5: null,
      ManureP2O5: null,
      FertilizerP2O5: null,
      CropK2O: null,
      ManureK2O: null,
      FertilizerK2O: null,
      CropMgO: null,
      ManureMgO: null,
      FertilizerMgO: null,
      CropSO3: null,
      ManureSO3: null,
      FertilizerSO3: null,
      CropNa2O: null,
      ManureNa2O: null,
      FertilizerNa2O: null,
      CropLime: null,
      ManureLime: null,
      FertilizerLime: null,
      PH: latestSoilAnalysis?.PH?.toString() || null,
      SNSIndex: snsAnalysesData?.SoilNitrogenSupplyIndex?.toString() || null,
      PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString() || null,
      KIndex: latestSoilAnalysis?.PotassiumIndex?.toString() || null,
      MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString() || null,
      SIndex: null,
      NIndex: null,
    };
    let nIndex;
    // Iterate through the nutrient recommendations data
    for (const calculation of nutrientRecommendationsData.calculations) {
      const nutrientId = calculation.nutrientId;
      const sequenceId = calculation.sequenceId;
      switch (nutrientId) {
        case 0:
          // Nitrogen (N) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropN = calculation.recommendation;
            // cropOrder1Data.ManureN = calculation.applied;
            cropOrder1Data.FertilizerN = calculation.cropNeed;
            cropOrder1Data.NIndex = calculation.indexpH;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropN = calculation.recommendation;
            // cropOrder2Data.ManureN = calculation.applied;
            cropOrder2Data.FertilizerN = calculation.cropNeed;
            cropOrder2Data.NIndex = calculation.indexpH;
          }
          break;

        case 1:
          // Phosphorus (P2O5) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropP2O5 = calculation.recommendation;
            // cropOrder1Data.ManureP2O5 = calculation.applied;
            cropOrder1Data.FertilizerP2O5 = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropP2O5 = calculation.recommendation;
            // cropOrder2Data.ManureP2O5 = calculation.applied;
            cropOrder2Data.FertilizerP2O5 = calculation.cropNeed;
          }
          break;

        case 2:
          // Potassium (K2O) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropK2O = calculation.recommendation;
            // cropOrder1Data.ManureK2O = calculation.applied;
            cropOrder1Data.FertilizerK2O = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropK2O = calculation.recommendation;
            // cropOrder2Data.ManureK2O = calculation.applied;
            cropOrder2Data.FertilizerK2O = calculation.cropNeed;
          }
          break;

        case 3:
          // Magnesium (MgO) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropMgO = calculation.recommendation;
            // cropOrder1Data.ManureMgO = calculation.applied;
            cropOrder1Data.FertilizerMgO = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropMgO = calculation.recommendation;
            // cropOrder2Data.ManureMgO = calculation.applied;
            cropOrder2Data.FertilizerMgO = calculation.cropNeed;
          }
          break;

        case 4:
          // Sodium (Na2O) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropNa2O = calculation.recommendation;
            // cropOrder1Data.ManureNa2O = calculation.applied;
            cropOrder1Data.FertilizerNa2O = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropNa2O = calculation.recommendation;
            // cropOrder2Data.ManureNa2O = calculation.applied;
            cropOrder2Data.FertilizerNa2O = calculation.cropNeed;
          }
          break;
        case 5:
          // Sulfur (SO3) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropSO3 = calculation.recommendation;
            // cropOrder1Data.ManureSO3 = calculation.applied;
            cropOrder1Data.FertilizerSO3 = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropSO3 = calculation.recommendation;
            // cropOrder2Data.ManureSO3 = calculation.applied;
            cropOrder2Data.FertilizerSO3 = calculation.cropNeed;
          }
          break;

        case 6:
          // Lime handling
          if (sequenceId === 1) {
            cropOrder1Data.CropLime = calculation.recommendation;
            // cropOrder1Data.ManureLime = calculation.applied;
            cropOrder1Data.FertilizerLime = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropLime = calculation.recommendation;
            // cropOrder2Data.ManureLime = calculation.applied;
            cropOrder2Data.FertilizerLime = calculation.cropNeed;
          }
          break;

        default:
          break;
      }
    }
    let managementPeriodIdSecondCrop = ManagementPeriods[0]?.ID;
    // Save or update for Crop Order 2
    let firstCropSaveData;

    // Save or update for Crop Order 1
    firstCropSaveData = await this.createCropSaveData(
      transactionalManager,
      cropOrder1Data,
      ManagementPeriods[0].ID,
      nutrientRecommendationsData,
      userId
    );
    //}

    return {
      firstCropSaveData,
    };
  }
  // New function to save the crop data
  async createCropSaveData(
    transactionalManager,
    cropOrderData,
    managementPeriodId,
    nutrientRecommendationsData,
    userId
  ) {
    const newCropSaveData = await transactionalManager.save(
      RecommendationEntity,
      this.repository.create({
        ...cropOrderData,
        ManagementPeriodID: managementPeriodId,
        Comments: `Reference Value: ${nutrientRecommendationsData.referenceValue}\nVersion: ${nutrientRecommendationsData.versionNumber}`,
        CreatedOn: new Date(),
        CreatedByID: userId,
      })
    );

    return newCropSaveData;
  }
  async findPkBalanceData(cropYear, fieldId) {
    return await this.pkBalanceRepository.findOne({
      where: { Year: cropYear, FieldID: fieldId },
    });
  }
  // Function to find indexId by matching index values
  async findIndexId(nutrient, indexValue, nutrientIndicesData) {
    // Return null immediately if indexValue is null
    if (indexValue === null) {
      return null;
    }
    const nutrientData = nutrientIndicesData[nutrient];

    // Special case for Potassium (nutrientId = 2)
    if (nutrient === "Potassium") {
      // Check if indexValue is 2 and match with "2+"
      if (indexValue === 2) {
        for (const data of nutrientData) {
          if (data.index.trim() === "2+") {
            return data.indexId;
          }
        }
      }

      // Check if indexValue is -2 and match with "2-"
      if (indexValue === -2) {
        for (const data of nutrientData) {
          if (data.index.trim() === "2-") {
            return data.indexId;
          }
        }
      }
    }

    for (const data of nutrientData) {
      if (data.index.trim() === indexValue.toString()) {
        return data.indexId;
      }
    }
    return null; // Return null if no match is found
  }

  async assignIndexIdToSoilRecords(soilAnalysisRecords, rb209CountryId) {
    const nutrientIndicesData = {};

    // Loop through each soil analysis record
    for (const record of soilAnalysisRecords) {
      // Loop through NutrientMapper to process each nutrient
      for (const nutrient of NutrientMapperNames) {
        const { nutrientId, nutrient: nutrientName, countryId } = nutrient;

        // Fetch data for each nutrient and country
        const getNutrientData = await this.RB209SoilService.getData(
          `Soil/Methodologies/${nutrientId}/${countryId}`
        );

        const methodologyId = getNutrientData[0]?.methodologyId;

        if (methodologyId != null) {
          // Use dynamic countryId for the NutrientIndices API call
          nutrientIndicesData[nutrientName] =
            await this.RB209SoilService.getData(
              `Soil/NutrientIndices/${nutrientId}/${methodologyId}/${rb209CountryId}`
            );
        }

        // Dynamically assign indexId to each nutrient in soil analysis record
        const nutrientIndexKey = `${nutrientName}Index`; // e.g., "PhosphateIndex"
        if (record[nutrientIndexKey] !== undefined) {
          const nutrientIndexId = await this.findIndexId(
            nutrientName,
            record[nutrientIndexKey],
            nutrientIndicesData
          );
          console.log(`${nutrientName}IndexId`, nutrientIndexId);
          record[nutrientIndexKey] =
            nutrientIndexId || record[nutrientIndexKey]; // Update the index with indexId
        }
      }
    }

    return soilAnalysisRecords;
  }

  async convertIndexValueToId(indexId, nutrientId) {
    const numericIndexId = Number(indexId);
    // Convert nutrientId to a string
    const numericNutrientId = Number(nutrientId);
    const indexValue = await this.RB209SoilService.getData(
      `Soil/NutrientIndex/${numericIndexId}/${numericNutrientId}`
    );
    const trimmedIndexValue = indexValue.index.trim();

    return trimmedIndexValue;
  }

  async fetchAllDataByFieldIDs(fieldIDs) {
    // Fetch all crop data by FieldID using `find` and `IN` operator
    const allCropData = await this.cropRepository.find({
      where: {
        FieldID: In(fieldIDs), // Using TypeORM's `In` function
      },
    });

    // Extract CropIDs from the fetched crop data
    const cropIDs = allCropData.map((crop) => crop.ID);

    // Fetch all management period data from managementRepository using `IN` operator
    const allManagementPeriods = await this.managementPeriodRepository.find({
      where: {
        CropID: In(cropIDs), // Fetch management periods where CropID is in cropIDs array
      },
    });

    // Extract ManagementPeriodIDs from the fetched management period data
    const managementPeriodIDs = allManagementPeriods.map(
      (managementPeriod) => managementPeriod.ID
    );

    // Fetch all recommendations from recommendationRepository by ManagementPeriodID using `IN` operator
    const allRecommendations = await this.repository.find({
      where: {
        ManagementPeriodID: In(managementPeriodIDs), // Fetch recommendations where ManagementPeriodID is in managementPeriodIDs array
      },
    });

    // Fetch all PKBalanceData from pkBalanceRepository by FieldID using `IN` operator
    const allPKBalanceData = await this.pkBalanceRepository.find({
      where: {
        FieldID: In(fieldIDs), // Fetch PKBalanceData where FieldID is in fieldIDs array
      },
    });

    // Return the fetched data as an object
    return {
      allCropData,
      allManagementPeriods,
      allRecommendations,
      allPKBalanceData,
    };
  }

  async getGrassHistoryID(field, cropThisYear, transactionalManager) {
    // Step 1: Get crops for Year - 1 and Year - 2
    // const crop1 = await transactionalManager.findOne(CropEntity, {
    //   where: { FieldID: field.ID, Year: cropThisYear.Year - 1 },
    // });
    // const crop2 = await transactionalManager.findOne(CropEntity, {
    //   where: { FieldID: field.ID, Year: cropThisYear.Year - 2 },
    // });
    const crop1 = await this.getCropForYear(
      field.ID,
      cropThisYear.Year - 1,
      transactionalManager
    );
    const crop2 = await this.getCropForYear(
      field.ID,
      cropThisYear.Year - 2,
      transactionalManager
    );

    let FirstHYFieldType = crop1?.FieldType || null;
    let SecondHYFieldType = crop2?.FieldType || null;

    // 🟡 Check PreviousGrassesEntity if crops not found
    if (FirstHYFieldType === null) {
      const prevGrass1 = await transactionalManager.findOne(
        PreviousGrassesEntity,
        {
          where: { FieldID: field.ID, HarvestYear: cropThisYear.Year - 1 },
        }
      );
      FirstHYFieldType = prevGrass1 ? 2 : 1; // If not found, assign 1
    }

    if (SecondHYFieldType === null) {
      const prevGrass2 = await transactionalManager.findOne(
        PreviousGrassesEntity,
        {
          where: { FieldID: field.ID, HarvestYear: cropThisYear.Year - 2 },
        }
      );
      SecondHYFieldType = prevGrass2 ? 2 : 1;
    }

    // Step 2: IsReseeded - only when FirstHYFieldType === 2
    let IsReseeded = null;
    if (FirstHYFieldType === 2) {
      const establishment = cropThisYear?.Establishment;
      IsReseeded = establishment === 0 || establishment === null ? 0 : 1;
    }

    // Step 3: IsHighClover - from cropThisYear.SwardTypeID
    const SwardTypeID = cropThisYear?.SwardTypeID;
    const IsHighClover = [2, 3, 4].includes(SwardTypeID) ? 1 : 0;

    // Step 4: NitrogenUse - sum N from organic and fertiliser manures
    let nitrogenTotal = 0;

    if (cropThisYear?.ID) {
      const managementPeriods = await transactionalManager.find(
        ManagementPeriodEntity,
        {
          where: { CropID: cropThisYear.ID },
        }
      );

      const mgmtIds = managementPeriods.map((mp) => mp.ID);
      let organicN = 0;
      let fertiliserN = 0;

      for (const mgmtId of mgmtIds) {
        const organicManures = await transactionalManager.find(
          OrganicManureEntity,
          {
            where: { ManagementPeriodID: mgmtId },
          }
        );
        for (const o of organicManures) {
          organicN += o.N || 0;
        }

        const fertiliserManures = await transactionalManager.find(
          FertiliserManuresEntity,
          {
            where: { ManagementPeriodID: mgmtId },
          }
        );
        for (const f of fertiliserManures) {
          fertiliserN += f.N || 0;
        }
      }

      nitrogenTotal = organicN + fertiliserN;
    }

    const NitrogenUse = nitrogenTotal > 250 ? "High" : "Low"; //100 to 250 => moderate// below 100 => low// above 250 => high

    // Step 5: SoilGroupCategoryID - only if both FieldTypes are 1
    let SoilGroupCategoryID = null;
    if (FirstHYFieldType === 1 && SecondHYFieldType === 1) {
      //enum
      // const field = await transactionalManager.findOne(FieldEntity, {
      //   where: { ID: field.FieldID },
      // });
      const soilTypeID = field?.SoilTypeID;

      const soilGroupCategory = await transactionalManager.findOne(
        SoilGroupCategoriesEntity,
        {
          where: { SoilTypeID: soilTypeID },
        }
      );
      SoilGroupCategoryID = soilGroupCategory?.ID || null;

      // Step 6: CropGroupCategoryID - only if SoilGroupCategoryID is 2
      if (SoilGroupCategoryID === 2) {
        //enum
        const cropGroupCategory = await transactionalManager.findOne(
          CropGroupCategoriesEntity,
          {
            where: { CropTypeID: cropThisYear?.CropTypeID },
          }
        );
        var CropGroupCategoryID = cropGroupCategory?.ID || null;
      } else {
        var CropGroupCategoryID = null;
      }
    } else {
      var CropGroupCategoryID = null;
    }

    // Step 7: Final lookup in GrassHistoryIdMapping
    const mapping = await transactionalManager.findOne(
      GrassHistoryIdMappingEntity,
      {
        where: {
          FirstHYFieldType,
          SecondHYFieldType,
          IsReseeded,
          IsHighClover,
          NitrogenUse,
          SoilGroupCategoryID,
          CropGroupCategoryID,
        },
      }
    );

    return mapping?.GrassHistoryID || null;
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
  async getPreviousGrassID(crop, transactionalManager) {
    // Step 1: Fetch crops for current and previous years
    let cropThisYear = crop;
    if (!cropThisYear) {
      cropThisYear = await transactionalManager.findOne(CropEntity, {
        where: { FieldID: crop.FieldID, Year: crop.Year },
      });
    }
    // const crop1 = await transactionalManager.findOne(CropEntity, {
    //   where: { FieldID: crop.FieldID, Year: crop.Year - 1 },
    // });
    // const crop2 = await transactionalManager.findOne(CropEntity, {
    //   where: { FieldID: crop.FieldID, Year: crop.Year - 2 },
    // });
    // const crop3 = await transactionalManager.findOne(CropEntity, {
    //   where: { FieldID: crop.FieldID, Year: crop.Year - 3 },
    // });

    const crop1 = await this.getCropForYear(
      crop.FieldID,
      crop.Year - 1,
      transactionalManager
    );
    const crop2 = await this.getCropForYear(
      crop.FieldID,
      crop.Year - 2,
      transactionalManager
    );
    const crop3 = await this.getCropForYear(
      crop.FieldID,
      crop.Year - 3,
      transactionalManager
    );

    let FirstHYFieldType = crop1?.FieldType || null;
    let SecondHYFieldType = crop2?.FieldType || null;
    let ThirdHYFieldType = crop3?.FieldType || null;

    // Step 2: Check PreviousGrass if crop not found
    const missingYears = [];
    if (!crop1) missingYears.push(crop.Year - 1);
    if (!crop2) missingYears.push(crop.Year - 2);
    if (!crop3) missingYears.push(crop.Year - 3);

    for (const y of missingYears) {
      const prevGrass = await transactionalManager.findOne(
        PreviousGrassesEntity,
        {
          where: { FieldID: crop.FieldID, HarvestYear: y },
        }
      );
      if (prevGrass) {
        if (y === crop.Year - 1) FirstHYFieldType = 2;
        if (y === crop.Year - 2) SecondHYFieldType = 2;
        if (y === crop.Year - 3) ThirdHYFieldType = 2;
      }
    }
    // 🆕 Assign default value `1` if still null
    if (FirstHYFieldType === null) FirstHYFieldType = 1;
    if (SecondHYFieldType === null) SecondHYFieldType = 1;
    if (ThirdHYFieldType === null) ThirdHYFieldType = 1;

    // Step 8: If none of the FieldTypes is 2, return 1 directly
    if (
      FirstHYFieldType !== 2 &&
      SecondHYFieldType !== 2 &&
      ThirdHYFieldType !== 2
    ) {
      return 1;
    }

    // Step 3: LayDuration
    let layCount = 0;
    [FirstHYFieldType, SecondHYFieldType, ThirdHYFieldType].forEach((c) => {
      if (c === 2) layCount++;
    });
    const LayDuration = layCount > 2 ? 2 : layCount > 0 ? 1 : 0;

    // Step 4: IsGrazedOnly
    const SwardManagementID = cropThisYear?.SwardManagementID;
    const IsGrazedOnly = [1, 4, 5].includes(SwardManagementID) ? 1 : 0;

    // Step 5: IsHighClover
    const SwardTypeID = cropThisYear?.SwardTypeID;
    const IsHighClover = [2, 3, 4].includes(SwardTypeID) ? 1 : 0;

    // Step 6: NitrogenUse
    let nitrogenTotal = 0;

    if (cropThisYear?.ID) {
      const managementPeriods = await transactionalManager.find(
        ManagementPeriodEntity,
        {
          where: { CropID: cropThisYear.ID },
        }
      );

      const mgmtIds = managementPeriods.map((mp) => mp.ID);
      let organicN = 0;
      let fertiliserN = 0;

      for (const mgmtId of mgmtIds) {
        const organicManures = await transactionalManager.find(
          OrganicManureEntity,
          {
            where: { ManagementPeriodID: mgmtId },
          }
        );
        for (const o of organicManures) {
          organicN += o.N || 0;
        }

        const fertiliserManures = await transactionalManager.find(
          FertiliserManuresEntity,
          {
            where: { ManagementPeriodID: mgmtId },
          }
        );
        for (const f of fertiliserManures) {
          fertiliserN += f.N || 0;
        }
      }

      nitrogenTotal = organicN + fertiliserN;
    }

    const NitrogenUse = nitrogenTotal > 250 ? "High" : "Low";

    // Step 7: Lookup in PreviousGrassIdMapping
    const mapping = await transactionalManager.findOne(
      PreviousGrassIdMappingEntity,
      {
        where: {
          FirstHYFieldType: FirstHYFieldType,
          SecondHYFieldType: SecondHYFieldType,
          ThirdHYFieldType: ThirdHYFieldType,
          LayDuration: LayDuration,
          IsGrazedOnly: IsGrazedOnly,
          IsHighClover: IsHighClover,
          NitrogenUse: NitrogenUse, // This should be string: "High" or "Low"
        },
      }
    );

    return mapping?.PreviousGrassID || null;
  }

  async createNutrientsRecommendationForField(crops, userId, request) {
    const fieldIDs = crops.map((cropData) => cropData.Crop.FieldID); //22 //23
    const {
      allCropData,
      allManagementPeriods,
      allRecommendations,
      allPKBalanceData,
    } = await this.fetchAllDataByFieldIDs(fieldIDs);

    return await AppDataSource.transaction(async (transactionalManager) => {
      const Recommendations = [];
      const Errors = [];
      for (const cropData of crops) {
        const crop = cropData?.Crop;
        const errors = this.handleCropValidation(crop);
        Errors.push(...errors);
        const fieldId = crop.FieldID;
        const isSoilAnalysisHavePAndK = (
          await this.soilAnalysisRepository.find({
            where: { FieldID: fieldId },
          })
        ).some(
          (item) =>
            item.PhosphorusIndex !== null || item.PotassiumIndex !== null
        )
          ? true
          : false;

        const pkBalanceData = allPKBalanceData.find(
          (data) => data.Year === crop.Year && data.FieldID === fieldId
        );

        const cropPlanOfNextYear = allCropData
          .filter((data) => data.FieldID === fieldId && data.Year > crop?.Year) // Filter records in memory
          .map((data) => ({ ID: data.ID }));
        const { field, errors: fieldErrors } = await this.handleFieldValidation(
          fieldId
        );
        Errors.push(...fieldErrors);
        const { farm, errors: farmErrors } = await this.handleFarmValidation(
          field.FarmID
        );
        Errors.push(...farmErrors);
        const rb209CountryData = await transactionalManager.findOne(
          CountryEntity,
          {
            where: {
              ID: farm.CountryID,
            },
          }
        );

        const {
          latestSoilAnalysis,
          errors: soilAnalysisErrors,
          soilAnalysisRecords,
        } = await this.handleSoilAnalysisValidation(
          fieldId,
          field.Name,
          crop?.Year,
          rb209CountryData.RB209CountryID
        );

        Errors.push(...soilAnalysisErrors);
        if (Errors.length > 0) {
          throw new Error(JSON.stringify(Errors));
        }

        const snsAnalysesData = await this.getSnsAnalysesData(crop?.ID);
        if (crop.CropTypeID === CropTypeMapper.OTHER) {
          await this.savedDefault(cropData, userId, transactionalManager);
          if (isSoilAnalysisHavePAndK) {
            if (cropPlanOfNextYear.length == 0) {
              try {
                let saveAndUpdatePKBalance = await this.createOrUpdatePKBalance(
                  fieldId,
                  crop,
                  null,
                  pkBalanceData,
                  userId
                );
                if (saveAndUpdatePKBalance) {
                  await transactionalManager.save(
                    PKBalanceEntity,
                    saveAndUpdatePKBalance.saveAndUpdatePKBalance
                  );
                }
              } catch (error) {
                console.error(
                  `Error while saving PKBalance Data FieldId: ${fieldId} And Year:${crop?.Year}:`,
                  error
                );
              }
            } else {
              //call UpdateRecommendation function
              this.UpdateRecommendation.updateRecommendationsForField(
                crop.FieldID,
                crop.Year,
                request,
                userId
              )
                .then((res) => {
                  if (res === undefined) {
                    console.log(
                      "updateRecommendationAndOrganicManure returned undefined"
                    );
                  } else {
                    console.log(
                      "updateRecommendationAndOrganicManure result:",
                      res
                    );
                  }
                })
                .catch((error) => {
                  console.error(
                    "Error updating recommendation and organic manure:",
                    error
                  );
                });
            }
          }
          return {
            message: "Default crop saved and exiting early",
            Recommendations,
          };
        }
        const nutrientRecommendationnReqBody =
          await this.buildNutrientRecommendationReqBody(
            field,
            farm,
            soilAnalysisRecords,
            snsAnalysesData,
            crop,
            allPKBalanceData,
            allCropData,
            rb209CountryData.RB209CountryID,
            request,
            transactionalManager
          );

        const nutrientRecommendationsData =
          await this.rB209RecommendationService.postData(
            "Recommendation/Recommendations",
            nutrientRecommendationnReqBody
          );

        if (
          !nutrientRecommendationsData ||
          !nutrientRecommendationsData.calculations == null ||
          !nutrientRecommendationsData.adviceNotes == null ||
          nutrientRecommendationsData.data?.error
        ) {
          throw boom.badData(`${nutrientRecommendationsData.data.error}`);
        } else if (nutrientRecommendationsData.data?.Invalid) {
          throw boom.badRequest(
            `${nutrientRecommendationsData.data?.Invalid[0]}`
          );
        } else if (nutrientRecommendationsData.data?.missing) {
          throw boom.badRequest(
            `${nutrientRecommendationsData.data?.missing[0]}`
          );
        }

        const savedCrop = await transactionalManager.save(
          CropEntity,
          this.cropRepository.create({
            ...crop,
            CreatedByID: userId,
          })
        );

        const ManagementPeriods = [];
        let sumOfP205 = 0;
        let sumOfK20 = 0;
        for (const managementPeriod of cropData.ManagementPeriods) {
          const savedManagementPeriod = await transactionalManager.save(
            ManagementPeriodEntity,
            this.managementPeriodRepository.create({
              ...managementPeriod,
              CropID: savedCrop.ID,
              CreatedByID: userId,
            })
          );
          ManagementPeriods.push(savedManagementPeriod);
        }

        let savedRecommendation;
        if (crop.CropOrder == CropOrderMapper.SECONDCROP) {
          const firstCropData = await this.getFirstCropData(
            transactionalManager,
            field.ID,
            crop.Year
          );

          const cropFirstSavedRecommedndationData =
            await this.buildCropRecommendationData(
              firstCropData,
              latestSoilAnalysis,
              nutrientRecommendationsData,
              transactionalManager,
              userId
            );

          const managementPeriodData = await this.getManagementPeriods(
            firstCropData.ID
          );
          const cropSecondSavedRecommedndationData =
            await this.buildCropRecommendationData(
              savedCrop,
              latestSoilAnalysis,
              nutrientRecommendationsData,
              transactionalManager,
              userId
            );

          // const savedMultipleCropRecommendation =
          //   await this.saveRecommendationForMutipleCrops(
          //     transactionalManager,
          //     nutrientRecommendationsData,
          //     allRecommendations,
          //     allCropData,
          //     savedCrop,
          //     firstCropData,
          //     managementPeriodData,
          //     ManagementPeriods,
          //     latestSoilAnalysis,
          //     snsAnalysesData,
          //     userId
          //   );
          const isGrassCrops = await this.isGrassCropPresent(
            crop,
            transactionalManager
          );
          let savedFirstRecommendationComment = [];
          if (isGrassCrops) {
            savedFirstRecommendationComment =
              await this.saveMultipleRecommendation(
                Recommendations,
                cropFirstSavedRecommedndationData[0],
                cropSecondSavedRecommedndationData[0],
                transactionalManager,
                nutrientRecommendationsData,
                userId
              );
            console.log(
              "savedFirstRecommendationComment",
              savedFirstRecommendationComment
            );
          }
        } else {
          const cropNutrientsValue = {};
          nutrientRecommendationsData.calculations.forEach((recommendation) => {
            cropNutrientsValue[NutrientsMapper[recommendation.nutrientId]] =
              recommendation.cropNeedValue;
          });

          const existingRecommendation = allManagementPeriods.find(
            (mp) => mp.ID === ManagementPeriods[0].ID
          );
          // let savedData = await this.saveRecommendationsForMutipleCrops(
          //   transactionalManager,
          //   nutrientRecommendationsData,
          //   savedCrop,
          //   ManagementPeriods,
          //   latestSoilAnalysis,
          //   snsAnalysesData,
          //   userId
          // );

          const cropSavedRecommedndationData =
            await this.buildCropRecommendationData(
              savedCrop,
              latestSoilAnalysis,
              nutrientRecommendationsData,
              transactionalManager,
              userId
            );

          //savedRecommendation = savedData.firstCropSaveData;
          if (savedCrop.CropTypeID !== CropTypeMapper.GRASS) {
            savedRecommendation = cropSavedRecommedndationData[0];

            const RecommendationComments = [];
            const notesByNutrient =
              nutrientRecommendationsData?.adviceNotes?.reduce(
                (acc, adviceNote) => {
                  if (!acc[adviceNote?.nutrientId]) {
                    acc[adviceNote?.nutrientId] = [];
                  }
                  acc[adviceNote?.nutrientId].push(adviceNote?.note); // Group notes by nutrientId
                  return acc;
                },
                {}
              );
            for (const nutrientId in notesByNutrient) {
              const concatenatedNote =
                notesByNutrient[nutrientId]?.join(" <br/>"); // Concatenate notes for the same nutrientId

              // Create and save recommendation comment
              const savedRecommendationComment =
                await this.createAndSaveRecommendationComment(
                  nutrientId,
                  concatenatedNote,
                  savedRecommendation,
                  userId,
                  transactionalManager
                );

              RecommendationComments.push(savedRecommendationComment);
            }
            Recommendations.push({
              Recommendation: savedRecommendation,
              RecommendationComments,
            });
          } else {
            savedRecommendation = cropSavedRecommedndationData;
            Recommendations.push({
              Recommendation: savedRecommendation,
            });
          }
        }
        if (isSoilAnalysisHavePAndK) {
          if (cropPlanOfNextYear.length == 0) {
            try {
              let saveAndUpdatePKBalance = await this.createOrUpdatePKBalance(
                fieldId,
                crop,
                nutrientRecommendationsData.calculations,
                pkBalanceData,
                userId
              );
              if (saveAndUpdatePKBalance) {
                await transactionalManager.save(
                  PKBalanceEntity,
                  saveAndUpdatePKBalance.saveAndUpdatePKBalance
                );
              }
            } catch (error) {
              console.error(
                `Error while saving PKBalance Data FieldId: ${fieldId} And Year:${crop?.Year}:`,
                error
              );
            }
          } else {
            //calling updateRecommendations function
            this.UpdateRecommendation.updateRecommendationsForField(
              crop.FieldID,
              crop.Year,
              request,
              userId
            )
              .then((res) => {
                if (res === undefined) {
                  console.log(
                    "updateRecommendationAndOrganicManure returned undefined"
                  );
                } else {
                  console.log(
                    "updateRecommendationAndOrganicManure result:",
                    res
                  );
                }
              })
              .catch((error) => {
                console.error(
                  "Error updating recommendation and organic manure:",
                  error
                );
              });
          }
        }
      }

      return { Recommendations };
    });
  }

  async buildCropRecommendationData(
    cropData,
    latestSoilAnalysis,
    nutrientRecommendationsData,
    transactionalManager,
    userId
  ) {
    // First filter based on CropOrder from nutrientRecommendationsData
    const filteredData = await this.filterBySingleSequenceId(
      nutrientRecommendationsData,
      cropData.CropOrder
    );
    const cropID = cropData.ID;
    const results = [];

    // Get all unique defoliationIds from filtered calculations
    const defoliationIds = [
      ...new Set(filteredData.calculations.map((calc) => calc.defoliationId)),
    ];

    // Loop over each defoliationId
    for (const defoliationId of defoliationIds) {
      // Extract all calculations with this defoliationId
      const defoliationData = await this.extractNutrientData(
        filteredData.calculations,
        defoliationId
      );

      // Initialize crop recommendation object for this defoliation group
      const cropRecData = {
        CropN: null,
        CropP2O5: null,
        CropK2O: null,
        CropMgO: null,
        CropSO3: null,
        CropNa2O: null,
        CropLime: null,
        FertilizerN: null,
        FertilizerP2O5: null,
        FertilizerK2O: null,
        FertilizerMgO: null,
        FertilizerSO3: null,
        FertilizerNa2O: null,
        FertilizerLime: null,
        PH: latestSoilAnalysis?.PH?.toString() || null,
        SNSIndex:
          latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString() || null,
        PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString() || null,
        KIndex: latestSoilAnalysis?.PotassiumIndex?.toString() || null,
        MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString() || null,
        SIndex: null,
        NIndex: null,
      };

      // Loop through each calculation inside this defoliation group.
      // Each calculation corresponds to a nutrient for this defoliation.
      for (const calc of defoliationData) {
        // Use a switch to update cropRecData based on nutrientId
        switch (calc.nutrientId) {
          case 0:
            cropRecData.CropN = calc.recommendation;
            cropRecData.FertilizerN = calc.cropNeed;
            cropRecData.NIndex = calc.indexpH;
            break;
          case 1:
            cropRecData.CropP2O5 = calc.recommendation;
            cropRecData.FertilizerP2O5 = calc.cropNeed;
            break;
          case 2:
            cropRecData.CropK2O = calc.recommendation;
            cropRecData.FertilizerK2O = calc.cropNeed;
            break;
          case 3:
            cropRecData.CropMgO = calc.recommendation;
            cropRecData.FertilizerMgO = calc.cropNeed;
            break;
          case 4:
            cropRecData.CropNa2O = calc.recommendation;
            cropRecData.FertilizerNa2O = calc.cropNeed;
            break;
          case 5:
            cropRecData.CropSO3 = calc.recommendation;
            cropRecData.FertilizerSO3 = calc.cropNeed;
            break;
          case 6:
            cropRecData.CropLime = calc.recommendation;
            cropRecData.FertilizerLime = calc.cropNeed;
            break;
          default:
            console.warn(`Unhandled nutrientId: ${calc.nutrientId}`);
        }
      }

      // Retrieve the management period that matches the crop and defoliationId.
      const managementPeriods = await transactionalManager.find(
        ManagementPeriodEntity,
        { where: { CropID: cropID, Defoliation: defoliationId } }
      );

      if (!managementPeriods.length) continue;

      const managementPeriod = managementPeriods[0];

      // Check if a recommendation exists for this management period
      const existingRecommendation = await transactionalManager.findOne(
        RecommendationEntity,
        { where: { ManagementPeriodID: managementPeriod.ID } }
      );

      if (existingRecommendation) {
        // Update existing recommendation
        const updated = {
          ...existingRecommendation,
          ...cropRecData,
          ModifiedByID: userId,
          ModifiedOn: new Date(),
          Comments: `Reference Value: ${filteredData.referenceValue}\nVersion: ${filteredData.versionNumber}`,
        };
        const saved = await transactionalManager.save(
          RecommendationEntity,
          updated
        );
        results.push(saved);
      } else {
        // Create a new recommendation record
        const created = this.repository.create({
          ...cropRecData,
          ManagementPeriodID: managementPeriod.ID,
          Comments: `Reference Value: ${filteredData.referenceValue}\nVersion: ${filteredData.versionNumber}`,
          CreatedOn: new Date(),
          CreatedByID: userId,
        });
        const saved = await transactionalManager.save(
          RecommendationEntity,
          created
        );
        results.push(saved);
      }
    }

    return results;
  }

  async extractNutrientData(calculations, defoliationId) {
    return calculations.filter((c) => c.defoliationId === defoliationId);
  }

  async filterBySingleSequenceId(data, sequenceId) {
    const filteredCalculations = data.calculations.filter(
      (item) => item.sequenceId === sequenceId
    );

    const filteredAdviceNotes = data.adviceNotes.filter(
      (item) => item.sequenceId === sequenceId
    );

    return {
      ...data,
      calculations: filteredCalculations,
      adviceNotes: filteredAdviceNotes,
    };
  }

  async createAndSaveRecommendationComment(
    nutrientId,
    concatenatedNote,
    savedRecommendation,
    userId,
    transactionalManager
  ) {
    // Use the new function to create the recommendation comment
    const newComment = await this.createRecommendationComment(
      nutrientId,
      concatenatedNote,
      savedRecommendation,
      userId
    );

    // Save the new recommendation comment
    const savedRecommendationComment = await transactionalManager?.save(
      RecommendationCommentEntity,
      newComment
    );

    return savedRecommendationComment;
  }
  async createRecommendationComment(
    nutrientId,
    concatenatedNote,
    savedRecommendation,
    userId
  ) {
    // Create a new recommendation comment object
    return this.recommendationCommentRepository?.create({
      Nutrient: parseInt(nutrientId),
      Comment: concatenatedNote, // Store concatenated notes
      RecommendationID: savedRecommendation?.ID,
      CreatedOn: new Date(),
      CreatedByID: userId,
    });
  }
  async getCropsPlanFields(farmId, harvestYear, cropTypeID) {
    try {
      const storedProcedure =
        "EXEC dbo.spCrops_GetCropPlansFieldsByHarvestYear @farmId = @0, @harvestYear = @1, @cropTypeId = @2";
      const plans = await AppDataSource.query(storedProcedure, [
        farmId,
        harvestYear,
        cropTypeID,
      ]);
      return plans;
    } catch (error) {
      console.error(
        "Error while fetching crop plans fields join data using farmId, harvest year and crop typeId:",
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
    cropTypeId,
    cropOrder
  ) {
    try {
      cropOrder = cropOrder || 1;
      const storedProcedure =
        "EXEC dbo.spCrops_GetCropPlansManagementPeriodByHarvestYear @fieldIds = @0, @harvestYear = @1, @cropTypeId = @2 , @cropOrder = @3";
      const plans = await this.executeQuery(storedProcedure, [
        fieldIds,
        harvestYear,
        cropTypeId,
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
    userId
  ) {
    try {
      let pBalance = 0;
      let kBalance = 0;
      let saveAndUpdatePKBalance;
      if (crop.CropTypeID === CropTypeMapper.OTHER || crop.CropInfo1 === null) {
      } else {
        for (const recommendation of calculations) {
          switch (recommendation.nutrientId) {
            case 1:
              pBalance = pBalance - recommendation.cropNeed;
              break;
            case 2:
              kBalance = kBalance - recommendation.cropNeed;
              break;
          }
        }
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
