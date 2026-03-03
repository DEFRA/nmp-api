const { PscIndexesService } = require("./psc-indexes.service");
class PscIndexesController {
  #request;
  #h;
  #pscIndexesService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#pscIndexesService = new PscIndexesService();
  }

  async getAll() {
    try {
      const records = await this.#pscIndexesService.getAll();
      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getAll:", error);
      return this.#h.response(error);
    }
  }

  async getById() {
    const { id } = this.#request.params;
    try {
      const record = await this.#pscIndexesService.getById(id);
      return this.#h.response(record);
    } catch (error) {
      console.error("Error in getById:", error);
      return this.#h.response(error);
    }
  }
}

module.exports = { PscIndexesController };
