const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");

const {
  UpdateRecommendation,
} = require("../shared/updateRecommendation.service");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const { MoreThan } = require("typeorm");

class SnsAnalysisService extends BaseService {
  constructor() {
    super(SnsAnalysesEntity);
    this.repository = AppDataSource.getRepository(SnsAnalysesEntity);
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.UpdateRecommendation = new UpdateRecommendation();
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
            console.log("updateRecommendationAndOrganicManure result:", res);
          }
        })
        .catch((error) => {
          console.error(
            "Error updating recommendation and organic manure:",
            error
          );
        });

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

        this.UpdateRecommendation.updateRecommendationAndOrganicManure(
          crop.FieldID,
          crop.Year,
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

      // Update SoilAnalysis
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
        throw new Error(`Soil Analysis with ID ${snsAnalysisId} not found`);
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

      this.UpdateRecommendation.updateRecommendationAndOrganicManure(
        crop.FieldID,
        crop.Year,
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
              console.log("updateRecommendationAndOrganicManure result:", res);
            }
          })
          .catch((error) => {
            console.error(
              "Error updating recommendation and organic manure:",
              error
            );
          });
      }

      return { SnsAnalysis };
    });
  }
}

module.exports = { SnsAnalysisService };
