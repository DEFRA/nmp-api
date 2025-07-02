const boom = require("@hapi/boom");
const {
  NutrientsLoadingFarmDetailsService,
} = require("./nutrients-loading-farm-details.service");
const { StaticStrings } = require("../shared/static.string");

class NutrientsLoadingFarmDetailsController {
  #request;
  #h;
  #nutrientsFarmDetailsservice;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#nutrientsFarmDetailsservice =
      new NutrientsLoadingFarmDetailsService();
  }

  async getByFarmIdAndYear() {
    const { farmId } = this.#request.params;
    const { year } = this.#request.query;
    try {
      const data = await this.#nutrientsFarmDetailsservice.getByFarmIdAndYear(
        farmId,
        year
      );
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async createNutrientsLoadingFarmDetails() {

    const payload = this.#request.payload;
    const userId = this.#request.userId;

    try {
      const data =
        await this.#nutrientsFarmDetailsservice.createNutrientsLoadingFarmDetails(
          payload,
          userId,
          this.#request
        );
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async updateNutrientsLoadingFarmDetails() {
    const payload = this.#request.payload;
    const userId = this.#request.userId;

    try {
      const updated =
        await this.#nutrientsFarmDetailsservice.updateNutrientsLoadingFarmDetails(
          payload,
          userId,
          this.#request
        );
      return this.#h.response(updated);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { NutrientsLoadingFarmDetailsController };
