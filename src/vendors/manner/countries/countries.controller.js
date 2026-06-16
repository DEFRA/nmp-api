const MannerCountriesService = require("./countries.service");
class MannerCountriesController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new MannerCountriesService();
  }
  async handlerGetData() {
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
  async getAllcountries() {
    return this.handlerGetData();
  }
  async getcountriesById() {
    return this.handlerGetData();
  }
}

module.exports = MannerCountriesController;
