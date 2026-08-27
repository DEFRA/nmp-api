const MannerApiNutrientsProductService = require("./nutrients-product.service");


class MannerApiNutrientsProductController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new MannerApiNutrientsProductService();
  }
  async handlerGetData() {
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
  async getAllNutrientsProducts() {
    return this.handlerGetData();
  }
  async getNutrientsProductsById() {
    return this.handlerGetData();
  }
  async getNutrientsProductsByNutrientId() {
    return this.handlerGetData();
  }
}

module.exports = MannerApiNutrientsProductController;
