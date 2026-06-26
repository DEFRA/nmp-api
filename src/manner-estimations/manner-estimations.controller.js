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
          this.#request,
        );

      return this.#h.response(result);
    } catch (error) {
      console.error("Error creating Manner Estimation:", error);
      return this.#h.response(error);
    }
  }

  async copyMannerEstimation() {
    try {
      const payload = this.#request.payload;
      const userId = this.#request.userId;

      const result = await this.#mannerEstimationsService.copyMannerEstimation(
        payload,
        userId,
        this.#request,
      );

      return this.#h.response(result);
    } catch (error) {
      console.error("Error copying Manner Estimation:", error);
      return this.#h.response(error);
    }
  }

  async getByOrganisationId() {
    try {
      const { organisationId } = this.#request.params;
      const records =
        await this.#mannerEstimationsService.getByOrganisationId(
          organisationId,
        );
      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getByOrganisationId:", error);
      return this.#h.response(error);
    }
  }

  async getMannerEstimationRelatedDataById() {
    try {
      const { id } = this.#request.params;
      const records =
        await this.#mannerEstimationsService.getMannerEstimationRelatedDataById(
          id,
          this.#request,
        );
      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getMannerEstimationRelatedDataById:", error);
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
