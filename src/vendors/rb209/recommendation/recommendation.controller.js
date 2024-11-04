const { RB209RecommendationService } = require("./recommendation.service");

class RB209RecommendationController {
  #request;
  #h;
  #recommendationService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#recommendationService = new RB209RecommendationService();
  }

  async calculateNutrientRecommendations() {
    try {
      const body = this.#request.payload;
      const url = this.#request.url.pathname.split("/rb209")[1];
      const data = await this.#recommendationService.postData(url, body);
      return this.#h.response(data);
    } catch (error) {
      console.error(
        "Error in calculateNutrientRecommendations controller:",
        error
      );
      return this.#h.response({ error });
    }
  }

  async calculateNutrientOfftake() {
    try {
      const body = this.#request.payload;
      const url = this.#request.url.pathname.split("/rb209")[1];
      const data = await this.#recommendationService.postData(url, body);
      return this.#h.response(data);
    } catch (error) {
      console.error("Error in calculateNutrientOfftake controller:", error);
      return this.#h.response({ error });
    }
  }

  async calculateNutrientDeficiency() {
    const { cropTypeId, leafSamplingPosition, nutrientId, nutrientContent } =
      this.#request.params;
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#recommendationService.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { RB209RecommendationController };
