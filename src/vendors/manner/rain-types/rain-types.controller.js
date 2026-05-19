const MannerRainTypesService = require("./rain-types.service");

class MannerRainTypesController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new MannerRainTypesService();
  }

  async handlerGetData() {
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }

  async getAllRainTypes() {
    return this.handlerGetData();
  }

  async getRainTypeById() {
   return this.handlerGetData();
  }
}

module.exports = MannerRainTypesController;
