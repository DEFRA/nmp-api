const RB209ArableService = require("./arable.service");

class RB209ArableController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new RB209ArableService();
  }

  async getCropsdetails() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getCropGroups() {
    try {
      const data = await this.#service.getCropGroupsList();
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getCropGroupsBycropGroupId() {
    const { cropGroupId } = this.#request.params;

    try {
      const data = await this.#service.getCropGroupByCropGroupId(cropGroupId);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getCropTypes() {
    try {
      const data = await this.#service.getCropTypesList();
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getCropTypesByCropGroupId() {
    const { cropGroupId } = this.#request.params;

    try {
      const data = await this.#service.getCropTypesByCropGroupId(cropGroupId);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getCropTypeByCropTypeId() {
    const { cropTypeId } = this.#request.params;

    try {
      const data = await this.#service.getCropTypeByCropTypeId(cropTypeId);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getCropInfo1s() {
    return this.getCropsdetails();
  }

  async getCropInfo1sByCropTypeId() {
    return this.getCropsdetails();
  }

  async getCropInfo1ByCropTypeIdAndCropInfo1Id() {
    return this.getCropsdetails();
  }

  async getCropInfo2s() {
    return this.getCropsdetails();
  }

  async getCropInfo2CropInfo2Id() {
    return this.getCropsdetails();
  }

  async getPotatoGroups() {
    return this.getCropsdetails();
  }

  async getPotatoGroupByPotatoGroupId() {
    return this.getCropsdetails();
  }

  async getPotatoVarieties() {
    return this.getCropsdetails();
  }

  async getPotatoVarietiesByPotatoGroupId() {
    return this.getCropsdetails();
  }

  async getPotatoVarietyByPotatoVarietyId() {
    return this.getCropsdetails();
  }

  async getCropTypesMetrics() {
    try {
      const data = await this.#service.getCropTypesMetrics();
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async resetCropTypesMetrics() {
    try {
      const data = this.#service.resetCropTypesMetrics();
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async resetCropTypesCache() {
    try {
      const data = await this.#service.resetCropTypesCache();
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { RB209ArableController };
