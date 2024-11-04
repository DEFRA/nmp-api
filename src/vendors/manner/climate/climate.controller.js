const MannerClimateService = require("./climate.service");

class MannerClimateController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new MannerClimateService();
  }

  async getAllClimatesListByPostCode() {
    const { postcode } = this.#request.query;
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }

  async getAverageAnnualRainfallByPostCode() {
    const { postcode } = this.#request.query;
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
}

module.exports = MannerClimateController;
