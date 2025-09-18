const { StoreCapacitiesService } = require("./store-capacities.service");

class StoreCapacitiesController {
  #request;
  #h;
  #storeCapacitiesService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#storeCapacitiesService = new StoreCapacitiesService();
  }

  async getAll() {
    try {
      const records = await this.#storeCapacitiesService.getAll();
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
      const record = await this.#storeCapacitiesService.getByFarmAndYear(
        farmId,
        year
      );
      return this.#h.response(record);
    } catch (error) {
      console.error("Error in getById:", error);
      return this.#h.response(error);
    }
  }
  async getById() {
    const { id } = this.#request.params;
    try {
      const record = await this.#storeCapacitiesService.getById(id);
      return this.#h.response(record);
    } catch (error) {
      console.error("Error in getById:", error);
      return this.#h.response(error);
    }
  }

  async checkExistByFarmIdYearAndStoreName() {
    const { FarmId, Year, StoreName } = this.#request.params;
 
    const { ID } = this.#request.query;

    try {
      const exists = await this.#storeCapacitiesService.checkExist(
        FarmId,
        Year,
        StoreName,
        ID
      );
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

      const record = await this.#storeCapacitiesService.createStoreCapacities(
        payload,
        userId
      );
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

      const results = await this.#storeCapacitiesService.copyStorageCapacities(
        body,
        userId
      );

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
      const updated = await this.#storeCapacitiesService.updateStoreCapacities(
        payload,
        userId,
        this.#request
      );
      return this.#h.response(updated);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async deleteStoreCapacitiesById() {
    const { storeCapacitiesId } = this.#request.params;
    try {
      const result =
        await this.#storeCapacitiesService.deleteStoreCapacitiesById(
          storeCapacitiesId
        );
      if (result?.affectedRows === 0) {
        throw boom.notFound(
          `StoreCapacities with ID ${storeCapacitiesId} not found.`
        );
      }
      return this.#h.response({
        message: "StoreCapacities deleted successfully.",
      });
    } catch (error) {
      return this.#h.response({ error: error.message });
    }
  }
}



module.exports = { StoreCapacitiesController };
