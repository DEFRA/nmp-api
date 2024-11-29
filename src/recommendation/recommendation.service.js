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
    this.FertiliserManuresRepository = AppDataSource.getRepository(FertiliserManuresEntity);
    this.PKbalanceRepository = AppDataSource.getRepository(PKBalanceEntity);
  }

  async getNutrientsRecommendationsForField(
    fieldId,
    harvestYear,
    request
  ) {
    try {
      const storedProcedure =
        "EXEC dbo.spRecommendations_GetRecommendations @fieldId = @0, @harvestYear = @1";
      const recommendations = await this.executeQuery(storedProcedure, [
        fieldId,
        harvestYear,
      ]);
      const mappedRecommendations = recommendations.map((r) => {
        const data = { Crop: {}, Recommendation: {}, ManagementPeriod: {}, FertiliserManure: {}}; 
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
          Year: harvestYear,
          FieldID:fieldId
        },
        select: {
          ID: true,
          PBalance: true,
          KBalance: true
        },
      });
      const groupedObj = {};

      mappedRecommendations.forEach((r) => {
        groupedObj[r.Crop.ID] = {
          Crop: r.Crop,
          PKbalance:PKbalance,
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

              const FertiliserManures = await this.FertiliserManuresRepository.find({
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
                FertiliserManures:FertiliserManures             };
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
