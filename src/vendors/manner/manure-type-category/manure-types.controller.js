const MannerManureTypesCategoriesService = require("./manure-types.service");


class MannerManureTypesCategoriesController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new MannerManureTypesCategoriesService();
  }
  async handlerGetData() {
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
  async getAllManureTypeCategories() {
    return this.handlerGetData();
  }
  async getManureTypeCategoriesById() {
    return this.handlerGetData();
  }
}

module.exports = MannerManureTypesCategoriesController;
