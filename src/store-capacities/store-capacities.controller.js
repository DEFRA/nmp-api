const { StoreCapacitiesService } = require("./store-capacities.service");

class StoreCapacitiesController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new StoreCapacitiesService();
  }

  async getAll() {
    try {
      const records = await this.#service.getAll();
      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getAll:", error);
      return this.#h.response(error);
    }
  }

  async getByFarmIdAndYear() {
    const { farmId } = this.#request.params;
    const { year } = this.#request.query;

    try {
      const record = await this.#service.getByFarmAndYear(farmId, year);
      return this.#h.response(record);
    } catch (error) {
      console.error("Error in getById:", error);
      return this.#h.response(error);
    }
  }
  async getById() {
    const { id } = this.#request.params;
    try {
      const record = await this.#service.getById(id);
      return this.#h.response(record);
    } catch (error) {
      console.error("Error in getById:", error);
      return this.#h.response(error);
    }
  }

  async checkExistByFarmIdYearAndStoreName() {
    const { farmId, year, storeName } = this.#request.params;
    try {
      const exists = await this.#service.checkExist(farmId, year, storeName);
      return this.#h.response({ exists });
    } catch (error) {
      console.error("Error in checkExistByFarmIdYearAndStoreName:", error);
      return this.#h.response(error);
    }
  }

  async create() {
    try {
      const payload = this.#request.payload;
      const userId = this.#request.userId;

      const record = await this.#service.createStoreCapacities(payload, userId);
      return this.#h.response(record);
    } catch (error) {
      console.error("Error in create:", error);
      return this.#h.response(error);
    }
  }

  async copyStorageCapacititesByYearAndFarmID() {
    try {
      const body = this.#request.payload;
      const userId = this.#request.userId;

      const results = await this.#service.copyStorageCapacities(body, userId);

      return this.#h.response(results);
    } catch (error) {
      console.error("Error copying storage capacities:", error);
      return this.#h.response({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }

  async updateStoreCapacities() {
    const payload = this.#request.payload;
    const userId = this.#request.userId;

    try {
      const updated = await this.#service.updateStoreCapacities(
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



module.exports = { StoreCapacitiesController };
