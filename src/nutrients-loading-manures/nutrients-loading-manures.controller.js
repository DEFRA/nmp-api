const boom = require("@hapi/boom");
const { StaticStrings } = require("../shared/static.string");
const {
  NutrientsLoadingManuresService,
} = require("./nutrients-loading-manures.service");

class NutrientsLoadingManuresController {
  #request;
  #h;
  #nutrientsFarmManureservice;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#nutrientsFarmManureservice = new NutrientsLoadingManuresService();
  }

  async getByFarmIdAndYear() {
    const { farmID } = this.#request.params;
    try {
      const data = await this.#nutrientsFarmManureservice.getByFarmIdAndYear(
        farmID
      );
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async createNutrientsLoadingManures() {
    const payload = this.#request.payload;
    const userId = this.#request.userId;

    try {
      const data =
        await this.#nutrientsFarmManureservice.createNutrientsLoadingManures(
          payload,
          userId,
          this.#request
        );
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async updateNutrientsLoadingManures() {
    const payload = this.#request.payload;
    const userId = this.#request.userId;

    try {
      const updated =
        await this.#nutrientsFarmManureservice.updateNutrientsLoadingManures(
          payload,
          userId,
          this.#request
        );
      return this.#h.response(updated);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getById() {
    const { id } = this.#request.params;
    try {
      const { records } = await this.#nutrientsFarmManureservice.getById(id);
      return this.#h.response({ NutrientsLoadingManure: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
    async deleteNutrientsLoadingManureById() {
      const { nutrientsLoadingManureId } = this.#request.params;
      try {
        const result = await this.#nutrientsFarmManureservice.deleteNutrientsLoadingManureById(
          nutrientsLoadingManureId
        );
        if (result?.affectedRows === 0) {
          throw boom.notFound(`NutrientsLoadingManure with ID ${nutrientsLoadingManureId} not found.`);
        }
        return this.#h.response({ message: "NutrientsLoadingManure deleted successfully." });
      } catch (error) {
        return this.#h.response({ error: error.message });
      }
    }
}

module.exports = { NutrientsLoadingManuresController };
