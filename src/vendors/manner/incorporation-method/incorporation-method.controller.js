
const MannerIncorporationMethodService = require("./incorporation-method.service");

class MannerIncorporationMethodsController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new MannerIncorporationMethodService();
  }
  async handlerGetData() {
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
  async getAllIncorporationMethods() {
    return this.handlerGetData();
  }
  async getIncorporationMethodsById() {
    return this.handlerGetData();
  }
  async getIncorporationMethodByIncorporationId() {
    return this.handlerGetData();
  }
  async getIncorporationMethodByAppMethodAndApplicableFor() {
    const { applicableFor } = this.#request.query;
    let endpoint = this.#request.url.pathname.split("/manner")[1];
    endpoint += `?applicableFor=${applicableFor}`;
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
}

module.exports = MannerIncorporationMethodsController;
