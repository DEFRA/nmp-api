const { AppDataSource } = require("../db/data-source");
const {
  RecommendationEntity,
} = require("../db/entity/recommendation.entity");
const {
  RecommendationCommentEntity,
} = require("../db/entity/recommendation-comment.entity");
const {
  OrganicManureEntity,
} = require("../db/entity/organic-manure.entity");
const { BaseService } = require("../base/base.service");
const MannerManureTypesService = require("../vendors/manner/manure-types/manure-types.service");
const MannerApplicationMethodService = require("../vendors/manner/application-method/application-method.service");
const { FertiliserManuresEntity } = require("../db/entity/fertiliser-manures.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { Between } = require("typeorm");
const { CropEntity } = require("../db/entity/crop.entity");
const { ManagementPeriodEntity } = require("../db/entity/management-period.entity");

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
  }
  async findManagementPeriodByCropID(CropID) {
    // Ensure the managementPeriodID is provided
    if (!CropID) {
      throw new Error("CropID is required");
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

  async findCropDataByManagementPeriodID(managementPeriodID) {
    // Ensure the managementPeriodID is provided
    if (!managementPeriodID) {
      console.error("ManagementPeriodID is required");
    }

    // Find the ManagementPeriod by the provided ManagementPeriodID
    const managementPeriodData = await this.managementPeriodRepository.findOne({
      where: {
        ID: managementPeriodID,
      },
      relations: ["Crop"], // Assuming "Crop" is the relation name in your entity
    });

    // Check if management period data is found
    if (!managementPeriodData || !managementPeriodData.Crop) {
      return 0; 
    }

    // Return the associated crop data
    return managementPeriodData.Crop;
  }

  async findCropDataByFieldIDAndYear(fieldID, year, cropOrder = null) {
    // Ensure both fieldID and year are provided
    if (!fieldID || !year) {
      console.error("FieldID and Year are required");
      return 0; // Return null if required parameters are missing
    }

    // Build the query object based on the provided parameters
    const query = {
      where: {
        FieldID: fieldID, // FieldID is required
        Year: year, // Year is required
      },
    };

    // If cropOrder is provided, include it in the query
    if (cropOrder !== null) {
      query.where.CropOrder = cropOrder;
    }

    // Find a single crop data based on the provided fieldID, year, and optional cropOrder
    const cropData = await this.cropRepository.findOne(query);

    // Return the found crop data or null if not found
    return cropData || null;
  }

  async findAndSumFertiliserManuresByManagementPeriodID(managementPeriodID) {
    // Ensure the managementPeriodID is provided
    if (!managementPeriodID) {
      console.error("ManagementPeriodID is required");
    }

    // Fetch all fertiliser manures data for the given ManagementPeriodID
    const fertiliserManuresData = await this.fertiliserManuresRepository.find({
      where: {
        ManagementPeriodID: managementPeriodID,
      },
      select: {
        Lime: true, // Only select the Lime field
      },
    });

    // Check if any fertiliser manures data is found
    if (!fertiliserManuresData || fertiliserManuresData.length === 0) {
      console.error(
        `No fertiliser manures data found for ManagementPeriodID ${managementPeriodID}`
      );
      return 0; // Exit if no fertiliser data is found
    }

    // Sum up the Lime values from the list of fertiliser manures data
    const totalLime = fertiliserManuresData.reduce((total, item) => {
      return total + (item.Lime || 0); // Add Lime value if available, otherwise 0
    }, 0);

    // Return the total sum of Lime
    return totalLime;
  }

  async processSoilRecommendations(harvestYear, fieldId, Recommendation) {
    try {
      const currentYear = harvestYear;
      const fiveYearsAgo = currentYear - 5;

      // Step 1: Fetch soil recommendations (before fertiliser apply)
      const soilRecommendations = await this.soilAnalysisRepository.find({
        where: {
          FieldID: fieldId,
          Year: Between(fiveYearsAgo, currentYear),
        },
      });

      // Step 2: Check if any year has pH value > 0
      const recommendationWithPH = soilRecommendations.find(
        (rec) => rec.PH > 0
      );

      // If no pH > 0 is found, return early without doing any further processing
      if (!recommendationWithPH) {
        return 0; // Exit if no recommendation with pH > 0 is found
      }

      // Step 3: Proceed with the process only if pH > 0 is found
      const cropData = await this.findCropDataByManagementPeriodID(
        Recommendation.ManagementPeriodID
      ); // check order 1 or 2

      let totalLime1 = 0;
      let totalLime2 = 0;

      // Step 4: Handle CropOrder 1 (first crop)
      if (cropData.CropOrder === 1) {
        const firstCropOrderData = await this.findCropDataByFieldIDAndYear(
          fieldId,
          cropData.Year - 1
        );

        // Fetch the first crop's total lime
        const previousManagementPeriodData =
          await this.findManagementPeriodByCropID(firstCropOrderData.ID);
        totalLime1 = await this.findAndSumFertiliserManuresByManagementPeriodID(
          previousManagementPeriodData.ID
        );
      }

      // Step 5: Handle CropOrder 2 (second crop)
      if (cropData.CropOrder === 2) {
        // Fetch the second crop's data
        const firstCropOrderData = await this.findCropDataByFieldIDAndYear(
          fieldId,
          cropData.Year
        );

        const previousManagementPeriodData =
          await this.findManagementPeriodByCropID(firstCropOrderData.ID);
        totalLime1 = await this.findAndSumFertiliserManuresByManagementPeriodID(
          previousManagementPeriodData.ID
        );

        const secondCropData = cropData;
        const secondManagementPeriodData =
          await this.findManagementPeriodByCropID(secondCropData.ID);
        totalLime2 = await this.findAndSumFertiliserManuresByManagementPeriodID(
          secondManagementPeriodData.ID
        );
      }

      // Step 6: Sum total lime values for both crops
      const totalLime = totalLime1 + totalLime2;

      // Step 7: Subtract the total lime from cropN in the recommendation
      const cropNeedValue = Recommendation.CropLime;
      const result = cropNeedValue - totalLime;

      // Return the result of the calculation
      return {
        result,
      };
    } catch (error) {
      console.error("Error in processSoilRecommendations:", error);
      throw error;
    }
  }

  async getNutrientsRecommendationsForField(fieldId, harvestYear, request) {
    try {
      const storedProcedure =
        "EXEC dbo.spRecommendations_GetRecommendations @fieldId = @0, @harvestYear = @1";
      const recommendations = await this.executeQuery(storedProcedure, [
        fieldId,
        harvestYear,
      ]);
      const mappedRecommendations = recommendations.map((r) => {
        const data = {
          Crop: {},
          Recommendation: {},
          ManagementPeriod: {},
          FertiliserManure: {},
        };
        Object.keys(r).forEach((recDataKey) => {
          if (recDataKey.startsWith("Crop_"))
            data.Crop[recDataKey.slice(5)] = r[recDataKey];
          else if (recDataKey.startsWith("Recommendation_"))
            data.Recommendation[recDataKey.slice(15)] = r[recDataKey];
          else if (recDataKey.startsWith("ManagementPeriod_"))
            data.ManagementPeriod[recDataKey.slice(17)] = r[recDataKey];
          else if (recDataKey.startsWith("FertiliserManure_"))
            data.FertiliserManure[recDataKey.slice(17)] = r[recDataKey];
        });
        return data;
      });
      const PKbalance = await this.PKbalanceRepository.findOne({
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
      const groupedObj = {};
      console.log("PKBalnceee", PKbalance);
      mappedRecommendations.forEach((r) => {
        groupedObj[r.Crop.ID] = {
          Crop: r.Crop,
          PKbalance: PKbalance,
          Recommendations: (
            groupedObj[r.Crop.ID]?.Recommendations || []
          ).concat({
            Recommendation: r.Recommendation,
            ManagementPeriod: r.ManagementPeriod,
            FertiliserManure: r.FertiliserManure,
          }),
        };
      });

      const dataWithComments = await Promise.all(
        Object.values(groupedObj).map(async (r) => ({
          ...r,
          Recommendations: await Promise.all(
            r.Recommendations.map(async (recData) => {
              const comments = await this.recommendationCommentRepository.find({
                where: {
                  RecommendationID: recData.Recommendation.ID,
                },
              });

              const organicManures = await this.organicManureRepository.find({
                where: {
                  ManagementPeriodID: recData.ManagementPeriod.ID,
                },
                select: {
                  ID: true,
                  ManureTypeID: true,
                  ApplicationDate: true,
                  ApplicationRate: true,
                  ApplicationMethodID: true,
                },
              });

              const FertiliserManures =
                await this.FertiliserManuresRepository.find({
                  where: {
                    ManagementPeriodID: recData.ManagementPeriod.ID,
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
              const currentYear = harvestYear;
              const fiveYearsAgo = currentYear - 5; //crop table crop ID se Management PeriodID Fertilisertable managementperiod se recommendation main croplime se fertriliser minus kaarna hai

              // Fetch ManureType details from external API
              const organicManuresWithDetails = await Promise.all(
                organicManures.map(async (o) => {
                  const manureTypeData =
                    await this.MannerManureTypesService.getData(
                      `/manure-types/${o.ManureTypeID}`,
                      request
                    );
                  const applicationMethodData =
                    await this.MannerApplicationMethodService.getData(
                      `/application-methods/${o.ApplicationMethodID}`,
                      request
                    );
                  return {
                    ...o,
                    ManureTypeName: manureTypeData.data.name,
                    ApplicationMethodName: applicationMethodData.data.name,
                  };
                })
              );

              const mergedRecommendation = {
                ...recData.Recommendation,
                ...recData.FertiliserManure, // Adds FertiliserManure properties to Recommendation
              };
              console.log("recData.Recommendation", recData.Recommendation);
              const previousAppliedLime = await this.processSoilRecommendations(
                harvestYear,
                fieldId,
                recData.Recommendation
              );
              return {
                Recommendation: mergedRecommendation,
                RecommendationComments: comments,
                ManagementPeriod: recData.ManagementPeriod,
                OrganicManures: organicManuresWithDetails,
                FertiliserManures: FertiliserManures,
                previousAppliedLime: previousAppliedLime,
              };
            })
          ),
        }))
      );

      return dataWithComments;
    } catch (error) {
      console.error("Error while fetching join data:", error);
      throw error;
    }
  }
}

module.exports = { RecommendationService };
