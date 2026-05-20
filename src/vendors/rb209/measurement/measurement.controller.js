const RB209MeasurementService = require("./measurement.service");

class RB209MeasurementController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new RB209MeasurementService();
  }

  async getMeasurementDataHelper() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getCropHeights() {
    return this.getMeasurementDataHelper();
  }

  async getGreenAreaIndexes() {
    return this.getMeasurementDataHelper();
  }

  async getSeasons() {
    return this.getMeasurementDataHelper();
   
  }

  async getShootNumbers() {
    return this.getMeasurementDataHelper();
  
  }

  async getSmnConversionMethodBySmnValueAndSoilLayer() {
    return this.getMeasurementDataHelper();
  }

  async calculateSnsIndex() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    const payload = this.#request.payload;
    try {
      const data = await this.#service.postData(url, payload);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { RB209MeasurementController };
