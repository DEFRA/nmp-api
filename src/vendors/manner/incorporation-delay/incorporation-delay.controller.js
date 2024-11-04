const EnvironmentService = require("../../../shared/environment.service");
const MannerIncorporationDelayService = require("./incorporation-delay.service");


class MannerIncorporationDelayController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new MannerIncorporationDelayService();
  }

  async getAllIncorporationDelays() {
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }

  async getIncorporationDelayById() {
    const { id } = this.#request.params;
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
  async getIncorporationDelayByIncorporationId() {
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

module.exports = MannerIncorporationDelayController;
