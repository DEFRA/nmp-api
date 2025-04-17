const RB209GrassService = require("./grass.service");

class RB209GrassController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new RB209GrassService();
  }

  async getGrassDefoliationSequence() {
    let url = this.#request.url.pathname.split("/rb209")[1];
    const { swardTypeId, numberOfCuts } = this.#request.query;

    const queryParams = [];
    if (swardTypeId !== undefined) {
      queryParams.push(`swardTypeId=${swardTypeId}`);
    }
    if (numberOfCuts !== undefined) {
      queryParams.push(`numberOfCuts=${numberOfCuts}`);
    }

    if (queryParams.length > 0) {
      url += "?" + queryParams.join("&");
    }

    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getGrassCutsForField() {
    let url = this.#request.url.pathname.split("/rb209")[1];
    const { swardTypeId, swardManagementId } = this.#request.query;

    const queryParams = [];
    if (swardTypeId !== undefined) {
      queryParams.push(`swardTypeId=${swardTypeId}`);
    }
    if (swardManagementId !== undefined) {
      queryParams.push(`swardManagementId=${swardManagementId}`);
    }

    if (queryParams.length > 0) {
      url += "?" + queryParams.join("&");
    }

    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getSwardManagementsForGrassFields() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getSwardTypesForField() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getYieldRangesForGrassFields() {
    let url = this.#request.url.pathname.split("/rb209")[1];
    const { sequenceId, grassGrowthClassId } = this.#request.query;

    const queryParams = [];
    if (sequenceId !== undefined) {
      queryParams.push(`sequenceId=${sequenceId}`);
    }
    if (grassGrowthClassId !== undefined) {
      queryParams.push(`grassGrowthClassId=${grassGrowthClassId}`);
    }

    if (queryParams.length > 0) {
      url += "?" + queryParams.join("&");
    }

    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }


}

module.exports = { RB209GrassController };
