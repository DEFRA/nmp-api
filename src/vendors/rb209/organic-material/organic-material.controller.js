const RB209OrganicMaterialService = require("./organic-material.service");

class RB209OrganicMaterialController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new RB209OrganicMaterialService();
  }

  async getOrganicMaterialDataHelper() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getOrganicMaterialCategories() {
    return this.getOrganicMaterialDataHelper();
  }

  async getOrganicMaterialTypes() {
    const { dryMatterSplit, organicMaterialCategoryId } = this.#request.query;
    let url = this.#request.url.pathname.split("/rb209")[1];

    if (organicMaterialCategoryId !== undefined) {
      url += `/${organicMaterialCategoryId}`;
    }
    if (dryMatterSplit !== undefined) {
      url += `/${dryMatterSplit}`;
    }

    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getIncorporationMethods() {
    return this.getOrganicMaterialDataHelper();
  }

  async getIncorporationMethodsByOrganicMaterialTypeId() {
    return this.getOrganicMaterialDataHelper();
  }

  async getIncorporationMethodByIncorporationMethodId() {
    return this.getOrganicMaterialDataHelper();
  }

  async getOrganicMaterialCategoryItemByOrganicMaterialCategoryId() {
    return this.getOrganicMaterialDataHelper();
  }

  async getOrganicMaterialTypeItemByOrganicMaterialTypeId() {
       return this.getOrganicMaterialDataHelper();
  }

  async getOrganicMaterialTypeItemByOrganicMaterialTypeIdAndDryMatterSplit() {
    return this.getOrganicMaterialDataHelper();
  }
}

module.exports = { RB209OrganicMaterialController };
