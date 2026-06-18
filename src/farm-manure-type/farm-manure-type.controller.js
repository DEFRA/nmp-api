const boom = require("@hapi/boom");
const { FarmManureTypeService } = require("./farm-manure-type.service");


class FarmManureTypeController {
  #request;
  #h;
  #farmManureTypeService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#farmManureTypeService = new FarmManureTypeService();
  }

  async getFarmManureTypeByFarmId() {
    const { farmId } = this.#request.params;
    try {
      const records =
        await this.#farmManureTypeService.getFarmManureTypebyFarmId(farmId);
      if (!records) {
        throw boom.notFound("No Farm manure types found.");
      }
      return this.#h.response({ FarmManureTypes: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getById() {
    try {
      const { farmManureTypeId } = this.#request.params;
      const records = await this.#farmManureTypeService.getById(farmManureTypeId);
      return this.#h.response( records );
    } catch (error) {
      console.error(error);
      return this.#h.response({ error });
    }
  }

  async checkFarmManureTypeExists() {
    const { farmId, manureTypeId, manureTypeName } = this.#request.query;
    try {
      const exists =
        await this.#farmManureTypeService.checkFarmManureTypeExists(
          farmId,
          manureTypeId,
          manureTypeName,
        );
      return this.#h.response({ exists }).code(200);
    } catch (error) {
      return this.#h.response({ error }).code(500);
    }
  }
}

module.exports = { FarmManureTypeController };
