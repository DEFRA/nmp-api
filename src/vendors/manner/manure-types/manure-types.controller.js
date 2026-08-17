const MannerManureTypesService = require("./manure-types.service");

class MannerManureTypesController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new MannerManureTypesService();
  }

  async getAllManureTypes() {
    const {
      manureGroupId,
      manureTypeCategoryId,
      countryId,
      highReadilyAvailableNitrogen,
      isLiquid,
    } = this.#request.query;

    const data = await this.#service.getAllManureTypesByQuery(this.#request, {
      manureGroupId,
      manureTypeCategoryId,
      countryId,
      highReadilyAvailableNitrogen,
      isLiquid,
    });
    // Return the response with the data
    return this.#h.response(data);
  }

  async getManureTypesById() {
    const { id } = this.#request.params;
    const data = await this.#service.getManureTypeById(id, this.#request);
    return this.#h.response(data);
  }
}
module.exports = MannerManureTypesController;
