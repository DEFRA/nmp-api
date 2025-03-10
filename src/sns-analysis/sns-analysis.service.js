const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");

const {
  UpdateRecommendation,
} = require("../shared/updateRecommendation.service");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { CropEntity } = require("../db/entity/crop.entity");

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
}

module.exports = { SnsAnalysisService };
