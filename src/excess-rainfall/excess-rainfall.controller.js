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
      return this.#h.response(records);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async createExcessRainfall() {
    const { farmId } = this.#request.params;
    const { year } = this.#request.query; // Extract the year from the query parameters
    const body = this.#request.payload;
    const userId = this.#request.userId;

    try {
      const data = await this.#excessRainfallService.createExcessRainfall(
        farmId,
        year, // Pass the year to the service
        body,
        userId
      );
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async updateExcessRainfall() {
    const { farmId } = this.#request.params;
    const { year } = this.#request.query; // Extract the year from the query parameters
    const userId = this.#request.userId;
    const body = this.#request.payload;

    try {
      const updatedExcessRainfall =
        await this.#excessRainfallService.updateExcessRainfall(
          body,
          userId,
          farmId,
          year // Pass the year to the service
        );
      return this.#h.response({ ExcessRainfall: updatedExcessRainfall });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { ExcessRainfallController };
