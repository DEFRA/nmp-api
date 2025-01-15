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

  async processSoilRecommendations(harvestYear, fieldId) { // recommandationData
    try {
      const currentYear = harvestYear;
      const fiveYearsAgo = currentYear - 5;
       // cropOrder 1 = recommandationData.cropNeed-lime
 //fetch cropData using managperiodId (recommandationData.ManmanagperiodId)= field, year
 // soil analysis(field, year)
 // crop id get (field, year-1)
 //fetch managperiod(cropID)= managperiodId
 // fetch fertiliser (managperiodId)
 // sum total lime

 // cropOrder2 = recommandationData.cropNeed-lime
//fetch cropData using managperiodId (recommandationData.ManmanagperiodId)= field, year
 // soil analysis(field, year)
 // crop id get (field, year-1)
 //fetch managperiod(cropID)= managperiodId= 
 // fetch fertiliser (managperiodId)
 // sum total lime (crop order 1)
 // sum total lime (crop order 2)
 //crop order 1 lime+crop order 2 lime




      // Step 1: Find soil recommendations for the past 5 years including the current year
      const soilRecommendations = await this.soilAnalysisRepository.find({ //before fertiliser apply
        where: {
          FieldID: fieldId,
          Year: Between(fiveYearsAgo, currentYear),
        },
      });

      // Step 2: Check if any year has pH value > 0
      const recommendationWithPH = soilRecommendations.find(
        (rec) => rec.PH > 0
      );

      if (!recommendationWithPH) {
        // If no pH > 0 is found, return without doing anything
        return 0;
      }

      // If a pH > 0 is found, get the year of that recommendation
      const yearWithPH = recommendationWithPH.Year;

      // Step 3: Find data in CropRepository by fieldId and yearWithPH
      const cropData = await this.cropRepository.findOne({
        where: {
          FieldID: fieldId,
          Year: harvestYear-1,
        },
        select: {
          ID: true, // We only need the crop ID now
        },
      });

      if (!cropData) {
        console.error(
          `No crop data found for FieldID ${fieldId} and Year ${yearWithPH}`
        );
        return null; // Exit if no crop data is found
      }

      // Step 4: Find ManagementPeriodID in ManagementPeriodRepository using cropData.ID
      const managementPeriodData =
        await this.managementPeriodRepository.findOne({
          where: {
            CropID: cropData.ID, // Assuming CropID is the foreign key to the crop table
          },
          select: {
            ID: true, // The ManagementPeriodID we need
          },
        });

      if (!managementPeriodData) {
        console.error(
          `No management period data found for CropID ${cropData.ID}`
        );
        return null; // Exit if no management period data is found
      }

      const managementPeriodID = managementPeriodData.ID;

      // Step 5: Find data in FertiliserManuresRepository by ManagementPeriodID
      const fertiliserManuresData =
        await this.fertiliserManuresRepository.findOne({  // sum
          where: {
            ManagementPeriodID: managementPeriodID,
          },
          select: {
            Lime: true,
          },
        });

      if (!fertiliserManuresData) {
        console.error(
          `No fertiliser manures data found for ManagementPeriodID ${managementPeriodID}`
        );
        return null; // Exit if no fertiliser data is found
      }

      const limeValue = fertiliserManuresData.Lime;

      // Step 6: Find data in RecommendationRepository by ManagementPeriodID
      const recommendationData = await this.repository.findOne({
        where: {
          ManagementPeriodID: managementPeriodID, // current year not previous year
        },
        select: {
          CropNeed: true,
        },
      });

      if (!recommendationData) {
        console.error(
          `No recommendation data found for ManagementPeriodID ${managementPeriodID}`
        );
        return null; // Exit if no recommendation data is found
      }

      const cropNeedValue = recommendationData.CropNeed;

      // Step 7: Perform the calculation (CropNeed - Lime)
      const result = cropNeedValue - limeValue;

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

              const previousAppliedLime = await this.processSoilRecommendations(
                harvestYear,
                fieldId
              );
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
