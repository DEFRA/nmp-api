const { MoreThan } = require("typeorm");
const {
  GenerateRecommendations,
} = require("./generate-recomendations-service");
const {
  UpdatingFutureRecommendations,
} = require("./updating-future-recommendations-service");
const { CropEntity } = require("../db/entity/crop.entity");
const { runWithDeadlockRetry } = require("../db/transactionRetry");

class CurrentAndFuture {
  constructor() {
    this.generateRecommendations = new GenerateRecommendations();
    this.updatingFutureRecommendations = new UpdatingFutureRecommendations();
  }
  async regenerateCurrentAndFutureRecommendations(
    crop,
    transactionalManager,
    request,
    userId,
  ) {
    const newOrganicManure = null;
    // Generate recommendations for current crop
    await runWithDeadlockRetry(
      () =>
        this.generateRecommendations.generateRecommendations(
          crop.FieldID,
          crop.Year,
          newOrganicManure,
          transactionalManager,
          request,
          userId,
        ),
      {
        retries: 4,
        delayMs: 150,
        backoffMultiplier: 2,
        jitterMs: 100,
        operationName: "current-recommendation-generate",
      },
    );

    // Use transactional manager instead of repository
    const nextAvailableCrop = await transactionalManager.findOne(CropEntity, {
      where: {
        FieldID: crop.FieldID,
        Year: MoreThan(crop.Year),
      },
      order: {
        Year: "ASC",
      },
    });

    if (nextAvailableCrop) {
      this.updatingFutureRecommendations
        .updateRecommendationsForField(
          crop.FieldID,
          nextAvailableCrop.Year,
          request,
          userId,
        )
        .catch((error) => {
          console.error(
            `Error scheduling future recommendation update for FieldID: ${crop.FieldID}, Year: ${nextAvailableCrop.Year}`,
            error,
          );
        });
    }
  }
}
module.exports = { CurrentAndFuture };
