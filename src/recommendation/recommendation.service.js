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
      console.error("FieldID and Year are required");
      return 0; // Return null if required parameters are missing
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
      } else if (year == soilAnalysisYear) {
        query.where.Year = Between(year, soilAnalysisYear); // Include years between `year` and `soilAnalysisYear`
      } else if (year < soilAnalysisYear) {
        return null;
      }
    }

    // Determine whether to use `findOne` or `find` based on the provided parameters
    if (!soilAnalysisYear && cropOrder) {
      // If only fieldID, year, and cropOrder are provided, return a single result using findOne
      return await this.cropRepository.findOne(query);
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

  async processSoilRecommendations(harvestYear, fieldId, Recommendation) {
    try {
      const currentYear = harvestYear;
      const fiveYearsAgo = currentYear - 5;

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
        return 0; // Exit if no recommendation with pH > 0 is found
      }

      // Get the soilAnalysisYear from the recommendation with pH > 0
      const soilAnalysisWithPhYear = soilAnalysisWithPH.Year;
      // console.log(
      //   "RecommendationData",
      //   Recommendation.Crop_ID
      // );
      // console.log(
      //   "RecommendationData1",
      //   Recommendation
      // );
      // const managementPeriodData = await this.findManagementPeriodByID(
      //   Recommendation.ManagementPeriodID
      // );
      // Step 3: Proceed with the process only if pH > 0 is found
      const cropData = await this.findCropDataByID(Recommendation.Crop_ID); // check order 1 or 2
      console.log("cropData", cropData);
      let totalLime1 = 0;
      let totalLime2 = 0;
      let result = 0;
      if (cropData != null) {
        // Step 4: Handle CropOrder 1 (first crop)
        if (cropData.CropOrder === 1) {
          console.log("croporder1");
          // Step: Fetch multiple firstCropOrderData based on fieldID, year, and soilAnalysisYear
          const firstCropOrderDataList =
            await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
              fieldId,
              cropData.Year - 1,
              soilAnalysisWithPhYear,
              1
            );
          console.log("CropOrderDataList", firstCropOrderDataList);
          if (firstCropOrderDataList != null) {
            totalLime1 = await this.getApplyLimeInCaseOfMultipleCrops(
              firstCropOrderDataList
            );
          }

          // Now, totalLime1 contains the sum of lime for all crops found in the list
          console.log(`Total Lime from all firstCropOrderData: ${totalLime1}`);
        }

        // Step 5: Handle CropOrder 2 (second crop)
        if (cropData.CropOrder === 2) {
          console.log("croporder2");
          totalLime1 = 0;
          const CropOrderDataList =
            await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
              fieldId,
              cropData.Year - 1,
              soilAnalysisWithPhYear
            );

          if (CropOrderDataList != null) {
            console.log("CropOrderDataList", CropOrderDataList);
            totalLime1 = await this.getApplyLimeInCaseOfMultipleCrops(
              CropOrderDataList
            );
          }
          let cropOrder = 1;
          const firstCropOrderData =
            await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
              fieldId,
              cropData.Year,
              null,
              cropOrder
            );
          if (firstCropOrderData != null) {
            console.log("CropOrderDataList", firstCropOrderData);
            totalLime1 += await this.getApplyLimeInCaseOfMultipleCrops(
              firstCropOrderData
            );
          }
        }

        // Step 6: Sum total lime values for both crops
        
        console.log("totalLime", totalLime1);

        // Step 7: Subtract the total lime from cropN in the recommendation
        const cropNeedValue = Recommendation.Recommendation_CropN;
        console.log("cropNeedValue", cropNeedValue);
        if (totalLime1 > 0) {
          result = cropNeedValue - totalLime1;
        }
      }
      // Return the result of the calculation
      return result;
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

      const mappedRecommendations = recommendations.map(async (r) => {
        const data = {
          Crop: {},
          Recommendation: {},
          ManagementPeriod: {},
          FertiliserManure: {},
        };

        const previousAppliedLime = await this.processSoilRecommendations(
          harvestYear,
          fieldId,
          r
        );
        // Add previousAppliedLime to Recommendation object
        data.Recommendation.PreviousAppliedLime = previousAppliedLime || 0;

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
      console.log("AllGood");
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
      const mappedRecommendationsNew = await Promise.all(mappedRecommendations);
      mappedRecommendationsNew.forEach((r) => {
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
              // const previousAppliedLime = await this.processSoilRecommendations(
              //   harvestYear,
              //   fieldId,
              //   recData.Recommendation
              // );
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
              // console.log()
              //               // Add previousAppliedLime to the mergedRecommendation object
              //               mergedRecommendation.PreviousAppliedLime =
              //                 previousAppliedLime || 0;

              return {
                Recommendation: mergedRecommendation,
                RecommendationComments: comments,
                ManagementPeriod: recData.ManagementPeriod,
                OrganicManures: organicManuresWithDetails,
                FertiliserManures: FertiliserManures,
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
