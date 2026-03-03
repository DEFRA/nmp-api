const { PscIndexService } = require("./psc-index.service");
class PscIndexController {
  #request;
  #h;
  #pscIndexService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#pscIndexService = new PscIndexService();
  }

  async getAll() {
    try {
      const records = await this.#pscIndexService.getAll();
      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getAll:", error);
      return this.#h.response(error);
    }
  }

  async getById() {
    const { id } = this.#request.params;
    try {
      const record = await this.#pscIndexService.getById(id);
      return this.#h.response(record);
    } catch (error) {
      console.error("Error in getById:", error);
      return this.#h.response(error);
    }
  }
}

module.exports = { PscIndexController };
