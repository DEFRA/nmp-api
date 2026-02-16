const { ManagementPeriodEntity } = require("../db/entity/management-period.entity");
const { RecommendationCommentEntity } = require("../db/entity/recommendation-comment.entity");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");

class SavingOtherCropRecommendations {


  async buildCropOrderData(OrganicManure, mannerOutputs, latestSoilAnalysis) {
    return {
      CropN: null,
      NBalance: null,
      ManureN: mannerOutputs
        ? mannerOutputs[0].availableN
        : OrganicManure.AvailableN,
      FertilizerN: null,
      CropP2O5: null,
      PBalance: null,
      ManureP2O5: mannerOutputs
        ? mannerOutputs[0].availableP
        : OrganicManure.AvailableP2O5,
      FertilizerP2O5: null,
      CropK2O: null,
      KBalance: null,
      ManureK2O: mannerOutputs
        ? mannerOutputs[0].availableK
        : OrganicManure.AvailableK2O,
      FertilizerK2O: null,
      CropMgO: null,
      MgBalance: null,
      ManureMgO: null,
      FertilizerMgO: null,
      CropSO3: null,
      SBalance: null,
      ManureSO3: mannerOutputs
        ? mannerOutputs[0].availableS
        : OrganicManure.AvailableSO3,
      FertilizerSO3: null,
      CropNa2O: null,
      NaBalance: null,
      ManureNa2O: null,
      FertilizerNa2O: null,
      CropLime: null,
      LimeBalance: null,
      ManureLime: null,
      FertilizerLime: null,
      PH: latestSoilAnalysis?.PH?.toString() || null,
      SNSIndex: latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString() || null,
      PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString() || null,
      KIndex: latestSoilAnalysis?.PotassiumIndex?.toString() || null,
      MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString() || null,
      SIndex: null,
      NIndex: null,
    };
  }

  async saveRecommendationForOtherCrops(
    transactionalManager,
    OrganicManure,
    mannerOutputs,
    userId,
    latestSoilAnalysis,
    crop
  ) {
    const cropOrderData = await this.buildCropOrderData(
      OrganicManure,
      mannerOutputs,
      latestSoilAnalysis
    );
    let managementPeriods = [];
    if (OrganicManure) {
      managementPeriods = [
        await transactionalManager.findOne(ManagementPeriodEntity, {
          where: { ID: OrganicManure.ManagementPeriodID },
        }),
      ];
    } else {
      managementPeriods = await transactionalManager.find(
        ManagementPeriodEntity,
        {
          where: { CropID: crop.ID },
        },
      );
    }
    const updatedRecommendations = [];
    for (const period of managementPeriods) {
      let recommendation = await transactionalManager.findOne(
        RecommendationEntity,
        {
          where: {
            ManagementPeriodID: period.ID
          },
        },
      );
      if (recommendation) {
        // If a recommendation exists, update it
        recommendation = {
          ...recommendation,
          ...cropOrderData,
          ModifiedOn: new Date(),
          ModifiedByID: userId,
        };
        await transactionalManager.save(RecommendationEntity, recommendation);

        // Find and delete related recommendation comments
        const existingComments = await transactionalManager.find(
          RecommendationCommentEntity,
          {
            where: { RecommendationID: recommendation.ID },
          },
        );

        if (existingComments && existingComments.length > 0) {
          await transactionalManager.remove(
            RecommendationCommentEntity,
            existingComments,
          );
        }
        updatedRecommendations.push(recommendation);
      } else {
        // If no recommendation exists, create a new one
        recommendation = this.RecommendationRepository.create({
          ...cropOrderData,
          ManagementPeriodID: period.ID,
          Comments: "New recommendation created",
          CreatedOn: new Date(),
          CreatedByID: userId,
        });
        await transactionalManager.save(RecommendationEntity, recommendation);
        updatedRecommendations.push(recommendation);
      }
    }
    // Check if there's an existing recommendation for the current OrganicManure.ManagementPeriodID

    return updatedRecommendations;
  }
}

module.exports = { SavingOtherCropRecommendations };