const { StaticStrings } = require("../shared/static.string");
const { ExcessRainfallService } = require("./excess-rainfall.service");
const boom = require("@hapi/boom");

class ExcessRainfallController {
  #request;
  #h;
  #excessRainfallService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#excessRainfallService = new ExcessRainfallService();
  }

  async getExcessRainfallByFarmIdAndYear() {
    const { farmId } = this.#request.params;
    const { year } = this.#request.query;
    try {
      const records =
        await this.#excessRainfallService.getExcessRainfallByFarmIdAndYear(
          farmId,
          year
        );
      if (!records) {
        throw boom.notFound(StaticStrings.HTTP_STATUS_NOT_FOUND);
      }
      return this.#h.response({ ExcessRainfallDetails: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { ExcessRainfallController };
