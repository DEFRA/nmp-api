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

  async getByFarmId() {
    const { farmId } = this.#request.params;
    try {
      const data = await this.#service.getByFarmId(farmId);
      return this.#h.response(data);
    } catch (error) {
      console.error("Error in getByFarmId:", error);
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
}

module.exports = { NutrientsLoadingLiveStocksController };
