const MannerManureGroupService = require("./manure-group.service");

class MannerManureGroupController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new MannerManureGroupService();
  }

  async handlerGetData() {
    const endpoint = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(endpoint, this.#request);
    return this.#h.response(data);
  }
  async getAllManureGroups() {
    return this.handlerGetData();
  }
  async getManureGroupsById() {
    return this.handlerGetData();
  }
}

module.exports = MannerManureGroupController;
