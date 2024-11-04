const MannerApiCropTypesService = require("./crop-types.service");
class MannerApiCropTypesController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new MannerApiCropTypesService();
  }

  async getAllCropTypes() {
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }

  async getCropTypesById() {
    const { id } = this.#request.params;
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
}

module.exports = MannerApiCropTypesController;
