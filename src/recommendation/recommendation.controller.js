const { StaticStrings } = require("../shared/static.string");
const { RecommendationService } = require("./recommendation.service");
const boom = require("@hapi/boom");

class RecommendationController {
  #request;
  #h;
  #recommendationService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#recommendationService = new RecommendationService();
  }
  async getNutrientsRecommendationsForFieldByFieldIdAndHarvestYear() {
    const { fieldId, harvestYear } = this.#request.query;

    try {
      if (!fieldId || !harvestYear) {
        throw boom.badRequest(StaticStrings.ERR_MISSING_PARAMETERS);
      }
      const Recommendations =
        await this.#recommendationService.getNutrientsRecommendationsForField(
          fieldId,
          harvestYear,
          this.#request
        );
      if (Recommendations.length === 0) {
        throw boom.notFound("No Recommendations Found");
      }

      return this.#h.response({ Recommendations });
    } catch (error) {
      console.error("Error while fetching join data:", error);
      return this.#h.response({ error });
    }
  }
}

module.exports = { RecommendationController };
