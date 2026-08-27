const MannerApinutrientsService = require("./nutrients.service");

class MannerApiNutrientsController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new MannerApinutrientsService();
  }
  async handlerGetData() {
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
  async getAllNutrients() {
    return this.handlerGetData();
  }
  async getNutrientsById() {
    return this.handlerGetData();
  }
}

module.exports = MannerApiNutrientsController;
