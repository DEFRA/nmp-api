
const MannerTopSoilsService = require("./top-soil.service");

class MannerTopSoilsController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new MannerTopSoilsService();
  }
  async handlerGetData() {
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
  async getAllSoils() {
    return this.handlerGetData();
  }
  async getSoilsById() {
    return this.handlerGetData();
  }
}

module.exports = MannerTopSoilsController;
