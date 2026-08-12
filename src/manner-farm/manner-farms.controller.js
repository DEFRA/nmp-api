const { MannerFarmsService } = require("./manner-farms.service");

class MannerFarmsController {
  #request;
  #h;
  #mannerFarmsService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#mannerFarmsService = new MannerFarmsService();
  }

  async createWithMannerEstimation() {
    try {
      const payload = this.#request.payload;
      const userId = this.#request.userId;
      const result = await this.#mannerFarmsService.createWithMannerEstimation(
        payload,
        userId,
        this.#request,
      );
      return this.#h.response(result);
    } catch (error) {
      console.error("Error in createWithMannerEstimation:", error);
      return this.#h.response(error);
    }
  }

  async getByOrganisationId() {
    try {
      const { organisationId } = this.#request.params;
      const records =
        await this.#mannerFarmsService.getByOrganisationId(organisationId);
      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getByOrganisationId:", error);
      return this.#h.response(error);
    }
  }

  async getById() {
    try {
      const { id } = this.#request.params;
      const records = await this.#mannerFarmsService.getById(id);
      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getById:", error);
      return this.#h.response(error);
    }
  }

  async deleteMannerFarmsByIds() {
    const { mannerFarmsIds } = this.#request.payload;
    try {
      await this.#mannerFarmsService.deleteMannerFarmsByIds(
        mannerFarmsIds
      );

      return this.#h.response({
        message: "Manner farms deleted successfully.",
      });
    } catch (error) {
      return this.#h
        .response({
          error: error.message,
        })
    }
  }
}

module.exports = { MannerFarmsController };
