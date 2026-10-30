const boom = require("@hapi/boom");
const {
  ScotlandGrassNMaxValueService,
} = require("./scotland-grass-nmax-values.service");

class ScotlandGrassNMaxValueController {
  #request;
  #h;
  #scotlandGrassNMaxValueService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#scotlandGrassNMaxValueService = new ScotlandGrassNMaxValueService();
  }

  async getAll() {
    try {
      const records = await this.#scotlandGrassNMaxValueService.getAll();
      return this.#h.response(records);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getNMaxValue() {
    const { swardTypeID, swardManagementID, defoliationSequenceID, siteClass } =
      this.#request.query;
    try {
      const nMaxValue = await this.#scotlandGrassNMaxValueService.getNMaxValue(
        swardTypeID,
        swardManagementID,
        defoliationSequenceID,
        siteClass,
      );

      if (nMaxValue === null) {
        throw boom.notFound("No Scotland grass nmax value found.");
      }

      return this.#h.response({ ScotlandNMax: nMaxValue });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { ScotlandGrassNMaxValueController };
