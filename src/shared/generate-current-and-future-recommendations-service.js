const { MoreThan } = require("typeorm");
const { GenerateRecommendations } = require("./generate-recomendations-service");
const { UpdatingFutureRecommendations } = require("./updating-future-recommendations-service");
const { CropEntity } = require("../db/entity/crop.entity");

class CurrentAndFuture {
 
constructor(){
 this.generateRecommendations = new GenerateRecommendations();
 this.updatingFutureRecommendations = new UpdatingFutureRecommendations();
}
async regenerateCurrentAndFutureRecommendations(
  crop,
  transactionalManager,
  request,
  userId
) {
  const newOrganicManure = null;
  // Generate recommendations for current crop
  await this.generateRecommendations.generateRecommendations(
    crop.FieldID,
    crop.Year,
    newOrganicManure,
    transactionalManager,
    request,
    userId
  );

  // Use transactional manager instead of repository
  const nextAvailableCrop = await transactionalManager.findOne(
    CropEntity,
    {
      where: {
        FieldID: crop.FieldID,
        Year: MoreThan(crop.Year),
      },
      order: {
        Year: 'ASC',
      },
    },
  );

  if (nextAvailableCrop) {
    await this.updatingFutureRecommendations.updateRecommendationsForField(
      crop.FieldID,
      nextAvailableCrop.Year,
      request,
      userId
    );
  }
}
}
module.exports = { CurrentAndFuture };