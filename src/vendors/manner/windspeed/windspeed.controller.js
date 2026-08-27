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

  async handlerGetData() {
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
  async getAllWindspeeds() {
    return this.handlerGetData();
  }
  async getWindspeedById() {
    return this.handlerGetData();
  }

}

module.exports = MannerWindspeedController;
