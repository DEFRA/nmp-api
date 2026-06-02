const { AppDataSource } = require("../db/data-source");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const {
  RecommendationCommentEntity,
} = require("../db/entity/recommendation-comment.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { BaseService } = require("../base/base.service");
const MannerManureTypesService = require("../vendors/manner/manure-types/manure-types.service");
const MannerApplicationMethodService = require("../vendors/manner/application-method/application-method.service");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { Between } = require("typeorm");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const RB209GrassService = require("../vendors/rb209/grass/grass.service");
const RB209GrasslandService = require("../vendors/rb209/grassland/grassland.service");
const { CropTypeMapper } = require("../constants/crop-type-mapper");

class RecommendationService extends BaseService {
  constructor() {
    super(RecommendationEntity);
    this.repository = AppDataSource.getRepository(RecommendationEntity);
    this.recommendationCommentRepository = AppDataSource.getRepository(
      RecommendationCommentEntity
    );
    this.organicManureRepository =
      AppDataSource.getRepository(OrganicManureEntity);
    this.MannerManureTypesService = new MannerManureTypesService();
    this.MannerApplicationMethodService = new MannerApplicationMethodService();
    this.FertiliserManuresRepository = AppDataSource.getRepository(
      FertiliserManuresEntity
    );
    this.PKbalanceRepository = AppDataSource.getRepository(PKBalanceEntity);
    this.soilAnalysisRepository =
      AppDataSource.getRepository(SoilAnalysisEntity);
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.managementPeriodRepository = AppDataSource.getRepository(
      ManagementPeriodEntity
    );
    this.fertiliserManuresRepository = AppDataSource.getRepository(
      FertiliserManuresEntity
    );    
    this.rB209GrassService = new RB209GrassService();
    this.rB209GrasslandService = new RB209GrasslandService();
  }
  async findManagementPeriodByID(ManagementPeriodID) {
    // Ensure the managementPeriodID is provided
    if (!ManagementPeriodID) {
      console.error("ManagementPeriodID is required");
    }

    // Find the ManagementPeriodData by the provided ManagementPeriodID
    const managementPeriodData = await this.managementPeriodRepository.findOne({
      where: {
        ID: ManagementPeriodID,
      },
    });

    // Return the ManagementPeriodData or null if not found
    return managementPeriodData || null;
  }
  async findManagementPeriodByCropID(CropID) {
    // Ensure the managementPeriodID is provided
    if (!CropID) {
      console.error("CropID is required");
    }

    // Find the ManagementPeriodData by the provided ManagementPeriodID
    const managementPeriodData = await this.managementPeriodRepository.findOne({
      where: {
        CropID: CropID,
      },
    });

    // Return the ManagementPeriodData or null if not found
    return managementPeriodData || null;
  }

  async findCropDataByID(CropID) {
    // Ensure the managementPeriodID is provided
    if (!CropID) {
      console.error("CropID is required");
    }

    // Find the ManagementPeriod by the provided ManagementPeriodID
    const cropData = await this.cropRepository.findOne({
      where: {
        ID: CropID,
      },
    });

    // Check if management period data is found
    if (!cropData) {
      return 0;
    }

    // Return the associated crop data
    return cropData;
  }

  async findCropDataByFieldIDAndYearToSoilAnalysisYear(
    fieldID,
    year,
    soilAnalysisYear = null,
    cropOrder = null
  ) {
    // Ensure both fieldID and year are provided
    if (!fieldID || !year) {
      console.log("FieldID and Year are required");
      return null; 
    }

    // Build the query object
    const query = {
      where: {
        FieldID: fieldID, // FieldID is required
        Year: year, // Default Year filter (exact year match)
      },
    };

    // If cropOrder is provided, include it in the query
    if (cropOrder) {
      query.where.CropOrder = cropOrder;
    }

    // If soilAnalysisYear 2024 is provided, adjust the query to include years up to soilAnalysisYear
    //Harvestyear 2024
    if (soilAnalysisYear) {
      if (year > soilAnalysisYear) {
        query.where.Year = Between(soilAnalysisYear, year); // Include years between `year` and `soilAnalysisYear`
      } else if (year === soilAnalysisYear) {
        query.where.Year = Between(year, soilAnalysisYear); // Include years between `year` and `soilAnalysisYear`
      } else if (year < soilAnalysisYear) {
        return null;
      }else {console.log("Invalid year and soilAnalysisYear combination")}
    }

    // Determine whether to use `findOne` or `find` based on the provided parameters
    if (!soilAnalysisYear && cropOrder) {
      // If only fieldID, year, and cropOrder are provided, return a single result using findOne
      const cropDatabyFieldAndYear = await this.cropRepository.findOne(query);
      return cropDatabyFieldAndYear;
    } else {
      // If soilAnalysisYear is provided, return all crop data between year and soilAnalysisYear
      const cropDataList = await this.cropRepository.find(query);
      console.log("cropDataList", cropDataList);
      return cropDataList.length > 0 ? cropDataList : null;
    }
  }

  async findAndSumFertiliserManuresByManagementPeriodID(managementPeriodID) {
    // Ensure the managementPeriodID is provided
    if (!managementPeriodID) {
      console.log("ManagementPeriodID is required");
    }

    // Fetch all fertiliser manures data for the given ManagementPeriodID
    const fertiliserManures = await this.fertiliserManuresRepository.find({
      where: {
        ManagementPeriodID: managementPeriodID,
      },
      select: {
        Lime: true, // Only select the Lime field
      },
    });

    // Check if any fertiliser manures data is found
    if (!fertiliserManures || fertiliserManures.length === 0) {
      console.log(
        `No fertiliser manures data found for ManagementPeriodID ${managementPeriodID}`
      );
      return 0; // Exit if no fertiliser data is found
    }

    // Sum up the Lime values from the list of fertiliser manures data
    const totalLime = fertiliserManures.reduce((total, item) => {
      return total + (item.Lime || 0); // Add Lime value if available, otherwise 0
    }, 0);

    // Return the total sum of Lime
    return totalLime;
  }

  async getApplyLimeInCaseOfMultipleCrops(cropDataList) {
    let totalLime = 0; // Initialize total lime to 0

    // Ensure cropDataList is an array, if it's not, wrap it in an array
    const cropsToProcess = Array.isArray(cropDataList)
      ? cropDataList
      : [cropDataList];
    // Loop through each crop in the cropsToProcess (which is always an array)
    for (const cropData of cropsToProcess) {
      // Fetch the ManagementPeriod data for the current crop
      const previousManagementPeriodData =
        await this.findManagementPeriodByCropID(cropData.ID);

      // Fetch and sum the total lime for the current management period
      const limeForThisManagementPeriod =
        await this.findAndSumFertiliserManuresByManagementPeriodID(
          previousManagementPeriodData.ID
        );
      console.log("limeForThisManagementPeriod", limeForThisManagementPeriod);
      // Accumulate the lime value
      totalLime += limeForThisManagementPeriod;
    }

    return totalLime; // Return the total lime value
  }

  async calculateFirstCropPreviousLime(fieldId, cropData, soilAnalysisYear) {
    const firstCropOrderDataList =
      await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
        fieldId,
        cropData.Year - 1,
        soilAnalysisYear,
        1
      );

    if (firstCropOrderDataList == null) {
      return 0;
    }

    const totalLime = await this.getApplyLimeInCaseOfMultipleCrops(
      firstCropOrderDataList
    );
    console.log(`Total Lime from all firstCropOrderData: ${totalLime}`);
    return totalLime;
  }

  async calculateSecondCropPreviousLime(fieldId, cropData, soilAnalysisYear) {
    const cropOrderDataList =
      await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
        fieldId,
        cropData.Year - 1,
        soilAnalysisYear
      );
    const priorCropLime = cropOrderDataList == null
      ? 0
      : await this.getApplyLimeInCaseOfMultipleCrops(cropOrderDataList);
    const firstCropOrderData =
      await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
        fieldId,
        cropData.Year,
        null,
        1
      );

    if (firstCropOrderData == null) {
      return priorCropLime;
    }

    console.log("CropOrderDataList", firstCropOrderData);
    return (
      priorCropLime +
      await this.getApplyLimeInCaseOfMultipleCrops(firstCropOrderData)
    );
  }

  async calculatePreviousAppliedLime(fieldId, cropData, soilAnalysisYear) {
    if (cropData.CropOrder === 1) {
      return this.calculateFirstCropPreviousLime(
        fieldId,
        cropData,
        soilAnalysisYear
      );
    }

    if (cropData.CropOrder === 2) {
      return this.calculateSecondCropPreviousLime(
        fieldId,
        cropData,
        soilAnalysisYear
      );
    }

    return 0;
  }

  getPreviousAppliedLimeRecommendation(cropNeedValue, totalLime) {
    if (totalLime <= 0) {
      return 0;
    }

    return Math.max(cropNeedValue - totalLime, 0);
  }

  async processSoilRecommendations(harvestYear, fieldId, Recommendation) {
    try {
      const fiveYears = 5;
      const currentYear = harvestYear;
      const fiveYearsAgo = currentYear - fiveYears;
      // Step 1: Fetch soil recommendations (before fertiliser apply)
      const soilAnalyses = await this.soilAnalysisRepository.find({
        where: {
          FieldID: fieldId,
          Year: Between(fiveYearsAgo, currentYear),
        },
      });

      // Step 2: Check if any year has pH value > 0
      const soilAnalysisWithPH = soilAnalyses.find((rec) => rec.PH > 0);

      // If no pH > 0 is found, return early without doing any further processing
      if (!soilAnalysisWithPH) {
        return null; // Exit if no recommendation with pH > 0 is found
      }
      // Get the soilAnalysisYear from the recommendation with pH > 0
      const soilAnalysisWithPhYear = soilAnalysisWithPH.Year;
      // Step 3: Proceed with the process only if pH > 0 is found
      const cropData = await this.findCropDataByID(Recommendation.Crop_ID); // check order 1 or 2

      if (cropData == null) {
        return 0;
      }

      const totalLime = await this.calculatePreviousAppliedLime(
        fieldId,
        cropData,
        soilAnalysisWithPhYear
      );
      const cropNeedValue = Recommendation.Recommendation_CropN;
      console.log("cropNeedValue", cropNeedValue);
      return this.getPreviousAppliedLimeRecommendation(cropNeedValue, totalLime);
    } catch (error) {
      console.error("Error in processSoilRecommendations:", error);
      throw error;
    }
  }

  mapRecommendationField(recDataKey, recommendationRow, data) {
    const PREFIXES = {
      CROP: "Crop_",
      RECOMMENDATION: "Recommendation_",
      MANAGEMENT_PERIOD: "ManagementPeriod_",
      FERTILISER_MANURE: "FertiliserManure_",
    };

    if (recDataKey.startsWith(PREFIXES.CROP)) {
      data.Crop[recDataKey.slice(PREFIXES.CROP.length)] =
        recommendationRow[recDataKey];
    } else if (recDataKey.startsWith(PREFIXES.RECOMMENDATION)) {
      data.Recommendation[recDataKey.slice(PREFIXES.RECOMMENDATION.length)] =
        recommendationRow[recDataKey];
    } else if (recDataKey.startsWith(PREFIXES.MANAGEMENT_PERIOD)) {
      data.ManagementPeriod[recDataKey.slice(PREFIXES.MANAGEMENT_PERIOD.length)] =
        recommendationRow[recDataKey];
    } else if (recDataKey.startsWith(PREFIXES.FERTILISER_MANURE)) {
      data.FertiliserManure[recDataKey.slice(PREFIXES.FERTILISER_MANURE.length)] =
        recommendationRow[recDataKey];
    } else {
      console.log("no assignment");
    }
  }

  async mapRecommendationRow(recommendationRow, harvestYear, fieldId) {
    const data = {
      Crop: {},
      Recommendation: {},
      ManagementPeriod: {},
      FertiliserManure: {},
    };

    const previousAppliedLime = await this.processSoilRecommendations(
      harvestYear,
      fieldId,
      recommendationRow,
    );
    data.Recommendation.PreviousAppliedLime = previousAppliedLime || 0;

    Object.keys(recommendationRow).forEach((recDataKey) => {
      this.mapRecommendationField(recDataKey, recommendationRow, data);
    });

    return data;
  }

  async getPreviousYearPKBalance(fieldId, harvestYear) {
    return this.PKbalanceRepository.findOne({
      where: {
        Year: harvestYear - 1,
        FieldID: fieldId,
      },
      select: {
        ID: true,
        PBalance: true,
        KBalance: true,
      },
    });
  }

  async findDefoliationSequenceDescription(DefoliationSequenceID) {
    try {
      const defoliationSequence = await this.rB209GrassService.getData(
        `Grass/DefoliationSequence/${DefoliationSequenceID}`
      );

      return defoliationSequence
        ? defoliationSequence.defoliationSequenceDescription
        : null;
    } catch (error) {
      console.error(
        `Error fetching Defoliation Sequence by id ${DefoliationSequenceID}`,
        error
      );
      return "Unknown";
    }
  }

  async findSwardType(SwardTypeID) {
    try {
      let swardTypeName = null;
      const swardTypeList = await this.rB209GrassService.getData(
        `Grass/SwardTypes`
      );

      if (swardTypeList.length > 0) {
        const matchingSward = swardTypeList.find(
          (x) => x.swardTypeId === SwardTypeID
        );
        if (matchingSward != null) {
          swardTypeName = matchingSward ? matchingSward.swardType : null;
        }
      }

      return swardTypeName;
    } catch (error) {
      console.error(`Error fetching sward Type list`, error);
      return "Unknown";
    }
  }

  async findGrassSeason(seasonID) {
    try {
      const season = await this.rB209GrasslandService.getData(
        `Grassland/GrasslandSeason/${seasonID}`
      );
      return season.seasonName;
    } catch (error) {
      console.error(`Error fetching Grassland Season`, error);
      return "Unknown";
    }
  }

  async addGrassCropNames(crop) {
    const isGrass = crop.CropTypeID === CropTypeMapper.GRASS;

    return {
      ...crop,
      EstablishmentName: isGrass && crop.Establishment !== null
        ? await this.findGrassSeason(crop.Establishment)
        : null,
      SwardManagementName: isGrass && crop.SwardManagementID !== null
        ? await this.findSwardTypeManagment(crop.SwardManagementID)
        : null,
      SwardTypeName: isGrass && crop.SwardTypeID !== null
        ? await this.findSwardType(crop.SwardTypeID)
        : null,
      DefoliationSequenceName: isGrass && crop.DefoliationSequenceID !== null
        ? await this.findDefoliationSequenceDescription(crop.DefoliationSequenceID)
        : null,
    };
  }

  async groupRecommendationsByCrop(mappedRecommendations, PKbalance) {
    const groupedObj = {};

    for (const recommendation of mappedRecommendations) {
      groupedObj[recommendation.Crop.ID] = {
        Crop: await this.addGrassCropNames(recommendation.Crop),
        PKbalance,
        Recommendations: (
          groupedObj[recommendation.Crop.ID]?.Recommendations || []
        ).concat({
          Recommendation: recommendation.Recommendation,
          ManagementPeriod: recommendation.ManagementPeriod,
          FertiliserManure: recommendation.FertiliserManure,
        }),
      };
    }

    return groupedObj;
  }

  async getOrganicManuresWithDetails(managementPeriodId, request) {
    const organicManures = await this.organicManureRepository.find({
      where: {
        ManagementPeriodID: managementPeriodId,
      },
      select: {
        ID: true,
        ManureTypeID: true,
        ApplicationDate: true,
        ApplicationRate: true,
        ApplicationMethodID: true,
      },
    });

    return Promise.all(
      organicManures.map(async (organicManure) =>
        this.addOrganicManureReferenceDetails(organicManure, request),
      )
    );
  }

  async addOrganicManureReferenceDetails(organicManure, request) {
    const manureTypeId = Number(organicManure.ManureTypeID);
    const applicationMethodId = Number(organicManure.ApplicationMethodID);
    const manureTypeData = await this.MannerManureTypesService.getData(
      `/manure-types/${manureTypeId}`,
      request,
    );
    const applicationMethodData =
      await this.MannerApplicationMethodService.getData(
        `/application-methods/${applicationMethodId}`,
        request,
      );

    return {
      ...organicManure,
      ManureTypeName: manureTypeData.data.name,
      ApplicationMethodName: applicationMethodData.data.name,
    };
  }

  async getFertiliserManuresForManagementPeriod(managementPeriodId) {
    return this.FertiliserManuresRepository.find({
      where: {
        ManagementPeriodID: managementPeriodId,
      },
      select: {
        ID: true,
        ApplicationDate: true,
        ApplicationRate: true,
        N: true,
        P2O5: true,
        K2O: true,
        MgO: true,
        SO3: true,
        Na2O: true,
        Lime: true,
        NH4N: true,
        NO3N: true,
      },
    });
  }

  async addRecommendationDetails(recData, request) {
    const comments = await this.recommendationCommentRepository.find({
      where: {
        RecommendationID: recData.Recommendation.ID,
      },
    });
    const organicManuresWithDetails = await this.getOrganicManuresWithDetails(
      recData.ManagementPeriod.ID,
      request,
    );
    const FertiliserManures =
      await this.getFertiliserManuresForManagementPeriod(
        recData.ManagementPeriod.ID,
      );
    const mergedRecommendation = {
      ...recData.Recommendation,
      ...recData.FertiliserManure,
    };

    return {
      Recommendation: mergedRecommendation,
      RecommendationComments: comments,
      ManagementPeriod: recData.ManagementPeriod,
      OrganicManures: organicManuresWithDetails,
      FertiliserManures,
    };
  }

  async addDetailsToGroupedRecommendations(groupedObj, request) {
    return Promise.all(
      Object.values(groupedObj).map(async (recommendationGroup) => ({
        ...recommendationGroup,
        Recommendations: await Promise.all(
          recommendationGroup.Recommendations.map((recData) =>
            this.addRecommendationDetails(recData, request),
          )
        ),
      }))
    );
  }

  async getNutrientsRecommendationsForField(fieldId, harvestYear, request) {
    try {
      const storedProcedure ="EXEC dbo.spRecommendations_GetRecommendations @fieldId = @0, @harvestYear = @1";
      const recommendations = await this.executeQuery(storedProcedure, [fieldId,harvestYear]);
      const mappedRecommendations = await Promise.all(
        recommendations.map((recommendation) =>
          this.mapRecommendationRow(recommendation, harvestYear, fieldId),
        )
      );
      console.log("mappedRecommendationsNew", mappedRecommendations);

      const PKbalance = await this.getPreviousYearPKBalance(
        fieldId,
        harvestYear,
      );
      const groupedObj = await this.groupRecommendationsByCrop(
        mappedRecommendations,
        PKbalance,
      );
      console.log("groupedObj", groupedObj);

      return this.addDetailsToGroupedRecommendations(groupedObj, request);
    } catch (error) {
      console.error("Error while fetching join data:", error);
      throw error;
    }
  }
  async findSwardTypeManagment(SwardManagementID) {
    try {
      let swardManagementsName = null;
      const swardManagementsList = await this.rB209GrassService.getData(
        `Grass/SwardManagements`
      );
console.log('swardManagementsList',swardManagementsList);
      if (swardManagementsList.length > 0) {
        const matchingSward = swardManagementsList.find(
          (x) => x.swardManagementId === SwardManagementID
        );
        if (matchingSward != null) {
          swardManagementsName = matchingSward
            ? matchingSward.swardManagement
            : null;
        }
      }

      return swardManagementsName;
    } catch (error) {
      console.error(`Error fetching sward Management list`, error);
      return "Unknown";
    }
  };
  async getByManagementPeriodId(managementPeriodID) {
    const record = await this.repository.findOne({
      where: {
        ManagementPeriodID: managementPeriodID,
      },
    });
    return record;
}

}

module.exports = { RecommendationService };
