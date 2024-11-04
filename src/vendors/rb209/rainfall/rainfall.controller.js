const RB209RainfallService = require("./rainfall.service");
class RB209RainfallController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new RB209RainfallService();
  }
  async getAverageRainfallByPostcode() {
    const { postcode } = this.#request.params;
    console.log("Postcode:", postcode);
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { RB209RainfallController };
