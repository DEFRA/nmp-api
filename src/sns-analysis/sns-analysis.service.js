const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");

const {
  UpdateRecommendation,
} = require("../shared/updateRecommendation.service");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const { MoreThan } = require("typeorm");
const { UpdateRecommendationChanges } = require("../shared/updateRecommendationsChanges");
const { GenerateRecommendations } = require("../shared/generate-recomendations-service");
const { UpdatingFutureRecommendations } = require("../shared/updating-future-recommendations-service");

class SnsAnalysisService extends BaseService {
  constructor() {
    super(SnsAnalysesEntity);
    this.repository = AppDataSource.getRepository(SnsAnalysesEntity);
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.UpdateRecommendation = new UpdateRecommendation();
    this.UpdateRecommendationChanges = new UpdateRecommendationChanges();
    this.generateRecommendations = new GenerateRecommendations();
    this.updatingFutureRecommendations = new UpdatingFutureRecommendations();
  }

  async createSnsAnalysis(snsAnalysisBody, userId, request) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      const snsAnalysisRequest = snsAnalysisBody.SnsAnalysis;
      const snsAnalysis = await transactionalManager.save(SnsAnalysesEntity, {
        ...snsAnalysisRequest,
        CreatedByID: userId,
        CreatedOn: new Date(),
      });

      const crop = await this.cropRepository.findOne({
        where: { ID: snsAnalysisRequest.CropID },
      });
      const newOrganicManure = null;
       await this.generateRecommendations.generateRecommendations(
         crop.FieldID,
         crop.Year,
         newOrganicManure,
         transactionalManager,
         request,
         userId
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
         this.updatingFutureRecommendations.updateRecommendationsForField(
             crop.FieldID,
             nextAvailableCrop.Year,
             request,
             userId
           )
       }
      return { snsAnalysis };
    });
  }

  async deleteSnsAnalysis(snsAnalysisId, userId, request) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      // Check if the soilAnalysis exists
      const snsAnalysisToDelete = await transactionalManager.findOne(
        SnsAnalysesEntity,
        {
          where: { ID: snsAnalysisId },
        }
      );

      // If the soilAnalysis does not exist, throw a not found error
      if (snsAnalysisToDelete == null) {
        console.log(`soilAnalysis with ID ${snsAnalysisId} not found`);
      }
      const crop = await this.cropRepository.findOne({
        where: { ID: snsAnalysisToDelete.CropID },
      });
      try {
        // Call the stored procedure to delete the snsAnalysisId and related entities
        const storedProcedure = "EXEC spSnsAnalyses_DeleteSnsAnalyses @id = @0";
        await AppDataSource.query(storedProcedure, [snsAnalysisId]);
         const newOrganicManure = null;
          await this.generateRecommendations.generateRecommendations(
            crop.FieldID,
            crop.Year,
            newOrganicManure,
            transactionalManager,
            request,
            userId
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
          this.updatingFutureRecommendations.updateRecommendationsForField(
              crop.FieldID,
              nextAvailableCrop.Year,
              request,
              userId,
            )
            .then((res) => {
              if (res === undefined) {
                console.log(
                  "updateRecommendationAndOrganicManure returned undefined",
                );
              } else {
                console.log(
                  "updateRecommendationAndOrganicManure result:",
                  res,
                );
              }
            })
            .catch((error) => {
              console.error(
                "Error updating recommendation and organic manure:",
                error,
              );
            });
        }
      } catch (error) {
        // Log the error and throw an internal server error
        console.error("Error deleting SnsAnalyses:", error);
      }
    });
  }

  async updateSnsAnalysis(
    updatedSnsAnalysisData,
    userId,
    snsAnalysisId,
    request
  ) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      const { CreatedByID, CreatedOn,CropID, ...updatedData } =
        updatedSnsAnalysisData.SnsAnalysis;

      // Update snsAnalyses
      const result = await transactionalManager.update(
        SnsAnalysesEntity,
        snsAnalysisId,
        {
          ...updatedData,
          ModifiedByID: userId,
          ModifiedOn: new Date(),
        }
      );

      if (result.affected === 0) {
        throw new Error(`Sns Analysis with ID ${snsAnalysisId} not found`);
      }

      const SnsAnalysis = await transactionalManager.findOne(
        SnsAnalysesEntity,
        {
          where: { ID: snsAnalysisId },
        }
      );

      const crop = await this.cropRepository.findOne({
        where: { ID: SnsAnalysis.CropID },
      });
     const newOrganicManure = null
      await this.generateRecommendations.generateRecommendations(
        crop.FieldID,
        crop.Year,
        newOrganicManure,
        transactionalManager,
        request,
        userId
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
        this.updatingFutureRecommendations.updateRecommendationsForField(
            crop.FieldID,
            nextAvailableCrop.Year,
            request,
            userId,
          )
          .then((res) => {
            if (res === undefined) {
              console.log(
                "updateRecommendationAndOrganicManure returned undefined",
              );
            } else {
              console.log("updateRecommendationAndOrganicManure result:", res);
            }
          })
          .catch((error) => {
            console.error(
              "Error updating recommendation and organic manure:",
              error,
            );
          });
      }

      return { SnsAnalysis };
    });
  }
}

module.exports = { SnsAnalysisService };
