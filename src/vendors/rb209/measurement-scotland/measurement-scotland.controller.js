const RB209MeasurementScotlandService = require("./measurement-scotland.service");
class RB209MeasurementScotlandController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new RB209MeasurementScotlandService();
  }

  async calculateResidueGroup() {
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

module.exports = { RB209MeasurementScotlandController };
