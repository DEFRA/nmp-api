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
  async handlerGetData() {
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
  async getAllCropTypes() {
    return this.handlerGetData();
  }
  async getCropTypesById() {
    return this.handlerGetData();
  }
}

module.exports = MannerApiCropTypesController;
