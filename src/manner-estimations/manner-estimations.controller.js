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

      const result = await this.#mannerEstimationsService.createMannerEstimation(
          payload,
          userId
        );

      return this.#h.response(result)
    } catch (error) {
      console.error("Error creating Manner Estimation:", error);
      return this.#h.response( error )
    }
  }
}

module.exports = { MannerEstimationsController };
