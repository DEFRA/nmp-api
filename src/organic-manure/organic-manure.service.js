const { AppDataSource } = require("../db/data-source");
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
const { CalculateNutrientOfftakeDto } = require("../vendors/rb209/recommendation/dto/recommendation.dto");
const MannerCalculateNutrientsService = require("../vendors/manner/calculate-nutrients/calculate-nutrients.service");
const RB209ArableService = require("../vendors/rb209/arable/arable.service");
const { RB209RecommendationService } = require("../vendors/rb209/recommendation/recommendation.service");
const { RecommendationCommentEntity } = require("../db/entity/recommendation-comment.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const { CropTypeLinkingEntity } = require("../db/entity/crop-type-linking.entity");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const RB209FieldService = require("../vendors/rb209/field/field.service");
const MannerManureTypesService = require("../vendors/manner/manure-types/manure-types.service");
const { LessThanOrEqual, Between, Not, In } = require("typeorm");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");

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
  }

  async getTotalNitrogen(managementPeriodID, fromDate, toDate, confirm) {
    const result = await this.repository
      .createQueryBuilder("organicManures")
      .select(
        "SUM(organicManures.N * organicManures.ApplicationRate)",
        "totalN"
      )
      .where("organicManures.ManagementPeriodID = :managementPeriodID", {
        managementPeriodID,
      })
      .andWhere(
        "organicManures.ApplicationDate BETWEEN :fromDate AND :toDate",
        { fromDate, toDate }
      )
      .andWhere("organicManures.Confirm =:confirm", { confirm })
      .getRawOne();

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
    field
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

    // Return the list of crops sorted by CropOrder (if necessary)
    return arableBody.sort((a, b) => a.cropOrder - b.cropOrder);
  }
  async buildNutrientRecommendationReqBody(
    field,
    farm,
    soilAnalysis,
    snsAnalysesData,
    dataMultipleCrops,
    crop,
    mannerOutputs,
    organicManureData
  ) {
    const cropTypesList = await this.rB209ArableService.getData(
      "/Arable/CropTypes"
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
    const previousCrop = await this.cropRepository.find({
      where: {
        FieldID: field.ID,
        Year: crop.Year - 1,
        Confirm: true,
      },
      take: 1,
    })[0];
    const arableBody = await this.buildArableBody(dataMultipleCrops, field);
    const nutrientRecommendationnReqBody = {
      field: {
        fieldType: crop.FieldType,
        multipleCrops: true,
        arable: arableBody,
        grassland: isMultipleCrops
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
          soilAnalyses: [],
        },
        harvestYear: crop.Year,
        area: farm.TotalFarmArea,
        postcode: farm.Postcode,
        altitude: farm.AverageAltitude,
        rainfallAverage: farm.Rainfall,
        excessWinterRainfall: 0, //TODO:: need to find it
        mannerManures: true,
        organicMaterials: [],
        mannerOutputs: [
          {
            id: crop.CropOrder,
            totalN: mannerOutputs.data.totalN,
            availableN: mannerOutputs.data.currentCropAvailableN,
            totalP: mannerOutputs.data.totalP2O5,
            availableP: mannerOutputs.data.cropAvailableP2O5,
            totalK: mannerOutputs.data.totalK2O,
            availableK: mannerOutputs.data.cropAvailableK2O,
            totalS: mannerOutputs.data.totalSO3,
            availableS: 0, //TODO:: need to find it
            totalM: mannerOutputs.data.totalMgO,
          },
        ],
        previousCropping: {},
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
        nutrientRecommendationnReqBody.field.soil.soilAnalyses.push({
          soilAnalysisDate: soilAnalysis.Date,
          soilpH: soilAnalysis.PH,
          sulphurDeficient: soilAnalysis.SulphurDeficient,
          snsIndexId: soilAnalysis.SoilNitrogenSupplyIndex,
          pIndexId: soilAnalysis.PhosphorusIndex,
          kIndexId: soilAnalysis.PotassiumIndex,
          mgIndexId: soilAnalysis.MagnesiumIndex,
          snsMethodologyId: 4,
          pMethodologyId: 0,
          kMethodologyId: 4,
          mgMethodologyId: 4,
        });
      });
    }
    // Add SnsAnalyses data
    if (snsAnalysesData) {
      nutrientRecommendationnReqBody.field.soil.soilAnalyses.push({
        soilAnalysisDate: snsAnalysesData.SampleDate, // Using snsAnalysesData.SampleDate
        snsIndexId: snsAnalysesData.SoilNitrogenSupplyIndex, // Using snsAnalysesData.SoilNitrogenSupplyIndex
        snsMethodologyId: 4,
        pMethodologyId: 0,
        kMethodologyId: 4,
        mgMethodologyId: 4,
      });
    }

    if (previousCrop) {
      const cropType = cropTypesList.find(
        (cropType) => cropType.cropTypeId === previousCrop.CropTypeID
      );
      nutrientRecommendationnReqBody.field.previousCropping = {
        previousCropGroupId: cropType.cropGroupId,
        previousCropTypeId: previousCrop.CropTypeID,
      };
    }
    nutrientRecommendationnReqBody.referenceValue = `${field.ID}-${crop.ID}-${crop.Year}`;

    return nutrientRecommendationnReqBody;
  }
  async handleSoilAnalysisValidation(fieldId, fieldName, year) {
    const errors = [];
    const fiveYearsAgo = year - 4;

    // Fetch all soil analyses for the last 5 years
    const soilAnalysisRecords = await this.soilAnalysisRepository.find({
      where: {
        FieldID: fieldId,
        Year: Between(fiveYearsAgo, year), // Fetch records within 5 years
      },
      order: { Date: "DESC" }, // Order by date, most recent first
    });

    const soilRequiredKeys = [
      "Date",
      "PH",
      "SulphurDeficient",
      "SoilNitrogenSupplyIndex",
      "PhosphorusIndex",
      "PotassiumIndex",
      "MagnesiumIndex",
    ];

    // Validate the most recent soil analysis (first record in the sorted array)
    const latestSoilAnalysis = soilAnalysisRecords[0];

    return { latestSoilAnalysis, errors, soilAnalysisRecords };
  }

  async buildManureApplications(
    managementPeriodID,
    manureTypeData,
    organicManureAllData
  ) {
    // const mulOrganicManuresData = await this.repository.find({
    //   where: { ManagementPeriodID: managementPeriodID },
    // });
    const mulOrganicManuresData = organicManureAllData.filter(
      (manure) => manure.ManagementPeriodID === managementPeriodID
    );

    return mulOrganicManuresData.map((manure) => ({
      manureDetails: {
        manureID: manure.ManureTypeID,
        name: manureTypeData.Name,
        isLiquid: manureTypeData.IsLiquid,
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
    }));
  }

  async buildMannerOutputReq(
    farmData,
    fieldData,
    cropTypeLinkingData,
    organicManureData,
    manureApplications
  ) {
    return {
      runType: farmData.EnglishRules ? 3 : 4,
      postcode: farmData.Postcode.split(" ")[0],
      countryID: farmData.EnglishRules ? 1 : 2,
      field: {
        fieldID: fieldData.ID,
        fieldName: fieldData.Name,
        MannerCropTypeID: cropTypeLinkingData.MannerCropTypeID,
        topsoilID: fieldData.TopSoilID,
        subsoilID: fieldData.SubSoilID,
        isInNVZ: fieldData.IsWithinNVZ,
      },
      manureApplications,
    };
  }
  async checkIfManagementPeriodExistsInOrganicManure(
    organicManure,
    organicManureAllData
  ) {
    // const managementPeriodExists = await this.repository.findOne({
    //   where: { ManagementPeriodID: organicManure.ManagementPeriodID },
    // });
    const managementPeriodExists = organicManureAllData.some(
      (data) => data.ManagementPeriodID === organicManure.ManagementPeriodID
    );

    if (managementPeriodExists) {
      return true;
    } else {
      return false;
    }
  }

  async getSnsAnalysesData(id) {
    const data = await this.snsAnalysisRepository.findOne({
      where: { FieldID: id }, // This line is correct as per your entity definition
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
    userId,
    cropData,
    dataMultipleCrops,
    latestSoilAnalysis,
    snsAnalysesData,
    allRecommendations
  ) {
    let cropOrder1Data = {
      CropN: 0,
      ManureN: 0,
      FertilizerN: 0,
      CropP2O5: 0,
      ManureP2O5: 0,
      FertilizerP2O5: 0,
      CropK2O: 0,
      ManureK2O: 0,
      FertilizerK2O: 0,
      CropMgO: 0,
      ManureMgO: 0,
      FertilizerMgO: 0,
      CropSO3: 0,
      ManureSO3: 0,
      FertilizerSO3: 0,
      CropNa2O: 0,
      ManureNa2O: 0,
      FertilizerNa2O: 0,
      CropLime: 0,
      ManureLime: 0,
      FertilizerLime: 0,
      PH: latestSoilAnalysis?.PH?.toString(),
      SNSIndex: latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString(),
      PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString(),
      KIndex: latestSoilAnalysis?.PotassiumIndex?.toString(),
      MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString(),
      SIndex: snsAnalysesData?.SoilNitrogenSupplyIndex?.toString(),
    };

    let cropOrder2Data = {
      ...cropOrder1Data,
    };

    const firstCrop = dataMultipleCrops.find((crop) => crop.CropOrder === 1);
    const secondCrop = dataMultipleCrops.find((crop) => crop.CropOrder === 2);

    // Get all recommendations once and store them in a map
    // const allRecommendations = await this.RecommendationRepository.find();
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

      nutrientRecommendationsData.calculations.forEach((calculation) => {
        if (calculation.sequenceId === 1) {
          switch (calculation.nutrientId) {
            case 0:
              cropOrder1Data.CropN = calculation.recommendation;
              cropOrder1Data.ManureN = calculation.applied;
              cropOrder1Data.FertilizerN = calculation.cropNeed;
              break;
            case 1:
              cropOrder1Data.CropP2O5 = calculation.recommendation;
              cropOrder1Data.ManureP2O5 = calculation.applied;
              cropOrder1Data.FertilizerP2O5 = calculation.cropNeed;
              break;
            case 2:
              cropOrder1Data.CropK2O = calculation.recommendation;
              cropOrder1Data.ManureK2O = calculation.applied;
              cropOrder1Data.FertilizerK2O = calculation.cropNeed;
              break;
            case 3:
              cropOrder1Data.CropMgO = calculation.recommendation;
              cropOrder1Data.ManureMgO = calculation.applied;
              cropOrder1Data.FertilizerMgO = calculation.cropNeed;
              break;
            case 4:
              cropOrder1Data.CropSO3 = calculation.recommendation;
              cropOrder1Data.ManureSO3 = calculation.applied;
              cropOrder1Data.FertilizerSO3 = calculation.cropNeed;
              break;
            case 5:
              cropOrder1Data.CropNa2O = calculation.recommendation;
              cropOrder1Data.ManureNa2O = calculation.applied;
              cropOrder1Data.FertilizerNa2O = calculation.cropNeed;
              break;
            case 6:
              cropOrder1Data.CropLime = calculation.recommendation;
              cropOrder1Data.ManureLime = calculation.applied;
              cropOrder1Data.FertilizerLime = calculation.cropNeed;
              break;
          }
        }
      });

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

      nutrientRecommendationsData.calculations.forEach((calculation) => {
        if (calculation.sequenceId === 2) {
          switch (calculation.nutrientId) {
            case 0:
              cropOrder2Data.CropN = calculation.recommendation;
              cropOrder2Data.ManureN = calculation.applied;
              cropOrder2Data.FertilizerN = calculation.cropNeed;
              break;
            case 1:
              cropOrder2Data.CropP2O5 = calculation.recommendation;
              cropOrder2Data.ManureP2O5 = calculation.applied;
              cropOrder2Data.FertilizerP2O5 = calculation.cropNeed;
              break;
            case 2:
              cropOrder2Data.CropK2O = calculation.recommendation;
              cropOrder2Data.ManureK2O = calculation.applied;
              cropOrder2Data.FertilizerK2O = calculation.cropNeed;
              break;
            case 3:
              cropOrder2Data.CropMgO = calculation.recommendation;
              cropOrder2Data.ManureMgO = calculation.applied;
              cropOrder2Data.FertilizerMgO = calculation.cropNeed;
              break;
            case 4:
              cropOrder2Data.CropSO3 = calculation.recommendation;
              cropOrder2Data.ManureSO3 = calculation.applied;
              cropOrder2Data.FertilizerSO3 = calculation.cropNeed;
              break;
            case 5:
              cropOrder2Data.CropNa2O = calculation.recommendation;
              cropOrder2Data.ManureNa2O = calculation.applied;
              cropOrder2Data.FertilizerNa2O = calculation.cropNeed;
              break;
            case 6:
              cropOrder2Data.CropLime = calculation.recommendation;
              cropOrder2Data.ManureLime = calculation.applied;
              cropOrder2Data.FertilizerLime = calculation.cropNeed;
              break;
          }
        }
      });

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

  async createOrganicManuresWithFarmManureType(request, body, userId) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      let savedFarmManureType;
      let farmManureTypeData;
      const organicManures = [];
      const organicManureAllData = await this.repository.find();
      const allRecommendations = await this.RecommendationRepository.find();
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
            OrganicManure,
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
        console.log("manureTypeDataaa", manureTypeData);
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
        const cropTypeLinkingData =
          await this.CropTypeLinkingRepository.findOneBy({
            CropTypeID: cropData.CropTypeID,
          });

        const manureApplications = await this.buildManureApplications(
          OrganicManure.ManagementPeriodID,
          manureTypeData,
          organicManureAllData
        );

        let mannerOutputReq;
        if (newOrganicManure == true) {
          mannerOutputReq = await this.buildMannerOutputReq(
            farmData,
            fieldData,
            cropTypeLinkingData,
            organicManureData,
            manureApplications
          );
        } else if (newOrganicManure == false) {
          mannerOutputReq = {
            runType: farmData.EnglishRules ? 3 : 4,
            postcode: farmData.Postcode.split(" ")[0],
            countryID: farmData.EnglishRules ? 1 : 2,
            field: {
              fieldID: fieldData.ID,
              fieldName: fieldData.Name,
              MannerCropTypeID: cropTypeLinkingData.MannerCropTypeID,
              topsoilID: fieldData.TopSoilID,
              subsoilID: fieldData.SubSoilID,
              isInNVZ: fieldData.IsWithinNVZ,
            },
            manureApplications: [
              {
                manureDetails: {
                  manureID: OrganicManure.ManureTypeID,
                  name: manureTypeData.Name,
                  isLiquid: manureTypeData.IsLiquid,
                  dryMatter: OrganicManure.DryMatterPercent,
                  totalN: OrganicManure?.N,
                  nH4N: OrganicManure.NH4N,
                  uric: OrganicManure.UricAcid,
                  nO3N: OrganicManure.NO3N,
                  p2O5: OrganicManure.P2O5,
                  sO3: OrganicManure.SO3,
                  k2O: OrganicManure.K2O,
                  mgO: OrganicManure.MgO,
                },
                applicationDate: applicationDate,
                applicationRate: {
                  value: OrganicManure.ApplicationRate,
                  unit: "kg/hectare",
                },
                applicationMethodID: OrganicManure.ApplicationMethodID,
                incorporationMethodID: OrganicManure.IncorporationMethodID,
                incorporationDelayID: OrganicManure.IncorporationDelayID,
                autumnCropNitrogenUptake: {
                  value: OrganicManure.AutumnCropNitrogenUptake,
                  unit: "string",
                },
                endOfDrainageDate: endOfDrainageDate,
                rainfallPostApplication: OrganicManure.Rainfall,
                windspeedID: OrganicManure.WindspeedID,
                rainTypeID: OrganicManure.RainfallWithinSixHoursID,
                topsoilMoistureID: OrganicManure.MoistureID,
              },
            ],
          };
        }

        // Call the new helper function to create mannerOutputReq
        const mannerOutputs =
          await this.MannerCalculateNutrientsService.postData(
            "/calculate-nutrients",
            mannerOutputReq,
            request
          );

        const Errors = [];
        const {
          latestSoilAnalysis,
          errors: soilAnalysisErrors,
          soilAnalysisRecords,
        } = await this.handleSoilAnalysisValidation(
          fieldData.ID,
          fieldData.Name,
          cropData?.Year
        );
        Errors.push(...soilAnalysisErrors);
        if (Errors.length > 0)
          throw new HttpException(
            JSON.stringify(Errors),
            HttpStatus.BAD_REQUEST
          );

        const dataMultipleCrops = await this.cropRepository.find({
          where: {
            FieldID: fieldData.ID,
            Year: cropData.Year,
            Confirm: false, // Or 0 based on your field setup
          },
        });

        const snsAnalysesData = await this.getSnsAnalysesData(fieldData.ID);
        const nutrientRecommendationnReqBody =
          await this.buildNutrientRecommendationReqBody(
            fieldData,
            farmData,
            soilAnalysisRecords,
            snsAnalysesData,
            dataMultipleCrops,
            cropData,
            mannerOutputs,
            organicManureData
          );

        const nutrientRecommendationsData =
          await this.rB209RecommendationService.postData(
            "Recommendation/Recommendations",
            nutrientRecommendationnReqBody
          );

        if (organicManureData.SaveDefaultForFarm) {
          farmManureTypeData = {
            FarmID: organicManureData.FarmID,
            ManureTypeID: OrganicManure.ManureTypeID,
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

        const savedOrganicManure = await transactionalManager.save(
          OrganicManureEntity,
          this.repository.create({
            ...organicManureData.OrganicManure,
            AvailableN: mannerOutputs.data.currentCropAvailableN,
            CreatedByID: userId,
            ...(organicManureData.OrganicManure.ID == 0 ? { ID: null } : {}),
          })
        );
        organicManures.push(savedOrganicManure);

        let arableNotes = nutrientRecommendationsData.adviceNotes;

        // const cropOrderFirstData = await this.getFirstCropData(
        //   fieldData.ID,
        //   cropData.Year,
        // );

        // const firstCropManagementPeriodId =
        //   await this.getManagementPeriodId(cropOrderFirstData.ID);

        const savedData = await this.saveRecommendationForMultipleCrops(
          transactionalManager,
          nutrientRecommendationsData,
          userId,
          cropData,
          dataMultipleCrops,
          latestSoilAnalysis,
          snsAnalysesData,
          allRecommendations
        );

        console.log("savedDataaa", savedData);

        await this.saveOrUpdateArableNotes(
          arableNotes,
          savedData,
          transactionalManager,
          userId
        );
      }
      if (farmManureTypeData) {
        const existingFarmManureType =
          await this.farmManureTypeRepository.findOne({
            where: {
              FarmID: farmManureTypeData.FarmID,
              ManureTypeID: farmManureTypeData.ManureTypeID,
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
        const concatenatedNote = notesByNutrientId[nutrientId].join(" ");

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
          const newComment = this.recommendationCommentEntity.create({
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

  async checkManureExists(dateFrom, dateTo, confirm, request) {
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
      const liquidManureTypes = allManureTypes.data.filter(
        (manure) => manure.IsLiquid === true || manure.ID === 8
      );

      if (!liquidManureTypes || liquidManureTypes.length === 0) {
        // Log a warning if no liquid or poultry manure types are found
        console.warn("No valid liquid or poultry manure types found");
      }

      // Extract manureTypeIds from the filtered result
      const manureTypeIds = liquidManureTypes.map((manure) => manure.ID);

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
}
module.exports = { OrganicManureService };
