const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const {
  RecommendationCommentEntity,
} = require("../db/entity/recommendation-comment.entity");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const { CountryMapper } = require("../constants/country-mapper");
const { MethodologyMapper } = require("../constants/methodology-mapper");

class SavingOtherCropRecommendations {
  async buildCropOrderData(
    OrganicManure,
    mannerOutputs
  ) {
    const resolveMannerValue = (mannerValue, organicValue) => {
      if (!mannerOutputs) {
        return organicValue;
      }

      return mannerValue === 0 ? null : mannerValue;
    };
    return {
      CropN: null,
      NBalance: null,
      ManureN: resolveMannerValue(
        mannerOutputs[0]?.availableN,
        OrganicManure?.AvailableN,
      ),
      FertilizerN: null,
      CropP2O5: null,
      PBalance: null,
      ManureP2O5: resolveMannerValue(
        mannerOutputs[0]?.availableP,
        OrganicManure?.AvailableP2O5,
      ),
      FertilizerP2O5: null,
      CropK2O: null,
      KBalance: null,
      ManureK2O: resolveMannerValue(
        mannerOutputs[0]?.availableK,
        OrganicManure?.AvailableK2O,
      ),
      FertilizerK2O: null,
      CropMgO: null,
      MgBalance: null,
      ManureMgO: null,
      FertilizerMgO: null,
      CropSO3: null,
      SBalance: null,
      ManureSO3: resolveMannerValue(
        mannerOutputs[0]?.availableS,
        OrganicManure?.AvailableSO3,
      ),
      FertilizerSO3: null,
      CropNa2O: null,
      NaBalance: null,
      ManureNa2O: null,
      FertilizerNa2O: null,
      CropLime: null,
      LimeBalance: null,
      ManureLime: null,
      FertilizerLime: null,
      PH: null,
      PIndex:null,
      KIndex: null,
      MgIndex: null,
      SIndex: null,
      NIndex: null,
    };
  }

  async saveRecommendationForOtherCrops(
    transactionalManager,
    OrganicManure,
    mannerOutputs,
    userId,
    crop
  ) {
    const cropOrderData = await this.buildCropOrderData(
      OrganicManure,
      mannerOutputs
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
            ManagementPeriodID: period.ID,
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
        recommendation = transactionalManager.create(RecommendationEntity, {
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
