const { FarmAverageYieldsService } = require("./farm-average-yields.service");


class FarmAverageYieldsController {
  #request;
  #h;
  #farmAverageYieldsService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#farmAverageYieldsService = new FarmAverageYieldsService();
  }

  async getByFarmIdAndHarvestYear() {
    try {
      const { farmID } = this.#request.params;
      const { harvestYear } = this.#request.query;

      const result =
        await this.#farmAverageYieldsService.getByFarmIdAndHarvestYear(
          farmID,
          harvestYear,
        );

      return this.#h.response({
        FarmAverageYields: result,
      });
    } catch (error) {
      console.error("Error fetching FarmAverageYields:", error);
      return this.#h.response({ error }).code(500);
    }
  }

  async mergeFarmAverageYields() {
    try {
      const payload = this.#request.payload;
      const userId = this.#request.userId;

      const result =
        await this.#farmAverageYieldsService.mergeFarmAverageYields(
          payload,
          userId
        );

      return this.#h
        .response({
          FarmAverageYield: result
        })
        .code(201);
    } catch (error) {
      console.error("Error creating FarmAverageYield:", error);
      return this.#h.response({ error }).code(500);
    }
  }
}

module.exports = { FarmAverageYieldsController };
