const { MannerEstimationsService } = require("./manner-estimations.service");

class MannerEstimationsController {
  #request;
  #h;
  #mannerEstimationsService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#mannerEstimationsService = new MannerEstimationsService();
  }

  async createMannerEstimation() {
    try {
      const payload = this.#request.payload;
      const userId = this.#request.userId;

      const result =
        await this.#mannerEstimationsService.createMannerEstimation(
          payload,
          userId,
        );

      return this.#h.response(result);
    } catch (error) {
      console.error("Error creating Manner Estimation:", error);
      return this.#h.response(error);
    }
  }
  async getAll() {
    try {
      const records = await this.#mannerEstimationsService.getAll();
      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getAll:", error);
      return this.#h.response(error);
    }
  }

  async checkMannerEstimationExists() {
    try {
      const { organisationId, name } = this.#request.query;

      const result =
        await this.#mannerEstimationsService.checkMannerEstimationExists(
          organisationId,
          name,
        );

      return this.#h.response(result);
    } catch (error) {
      console.error("Error checking Manner Estimation existence:", error);
      return this.#h.response(error);
    }
  }
}

module.exports = { MannerEstimationsController };
