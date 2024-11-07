
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

  async getAllIncorporationMethods() {
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }

  async getIncorporationMethodsById() {
    const { id } = this.#request.params;
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
  async getIncorporationMethodByIncorporationId() {
    const { methodId } = this.#request.params;
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
  async getIncorporationMethodByAppMethodAndApplicableFor() {
    const { methodId } = this.#request.params;
    const { applicableFor } = this.#request.query;
    let endpoint = this.#request.url.pathname.split("/manner")[1];
    endpoint += `?applicableFor=${applicableFor}`;
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
}

module.exports = MannerIncorporationMethodsController;
