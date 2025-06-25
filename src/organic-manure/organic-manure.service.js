const { AppDataSource } = require("../db/data-source");
const { MoreThan } = require("typeorm");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  FarmManureTypeEntity,
} = require("../db/entity/farm-manure-type.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { BaseService } = require("../base/base.service");
const { ManureTypeEntity } = require("../db/entity/manure-type.entity");
const {
  CalculateNutrientOfftakeDto,
} = require("../vendors/rb209/recommendation/dto/recommendation.dto");
const MannerCalculateNutrientsService = require("../vendors/manner/calculate-nutrients/calculate-nutrients.service");
const RB209ArableService = require("../vendors/rb209/arable/arable.service");
const {
  RB209RecommendationService,
} = require("../vendors/rb209/recommendation/recommendation.service");
const {
  RecommendationCommentEntity,
} = require("../db/entity/recommendation-comment.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const {
  CropTypeLinkingEntity,
} = require("../db/entity/crop-type-linking.entity");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const RB209FieldService = require("../vendors/rb209/field/field.service");
const MannerManureTypesService = require("../vendors/manner/manure-types/manure-types.service");
const { LessThanOrEqual, Between, Not, In } = require("typeorm");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const {
  UpdateRecommendation,
} = require("../shared/updateRecommendation.service");
const { SoilTypeSoilTextureEntity } = require("../db/entity/soil-type-soil-texture.entity");
const { CountryEntity } = require("../db/entity/country.entity");
const RB209SoilService = require("../vendors/rb209/soil/soil.service");
const { NutrientMapperNames } = require("../constants/nutrient-mapper-names");
const { UpdateRecommendationChanges } = require("../shared/updateRecommendationsChanges");
const { GrassGrowthService } = require("../grass-growth-plan/grass-growth-plan.service");
const { ExcessRainfallsEntity } = require("../db/entity/excess-rainfalls.entity");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { CalculateMannerOutputService } = require("../shared/calculate-manner-output-service");
const { FieldTypeMapper } = require("../constants/field-type-mapper");
const { CalculateGrassHistoryAndPreviousGrass } = require("../shared/calculate-previous-grass-id.service");

class OrganicManureService extends BaseService {
  constructor() {
    super(OrganicManureEntity);
    this.repository = AppDataSource.getRepository(OrganicManureEntity);
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.managementPeriodRepository = AppDataSource.getRepository(
      ManagementPeriodEntity
    );
    this.farmManureTypeRepository =
      AppDataSource.getRepository(FarmManureTypeEntity);
    this.manureTypeRepository = AppDataSource.getRepository(ManureTypeEntity);
    this.MannerCalculateNutrientsService =
      new MannerCalculateNutrientsService();
    this.rB209ArableService = new RB209ArableService();
    this.rB209RecommendationService = new RB209RecommendationService();
    this.RB209SoilService = new RB209SoilService();
    this.CalculateMannerOutput = new CalculateMannerOutputService();
    this.calculateGrassId = new CalculateGrassHistoryAndPreviousGrass();
    this.recommendationCommentRepository = AppDataSource.getRepository(
      RecommendationCommentEntity
    );
    this.fieldRepository = AppDataSource.getRepository(FieldEntity);
    this.farmRepository = AppDataSource.getRepository(FarmEntity);
    this.CropTypeLinkingRepository = AppDataSource.getRepository(
      CropTypeLinkingEntity
    );
    this.soilAnalysisRepository =
      AppDataSource.getRepository(SoilAnalysisEntity);
    this.RecommendationRepository =
      AppDataSource.getRepository(RecommendationEntity);
    this.RB209FieldService = new RB209FieldService();
    this.MannerManureTypesService = new MannerManureTypesService();
    this.snsAnalysisRepository = AppDataSource.getRepository(SnsAnalysesEntity);
    this.pkBalanceRepository = AppDataSource.getRepository(PKBalanceEntity);
    this.fertiliserRepository = AppDataSource.getRepository(
      FertiliserManuresEntity
    );
    this.UpdateRecommendation = new UpdateRecommendation();
    this.soilTypeTextureRepository = AppDataSource.getRepository(
      SoilTypeSoilTextureEntity
    );
    this.countryRepository = AppDataSource.getRepository(CountryEntity);
    this.UpdateRecommendationChanges = new UpdateRecommendationChanges();
    this.grassGrowthClass = new GrassGrowthService();
    this.excessRainfallRepository = AppDataSource.getRepository(
      ExcessRainfallsEntity
    );
  }

  async getTotalNitrogen(fieldId, fromDate, toDate, confirm, organicManureID) {
    // Ensure fromDate starts at 00:00:00 and toDate ends at 23:59:59
    const fromDateFormatted = new Date(fromDate);
    fromDateFormatted.setHours(0, 0, 0, 0); // Set time to start of the day

    const toDateFormatted = new Date(toDate);
    toDateFormatted.setHours(23, 59, 59, 999); // Set time to end of the day
    // const query = await this.repository
    //   .createQueryBuilder("organicManures")
    //   .select(
    //     "SUM(organicManures.N * organicManures.ApplicationRate)",
    //     "totalN"
    //   )
    //   .where("organicManures.ManagementPeriodID = :managementPeriodID", {
    //     managementPeriodID,
    //   })
    //   .andWhere(
    //     "organicManures.ApplicationDate BETWEEN :fromDate AND :toDate",
    //     { fromDate: fromDateFormatted, toDate: toDateFormatted }
    //   )
    //   .andWhere("organicManures.Confirm =:confirm", { confirm });

    const query = await this.repository
      .createQueryBuilder("O") // O = OrganicManures
      .select("SUM(O.N * O.ApplicationRate)", "totalN")
      .innerJoin("ManagementPeriods", "M", "O.ManagementPeriodID = M.ID")
      .innerJoin("Crops", "C", "M.CropID = C.ID")
      .where("C.FieldID = :fieldId", { fieldId }) // note lowercase 'fieldId'
      .andWhere("O.ApplicationDate BETWEEN :fromDate AND :toDate", {
        fromDate: fromDateFormatted,
        toDate: toDateFormatted,
      })
      .andWhere("O.Confirm = :confirm", { confirm });
    if (organicManureID != null) {
      query.andWhere("O.ID != :organicManureID", {
        organicManureID,
      });
    }
    const result = await query.getRawOne();

    return result.totalN;
  }
  async getTotalNitrogenIfIsGreenFoodCompost(
    fieldId,
    fromDate,
    toDate,
    confirm,
    isGreenFoodCompost,
    organicManureID
  ) {
    // Ensure fromDate starts at 00:00:00 and toDate ends at 23:59:59
    const fromDateFormatted = new Date(fromDate);
    fromDateFormatted.setHours(0, 0, 0, 0); // Set time to start of the day

    const toDateFormatted = new Date(toDate);
    toDateFormatted.setHours(23, 59, 59, 999); // Set time to end of the day
    // const query = this.repository
    //   .createQueryBuilder("organicManures")
    //   .select(
    //     "SUM(organicManures.N * organicManures.ApplicationRate)",
    //     "totalN"
    //   )
    //   .where("organicManures.ManagementPeriodID = :managementPeriodID", {
    //     managementPeriodID,
    //   })
    //   .andWhere(
    //     "organicManures.ApplicationDate BETWEEN :fromDate AND :toDate",
    //     {
    //       fromDate,
    //       toDate,
    //     }
    //   )
    //   .andWhere("organicManures.Confirm = :confirm", { confirm });

    // Add additional filtering for ManureTypeID when isGreenFoodCompost is true
    const query = await this.repository
      .createQueryBuilder("O") // O = OrganicManures
      .select("SUM(O.N * O.ApplicationRate)", "totalN")
      .innerJoin("ManagementPeriods", "M", "O.ManagementPeriodID = M.ID")
      .innerJoin("Crops", "C", "M.CropID = C.ID")
      .where("C.FieldID = :fieldId", { fieldId }) // note lowercase 'fieldId'
      .andWhere("O.ApplicationDate BETWEEN :fromDate AND :toDate", {
        fromDate: fromDateFormatted,
        toDate: toDateFormatted,
      })
      .andWhere("O.Confirm = :confirm", { confirm });
    if (isGreenFoodCompost) {
      query.andWhere("O.ManureTypeID IN (:...manureTypeIDs)", {
        manureTypeIDs: [24, 32],
      });
    }
    if (!isGreenFoodCompost) {
      query.andWhere("O.ManureTypeID NOT IN (:...manureTypeIDs)", {
        manureTypeIDs: [24, 32],
      });
    }
    if (organicManureID != null) {
      query.andWhere("O.ID != :organicManureID", {
        organicManureID,
      });
    }
    console.log("organicManureID", organicManureID);
    const result = await query.getRawOne();
    console.log("organicManureID", result.totalN);
    return result.totalN;
  }

  async getManureTypeIdsbyFieldAndYear(fieldId, year, confirm) {
    const cropId = (
      await this.cropRepository.findOne({
        where: { FieldID: fieldId, Year: year, Confirm: confirm },
      })
    )?.ID;

    const managementPeriodId = (
      await this.managementPeriodRepository.findOne({
        where: { CropID: cropId },
      })
    )?.ID;

    const organicManures = await this.repository.find({
      where: {
        ManagementPeriodID: managementPeriodId,
      },
    });

    const manureTypeIds = organicManures.map((data) => data.ManureTypeID);
    return manureTypeIds;
  }

  async getFirstCropData(transactionalManager, FieldID, Year) {
    const data = await transactionalManager.findOne(CropEntity, {
      where: {
        FieldID: FieldID,
        Year: Year,
        Confirm: false, // Or 0, depending on your schema
        CropOrder: 1,
      },
    });

    return data;
  }

  async getManagementPeriodId(id) {
    const data = await this.managementPeriodRepository.findOne({
      where: {
        CropID: id,
      },
      select: ["ID"], // Only select the ID column
    });

    return data?.ID; // Return only the ID field
  }

  async buildArableBody(
    dataMultipleCrops, // Accept either a single crop or multiple crops
    field,
    transactionalManager
  ) {
    const arableBody = [];

    // Ensure dataMultipleCrops is always treated as an array
    const crops = Array.isArray(dataMultipleCrops)
      ? dataMultipleCrops
      : [dataMultipleCrops];

    // Fetch cropTypes list once for all crops
    const cropTypesList = await this.rB209ArableService.getData(
      "/Arable/CropTypes"
    );

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
      // Add crop to arableBody based on its CropOrder
      if (crop.CropTypeID !== 140) {
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

    // Return the list of crops sorted by CropOrder (if necessary)
    return arableBody.sort((a, b) => a.cropOrder - b.cropOrder);
  }

  async getPKBalanceData(field, year, allPKBalanceData) {
    try {
      // Find the data by filtering allPKBalanceData
      const pkBalanceData = allPKBalanceData.find(
        (data) => data.FieldID === field.ID && data.Year === year
      );

      return pkBalanceData || null; // Return the found data or null if not found
    } catch (error) {
      console.error("Error fetching PK Balance data:", error);
      throw error; // Re-throw the error or handle it as needed
    }
  }
  async findPreviousCrop(fieldID, currentYear) {
    // Find all crops matching the previous year and field ID
    const previousCrops = await this.cropRepository.find({
      where: {
        FieldID: fieldID,
        Year: currentYear - 1,
      },
    });

    // If more than one crop is found, filter for CropOrder = 2
    if (previousCrops.length > 1) {
      return previousCrops.find((crop) => crop.CropOrder === 2);
    }

    // Otherwise, return the first crop (or null if none are found)
    return previousCrops[0] || null;
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
    if (crop.CropOrder === 1 && crop.CropTypeID === 140) {
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
    if (crop.CropOrder === 2) {
      if (crop.CropTypeID === 140) {
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

        if (firstCrop && firstCrop.CropTypeID === 140) {
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

  async isGrassCropPresent(crop, transaction) {
    if (crop.CropOrder === 1) {
      if (crop.CropTypeID === 140) {
        return true;
      } else {
        return false;
      }
    } else if (crop.CropOrder === 2) {
      if (crop.CropTypeID === 140) {
        return true;
      } else {
        const firstCropData = await this.getFirstCropData(
          transaction,
          crop.FieldID,
          crop.Year
        );
        if (firstCropData.CropTypeID === 140) {
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
        return FieldTypeMapper.GRASS; // Grass
      } else if (
        cropTypeID !== CropTypeMapper.GRASS &&
        cropTypeID !== CropTypeMapper.OTHER
      ) {
        return FieldTypeMapper.ARABLE;
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

    return FieldTypeMapper.ARABLE; // Default fallback
  }

  async buildNutrientRecommendationReqBody(
    field,
    farm,
    soilAnalysis,
    snsAnalysesData,
    dataMultipleCrops,
    crop,
    mannerOutputs,
    firstCropMannerOutput,
    firstCropData,
    organicManureData,
    OrganicManure,
    allPKBalanceData,
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
    const crops = Array.isArray(dataMultipleCrops)
      ? dataMultipleCrops
      : [dataMultipleCrops];

    // Check if there are multiple crops or a single crop
    const isMultipleCrops =
      Array.isArray(dataMultipleCrops) && dataMultipleCrops.length > 1;

    if (!cropType || cropType.cropGroupId === null) {
      throw new HttpException(
        `Invalid CropTypeId for crop having field name ${field.Name}`,
        HttpStatus.BAD_REQUEST
      );
    }
    const previousCrop = await this.findPreviousCrop(field.ID, crop.Year);

    const pkBalanceData = await this.getPKBalanceData(
      field.ID,
      crop.Year - 1,
      allPKBalanceData
    );
    const excessRainfall = await this.getWinterExcessRainfall(
      farm.ID,
      crop.Year
    );
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

    const arableBody = await this.buildArableBody(
      dataMultipleCrops,
      field,
      transactionalManager
    );
    const grassObject = await this.buildGrassObject(
      crop,
      field,
      grassGrowthClass,
      transactionalManager
    );
    const isCropGrass = await this.isGrassCropPresent(
      crop,
      transactionalManager
    );
    const fieldType = await this.determineFieldType(crop, transactionalManager);
    const nutrientRecommendationnReqBody = {
      field: {
        fieldType: fieldType,
        multipleCrops: dataMultipleCrops.length > 1 ? true : false,
        arable: crop.FieldType == FieldTypeMapper.GRASS ? [] : arableBody,
        grassland: {},
        grass:
          fieldType == FieldTypeMapper.BOTH ||
          crop.FieldType == FieldTypeMapper.GRASS
            ? grassObject
            : {},
        soil: {
          soilTypeId: field.SoilTypeID,
          kReleasingClay: field.SoilReleasingClay,
          nvzActionProgrammeId: field.NVZProgrammeID,
          psc:
            excessRainfall?.WinterRainfall != null
              ? excessRainfall.WinterRainfall
              : 0, //TODO:: need to find it, //TODO:: need to find it
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
        excessWinterRainfall: 0, //TODO:: need to find it
        mannerManures: true,
        organicMaterials: [],
        mannerOutputs: [],
        previousCropping: {},
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
    // If firstCropMannerOutput and firstCropData are available, add them to mannerOutputs array
    // if (firstCropMannerOutput && firstCropData) {
    //   nutrientRecommendationnReqBody.field.mannerOutputs.push({
    //     id: firstCropData.CropOrder,
    //     totalN: firstCropMannerOutput.data.totalN,
    //     availableN: firstCropMannerOutput.data.currentCropAvailableN,
    //     totalP: firstCropMannerOutput.data.totalP2O5,
    //     availableP: firstCropMannerOutput.data.cropAvailableP2O5,
    //     totalK: firstCropMannerOutput.data.totalK2O,
    //     availableK: firstCropMannerOutput.data.cropAvailableK2O,
    //     totalS: firstCropMannerOutput.data.totalSO3,
    //     availableS: firstCropMannerOutput.data.cropAvailableSO3,
    //     totalM: firstCropMannerOutput.data.totalMgO,
    //   });
    // }

    // if (dataMultipleCrops.length > 1 && mannerOutputs?.data) {
    //   // Add current crop mannerOutputs or OrganicManure data
    //   nutrientRecommendationnReqBody.field.mannerOutputs.push({
    //     id: firstCropMannerOutput ? 2 : 1,
    //     totalN: mannerOutputs.data
    //       ? mannerOutputs.data.totalN
    //       : OrganicManure.TotalN,
    //     availableN: mannerOutputs.data
    //       ? mannerOutputs.data.currentCropAvailableN
    //       : OrganicManure.AvailableN,
    //     totalP: mannerOutputs.data
    //       ? mannerOutputs.data.totalP2O5
    //       : OrganicManure.TotalP2O5,
    //     availableP: mannerOutputs.data
    //       ? mannerOutputs.data.cropAvailableP2O5
    //       : OrganicManure.AvailableP2O5,
    //     totalK: mannerOutputs.data
    //       ? mannerOutputs.data.totalK2O
    //       : OrganicManure.TotalK2O,
    //     availableK: mannerOutputs.data
    //       ? mannerOutputs.data.cropAvailableK2O
    //       : OrganicManure.AvailableK2O,
    //     totalS: mannerOutputs.data
    //       ? mannerOutputs.data.totalSO3
    //       : OrganicManure.TotalSO3,
    //     availableS: mannerOutputs.data
    //       ? mannerOutputs.data.cropAvailableSO3
    //       : OrganicManure.AvailableSO3,
    //     totalM: mannerOutputs.data
    //       ? mannerOutputs.data.totalMgO
    //       : OrganicManure.TotalMgO,
    //   });
    // } else if (dataMultipleCrops.length < 2) {
    //   // Add current crop mannerOutputs or OrganicManure data
    //   nutrientRecommendationnReqBody.field.mannerOutputs.push({
    //     id: crop.CropOrder,
    //     totalN: mannerOutputs
    //       ? mannerOutputs?.data.totalN
    //       : OrganicManure.TotalN,
    //     availableN: mannerOutputs
    //       ? mannerOutputs?.data.currentCropAvailableN
    //       : OrganicManure.AvailableN,
    //     totalP: mannerOutputs
    //       ? mannerOutputs?.data.totalP2O5
    //       : OrganicManure.TotalP2O5,
    //     availableP: mannerOutputs
    //       ? mannerOutputs?.data.cropAvailableP2O5
    //       : OrganicManure.AvailableP2O5,
    //     totalK: mannerOutputs
    //       ? mannerOutputs?.data.totalK2O
    //       : OrganicManure.TotalK2O,
    //     availableK: mannerOutputs
    //       ? mannerOutputs?.data.cropAvailableK2O
    //       : OrganicManure.AvailableK2O,
    //     totalS: mannerOutputs
    //       ? mannerOutputs?.data.totalSO3
    //       : OrganicManure.TotalSO3,
    //     availableS: mannerOutputs
    //       ? mannerOutputs?.data.cropAvailableSO3
    //       : OrganicManure.AvailableSO3,
    //     totalM: mannerOutputs
    //       ? mannerOutputs?.data.totalMgO
    //       : OrganicManure.TotalMgO,
    //   });
    // }

    nutrientRecommendationnReqBody.field.mannerOutputs = mannerOutputs;

    // Add SoilAnalyses data
    if (soilAnalysis) {
      soilAnalysis.forEach((soilAnalysis) => {
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

        // Only push if there's actual data
        if (Object.keys(soilAnalysisData).length > 0) {
          nutrientRecommendationnReqBody.field.soil.soilAnalyses.push(
            soilAnalysisData
          );
        }
      });
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
            : cropType?.cropGroupId !== undefined &&
              cropType?.cropGroupId !== null
            ? cropType?.cropGroupId
            : null,
        previousCropTypeId:
          previousCrop?.CropTypeID == CropTypeMapper.GRASS
            ? null
            : previousCrop.CropTypeID !== undefined &&
              previousCrop.CropTypeID !== null
            ? previousCrop.CropTypeID
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

  async buildManureApplications(
    managementPeriodID,
    organicManureData,
    organicManureAllData,
    request
  ) {
    // Filter the organicManureAllData for the given managementPeriodID
    const mulOrganicManuresData = organicManureAllData.filter(
      (manure) => manure.ManagementPeriodID === managementPeriodID
    );

    // Initialize an empty array for storing results
    const manureApplications = [];

    // Loop through the mulOrganicManuresData (array of objects)
    for (const manure of mulOrganicManuresData) {
      // Fetch manure type data for each manure by its ManureTypeID
      const manureTypeData = await this.getManureTypeData(
        manure.ManureTypeID,
        request
      );

      // Push each manure application details into the array
      manureApplications.push({
        manureDetails: {
          manureID: manure.ManureTypeID,
          name: manureTypeData.data.name,
          isLiquid: manureTypeData.data.isLiquid,
          dryMatter: manure.DryMatterPercent,
          totalN: manure.N,
          nH4N: manure.NH4N,
          uric: manure.UricAcid,
          nO3N: manure.NO3N,
          p2O5: manure.P2O5,
          sO3: manure.SO3,
          k2O: manure.K2O,
          mgO: manure.MgO,
        },
        applicationDate: new Date(manure.ApplicationDate)
          .toISOString()
          .split("T")[0],
        applicationRate: {
          value: manure.ApplicationRate,
          unit: "kg/hectare",
        },
        applicationMethodID: manure.ApplicationMethodID,
        incorporationMethodID: manure.IncorporationMethodID,
        incorporationDelayID: manure.IncorporationDelayID,
        autumnCropNitrogenUptake: {
          value: manure.AutumnCropNitrogenUptake,
          unit: "string",
        },
        endOfDrainageDate: new Date(manure.EndOfDrain)
          .toISOString()
          .split("T")[0],
        rainfallPostApplication: manure.Rainfall,
        cropNUptake: manure.AutumnCropNitrogenUptake,
        windspeedID: manure.WindspeedID,
        rainTypeID: manure.RainfallWithinSixHoursID,
        topsoilMoistureID: manure.MoistureID,
      });
    }
    if (organicManureData.ManagementPeriodID == managementPeriodID) {
      if (Object.keys(organicManureData).length !== 0) {
        // Handle the single organicManureData object and push its values into the array
        // Fetch manure type data for the single organicManureData object
        const manureTypeData = await this.getManureTypeData(
          organicManureData.ManureTypeID,
          request
        );

        manureApplications.push({
          manureDetails: {
            manureID: organicManureData.ManureTypeID,
            name: manureTypeData.data.name,
            isLiquid: manureTypeData.data.isLiquid,
            dryMatter: organicManureData.DryMatterPercent,
            totalN: organicManureData.N,
            nH4N: organicManureData.NH4N,
            uric: organicManureData.UricAcid,
            nO3N: organicManureData.NO3N,
            p2O5: organicManureData.P2O5,
            sO3: organicManureData.SO3,
            k2O: organicManureData.K2O,
            mgO: organicManureData.MgO,
          },
          applicationDate: new Date(organicManureData.ApplicationDate)
            .toISOString()
            .split("T")[0],
          applicationRate: {
            value: organicManureData.ApplicationRate,
            unit: "kg/hectare",
          },
          applicationMethodID: organicManureData.ApplicationMethodID,
          incorporationMethodID: organicManureData.IncorporationMethodID,
          incorporationDelayID: organicManureData.IncorporationDelayID,
          autumnCropNitrogenUptake: {
            value: organicManureData.AutumnCropNitrogenUptake,
            unit: "string",
          },
          endOfDrainageDate: new Date(organicManureData.EndOfDrain)
            .toISOString()
            .split("T")[0],
          rainfallPostApplication: organicManureData.Rainfall,
          cropNUptake: organicManureData.AutumnCropNitrogenUptake,
          windspeedID: organicManureData.WindspeedID,
          rainTypeID: organicManureData.RainfallWithinSixHoursID,
          topsoilMoistureID: organicManureData.MoistureID,
        });
      }
    }

    // Return the manure applications array
    return manureApplications;
  }

  async buildMannerOutputReq(
    farmData,
    fieldData,
    cropTypeLinkingData,
    organicManureData,
    manureApplications,
    soilTypeTextureData
  ) {
    return {
      runType: farmData.EnglishRules ? 3 : 4,
      postcode: farmData.ClimateDataPostCode.split(" ")[0],
      countryID: farmData.EnglishRules ? 1 : 2,
      field: {
        fieldID: fieldData.ID,
        fieldName: fieldData.Name,
        MannerCropTypeID: cropTypeLinkingData.MannerCropTypeID,
        topsoilID: soilTypeTextureData.TopSoilID,
        subsoilID: soilTypeTextureData.SubSoilID,
        isInNVZ: fieldData.IsWithinNVZ,
      },
      manureApplications,
    };
  }
  async checkIfManagementPeriodExistsInOrganicManure(
    ManagementPeriodID,
    organicManureAllData
  ) {
    // const managementPeriodExists = await this.repository.findOne({
    //   where: { ManagementPeriodID: organicManure.ManagementPeriodID },
    // });
    const managementPeriodExists = organicManureAllData.some(
      (data) => data.ManagementPeriodID === ManagementPeriodID
    );

    if (managementPeriodExists) {
      return true;
    } else {
      return false;
    }
  }

  async getSnsAnalysesData(id) {
    const data = await this.snsAnalysisRepository.findOne({
      where: { CropID: id },
    });

    return data;
  }

  async getSecondCropRecommendation(secondCropManagementPeriodId) {
    await this.RecommendationRepository.findOne({
      where: { ManagementPeriodID: secondCropManagementPeriodId.ID },
    });
  }
  async saveRecommendationForMultipleCrops(
    transactionalManager,
    nutrientRecommendationsData,
    mannerOutputs,
    firstCropMannerOutput,
    nutrientRecommendationnReqBody,
    OrganicManure,
    userId,
    cropData,
    dataMultipleCrops,
    latestSoilAnalysis,
    snsAnalysesData,
    allRecommendations
  ) {
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
      PH: latestSoilAnalysis?.PH?.toString(),
      SNSIndex: latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString() || null,
      PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString() || null,
      KIndex: latestSoilAnalysis?.PotassiumIndex?.toString() || null,
      MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString() || null,
      SIndex: null,
      NIndex: null,
    };

    let cropOrder2Data = {
      ...cropOrder1Data,
    };

    const firstCrop = dataMultipleCrops?.find((crop) => crop.CropOrder === 1);
    const secondCrop = dataMultipleCrops?.find((crop) => crop.CropOrder === 2);

    const recommendationMap = allRecommendations.reduce(
      (acc, recommendation) => {
        acc[recommendation.ManagementPeriodID] = recommendation;
        return acc;
      },
      {}
    );

    // Get ManagementPeriodID for first crop
    let firstCropSaveData = null;
    if (firstCrop) {
      const firstCropManagementPeriodId =
        await this.managementPeriodRepository.findOneBy({
          CropID: firstCrop.ID,
        });
      // mannerOutputs 2nd crop when
      for (const calculation of nutrientRecommendationsData?.calculations ||
        []) {
        if (calculation.sequenceId === 1) {
          switch (calculation.nutrientId) {
            case 0:
              cropOrder1Data.CropN = calculation.recommendation;
              cropOrder1Data.ManureN =
                firstCropMannerOutput ||
                (mannerOutputs && cropData.CropOrder == 1)
                  ? nutrientRecommendationnReqBody.field.mannerOutputs[0]
                      ?.availableN
                  : cropData.CropOrder == 1
                  ? OrganicManure.AvailableN
                  : null;
              cropOrder1Data.FertilizerN = calculation.cropNeed;
              cropOrder1Data.NIndex = calculation.indexpH;
              break;
            case 1:
              cropOrder1Data.CropP2O5 = calculation.recommendation;
              cropOrder1Data.ManureP2O5 =
                firstCropMannerOutput ||
                (mannerOutputs && cropData.CropOrder == 1)
                  ? nutrientRecommendationnReqBody.field.mannerOutputs[0]
                      ?.availableP
                  : cropData.CropOrder == 1
                  ? OrganicManure.AvailableP2O5
                  : null;
              cropOrder1Data.FertilizerP2O5 = calculation.cropNeed;
              break;
            case 2:
              cropOrder1Data.CropK2O = calculation.recommendation;
              cropOrder1Data.ManureK2O =
                firstCropMannerOutput ||
                (mannerOutputs && cropData.CropOrder == 1)
                  ? nutrientRecommendationnReqBody.field.mannerOutputs[0]
                      ?.availableK
                  : cropData.CropOrder == 1
                  ? OrganicManure.AvailableK2O
                  : null;
              cropOrder1Data.FertilizerK2O = calculation.cropNeed;
              break;
            case 3:
              cropOrder1Data.CropMgO = calculation.recommendation;
              cropOrder1Data.ManureMgO = null;
              cropOrder1Data.FertilizerMgO = calculation.cropNeed;
              break;
            case 4:
              cropOrder1Data.CropNa2O = calculation.recommendation;
              // cropOrder1Data.ManureNa2O = calculation.applied;
              cropOrder1Data.FertilizerNa2O = calculation.cropNeed;
              break;
            case 5:
              cropOrder1Data.CropSO3 = calculation.recommendation;
              cropOrder1Data.ManureSO3 =
                firstCropMannerOutput ||
                (mannerOutputs && cropData.CropOrder == 1)
                  ? nutrientRecommendationnReqBody.field.mannerOutputs[0]
                      ?.availableS
                  : cropData.CropOrder == 1
                  ? OrganicManure.AvailableSO3
                  : null;
              cropOrder1Data.FertilizerSO3 = calculation.cropNeed;
              break;
            case 6:
              cropOrder1Data.CropLime = calculation.recommendation;
              cropOrder1Data.ManureLime = null;
              cropOrder1Data.FertilizerLime = calculation.cropNeed;
              break;
          }
        }
      }

      firstCropSaveData = recommendationMap[firstCropManagementPeriodId.ID];

      if (firstCropSaveData) {
        firstCropSaveData = {
          ...firstCropSaveData,
          ...cropOrder1Data,
          ModifiedOn: new Date(),
          ModifiedByID: userId,
        };
        await transactionalManager.save(
          RecommendationEntity,
          firstCropSaveData
        );
      } else {
        firstCropSaveData = this.RecommendationRepository.create({
          ...cropOrder1Data,
          ManagementPeriodID: firstCropManagementPeriodId.ID,
          Comments:
            "Reference Value: " +
            nutrientRecommendationsData.referenceValue +
            "\nVersion: " +
            nutrientRecommendationsData.version,
          CreatedOn: new Date(),
          CreatedByID: userId,
        });
        await transactionalManager.save(
          RecommendationEntity,
          firstCropSaveData
        );
      }
    }

    // Get ManagementPeriodID for second crop if it exists
    let secondCropSaveData = null;
    if (secondCrop) {
      const secondCropManagementPeriodId =
        await this.managementPeriodRepository.findOneBy({
          CropID: secondCrop.ID,
        });

      nutrientRecommendationsData?.calculations?.forEach(
        async (calculation) => {
          if (calculation.sequenceId === 2) {
            switch (calculation.nutrientId) {
              case 0:
                cropOrder2Data.CropN = calculation.recommendation;
                cropOrder2Data.ManureN = mannerOutputs?.data
                  ? firstCropMannerOutput?.data && mannerOutputs?.data
                    ? nutrientRecommendationnReqBody.field.mannerOutputs[1]
                        .availableN
                    : nutrientRecommendationnReqBody.field.mannerOutputs[0]
                        .availableN
                  : cropData.CropOrder == 2
                  ? OrganicManure.AvailableN
                  : null;
                cropOrder2Data.FertilizerN = calculation.cropNeed;
                cropOrder2Data.NIndex = calculation.indexpH;
                break;
              case 1:
                cropOrder2Data.CropP2O5 = calculation.recommendation;
                cropOrder2Data.ManureP2O5 = mannerOutputs?.data
                  ? firstCropMannerOutput?.data && mannerOutputs?.data
                    ? nutrientRecommendationnReqBody.field.mannerOutputs[1]
                        ?.availableP
                    : nutrientRecommendationnReqBody.field.mannerOutputs[0]
                        ?.availableP
                  : cropData.CropOrder == 2
                  ? OrganicManure.AvailableP2O5
                  : null;
                cropOrder2Data.FertilizerP2O5 = calculation.cropNeed;
                break;
              case 2:
                cropOrder2Data.CropK2O = calculation.recommendation;
                cropOrder2Data.ManureK2O = mannerOutputs?.data
                  ? firstCropMannerOutput?.data && mannerOutputs?.data
                    ? nutrientRecommendationnReqBody.field.mannerOutputs[1]
                        ?.availableK
                    : nutrientRecommendationnReqBody.field.mannerOutputs[0]
                        ?.availableK
                  : cropData.CropOrder == 2
                  ? OrganicManure.AvailableK2O
                  : null;
                cropOrder2Data.FertilizerK2O = calculation.cropNeed;
                break;
              case 3:
                cropOrder2Data.CropMgO = calculation.recommendation;
                cropOrder2Data.ManureMgO = null;
                cropOrder2Data.FertilizerMgO = calculation.cropNeed;
                break;
              case 4:
                cropOrder2Data.CropNa2O = calculation.recommendation;
                // cropOrder2Data.ManureNa2O = calculation.applied;
                cropOrder2Data.FertilizerNa2O = calculation.cropNeed;
                break;
              case 5:
                cropOrder2Data.CropSO3 = calculation.recommendation;
                cropOrder2Data.ManureSO3 = mannerOutputs?.data
                  ? firstCropMannerOutput?.data && mannerOutputs?.data
                    ? nutrientRecommendationnReqBody.field.mannerOutputs[1]
                        ?.availableS
                    : nutrientRecommendationnReqBody.field.mannerOutputs[0]
                        ?.availableS
                  : cropData.CropOrder == 2
                  ? OrganicManure.AvailableSO3
                  : null;
                cropOrder2Data.FertilizerSO3 = calculation.cropNeed;
                break;
              case 6:
                cropOrder2Data.CropLime = calculation.recommendation;
                cropOrder2Data.ManureLime = null;
                cropOrder2Data.FertilizerLime = calculation.cropNeed;
                break;
            }
          }
        }
      );

      secondCropSaveData = recommendationMap[secondCropManagementPeriodId.ID];

      if (secondCropSaveData) {
        secondCropSaveData = {
          ...secondCropSaveData,
          ...cropOrder2Data,
          ModifiedOn: new Date(),
          ModifiedByID: userId,
        };
        await transactionalManager.save(
          RecommendationEntity,
          secondCropSaveData
        );
      } else {
        secondCropSaveData = this.RecommendationRepository.create({
          ...cropOrder2Data,
          ManagementPeriodID: secondCropManagementPeriodId.ID,
          Comments:
            "Reference Value: " +
            nutrientRecommendationsData.referenceValue +
            "\nVersion: " +
            nutrientRecommendationsData.version,
          CreatedOn: new Date(),
          CreatedByID: userId,
        });
        await transactionalManager.save(
          RecommendationEntity,
          secondCropSaveData
        );
      }
    }

    // Return the saved data for one or both crops based on the input
    if (secondCrop) {
      return { firstCropSaveData, secondCropSaveData };
    } else {
      return { firstCropSaveData };
    }
  }

  async saveRecommendationForOtherCrops(
    transactionalManager,
    OrganicManure,
    mannerOutputs,
    userId,
    latestSoilAnalysis,
    snsAnalysesData,
    allRecommendations
  ) {
    // Prepare cropOrderData with the values from latestSoilAnalysis, snsAnalysesData, and mannerOutputReq
    let cropOrderData = {
      CropN: null,
      ManureN: mannerOutputs
        ? mannerOutputs.data.currentCropAvailableN
        : OrganicManure.AvailableN,
      FertilizerN: null,
      CropP2O5: null,
      ManureP2O5: mannerOutputs
        ? mannerOutputs.data.cropAvailableP2O5
        : OrganicManure.AvailableP2O5,
      FertilizerP2O5: null,
      ManureK2O: mannerOutputs
        ? mannerOutputs.data.cropAvailableK2O
        : OrganicManure.AvailableK2O,
      CropMgO: null,
      ManureMgO: null,
      FertilizerMgO: null,
      CropSO3: null,
      ManureSO3: mannerOutputs
        ? mannerOutputs.data.cropAvailableSO3
        : OrganicManure.AvailableSO3,
      FertilizerSO3: null,
      CropNa2O: null, // assuming Na2O is present in mannerOutputReq if not remove this
      ManureNa2O: null,
      FertilizerNa2O: null, // assuming Na2O is present
      CropLime: null,
      ManureLime: null,
      FertilizerLime: null, // Assuming no data for FertilizerLime
      PH: latestSoilAnalysis?.PH?.toString() || null,
      SNSIndex: latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString() || null,
      PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString() || null,
      KIndex: latestSoilAnalysis?.PotassiumIndex?.toString() || null,
      MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString() || null,
      SIndex: null,
      NIndex: null,
    };

    // Check if there's an existing recommendation for the current OrganicManure.ManagementPeriodID
    let recommendation = allRecommendations.find(
      (rec) => rec.ManagementPeriodID === OrganicManure.ManagementPeriodID
    );

    if (recommendation) {
      // If a recommendation exists, update it
      recommendation = {
        ...recommendation,
        ...cropOrderData,
        ModifiedOn: new Date(),
        ModifiedByID: userId,
      };
      await transactionalManager.save(RecommendationEntity, recommendation);
    } else {
      // If no recommendation exists, create a new one
      recommendation = this.RecommendationRepository.create({
        ...cropOrderData,
        ManagementPeriodID: OrganicManure.ManagementPeriodID,
        Comments: "New recommendation created",
        CreatedOn: new Date(),
        CreatedByID: userId,
      });
      await transactionalManager.save(RecommendationEntity, recommendation);
    }

    return recommendation;
  }

  async saveOrganicManureForOtherCropType(
    organicManureData,
    mannerOutputs,
    transactionalManager,
    userId,
    organicManures
  ) {
    const savedOrganicManure = await transactionalManager.save(
      OrganicManureEntity,
      this.repository.create({
        ...organicManureData.OrganicManure,
        // AvailableN: mannerOutputs.data.currentCropAvailableN,
        // AvailableSO3: mannerOutputs.data.cropAvailableSO3,
        CreatedByID: userId,
        ...(organicManureData.OrganicManure.ID == 0 ? { ID: null } : {}),
      })
    );
    organicManures.push(savedOrganicManure);
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

  async findIndexId(nutrient, indexValue, nutrientIndicesData) {
    // Return null immediately if indexValue is null
    if (indexValue === null) {
      return null;
    }
    const nutrientData = nutrientIndicesData[nutrient];

    // if (nutrient === "Potassium" && indexValue === 2) {
    //   // Check only for "2+"
    //   for (const data of nutrientData) {
    //     console.log("data.index", data.index);
    //     if (data.index.trim() === "2+") {
    //       console.log("data.indexId", data.indexId);
    //       return data.indexId;
    //     }
    //   }
    // } //-2 == 2-
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
          record[nutrientIndexKey] =
            nutrientIndexId || record[nutrientIndexKey]; // Update the index with indexId
        }
      }
    }
    return soilAnalysisRecords;
  }
  async getManureTypeData(ManureTypeID, request) {
    try {
      const manureTypeData = await this.MannerManureTypesService.getData(
        `/manure-types/${ManureTypeID}`,
        request
      );
      return manureTypeData;
    } catch (error) {
      console.error("Error fetching manure type data:", error);
      throw new Error("Failed to get manure type data");
    }
  }
  async buildMannerOutputs(CropData, MannerOutput, managementPeriod) {
    return [
      {
        id: CropData.CropOrder,
        defoliationId: managementPeriod.Defoliation,
        totalN: MannerOutput.data.totalN,
        availableN: MannerOutput.data.currentCropAvailableN,
        totalP: MannerOutput.data.totalP2O5,
        availableP: MannerOutput.data.cropAvailableP2O5,
        totalK: MannerOutput.data.totalK2O,
        availableK: MannerOutput.data.cropAvailableK2O,
        totalS: MannerOutput.data.totalSO3,
        availableS: MannerOutput.data.cropAvailableSO3,
        totalM: MannerOutput.data.totalMgO,
      },
    ];
  }

  async calculateMannerOutputForOrganicManure(
    cropData,
    organicManure,
    organicManureAllData,
    farmData,
    fieldData,
    cropTypeLinkingData,
    soilTypeTextureData,
    transactionalManager,
    request
  ) {
    const allMannerOutputs = [];

    // Step 1: Get all crops for the field and year
    const allCrops = await transactionalManager.find(CropEntity, {
      where: {
        FieldID: cropData.FieldID,
        Year: cropData.Year,
      },
    });

    // Step 2: Process cropData first, then rest
    const cropsToProcess = [
      cropData,
      ...allCrops.filter((c) => c.ID !== cropData.ID),
    ];

    // Step 3: Loop through crops
    for (const crop of cropsToProcess) {
      // Fetch management periods for the crop
      const managementPeriods = await transactionalManager.find(
        ManagementPeriodEntity,
        { where: { CropID: crop.ID } }
      );

      // Separate periods: one matching organicManure.ManagementPeriodID, then others
      const matchingPeriod = managementPeriods.find(
        (p) => p.ID === organicManure.ManagementPeriodID
      );
      const otherPeriods = managementPeriods.filter(
        (p) => p.ID !== organicManure.ManagementPeriodID
      );

      const orderedPeriods = matchingPeriod
        ? [matchingPeriod, ...otherPeriods]
        : otherPeriods;

      // Step 4: Process each management period
      for (const period of orderedPeriods) {
        const managementPeriodID = period.ID;

        // 4.1: Build manureApplications
        const manureApplications = await this.buildManureApplications(
          managementPeriodID,
          organicManure,
          organicManureAllData,
          request
        );
        let mannerOutputReq = null;
        // 4.2: Build mannerOutputReq
        if (manureApplications.length > 0) {
          mannerOutputReq = await this.buildMannerOutputReq(
            farmData,
            fieldData,
            cropTypeLinkingData,
            organicManure,
            manureApplications,
            soilTypeTextureData
          );
        } else {
          console.log("there is no manure for the crop");
        }
        let mannerOutput = null;
        // 4.3: Post to calculate nutrients
        if (mannerOutputReq) {
          mannerOutput = await this.MannerCalculateNutrientsService.postData(
            "/calculate-nutrients",
            mannerOutputReq,
            request
          );
        }
        let output = [];
        // 4.4: Build output and add to final array
        if (mannerOutput) {
          output = await this.buildMannerOutputs(crop, mannerOutput, period);
        }
        allMannerOutputs.push(...output);
      }
    }

    return allMannerOutputs;
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

  async buildCropRecommendationData(
    cropData,
    latestSoilAnalysis,
    nutrientRecommendationsData,
    transactionalManager,
    userId,
    mannerOutputs
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
      let relevantMannerOutput = null;
      if (mannerOutputs != null) {
        relevantMannerOutput =
          mannerOutputs.find(
            (m) =>
              m.defoliationId === defoliationId && m.id === cropData.CropOrder
          ) ?? null;
      }

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
            cropRecData.ManureN =
              relevantMannerOutput != null
                ? relevantMannerOutput?.availableN
                : null;
            cropRecData.NIndex = calc.indexpH;
            break;
          case 1:
            cropRecData.CropP2O5 = calc.recommendation;
            cropRecData.ManureP2O5 =
              relevantMannerOutput != null
                ? relevantMannerOutput?.availableP
                : null;
            cropRecData.FertilizerP2O5 = calc.cropNeed;
            break;
          case 2:
            cropRecData.CropK2O = calc.recommendation;
            cropRecData.ManureK2O =
              relevantMannerOutput != null
                ? relevantMannerOutput?.availableK
                : null;
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
            cropRecData.ManureSO3 =
              relevantMannerOutput != null
                ? relevantMannerOutput?.availableS
                : null;
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

  async saveMultipleRecommendation(
    Recommendations,
    savedCrop,
    cropSaveData,
    transactionalManager,
    nutrientRecommendationsData,
    userId
  ) {
    const RecommendationComments = [];

    // Separate advice notes by sequenceId for crop (sequenceId = croporder)
    const cropNotes = nutrientRecommendationsData.adviceNotes?.filter(
      (note) => note.sequenceId === savedCrop.CropOrder
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

  async createOrganicManuresWithFarmManureType(request, body, userId) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      let savedFarmManureType;
      let farmManureTypeData;
      const organicManures = [];
      const organicManureAllData = await this.repository.find();
      const cropPlanAllData = await this.cropRepository.find({
        select: ["ID", "FieldID", "Year"],
      });
      const managementPeriodAllData =
        await this.managementPeriodRepository.find();
      const soilAnalysisAllData = await this.soilAnalysisRepository.find();
      const fertiliserAllData = await this.fertiliserRepository.find();
      const allRecommendations = await this.RecommendationRepository.find();
      const allPKBalanceData = await this.pkBalanceRepository.find();
      for (const organicManureData of body.OrganicManures) {
        const { OrganicManure } = organicManureData;
        if (
          OrganicManure.NH4N + OrganicManure.NO3N + OrganicManure.UricAcid >
          OrganicManure.N
        ) {
          throw new BadRequestException(
            "NH4N + NO3N + UricAcid must be less than or equal to TotalN"
          );
        }
        const newOrganicManure =
          await this.checkIfManagementPeriodExistsInOrganicManure(
            OrganicManure.ManagementPeriodID,
            organicManureAllData
          );

        // Convert the Date object to YYYY-MM-DD string format
        const applicationDateObj = new Date(OrganicManure.ApplicationDate);

        // Convert the Date object to YYYY-MM-DD format
        const applicationDate = applicationDateObj.toISOString().split("T")[0]; // returns a Date object
        const endOfDrainageDateObj = new Date(OrganicManure.EndOfDrain);
        const endOfDrainageDate = endOfDrainageDateObj
          .toISOString()
          .split("T")[0];

        const mannerManureTypeData =
          await this.MannerManureTypesService.getData(
            `/manure-types/${OrganicManure.ManureTypeID}`,
            request
          );

        const manureTypeData = mannerManureTypeData.data;

        const managementPeriodData =
          await this.managementPeriodRepository.findOneBy({
            ID: OrganicManure.ManagementPeriodID,
          });

        const cropData = await this.cropRepository.findOneBy({
          ID: managementPeriodData.CropID,
        });
        const fieldData = await this.fieldRepository.findOneBy({
          ID: cropData.FieldID,
        });
        const farmData = await this.farmRepository.findOneBy({
          ID: organicManureData.FarmID,
        });
        const rb209CountryData = await transactionalManager.findOne(
          CountryEntity,
          {
            where: {
              ID: farmData.CountryID,
            },
          }
        );
        const cropTypeLinkingData =
          await this.CropTypeLinkingRepository.findOneBy({
            CropTypeID: cropData.CropTypeID,
          });

        const soilAnalsisData = soilAnalysisAllData.filter((soilAnalyses) => {
          return soilAnalyses.FieldID === cropData.FieldID;
        });
        const soilTypeTextureData =
          await this.soilTypeTextureRepository.findOneBy({
            SoilTypeID: fieldData.SoilTypeID,
          });
        let isSoilAnalysisHavePAndK = false;
        if (soilAnalsisData) {
          isSoilAnalysisHavePAndK = soilAnalsisData.some(
            (item) =>
              item.PhosphorusIndex !== null || item.PotassiumIndex !== null
          )
            ? true
            : false;
        }
        let firstCrop,
          manureApplicationsFirstCrop = null,
          mannerOutputFirstReq = null,
          firstCropMannerOutput = null,
          mannerOutputs = null,
          mannerOutputReq = null;
        let firstCropOrganicManure = {};
        let firstCropManagementPeriods;
        const dataMultipleCrops = await this.cropRepository.find({
          where: {
            FieldID: fieldData.ID,
            Year: cropData.Year,
            Confirm: false,
          },
        });

        let manureApplications = null;
        mannerOutputs = await this.calculateMannerOutputForOrganicManure(
          cropData,
          OrganicManure,
          organicManureAllData,
          farmData,
          fieldData,
          cropTypeLinkingData,
          soilTypeTextureData,
          transactionalManager,
          request
        );
        // if (dataMultipleCrops.length > 1) {
        //   firstCrop = await this.getFirstCropData(
        //     transactionalManager,
        //     fieldData.ID,
        //     cropData.Year
        //   );
        //   firstCropManagementPeriods = managementPeriodAllData.find(
        //     (mp) => mp.CropID == firstCrop.ID
        //   );

        //   const checkFirstCropOrganicManure =
        //     await this.checkIfManagementPeriodExistsInOrganicManure(
        //       firstCropManagementPeriods.ID,
        //       organicManureAllData
        //     );

        //   if (cropData.CropOrder == 1 && checkFirstCropOrganicManure) {
        //     manureApplicationsFirstCrop = await this.buildManureApplications(
        //       firstCropManagementPeriods.ID,
        //       OrganicManure,
        //       organicManureAllData,
        //       request
        //     );
        //   } else if (checkFirstCropOrganicManure) {
        //     manureApplicationsFirstCrop = await this.buildManureApplications(
        //       firstCropManagementPeriods.ID,
        //       firstCropOrganicManure,
        //       organicManureAllData,
        //       request
        //     );
        //   } else if (cropData.CropOrder == 1) {
        //     manureApplicationsFirstCrop = await this.buildManureApplications(
        //       firstCropManagementPeriods.ID,
        //       OrganicManure,
        //       organicManureAllData,
        //       request
        //     );
        //   }
        //   console.log(
        //     "manureApplicationsFirstCrop",
        //     manureApplicationsFirstCrop
        //   );
        //   if (manureApplicationsFirstCrop != null) {
        //     mannerOutputFirstReq = await this.buildMannerOutputReq(
        //       farmData,
        //       fieldData,
        //       cropTypeLinkingData,
        //       organicManureData,
        //       manureApplicationsFirstCrop,
        //       soilTypeTextureData
        //     );
        //   }
        //   console.log("mannerOutputFirstReq", mannerOutputFirstReq);
        //   if (mannerOutputFirstReq != null) {
        //     firstCropMannerOutput =
        //       await this.MannerCalculateNutrientsService.postData(
        //         "/calculate-nutrients",
        //         mannerOutputFirstReq,
        //         request
        //       );
        //   }
        //   console.log("firstCropMannerOutput", firstCropMannerOutput);
        //   // Find the crop where CropOrder == 2
        //   const secondCrop = dataMultipleCrops.find(
        //     (crop) => crop.CropOrder == 2
        //   );
        //   const secondCropManagementPeriods = managementPeriodAllData.find(
        //     (mp) => mp.CropID == secondCrop.ID
        //   );

        //   const checkSecondCropOrganicManure =
        //     await this.checkIfManagementPeriodExistsInOrganicManure(
        //       secondCropManagementPeriods.ID,
        //       organicManureAllData
        //     );
        //   if (cropData.CropOrder == 2 && checkSecondCropOrganicManure) {
        //     manureApplications = await this.buildManureApplications(
        //       secondCropManagementPeriods.ID,
        //       OrganicManure,
        //       organicManureAllData,
        //       request
        //     );
        //   } else if (checkSecondCropOrganicManure) {
        //     manureApplications = await this.buildManureApplications(
        //       secondCropManagementPeriods.ID,
        //       firstCropOrganicManure,
        //       organicManureAllData,
        //       request
        //     );
        //   } else if (cropData.CropOrder == 2) {
        //     manureApplications = await this.buildManureApplications(
        //       secondCropManagementPeriods.ID,
        //       OrganicManure,
        //       organicManureAllData,
        //       request
        //     );
        //   }
        //   if (manureApplications != null) {
        //     mannerOutputReq = await this.buildMannerOutputReq(
        //       farmData,
        //       fieldData,
        //       cropTypeLinkingData,
        //       organicManureData,
        //       manureApplications,
        //       soilTypeTextureData
        //     );
        //   }
        //   if (mannerOutputReq != null) {
        //     mannerOutputs = await this.MannerCalculateNutrientsService.postData(
        //       "/calculate-nutrients",
        //       mannerOutputReq,
        //       request
        //     );
        //   }
        // } else {
        //   manureApplications = await this.buildManureApplications(
        //     OrganicManure.ManagementPeriodID,
        //     OrganicManure,
        //     organicManureAllData,
        //     request
        //   );
        // }
        // console.log("manureApplications", manureApplications);

        // if (newOrganicManure == true) {
        //   mannerOutputReq = await this.buildMannerOutputReq(
        //     farmData,
        //     fieldData,
        //     cropTypeLinkingData,
        //     organicManureData,
        //     manureApplications,
        //     soilTypeTextureData
        //   );
        // } else if (newOrganicManure == false) {
        //   // mannerOutputReq = {
        //   //   runType: farmData.EnglishRules ? 3 : 4,
        //   //   postcode: farmData.Postcode.split(" ")[0],
        //   //   countryID: farmData.EnglishRules ? 1 : 2,
        //   //   field: {
        //   //     fieldID: fieldData.ID,
        //   //     fieldName: fieldData.Name,
        //   //     MannerCropTypeID: cropTypeLinkingData.MannerCropTypeID,
        //   //     topsoilID: fieldData.TopSoilID,
        //   //     subsoilID: fieldData.SubSoilID,
        //   //     isInNVZ: fieldData.IsWithinNVZ,
        //   //   },
        //   //   manureApplications: [
        //   //     {
        //   //       manureDetails: {
        //   //         manureID: OrganicManure.ManureTypeID,
        //   //         name: manureTypeData.Name,
        //   //         isLiquid: manureTypeData.IsLiquid,
        //   //         dryMatter: OrganicManure.DryMatterPercent,
        //   //         totalN: OrganicManure?.N,
        //   //         nH4N: OrganicManure.NH4N,
        //   //         uric: OrganicManure.UricAcid,
        //   //         nO3N: OrganicManure.NO3N,
        //   //         p2O5: OrganicManure.P2O5,
        //   //         sO3: OrganicManure.SO3,
        //   //         k2O: OrganicManure.K2O,
        //   //         mgO: OrganicManure.MgO,
        //   //       },
        //   //       applicationDate: applicationDate,
        //   //       applicationRate: {
        //   //         value: OrganicManure.ApplicationRate,
        //   //         unit: "kg/hectare",
        //   //       },
        //   //       applicationMethodID: OrganicManure.ApplicationMethodID,
        //   //       incorporationMethodID: OrganicManure.IncorporationMethodID,
        //   //       incorporationDelayID: OrganicManure.IncorporationDelayID,
        //   //       autumnCropNitrogenUptake: {
        //   //         value: OrganicManure.AutumnCropNitrogenUptake,
        //   //         unit: "string",
        //   //       },
        //   //       endOfDrainageDate: endOfDrainageDate,
        //   //       rainfallPostApplication: OrganicManure.Rainfall,
        //   //       windspeedID: OrganicManure.WindspeedID,
        //   //       rainTypeID: OrganicManure.RainfallWithinSixHoursID,
        //   //       topsoilMoistureID: OrganicManure.MoistureID,
        //   //     },
        //   //   ],
        //   // };
        //   mannerOutputReq = null;
        // }

        // if (mannerOutputReq != null) {
        //   mannerOutputs = await this.MannerCalculateNutrientsService.postData(
        //     "/calculate-nutrients",
        //     mannerOutputReq,
        //     request
        //   );
        //   if (mannerOutputs.data == null) {
        //     console.error("Vendor manner api is not working");
        //   }
        // }
        // Call the new helper function to create mannerOutputReq
        const Errors = [];
        const {
          latestSoilAnalysis,
          errors: soilAnalysisErrors,
          soilAnalysisRecords,
        } = await this.handleSoilAnalysisValidation(
          fieldData.ID,
          fieldData.Name,
          cropData?.Year,
          rb209CountryData.RB209CountryID
        );
        Errors.push(...soilAnalysisErrors);
        if (Errors.length > 0)
          throw new HttpException(
            JSON.stringify(Errors),
            HttpStatus.BAD_REQUEST
          );

        let snsAnalysesData = null;

        // Check if more than one crop exists in dataMultipleCrops
        if (dataMultipleCrops.length > 1) {
          // Initialize snsAnalysesData as an array if multiple crops are found
          snsAnalysesData = [];

          // Loop through each crop in dataMultipleCrops
          for (const singleCrop of dataMultipleCrops) {
            // Retrieve snsAnalysesData for each crop by crop.ID
            const analysisData = await this.getSnsAnalysesData(singleCrop.ID);

            // Check if snsAnalysesData exists (not null or empty)
            if (analysisData) {
              // Push to snsAnalysesData array if snsAnalysesData is found
              snsAnalysesData.push(analysisData);
            }
          }
        } else if (dataMultipleCrops.length === 1) {
          // If there is only one crop, get snsAnalysesData for that crop
          const analysisData = await this.getSnsAnalysesData(cropData.ID);

          // Check if snsAnalysesData exists and assign directly as an object
          if (analysisData) {
            snsAnalysesData = analysisData; // Assign snsAnalysesData directly as an object
          }
        }

        let isNextYearPlanExist = false;
        let isNextYearOrganicManureExist = false;
        let isNextYearFertiliserExist = false;
        if (isSoilAnalysisHavePAndK) {
          const cropPlanForNextYear = cropPlanAllData.filter((cropPlan) => {
            return (
              cropPlan.FieldID === fieldData.ID && cropPlan.Year > cropData.Year
            );
          });

          console.log("cropPlanForNextYear", cropPlanForNextYear);

          if (cropPlanForNextYear.length > 0) {
            isNextYearPlanExist = true;
            for (const crop of cropPlanForNextYear) {
              console.log("CropID", crop.ID);
              const managementPeriodDataId = managementPeriodAllData
                .filter((manData) => manData.CropID === crop.ID)
                .map((manData) => manData.ID);
              console.log("managementPeriodDataId", managementPeriodDataId);
              if (managementPeriodDataId.length > 0) {
                const filterOrganicManure = organicManureAllData.filter(
                  (organicData) =>
                    organicData.ManagementPeriodID === managementPeriodDataId[0]
                );

                console.log("organicManureId", filterOrganicManure);
                const filterFertiliserData = fertiliserAllData.filter(
                  (fertData) =>
                    fertData.ManagementPeriodID === managementPeriodDataId[0]
                );
                console.log("fertiliserId", filterFertiliserData);

                if (
                  filterOrganicManure != null &&
                  filterOrganicManure.length > 0
                ) {
                  console.log("filterOrganicManure", filterFertiliserData);
                  isNextYearOrganicManureExist = true;
                }
                if (
                  filterFertiliserData != null &&
                  filterFertiliserData.length > 0
                ) {
                  console.log("filterOrganicManure", filterFertiliserData);
                  isNextYearFertiliserExist = true;
                }
              }
            }
          }
        }

        if (cropData.CropTypeID === CropTypeMapper.OTHER && cropData.CropInfo1 === null) {
          await this.saveOrganicManureForOtherCropType(
            organicManureData,
            mannerOutputs,
            transactionalManager,
            userId,
            organicManures
          );

          const saveOtherCropRecommendations =
            await this.saveRecommendationForOtherCrops(
              transactionalManager, // Transaction manager for transactional save
              OrganicManure, // OrganicManure data
              mannerOutputs, // Manner output request
              userId, // User ID
              latestSoilAnalysis, // Latest soil analysis data
              snsAnalysesData, // sns analyses data
              allRecommendations // All recommendations (or relevant recommendation data)
            );
          if (isSoilAnalysisHavePAndK) {
            if (
              (isNextYearPlanExist == true &&
                isNextYearOrganicManureExist == true) ||
              (isNextYearPlanExist == true && isNextYearFertiliserExist == true)
            ) {
              //call shreyash's function
              this.UpdateRecommendation.updateRecommendationsForField(
                cropData.FieldID,
                cropData.Year,
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
            } else {
              let pBalance = 0;
              let kBalance = 0;

              const pkBalanceData = await this.getPKBalanceData(
                fieldData.ID,
                cropData?.Year,
                allPKBalanceData
              );

              console.log("pkBalanceData", pkBalanceData);
              let updatePKBalance;
              // for (const manPeriodId of organicManureData.managementPeriodID) {

              if (pkBalanceData) {
                const fertiliserData = await this.getP205AndK20fromfertiliser(
                  OrganicManure.ManagementPeriodID
                );

                console.log("fertiliserData.length", fertiliserData.length);
                if (fertiliserData.p205 > 0 || fertiliserData.k20 > 0) {
                  //mannerOutputs.data.cropAvailableP2O5+pkBalanceData.PBalance
                  pBalance = fertiliserData.p205 - (0 - pkBalanceData.PBalance);
                  kBalance = fertiliserData.k20 - (0 - pkBalanceData.KBalance);
                } else {
                  pBalance = pBalance - (0 - pkBalanceData.PBalance);
                  kBalance = kBalance - (0 - pkBalanceData.KBalance);
                }

                const updateData = {
                  Year: cropData?.Year,
                  FieldID: fieldData.ID,
                  PBalance: pBalance,
                  KBalance: kBalance,
                };

                updatePKBalance = {
                  ...pkBalanceData,
                  ...updateData,
                  ModifiedOn: new Date(),
                  ModifiedByID: userId,
                };
              }
              if (updatePKBalance) {
                await transactionalManager.save(
                  PKBalanceEntity,
                  updatePKBalance
                );
              }
            }
          }
        } else {
          const nutrientRecommendationnReqBody =
            await this.buildNutrientRecommendationReqBody(
              fieldData,
              farmData,
              soilAnalysisRecords,
              snsAnalysesData,
              dataMultipleCrops,
              cropData,
              mannerOutputs,
              firstCropMannerOutput,
              firstCrop,
              organicManureData,
              OrganicManure,
              allPKBalanceData,
              rb209CountryData.RB209CountryID,
              request,
              transactionalManager
            );
          console.log(
            "nutrientRecommensssdationnReqBody",
            nutrientRecommendationnReqBody
          );
          console.log(
            "nutrientRecommensssdationnReqBodymannerOutputs:",
            nutrientRecommendationnReqBody.field.mannerOutputs[0].availableN
          );
          const nutrientRecommendationsData =
            await this.rB209RecommendationService.postData(
              "Recommendation/Recommendations",
              nutrientRecommendationnReqBody
            );

          console.log(
            "nutrientRecommendationsData",
            nutrientRecommendationsData
          );

          const savedOrganicManure = await transactionalManager.save(
            OrganicManureEntity,
            this.repository.create({
              ...organicManureData.OrganicManure,
              CreatedByID: userId,
              ...(organicManureData.OrganicManure.ID == 0 ? { ID: null } : {}),
            })
          );
          organicManures.push(savedOrganicManure);
          let arableNotes = nutrientRecommendationsData.adviceNotes;

          let savedRecommendation,
            savedRecommendationComment,
            Recommendations = [];
          for (const cropData of dataMultipleCrops) {
            savedRecommendation = await this.buildCropRecommendationData(
              cropData,
              latestSoilAnalysis,
              nutrientRecommendationsData,
              transactionalManager,
              userId,
              mannerOutputs
            );

            if (cropData.CropTypeID != CropTypeMapper.GRASS) {
              savedRecommendationComment =
                await this.saveMultipleRecommendation(
                  Recommendations,
                  cropData,
                  savedRecommendation[0],
                  transactionalManager,
                  nutrientRecommendationsData,
                  userId
                );
            }

            // If needed, handle or collect `testSavedData` here
            // e.g., push to an array
            // testResults.push(testSavedData);
          }

          // const savedData = await this.saveRecommendationForMultipleCrops(
          //   transactionalManager,
          //   nutrientRecommendationsData,
          //   mannerOutputs,
          //   firstCropMannerOutput,
          //   nutrientRecommendationnReqBody,
          //   OrganicManure,
          //   userId,
          //   cropData,
          //   dataMultipleCrops,
          //   latestSoilAnalysis,
          //   snsAnalysesData,
          //   allRecommendations
          // );
          // console.log("savedData", savedData);

          if (isSoilAnalysisHavePAndK) {
            if (
              isNextYearPlanExist == true ||
              isNextYearOrganicManureExist == true ||
              isNextYearFertiliserExist == true
            ) {
              // UpdateRecommendation
              this.UpdateRecommendation.updateRecommendationsForField(
                cropData.FieldID,
                cropData?.Year,
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
            } else {
              let pBalance = 0;
              let kBalance = 0;
              console.log(
                "organicManureData.managementPeriodID",
                OrganicManure.ManagementPeriodID
              );
              // for (const manPeriodId of organicManureData.managementPeriodID) {
              const fertiliserData = await this.getP205AndK20fromfertiliser(
                OrganicManure.ManagementPeriodID
              );
              let updatePKBalance;
              if (fertiliserData.p205 > 0 || fertiliserData.k20 > 0) {
                for (const recommendation of nutrientRecommendationsData.calculations) {
                  switch (recommendation.nutrientId) {
                    case 1:
                      pBalance = fertiliserData.p205 - recommendation.cropNeed;
                      break;
                    case 2:
                      kBalance = fertiliserData.k20 - recommendation.cropNeed;
                      break;
                  }
                }
              } else {
                for (const recommendation of nutrientRecommendationsData.calculations) {
                  switch (recommendation.nutrientId) {
                    case 1:
                      pBalance = pBalance - recommendation.cropNeed;
                      break;
                    case 2:
                      kBalance = kBalance - recommendation.cropNeed;
                      break;
                  }
                }
                // }
              }
              // const pkBalanceData = await this.pkBalanceRepository.findOne({
              //   where: { Year: cropData?.Year, FieldID: fieldData.ID },
              // });
              const pkBalanceData = await this.getPKBalanceData(
                fieldData.ID,
                cropData?.Year,
                allPKBalanceData
              );

              if (pkBalanceData) {
                const updateData = {
                  Year: cropData?.Year,
                  FieldID: fieldData.ID,
                  PBalance: pBalance,
                  KBalance: kBalance,
                };

                updatePKBalance = {
                  ...pkBalanceData,
                  ...updateData,
                  ModifiedOn: new Date(),
                  ModifiedByID: userId,
                };
                console.log("updatePKBalance", updatePKBalance);
              }
              if (updatePKBalance) {
                await transactionalManager.save(
                  PKBalanceEntity,
                  updatePKBalance
                );
              }
            }
          }

          // await this.saveOrUpdateArableNotes(
          //   arableNotes,
          //   savedData,
          //   transactionalManager,
          //   userId
          // );
        }

        if (organicManureData.SaveDefaultForFarm) {
          farmManureTypeData = {
            FarmID: organicManureData.FarmID,
            ManureTypeID: OrganicManure.ManureTypeID,
            ManureTypeName: OrganicManure.ManureTypeName,
            FieldTypeID: organicManureData.FieldTypeID,
            TotalN: OrganicManure.N, //Nitogen
            DryMatter: OrganicManure.DryMatterPercent,
            NH4N: OrganicManure.NH4N, //ammonium
            Uric: OrganicManure.UricAcid, //uric acid
            NO3N: OrganicManure.NO3N, //nitrate
            P2O5: OrganicManure.P2O5,
            SO3: OrganicManure.SO3,
            K2O: OrganicManure.K2O,
            MgO: OrganicManure.MgO,
          };
        }
      }
      if (farmManureTypeData) {
        const existingFarmManureType =
          await this.farmManureTypeRepository.findOne({
            where: {
              FarmID: farmManureTypeData.FarmID,
              ManureTypeID: farmManureTypeData.ManureTypeID,
              ManureTypeName: farmManureTypeData.ManureTypeName,
            },
          });
        if (existingFarmManureType) {
          await this.farmManureTypeRepository.update(
            existingFarmManureType.ID,
            {
              ...farmManureTypeData,
              ModifiedByID: userId,
              ModifiedOn: new Date(),
            }
          );

          savedFarmManureType = {
            ...existingFarmManureType,
            ...farmManureTypeData,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
          };
        } else {
          savedFarmManureType = await transactionalManager.save(
            FarmManureTypeEntity,
            this.farmManureTypeRepository.create({
              ...farmManureTypeData,
              CreatedByID: userId,
              CreatedOn: new Date(),
            })
          );
        }
      }

      return {
        OrganicManures: organicManures,
        FarmManureType: savedFarmManureType,
      };
    });
  }
  async updateRecommendationByManagementPeriodID(
    managementPeriodID,
    updateData,
    transactionalManager
  ) {
    let recommendation = await transactionalManager.findOne(
      RecommendationEntity,
      {
        where: { ManagementPeriodID: managementPeriodID },
      }
    );

    if (recommendation) {
      // If recommendation exists, update its values
      const updatedRecommendation = {
        ...recommendation,
        ...updateData, // Merge the update data with the existing recommendation
      };

      // Save the updated recommendation
      return await transactionalManager.save(
        RecommendationEntity,
        updatedRecommendation
      );
    } else {
      // If recommendation doesn't exist, create a new one with the given data
      const newRecommendation = transactionalManager.create(
        RecommendationEntity,
        {
          ManagementPeriodID: managementPeriodID,
          ...updateData, // Spread the data to create a new recommendation
        }
      );

      // Save the new recommendation
      return await transactionalManager.save(
        RecommendationEntity,
        newRecommendation
      );
    }
  }

  async saveOrUpdateArableNotes(
    arableNotes,
    savedData,
    transactionalManager,
    userId
  ) {
    const recommendationComments = [];

    // Separate notes by crop sequence
    const firstCropNotes = arableNotes.filter((note) => note.sequenceId === 1);
    const secondCropNotes = arableNotes.filter((note) => note.sequenceId === 2);

    // Group notes by nutrientId and concatenate
    const groupNotesByNutrientId = (notes) => {
      return notes.reduce((acc, note) => {
        if (!acc[note.nutrientId]) acc[note.nutrientId] = [];
        acc[note.nutrientId].push(note.note);
        return acc;
      }, {});
    };

    const firstCropNotesByNutrientId = groupNotesByNutrientId(firstCropNotes);
    const secondCropNotesByNutrientId = groupNotesByNutrientId(secondCropNotes);

    // Helper to handle comment updates and deletions for each crop's notes
    const saveComments = async (notesByNutrientId, recommendationId) => {
      const nutrientIdsInNotes = Object.keys(notesByNutrientId).map(Number);
      const existingComments = await transactionalManager.find(
        RecommendationCommentEntity,
        { where: { RecommendationID: recommendationId } }
      );

      for (const nutrientId in notesByNutrientId) {
        const concatenatedNote = notesByNutrientId[nutrientId].join(" <br/>");

        const existingComment = existingComments.find(
          (comment) => comment.Nutrient === Number(nutrientId)
        );

        if (existingComment) {
          // Update existing comment
          existingComment.Comment = concatenatedNote;
          existingComment.ModifiedOn = new Date();
          existingComment.ModifiedByID = userId;
          await transactionalManager.save(
            RecommendationCommentEntity,
            existingComment
          );

          // Log the updated comment
          console.log(
            `Updated comment for RecommendationID ${recommendationId}, NutrientID ${nutrientId}: ${concatenatedNote}`
          );
        } else {
          // Create new comment
          const newComment = this.recommendationCommentRepository.create({
            Nutrient: Number(nutrientId),
            Comment: concatenatedNote,
            RecommendationID: recommendationId,
            CreatedOn: new Date(),
            CreatedByID: userId,
            ModifiedOn: new Date(),
            ModifiedByID: userId,
          });
          recommendationComments.push(newComment);

          // Log the newly created comment
          console.log(
            `Created new comment for RecommendationID ${recommendationId}, NutrientID ${nutrientId}: ${concatenatedNote}`
          );
        }
      }

      // Delete comments that no longer have a matching nutrientId
      await transactionalManager.delete(RecommendationCommentEntity, {
        RecommendationID: recommendationId,
        Nutrient: Not(In(nutrientIdsInNotes)),
      });
    };

    // Process first crop comments if available
    if (savedData.firstCropSaveData) {
      await saveComments(
        firstCropNotesByNutrientId,
        savedData.firstCropSaveData.ID
      );
    }

    // Process second crop comments if available
    if (savedData.secondCropSaveData) {
      await saveComments(
        secondCropNotesByNutrientId,
        savedData.secondCropSaveData.ID
      );
    }

    // Save any new comments
    if (recommendationComments.length > 0) {
      await transactionalManager.save(
        RecommendationCommentEntity,
        recommendationComments
      );
    }
  }

  async checkManureExists(
    managementPeriodID,
    dateFrom,
    dateTo,
    confirm,
    request
  ) {
    try {
      // Fetch all manure types from the API
      const allManureTypes = await this.MannerManureTypesService.getData(
        "/manure-types",
        request
      );

      if (!allManureTypes?.data || allManureTypes.data.length === 0) {
        // Log a error if no manure types are returned
        console.error("No manure types returned from the Manner API");
      }

      // Filter manure types: IsLiquid is true OR ManureTypeID = 8 (for Poultry manure)
      const ManureTypes = Object.freeze({
        PoultryManure: 8,
        PigSlurry: 12,
        SeparatedCattleSlurryStrainerBox: 13,
        SeparatedCattleSlurryWeepingWall: 14,
        SeparatedCattleSlurryMechanicalSeparator: 15,
        SeparatedPigSlurryLiquidPortion: 18,
        CattleSlurry: 45,
      });

      const liquidManureTypes = allManureTypes.data.filter((manure) =>
        Object.values(ManureTypes).includes(manure.id)
      );

      if (!liquidManureTypes || liquidManureTypes.length === 0) {
        // Log a warning if no liquid or poultry manure types are found
        console.warn("No valid liquid or poultry manure types found");
      }

      // Extract manureTypeIds from the filtered result
      const manureTypeIds = liquidManureTypes.map((manure) => manure.id);

      // If no valid manureTypeIds, return false
      if (!manureTypeIds || manureTypeIds.length === 0) {
        return false; // No valid manure types found
      }

      // Query OrganicManures for these manureTypeIds within the date range
      const manureTypeExists = await this.repository
        .createQueryBuilder("organicManure")
        .where("organicManure.ManureTypeID IN (:...manureTypeIds)", {
          manureTypeIds,
        })
        .andWhere(
          "organicManure.ApplicationDate BETWEEN :dateFrom AND :dateTo",
          {
            dateFrom,
            dateTo,
          }
        )
        .andWhere("organicManure.ManagementPeriodID = :managementPeriodID", {
          managementPeriodID,
        })
        .andWhere("organicManure.Confirm = :confirm", { confirm })
        .getCount();

      // Return true if any matching records are found
      return manureTypeExists > 0;
    } catch (error) {
      // Log the error for debugging purposes
      console.error("Error checking for manure existence:", error.message);

      // You can choose to throw the error or handle it silently
      throw new Error(
        "Failed to check manure existence due to an internal error"
      );
    }
  }
  async getP205AndK20fromfertiliser(managementPeriodId) {
    let sumOfP205 = 0;
    let sumOfK20 = 0;
    const fertiliserData = await this.fertiliserRepository.find({
      where: {
        ManagementPeriodID: managementPeriodId,
      },
      select: {
        P2O5: true,
        K2O: true,
      },
    });

    if (fertiliserData && fertiliserData.length > 0) {
      for (const fertiliser of fertiliserData) {
        sumOfP205 += fertiliser.P2O5 || 0;
        sumOfK20 += fertiliser.K2O || 0;
      }
    }
    return { p205: sumOfP205, k20: sumOfK20 };
  }
  async deleteOrganicManure(organicManureId, userId, request) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      // Check if the Organic Manure exists
      const organicManureToDelete = await this.repository.findOneBy({
        ID: organicManureId,
      });

      // If the organicManure does not exist, throw a not found error
      if (organicManureToDelete == null) {
        console.log(`Organic Manure with ID ${organicManureId} not found`);
      }
      const managementPeriod = await this.managementPeriodRepository.findOne({
        where: { ID: organicManureToDelete.ManagementPeriodID },
        select: ["CropID"],
      });

      // If the managementPeriod does not exist, throw a not found error
      if (managementPeriod == null) {
        console.log(
          `managementPeriod with ID ${organicManureToDelete.ManagementPeriodID} not found`
        );
      }
      const crop = await this.cropRepository.findOne({
        where: { ID: managementPeriod.CropID },
      });

      // If the crop does not exist, throw a not found error
      if (crop == null) {
        console.log(`crop with ID ${managementPeriod.CropID} not found`);
      }

      try {
        // Call the stored procedure to delete the organicManureId and related entities
        const storedProcedure =
          "EXEC [spOrganicManures_DeleteOrganicManures] @OrganicManureID = @0";
        await transactionalManager.query(storedProcedure, [organicManureId]);

        await this.UpdateRecommendationChanges.updateRecommendationAndOrganicManure(
          crop.FieldID,
          crop.Year,
          request,
          userId,
          transactionalManager
        );
        // Check if there are any records in the repository for crop.FieldID with a year greater than crop.Year
        const nextAvailableCrop = await this.cropRepository.findOne({
          where: {
            FieldID: crop.FieldID,
            Year: MoreThan(crop.Year), // Find the next available year greater than the current crop.Year
          },
          order: {
            Year: "ASC", // Ensure we get the next immediate year
          },
        });
        if (nextAvailableCrop) {
          this.UpdateRecommendation.updateRecommendationsForField(
            crop.FieldID,
            nextAvailableCrop.Year,
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

        return { affectedRows: 1 }; // Success response
      } catch (error) {
        // Log the error and throw an internal server error
        console.error("Error deleting organicManure:", error);
      }
    });
  }
  async buildManureApplicationsForUpdate(
    managementPeriodID,
    organicManureData,
    mulOrganicManuresData,
    request
  ) {
    // Initialize an empty array for storing results
    const manureApplications = [];

    // Loop through the mulOrganicManuresData (array of objects)
    for (const manure of mulOrganicManuresData) {
      // Fetch manure type data for each manure by its ManureTypeID
      const manureTypeData = await this.getManureTypeData(
        manure.ManureTypeID,
        request
      );

      // Push each manure application details into the array
      manureApplications.push({
        manureDetails: {
          manureID: manure.ManureTypeID,
          name: manureTypeData.data.name,
          isLiquid: manureTypeData.data.isLiquid,
          dryMatter: manure.DryMatterPercent,
          totalN: manure.N,
          nH4N: manure.NH4N,
          uric: manure.UricAcid,
          nO3N: manure.NO3N,
          p2O5: manure.P2O5,
          sO3: manure.SO3,
          k2O: manure.K2O,
          mgO: manure.MgO,
        },
        applicationDate: new Date(manure.ApplicationDate)
          .toISOString()
          .split("T")[0],
        applicationRate: {
          value: manure.ApplicationRate,
          unit: "kg/hectare",
        },
        applicationMethodID: manure.ApplicationMethodID,
        incorporationMethodID: manure.IncorporationMethodID,
        incorporationDelayID: manure.IncorporationDelayID,
        autumnCropNitrogenUptake: {
          value: manure.AutumnCropNitrogenUptake,
          unit: "string",
        },
        endOfDrainageDate: new Date(manure.EndOfDrain)
          .toISOString()
          .split("T")[0],
        rainfallPostApplication: manure.Rainfall,
        cropNUptake: manure.AutumnCropNitrogenUptake,
        windspeedID: manure.WindspeedID,
        rainTypeID: manure.RainfallWithinSixHoursID,
        topsoilMoistureID: manure.MoistureID,
      });
    }
    if (organicManureData.ManagementPeriodID == managementPeriodID) {
      if (Object.keys(organicManureData).length !== 0) {
        // Handle the single organicManureData object and push its values into the array
        // Fetch manure type data for the single organicManureData object
        const manureTypeData = await this.getManureTypeData(
          organicManureData.ManureTypeID,
          request
        );

        manureApplications.push({
          manureDetails: {
            manureID: organicManureData.ManureTypeID,
            name: manureTypeData.data.name,
            isLiquid: manureTypeData.data.isLiquid,
            dryMatter: organicManureData.DryMatterPercent,
            totalN: organicManureData.N,
            nH4N: organicManureData.NH4N,
            uric: organicManureData.UricAcid,
            nO3N: organicManureData.NO3N,
            p2O5: organicManureData.P2O5,
            sO3: organicManureData.SO3,
            k2O: organicManureData.K2O,
            mgO: organicManureData.MgO,
          },
          applicationDate: new Date(organicManureData.ApplicationDate)
            .toISOString()
            .split("T")[0],
          applicationRate: {
            value: organicManureData.ApplicationRate,
            unit: "kg/hectare",
          },
          applicationMethodID: organicManureData.ApplicationMethodID,
          incorporationMethodID: organicManureData.IncorporationMethodID,
          incorporationDelayID: organicManureData.IncorporationDelayID,
          autumnCropNitrogenUptake: {
            value: organicManureData.AutumnCropNitrogenUptake,
            unit: "string",
          },
          endOfDrainageDate: new Date(organicManureData.EndOfDrain)
            .toISOString()
            .split("T")[0],
          rainfallPostApplication: organicManureData.Rainfall,
          cropNUptake: organicManureData.AutumnCropNitrogenUptake,
          windspeedID: organicManureData.WindspeedID,
          rainTypeID: organicManureData.RainfallWithinSixHoursID,
          topsoilMoistureID: organicManureData.MoistureID,
        });
      }
    }

    // Return the manure applications array
    return manureApplications;
  }

  async updateOrganicManure(updatedOrganicManureData, userId, request) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      const updatedOrganicManures = [];
      let savedFarmManureType = null;

      for (const manureEntry of updatedOrganicManureData) {
        const { OrganicManure, FarmID, FieldTypeID, SaveDefaultForFarm } =
          manureEntry;

        const {
          ID,
          CreatedByID,
          CreatedOn,
          FieldName,
          EncryptedCounter,
          Defoliation,
          FieldID,
          DefoliationName,
          ...updatedData
        } = OrganicManure;
        // 🔄 Update recommendations
        const managementPeriod = await transactionalManager.findOne(
          ManagementPeriodEntity,
          {
            where: { ID: OrganicManure.ManagementPeriodID },
          }
        );

        const crop = await transactionalManager.findOne(CropEntity, {
          where: { ID: managementPeriod?.CropID },
        });

        const fieldData = await transactionalManager.findOne(FieldEntity, {
          where: { ID: crop?.FieldID },
        });

        const farmData = await transactionalManager.findOne(FarmEntity, {
          where: { ID: fieldData?.FarmID },
        });
        const cropTypeLinkingData = await transactionalManager.findOne(
          CropTypeLinkingEntity,
          {
            where: {
              CropTypeID: crop.CropTypeID,
            },
          }
        );

        const soilTypeTextureData = await transactionalManager.findOne(
          SoilTypeSoilTextureEntity,
          {
            where: {
              SoilTypeID: fieldData.SoilTypeID,
            },
          }
        );
        let manureBody = null,
          manureRequestBody = null,
          mannerOutput = null;
        // Fetch existing OrganicManure from DB
        const existingOrganicManure = await transactionalManager.findOne(
          OrganicManureEntity,
          { where: { ID } }
        );

        if (!existingOrganicManure) {
          console.log(`Organic Manure with ID ${ID} not found`);
          continue;
        }
        const mulOrganicManuresData = await transactionalManager.find(
          OrganicManureEntity,
          {
            where: {
              ManagementPeriodID: OrganicManure.ManagementPeriodID,
              ID: Not(OrganicManure.ID),
            },
          }
        );

        if (mulOrganicManuresData) {
          manureBody = await this.buildManureApplicationsForUpdate(
            OrganicManure.ManagementPeriodID,
            OrganicManure,
            mulOrganicManuresData,
            request
          );

          if (manureBody) {
            manureRequestBody = await this.buildMannerOutputReq(
              farmData,
              fieldData,
              cropTypeLinkingData,
              OrganicManure,
              manureBody,
              soilTypeTextureData
            );
          }

          if (manureRequestBody) {
            mannerOutput = await this.MannerCalculateNutrientsService.postData(
              "/calculate-nutrients",
              manureRequestBody,
              request
            );
          }
        }
        // Check if ManagementPeriodID matches
        const isManagementPeriodSame =
          existingOrganicManure.ManagementPeriodID ===
          OrganicManure.ManagementPeriodID;
        let dataToUpdate;
        // Merge the updated data, include new ManagementPeriodID if changed
        if (mannerOutput) {
          dataToUpdate = {
            ...updatedData,
            AvailableN: mannerOutput.data.currentCropAvailableN,
            AvailableSO3: mannerOutput.data.cropAvailableSO3,
            AvailableP2O5: mannerOutput.data.cropAvailableP2O5,
            AvailableK2O: mannerOutput.data.cropAvailableK2O,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
            ...(isManagementPeriodSame
              ? {}
              : { ManagementPeriodID: OrganicManure.ManagementPeriodID }),
          };
        } else {
          dataToUpdate = {
            ...updatedData,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
            ...(isManagementPeriodSame
              ? {}
              : { ManagementPeriodID: OrganicManure.ManagementPeriodID }),
          };
        }

        const result = await transactionalManager.update(
          OrganicManureEntity,
          ID,
          dataToUpdate
        );

        // Fetch the updated version to return
        const organicManure = await transactionalManager.findOne(
          OrganicManureEntity,
          { where: { ID } }
        );

        if (organicManure) {
          updatedOrganicManures.push(organicManure);
        }

        // ✅ Update FarmManureType if SaveDefaultForFarm is true (no creation)
        if (SaveDefaultForFarm) {
          const farmManureTypeData = {
            FarmID,
            ManureTypeID: OrganicManure.ManureTypeID,
            ManureTypeName: OrganicManure.ManureTypeName,
            FieldTypeID,
            TotalN: OrganicManure.N,
            DryMatter: OrganicManure.DryMatterPercent,
            NH4N: OrganicManure.NH4N,
            Uric: OrganicManure.UricAcid,
            NO3N: OrganicManure.NO3N,
            P2O5: OrganicManure.P2O5,
            SO3: OrganicManure.SO3,
            K2O: OrganicManure.K2O,
            MgO: OrganicManure.MgO,
          };

          const existingFarmManureType =
            await this.farmManureTypeRepository.findOne({
              where: {
                FarmID: farmManureTypeData.FarmID,
                ManureTypeID: farmManureTypeData.ManureTypeID,
                ManureTypeName: farmManureTypeData.ManureTypeName,
              },
            });

          if (existingFarmManureType) {
            await this.farmManureTypeRepository.update(
              existingFarmManureType.ID,
              {
                ...farmManureTypeData,
                ModifiedByID: userId,
                ModifiedOn: new Date(),
              }
            );

            savedFarmManureType = {
              ...existingFarmManureType,
              ...farmManureTypeData,
              ModifiedByID: userId,
              ModifiedOn: new Date(),
            };
          } else {
            savedFarmManureType = await transactionalManager.save(
              FarmManureTypeEntity,
              this.farmManureTypeRepository.create({
                ...farmManureTypeData,
                CreatedByID: userId,
                CreatedOn: new Date(),
              })
            );
          }
        }

        await this.UpdateRecommendationChanges.updateRecommendationAndOrganicManure(
          crop.FieldID,
          crop.Year,
          request,
          userId,
          transactionalManager
        );

        const nextAvailableCrop = await this.cropRepository.findOne({
          where: {
            FieldID: crop.FieldID,
            Year: MoreThan(crop.Year),
          },
          order: { Year: "ASC" },
        });

        if (nextAvailableCrop) {
          this.UpdateRecommendation.updateRecommendationsForField(
            crop.FieldID,
            nextAvailableCrop.Year,
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
        OrganicManure: updatedOrganicManures,
        FarmManureType: savedFarmManureType,
      };
    });
  }

  async getOrganicManureByFarmIdAndYear(organicManureId, farmId, harvestYear) {
    try {
      const storedProcedure =
        "EXEC dbo.spOrganicManures_GetByFarmIdAndYear @farmId = @0, @harvestYear = @1";
      const organicManureList = await this.executeQuery(storedProcedure, [
        farmId,
        harvestYear,
      ]);

      const organicManure = await this.repository.findOne({
        where: { ID: organicManureId },
      });

      const records =
        organicManureList.length > 0 && organicManure != null
          ? organicManureList.filter((item) => {
              const itemDate = new Date(item?.ApplicationDate);
              const organicDate = new Date(organicManure?.ApplicationDate);
              const isMatching =
                itemDate.getTime() === organicDate.getTime() &&
                item?.ManureTypeID === organicManure?.ManureTypeID &&
                item?.Nitrogen === organicManure?.N &&
                item?.P2O5 === organicManure?.P2O5 &&
                item?.SO3 === organicManure?.SO3 &&
                item?.K2O === organicManure?.K2O &&
                item?.MgO === organicManure?.MgO &&
                item?.UricAcid === organicManure?.UricAcid &&
                item?.DryMatterPercent === organicManure?.DryMatterPercent &&
                item?.NH4N === organicManure?.NH4N &&
                item?.NO3N === organicManure?.NO3N;

              return isMatching;
            })
          : null;

      return records;
    } catch (error) {
      console.error("Error occurred while fetching organic records:", error);
      return null;
    }
  }
  async getTotalAvailableNitrogenByManagementPeriodID(managementPeriodID) {
    const organicManuresResult = await this.repository
      .createQueryBuilder("OrganicManures")
      .select("SUM(OrganicManures.AvailableN)", "totalN")
      .where("OrganicManures.ManagementPeriodID = :managementPeriodID", {
        managementPeriodID,
      });

    const organicResult = await organicManuresResult.getRawOne();
    console.log("organicResult", organicResult);

    return organicResult.totalN;
  }
}
 module.exports = { OrganicManureService };
