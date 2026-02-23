const { NutrientsLoadingLiveStocksService } = require("./nutrients-loading-live-stocks.service");



class NutrientsLoadingLiveStocksController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new NutrientsLoadingLiveStocksService();
  }

  async getByFarmIdAndYear() {
    const { farmId } = this.#request.params;
    const { year } = this.#request.query;
    try {
      const data = await this.#service.getByFarmIdAndYear(farmId, year);
      return this.#h.response(data);
    } catch (error) {
      console.error("Error in getByFarmId:", error);
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

  async createNutrientsLiveStocks() {
    const payload = this.#request.payload;
    const userId = this.#request.userId;

    try {
      const result = await this.#service.createNutrientsLiveStocks(
        payload,
        userId
      );
      return this.#h.response(result);
    } catch (error) {
      console.error("Error in create:", error);
    }
  }

  async updateNutrientsLoadingLiveStocks() {
    const payload = this.#request.payload;
    const userId = this.#request.userId;

    try {
      const updated = await this.#service.updateNutrientsLoadingLiveStocks(
        payload,
        userId,
        this.#request
      );
      return this.#h.response(updated);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async deleteNutrientsLoadingLivestockById() {
        const { nutrientsLoadingLivestockId } = this.#request.params;
        try {
          const result = await this.#service.deleteNutrientsLoadingLivestockById(
            nutrientsLoadingLivestockId
          );
          if (result?.affectedRows === 0) {
            console.log(`NutrientsLoadingLivestock with ID  not found.`);
          }
          return this.#h.response({ message: "NutrientsLoadingLivestock deleted successfully." });
        } catch (error) {
          return this.#h.response({ error: error.message });
        }
      }
}

module.exports = { NutrientsLoadingLiveStocksController };
