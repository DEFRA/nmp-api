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
    let grassCrop = null;

    if (crop.CropTypeID === CropTypeMapper.GRASS) {
      grassCrop = crop;
    } else {
      grassCrop = await transactionalManager.findOne(CropEntity, {
        where: {
          FieldID: crop.FieldID,
          Year: crop.Year,
          CropTypeID: CropTypeMapper.GRASS,
          ID: Not(crop.ID), // exclude the current crop
        },
      });
    }

    if (!grassCrop) {
      return {};
    }

    if (grassCrop.CropOrder === CropOrderMapper.FIRSTCROP) {
      return {
        cropOrder: grassCrop.CropOrder,
        swardTypeId: grassCrop.SwardTypeID,
        swardManagementId: grassCrop.SwardManagementID,
        defoliationSequenceId: grassCrop.DefoliationSequenceID,
        grassGrowthClassId: grassGrowthClass.grassGrowthClassId,
        yield: grassCrop.Yield,
        seasonId: grassCrop.Establishment,
      };
    }

    if (grassCrop.CropOrder === CropOrderMapper.SECONDCROP) {
      return {
        cropOrder: grassCrop.CropOrder,
        swardTypeId: grassCrop.SwardTypeID,
        swardManagementId: grassCrop.SwardManagementID,
        defoliationSequenceId: grassCrop.DefoliationSequenceID,
        grassGrowthClassId: grassGrowthClass.grassGrowthClassId,
        yield: grassCrop.Yield,
        seasonId: grassCrop.Establishment,
      };
    }

    return {};
  }

  async buildArableBody(
    dataMultipleCrops, // Accept either a single crop or multiple crops
    field,
    transactionalManager,
    cropTypesList
  ) {
    const arableBody = [];

    // Ensure dataMultipleCrops is always treated as an array
    const crops = Array.isArray(dataMultipleCrops)
      ? dataMultipleCrops
      : [dataMultipleCrops];

    // Iterate over crops (single or multiple)
    for (const crop of crops) {
      const currentCropType = cropTypesList.find(
        (cropType) => cropType.cropTypeId === crop.CropTypeID
      );

      if (!currentCropType || currentCropType.cropGroupId == null) {
        throw new HttpException(
          `Invalid CropTypeId for crop having field name ${field.Name}`,
          HttpStatus.BAD_REQUEST
        );
      }
      let expectedYield = crop.Yield,
        cropTypeLinkingData;
      if (expectedYield == null) {
        cropTypeLinkingData = await transactionalManager.findOne(
          CropTypeLinkingEntity,
          {
            where: {
              CropTypeID: crop.CropTypeID,
            },
          }
        );
        expectedYield = cropTypeLinkingData.DefaultYield;
      }

      if (crop.CropTypeID !== CropTypeMapper.GRASS) {
        arableBody.push({
          cropOrder: crop.CropOrder,
          cropGroupId: currentCropType.cropGroupId,
          cropTypeId: crop.CropTypeID,
          cropInfo1Id: crop.CropInfo1,
          cropInfo2Id: crop.CropInfo2,
          sowingDate: crop.SowingDate,
          expectedYield: expectedYield,
        });
      }
      // Add crop to arableBody based on its CropOrder
    }

    // Return the list of crops sorted by CropOrder (if necessary)
    return arableBody.sort((a, b) => a.cropOrder - b.cropOrder);
  }
  async findPreviousCrop(
    fieldID,
    currentYear,
    allCropData,
    transactionalManager
  ) {
    // Find all crops matching the previous year and field ID
    // Filter all crops to find those matching the previous year and field ID
    const previousCrops = allCropData?.filter(
      (crop) => crop.FieldID === fieldID && crop.Year === currentYear - 1
    );
    let prevCrop = null;

    if (previousCrops.length == 0) {
      // Check PreviousCrop
      prevCrop = await transactionalManager.findOne(PreviousCroppingEntity, {
        where: { FieldID: fieldID, HarvestYear: currentYear - 1 },
      });
      return prevCrop;
    }

    // If more than one crop is found, filter for CropOrder = 2
    if (previousCrops.length > 1) {
      return previousCrops.find(
        (crop) => crop.CropOrder === CropOrderMapper.SECONDCROP
      );
    }

    // Otherwise, return the first crop (or null if none are found)
    return previousCrops[0] || null;
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
      } else if (
        cropTypeID !== CropTypeMapper.GRASS &&
        cropTypeID !== CropTypeMapper.OTHER
      ) {
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
    transactionalManager,
    mannerOutputs,
    dataMultipleCrops,
    cropTypesList
  ) {
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
        StaticStrings.HTTP_STATUS_BAD_REQUEST
      );
    }
    const previousCrop =
      await this.CalculatePreviousCropService.findPreviousCrop(
        field.ID,
        crop.Year,
        transactionalManager
      );

    // Use the buildArableBody function to get the arable array
    const arableBody = await this.buildArableBody(
      dataMultipleCrops,
      field,
      transactionalManager,
      cropTypesList
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
        transactionalManager,
        crop.Year
      );
    } else {
      previousGrassId = await this.calculateGrassId.getPreviousGrassID(
        crop,
        transactionalManager,
        crop.Year
      );
    }

    const nutrientRecommendationnReqBody = {
      field: {
        fieldType: fieldType,
        multipleCrops:
          crop.CropOrder == CropOrderMapper.SECONDCROP ? true : false,
        arable: fieldType == FieldTypeMapper.GRASS ? [] : arableBody,
        grassland: {},
        grass:
          fieldType == FieldTypeMapper.BOTH ||
          fieldType == FieldTypeMapper.GRASS
            ? grassObject
            : {},
        soil: {
          soilTypeId: field.SoilTypeID,
          kReleasingClay: field.SoilReleasingClay,
          nvzActionProgrammeId: field.NVZProgrammeID,
          psc: 0, //need to find it
          pkBalance: {
            phosphate: pkBalanceData != null ? pkBalanceData.PBalance : 0,
            potash: pkBalanceData != null ? pkBalanceData.KBalance : 0,
          },
          soilAnalyses: [],
        },
        harvestYear: crop.Year,
        rainfallAverage: farm.Rainfall,
        excessWinterRainfall:
          excessRainfall?.WinterRainfall == null
            ? 0
            : excessRainfall.WinterRainfall, //need to find it
        mannerManures:
          mannerOutputs != null && mannerOutputs.length > 0 ? true : false,
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
        sulphur: true,
        lime: true,
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
          ...(soilAnalysis.SulphurDeficient != null && {
            sulphurDeficient: soilAnalysis.SulphurDeficient,
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
    if (mannerOutputs != null && mannerOutputs?.length > 0) {
      nutrientRecommendationnReqBody.field.mannerOutputs = mannerOutputs;
    }

    // Add SnsAnalyses data
    if (Array.isArray(snsAnalysesData)) {
      snsAnalysesData.forEach((analysis) => {
        const snsAnalysisData = {
          ...(analysis.SampleDate != null && {
            soilAnalysisDate: analysis.SampleDate,
          }),
          ...(analysis.SoilNitrogenSupplyIndex != null && {
            snsIndexId: analysis.SoilNitrogenSupplyIndex,
            snsMethodologyId: 4,
          }),
          ...(analysis.SNSCropOrder != null && {
            SNSCropOrder: analysis.SNSCropOrder,
          }),
        };

        // Only push if there's actual data
        if (Object.keys(snsAnalysisData).length > 0) {
          nutrientRecommendationnReqBody.field.soil.soilAnalyses.push(
            snsAnalysisData
          );
        }
      });
    } else if (snsAnalysesData) {
      const snsAnalysisData = {
        ...(snsAnalysesData.SampleDate != null && {
          soilAnalysisDate: snsAnalysesData.SampleDate,
        }),
        ...(snsAnalysesData.SoilNitrogenSupplyIndex != null && {
          snsIndexId: snsAnalysesData.SoilNitrogenSupplyIndex,
          snsMethodologyId: 4,
        }),
        ...(snsAnalysesData.SNSCropOrder != null && {
          SNSCropOrder: snsAnalysesData.SNSCropOrder,
        }),
      };

      // Only push if there's actual data
      if (Object.keys(snsAnalysisData).length > 0) {
        nutrientRecommendationnReqBody.field.soil.soilAnalyses.push(
          snsAnalysisData
        );
      }
    }

    if (previousCrop) {
      const cropType = cropTypesList.find(
        (cropType) => cropType?.cropTypeId === previousCrop?.CropTypeID
      );
      nutrientRecommendationnReqBody.field.previousCropping = {
        previousGrassId: grassHistoryID ? null : previousGrassId,
        previousCropGroupId:
          previousCrop?.CropTypeID == CropTypeMapper.GRASS
            ? null
            : grassHistoryID
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
        previousCropTypeId:
          previousCrop?.CropTypeID == CropTypeMapper.GRASS
            ? null
            : grassHistoryID
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
      "SulphurDeficient",
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

  async saveMultipleRecommendation(
    Recommendations,
    savedCrop,
    cropSaveData,
    transactionalManager,
    nutrientRecommendationsData,
    userId
  ) {
    const RecommendationComments = [];
    let cropNotes = [];

    const hasDefoliationIdInNotes =
      nutrientRecommendationsData.adviceNotes?.some((note) =>
        Object.prototype.hasOwnProperty.call(note, "defoliationId")
      );

    if (hasDefoliationIdInNotes) {
      const managementPeriod = await transactionalManager.find(
        ManagementPeriodEntity,
        {
          where: { ID: savedCrop.ManagementPeriodID },
        }
      );

      const defoliationValue = managementPeriod?.[0]?.Defoliation;

      cropNotes = nutrientRecommendationsData.adviceNotes.filter(
        (note) =>
          note.defoliationId === defoliationValue &&
          note.sequenceId === savedCrop.CropOrder
      );
    } else {
      cropNotes = nutrientRecommendationsData.adviceNotes?.filter(
        (note) => note.sequenceId === savedCrop.CropOrder
      );
    }

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

    const cropNotesByNutrientId = groupNotesByNutrientId(cropNotes);
    //const secondCropNotesByNutrientId = groupNotesByNutrientId(secondCropNotes);

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

    // Handle notes for the crop
    await saveComments(cropNotesByNutrientId, cropSaveData);

    // Push the first crop recommendation and its comments to the final result array
    Recommendations.push({
      Recommendation: cropSaveData, // First crop recommendation
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
      NBalance: null,
      ManureN: null,
      FertilizerN: null,
      CropP2O5: null,
      ManureP2O5: null,
      PBalance: null,
      FertilizerP2O5: null,
      CropK2O: null,
      KBalance: null,
      FertilizerK2O: null,
      ManureK2O: null,
      CropMgO: null,
      MgBalance: null,
      ManureMgO: null,
      FertilizerMgO: null,
      CropSO3: null,
      SBalance: null,
      ManureSO3: null,
      FertilizerSO3: null,
      CropNa2O: null,
      NaBalance: null,
      ManureNa2O: null,
      FertilizerNa2O: null,
      CropLime: null,
      LimeBalance: null,
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
    const fieldIDs = crops.map((cropData) => cropData.Crop.FieldID); //22 //23
    const {
      allCropData,
      allManagementPeriods,
      allRecommendations,
      allPKBalanceData,
    } = await this.fetchAllDataByFieldIDs(fieldIDs, transactionalManager);

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
        await this.generateRecommendations.generateRecommendations(
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
