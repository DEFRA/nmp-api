const MannerMoistureTypesService = require("./moisture-types.service");

class MannerMoistureTypesController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new MannerMoistureTypesService();
  }
  async handlerGetData() {
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
  async getAllMoistureTypes() {
    return this.handlerGetData();
  }
  async getMoistureTypesById() {
     return this.handlerGetData();
  }
}

module.exports = MannerMoistureTypesController;
