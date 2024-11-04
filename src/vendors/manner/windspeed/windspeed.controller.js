const MannerWindspeedService = require("./windspeed.service");

class MannerWindspeedController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new MannerWindspeedService();
  }

  async getAllWindspeeds() {
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }

  async getWindspeedById() {
    const { id } = this.#request.params;
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
}

module.exports = MannerWindspeedController;
