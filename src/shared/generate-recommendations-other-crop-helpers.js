const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");

const recommendationOtherCropHelpers = {
  async handleOtherCropRecommendation(otherCropContext, sharedContext) {
    const {
      crop,
      previousCrop,
      mannerOutputs,
      latestSoilAnalysis,
      nutrientRecommendationsData,
      cropPOfftake,
    } = otherCropContext;

    const { transactionalManager, newOrganicManure, userId, fertiliserData } =
      sharedContext;

    const recommendation =
      await this.savingOtherCropRecommendations.saveRecommendationForOtherCrops(
        transactionalManager,
        newOrganicManure,
        mannerOutputs,
        userId,
        latestSoilAnalysis,
        crop,
      );

    const saveAndUpdateOtherPKBalance =
      await this.CalculatePKBalance.createOrUpdatePKBalance(
        crop,
        nutrientRecommendationsData,
        userId,
        fertiliserData,
        transactionalManager,
        { cropPOfftake, latestSoilAnalysis },
        previousCrop,
      );

    if (saveAndUpdateOtherPKBalance) {
      await transactionalManager.save(
        PKBalanceEntity,
        saveAndUpdateOtherPKBalance.saveAndUpdatePKBalance,
      );
    }

    return {
      cropId: crop.ID,
      recommendations: recommendation,
      pkBalance: saveAndUpdateOtherPKBalance ?? null,
    };
  },
};

module.exports = { recommendationOtherCropHelpers };
