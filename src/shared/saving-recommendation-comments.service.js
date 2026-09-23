const { CropTypeMapper } = require("../constants/crop-type-mapper");
const {
  RecommendationCommentEntity,
} = require("../db/entity/recommendation-comment.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");

const recommendationCommentMethods = {
  async saveMultipleRecommendation(
    Recommendations,
    savedCrop,
    cropSaveData,
    transactionalManager,
    nutrientRecommendationsData,
    userId,
  ) {
    const cropNotes = await this.getCropNotes(
      savedCrop,
      transactionalManager,
      nutrientRecommendationsData,
    );
    const groupedNotes = this.groupNotesByNutrientId(cropNotes);
    const savedComments = await this.saveOrUpdateComments(
      groupedNotes,
      cropSaveData,
      transactionalManager,
      userId,
    );

    Recommendations.push({
      Recommendation: cropSaveData,
      RecommendationComments: savedComments,
    });

    return Recommendations;
  },

  async getCropNotes(savedCrop, transactionalManager, nutrientData) {
    const adviceNotes = nutrientData.adviceNotes ?? [];
    const hasDefoliation = adviceNotes.some((note) => "defoliationId" in note);

    if (!hasDefoliation) {
      return adviceNotes.filter(
        (note) => note.sequenceId === savedCrop.CropOrder,
      );
    }

    const managementPeriod = await transactionalManager.findOne(
      ManagementPeriodEntity,
      { where: { ID: savedCrop.ManagementPeriodID } },
    );

    if (!managementPeriod) {
      return [];
    }

    return adviceNotes.filter(
      (note) =>
        note.defoliationId === managementPeriod.Defoliation &&
        note.sequenceId === savedCrop.CropOrder,
    );
  },

  groupNotesByNutrientId(notes) {
    return notes.reduce((acc, note) => {
      const nutrientId = note.nutrientId;
      if (!acc[nutrientId]) {
        acc[nutrientId] = [];
      }
      acc[nutrientId].push(note.note);
      return acc;
    }, {});
  },

  async saveOrUpdateComments(
    notesByNutrientId,
    savedCrop,
    transactionalManager,
    userId,
  ) {
    const existingComments = await transactionalManager.find(
      RecommendationCommentEntity,
      { where: { RecommendationID: savedCrop?.ID } },
    );

    const processedNutrients = [];
    const results = [];

    for (const nutrientId of Object.keys(notesByNutrientId)) {
      const nutrient = Number(nutrientId);
      const commentText = notesByNutrientId[nutrientId].join(" <br/>");
      processedNutrients.push(nutrient);

      const existing = existingComments.find((c) => c.Nutrient === nutrient);
      if (existing) {
        existing.Comment = commentText;
        existing.ModifiedOn = new Date();
        existing.ModifiedByID = userId;
        results.push(
          await transactionalManager.save(
            RecommendationCommentEntity,
            existing,
          ),
        );
      } else {
        results.push(
          await transactionalManager.save(RecommendationCommentEntity, {
            Nutrient: nutrient,
            Comment: commentText,
            RecommendationID: savedCrop?.ID,
            CreatedOn: new Date(),
            CreatedByID: userId,
          }),
        );
      }
    }

    const toDelete = existingComments.filter(
      (c) => !processedNutrients.includes(c.Nutrient),
    );

    if (toDelete.length) {
      await transactionalManager.remove(RecommendationCommentEntity, toDelete);
    }

    return results;
  },

  async processSingleCrop(cropData, context, Recommendations, mannerOutputs) {
    const savedRecommendations = await this.buildCropRecommendationData(
      cropData,
      context.latestSoilAnalysis,
      context.nutrientRecommendationsData,
      context.transactionalManager,
      context.userId,
      mannerOutputs,
    );

    const recommendationsToSave = this.resolveRecommendationsToSave(
      cropData,
      savedRecommendations,
      context.hasDefoliationNotes,
    );

    if (!recommendationsToSave.length) {
      return [];
    }

    const recomendationsAndComments = [];
    for (const recommendation of recommendationsToSave) {
      if (!recommendation) {
        continue;
      }

      const recommendationsNotes = await this.saveMultipleRecommendation(
        Recommendations,
        cropData,
        recommendation,
        context.transactionalManager,
        context.nutrientRecommendationsData,
        context.userId,
      );
      recomendationsAndComments.push(recommendationsNotes);
    }

    return recomendationsAndComments;
  },

  isGrassCrop(cropData) {
    return cropData.CropTypeID === CropTypeMapper.GRASS;
  },

  hasDefoliationAdviceNotes(nutrientRecommendationsData) {
    return nutrientRecommendationsData?.adviceNotes?.some(
      (note) => "defoliationId" in note,
    );
  },

  async processAndSaveRecommendations(
    dataMultipleCrops,
    latestSoilAnalysis,
    nutrientRecommendationsData,
    transactionalManager,
    userId,
    mannerOutputs,
  ) {
    const recommendations = [];
    const finalRecommendations = [];

    if (!dataMultipleCrops?.length) {
      return recommendations;
    }

    if (!Array.isArray(nutrientRecommendationsData?.calculations)) {
      return finalRecommendations;
    }

    const hasDefoliationNotes = this.hasDefoliationAdviceNotes(
      nutrientRecommendationsData,
    );

    for (const cropData of dataMultipleCrops) {
      const recommendationsAndNotes = await this.processSingleCrop(
        cropData,
        {
          latestSoilAnalysis,
          nutrientRecommendationsData,
          transactionalManager,
          userId,
          hasDefoliationNotes,
        },
        recommendations,
        mannerOutputs,
      );

      finalRecommendations.push(recommendationsAndNotes);
    }

    return finalRecommendations;
  },

  resolveRecommendationsToSave(
    cropData,
    savedRecommendations,
    hasDefoliationNotes,
  ) {
    if (!savedRecommendations?.length) {
      return [];
    }

    const isGrass = this.isGrassCrop(cropData);
    if (isGrass && hasDefoliationNotes) {
      return savedRecommendations;
    }

    return [savedRecommendations[0]];
  },
};

module.exports = { recommendationCommentMethods };
