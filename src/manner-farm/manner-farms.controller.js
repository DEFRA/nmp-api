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

  async getByOrganisationId() {
    try {
      const { organisationId } = this.#request.params;
      const records =await this.#mannerFarmsService.getByOrganisationId(organisationId);
      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getByOrganisationId:", error);
      return this.#h.response(error);
    }
  }

  async getById() {
    try {
      const { Id } = this.#request.params;
      const records =await this.#mannerFarmsService.getById(Id);
      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getById:", error);
      return this.#h.response(error);
    }
  }
}

module.exports = { MannerFarmsController };