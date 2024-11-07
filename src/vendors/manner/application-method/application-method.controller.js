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
    let endpoint = this.#request.url.pathname.split("/manner")[1];
    // Initialize an array to hold query parameters
    let queryParams = [];

    // Add isLiquid query param if it exists
    if (isLiquid !== undefined) {
      queryParams.push(`isLiquid=${isLiquid}`);
    }

    // Add fieldType query param if it exists
    if (fieldType !== undefined) {
      queryParams.push(`fieldType=${fieldType}`);
    }

    // If any query parameters exist, append them to the endpoint
    if (queryParams.length > 0) {
      endpoint += `?${queryParams.join("&")}`;
    }

    const data = await this.#service.getData(endpoint, this.#request);
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
