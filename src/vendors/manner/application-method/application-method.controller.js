const MannerApplicationMethodService = require("./application-method.service");

class MannerApplicationMethodController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new MannerApplicationMethodService();
  }

  async getAllApplicationMethods() {
    const { isLiquid, fieldType } = this.#request.query;
    const endpoint = this.#request.url.pathname.split("/manner")[1];

    const data = await this.#service.getData(endpoint,this.#request);
    return this.#h.response(data);
  }

  async getApplicationMethodById() {
    const { id } = this.#request.params;
    const url = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(url, this.#request);
    return this.#h.response(data);
  }
}

module.exports = MannerApplicationMethodController;
