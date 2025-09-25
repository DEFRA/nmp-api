const { SolidManureTypesService } = require("./solid-manure-types.service");

class SolidManureTypesController {
  #request;
  #h;
  #solidManureService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#solidManureService = new SolidManureTypesService();
  }

  async getAll() {
    try {
      const records = await this.#solidManureService.getAll();
      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getAll:", error);
      return this.#h.response(error);
    }
  }

  async getById() {
    const { id } = this.#request.params;
    try {
      const record = await this.#solidManureService.getById(id);
      return this.#h.response(record);
    } catch (error) {
      console.error("Error in getById:", error);
      return this.#h.response(error);
    }
  }
}

module.exports = { SolidManureTypesController };
