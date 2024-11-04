const { StaticStrings } = require("../shared/static.string");
const { ManureTypeService } = require("./manure-type.service");
const boom = require("@hapi/boom");

class ManureTypeController {
  #request;
  #h;
  #manureTypeService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#manureTypeService = new ManureTypeService();
  }

  async getManureTypes() {
    const { manureGroupId } = this.#request.params;
    const { countryId } = this.#request.query;
    try {
    if (!manureGroupId || !countryId) {
      throw boom.badRequest(StaticStrings.HTTP_STATUS_BAD_REQUEST);
    }
      const { ManureTypes } = await this.#manureTypeService.getManureTypes(
        manureGroupId,
        countryId
      );
      return this.#h.response({ ManureTypes });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getManureTypeById() {
    const { manureTypeId } = this.#request.params;
    try {
      const { records } = await this.#manureTypeService.getById(manureTypeId);
      return this.#h.response({ ManureType: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { ManureTypeController };
