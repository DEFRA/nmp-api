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
        await this.#farmManureTypeService.getFarmManureTypebyFarmId(
          farmId,
        );
      if (!records) {
        throw boom.notFound("No Farm manure types found.");
      }
      return this.#h.response({ FarmManureTypes: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  
}

module.exports = { FarmManureTypeController };
