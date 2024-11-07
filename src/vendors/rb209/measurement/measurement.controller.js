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

  async getCropHeights() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getGreenAreaIndexes() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  
  async getSeasons() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getShootNumbers() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getSmnConversionMethodBySmnValueAndSoilLayer() {
    const { smnValue } = this.#request.params;
    console.log("Smn Value:", smnValue);
    const { soilLayer } = this.#request.params;
    console.log("Soil Layer:", soilLayer);
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async calculateSnsIndex() {
    const url = this.#request.url.pathname.split('/rb209')[1];
    const payload = this.#request.payload;
    try {
      const data = await this.#service.postData(url, payload);
      return this.#h.response(data)
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { RB209MeasurementController };
