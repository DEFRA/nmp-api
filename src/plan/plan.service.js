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
    this.excessRainfallRepository = AppDataSource.getRepository(
      ExcessRainfallsEntity
    );
  }

  async getManagementPeriods(id) {
    const data = await this.managementPeriodRepository.findOne({
      where: {
        CropID: id,
      },
    });

    return data;
  }

  async getFirstCropData(FieldID, Year) {
    const data = await this.cropRepository.findOne({
      where: {
        FieldID: FieldID,
        Year: Year,
        Confirm: false, // Or 0 based on your field setup
        CropOrder: 1,
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

  async buildArableBody(crop, field) {
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
    if (crop.CropOrder === 1) {
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
    if (crop.CropOrder === 2) {
      // Find the previous crop with CropOrder 1

      const previousCrop = await this.getFirstCropData(field.ID, crop.Year);

      if (previousCrop) {
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
      return previousCrops.find((crop) => crop.CropOrder === 2);
    }

    // Otherwise, return the first crop (or null if none are found)
    return previousCrops[0] || null;
  }

  async buildNutrientRecommendationReqBody(
    field,
    farm,
    soilAnalysis,
    snsAnalysesData,
    crop,
    allPKBalanceData,
    allCropData
  ) {
    const cropTypesList = await this.rB209ArableService.getData(
      "/Arable/CropTypes"
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
    const arableBody = await this.buildArableBody(crop, field);

    const pkBalanceData = allPKBalanceData.find(
      (data) => data.FieldID === field.ID && data.Year === crop.Year - 1
    );
    const excessRainfall = await this.getWinterExcessRainfall(
      farm.ID,
      crop.Year
    );
    const nutrientRecommendationnReqBody = {
      field: {
        fieldType: crop.FieldType,
        multipleCrops: crop.CropOrder == 2 ? true : false,
        arable: arableBody,
        grassland:
          crop.FieldType == 1
            ? {}
            : {
                cropOrder: null,
                snsId: null,
                grassGrowthClassId: null,
                yieldTypeId: null,
                sequenceId: null,
                grasslandSequence: [
                  {
                    position: null,
                    cropMaterialId: null,
                    yield: null,
                  },
                ],
                establishedDate: null,
                seasonId: null,
                siteClassId: null,
              },
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
        countryId: farm.EnglishRules ? 1 : 2,
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
          ...(soilAnalysis.Date && { soilAnalysisDate: soilAnalysis.Date }),
          ...(soilAnalysis.PH && { soilpH: soilAnalysis.PH }),
          ...(soilAnalysis.SulphurDeficient && {
            sulphurDeficient: soilAnalysis.SulphurDeficient,
          }),
          ...(soilAnalysis.PhosphorusIndex && {
            pIndexId: soilAnalysis.PhosphorusIndex,
            pMethodologyId: soilAnalysis.PhosphorusMethodologyID,
          }),
          ...(soilAnalysis.PotassiumIndex && {
            kIndexId: soilAnalysis.PotassiumIndex,
          }),
          ...(soilAnalysis.MagnesiumIndex && {
            mgIndexId: soilAnalysis.MagnesiumIndex,
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
        previousGrassId: 1,
        previousCropGroupId:
          cropType?.cropGroupId !== undefined && cropType?.cropGroupId !== null
            ? cropType?.cropGroupId
            : null,
        previousCropTypeId:
          previousCrop?.CropTypeID !== undefined &&
          previousCrop?.CropTypeID !== null
            ? previousCrop?.CropTypeID
            : null,
        snsId: null,
        smnDepth: null,
        measuredSmn: null,
      };
    } else {
      // If no previousCrop found, assign null except for previousGrassId
      nutrientRecommendationnReqBody.field.previousCropping = {
        previousCropGroupId: null,
        previousCropTypeId: null,
        previousGrassId: 1,
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

  async handleSoilAnalysisValidation(fieldId, fieldName, year, CountryID) {
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
      CountryID
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
      SIndex:  null,
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
      SIndex:  null,
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
      (recommendation) => recommendation.ManagementPeriodID === managementPeriodData.ID
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
      NIndex: null
    }

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
      NIndex: null
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

  async assignIndexIdToSoilRecords(soilAnalysisRecords, CountryID) {
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
              `Soil/NutrientIndices/${nutrientId}/${methodologyId}/${CountryID}`
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

  async createNutrientsRecommendationForField(crops, userId, request) {
    const fieldIDs = crops.map((cropData) => cropData.Crop.FieldID);//22 //23
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
        const countryData = await this.countryRepository.findOneBy({
          ID: farm.CountryID,
        });

        const {
          latestSoilAnalysis,
          errors: soilAnalysisErrors,
          soilAnalysisRecords,
        } = await this.handleSoilAnalysisValidation(
          fieldId,
          field.Name,
          crop?.Year,
          countryData.RB209CountryID
        );
    
        Errors.push(...soilAnalysisErrors);
        if (Errors.length > 0) {
          throw new Error(JSON.stringify(Errors));
        }

        const snsAnalysesData = await this.getSnsAnalysesData(crop?.ID);
        if (crop.CropTypeID === 170) {
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
            allCropData
          );
       console.log(
         "nutrientRecommendationnReqBodysoil",
         nutrientRecommendationnReqBody.field.soil.soilAnalyses
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
        if (crop.CropOrder == 2) {
          const firstCropData = await this.getFirstCropData(
            field.ID,
            crop.Year
          );

          const managementPeriodData = await this.getManagementPeriods(
            firstCropData.ID
          );

          const savedMultipleCropRecommendation =
            await this.saveRecommendationForMutipleCrops(
              transactionalManager,
              nutrientRecommendationsData,
              allRecommendations,
              allCropData,
              savedCrop,
              firstCropData,
              managementPeriodData,
              ManagementPeriods,
              latestSoilAnalysis,
              snsAnalysesData,
              userId
            );
         

          const savedFirstRecommendationComment =
            await this.saveMultipleRecommendation(
              Recommendations,
              savedMultipleCropRecommendation.firstCropSaveData,
              savedMultipleCropRecommendation.secondCropSaveData,
              transactionalManager,
              nutrientRecommendationsData,
              userId
            );
        } else {
          const cropNutrientsValue = {};
          nutrientRecommendationsData.calculations.forEach((recommendation) => {
            cropNutrientsValue[NutrientsMapper[recommendation.nutrientId]] =
              recommendation.cropNeedValue;
          });

          const existingRecommendation = allManagementPeriods.find(
            (mp) => mp.ID === ManagementPeriods[0].ID
          );
          let savedData = await this.saveRecommendationsForMutipleCrops(
            transactionalManager,
            nutrientRecommendationsData,
            savedCrop,
            ManagementPeriods,
            latestSoilAnalysis,
            snsAnalysesData,
            userId
          );

          savedRecommendation = savedData.firstCropSaveData;
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
      if (crop.CropTypeID === 170 || crop.CropInfo1 === null) {
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
