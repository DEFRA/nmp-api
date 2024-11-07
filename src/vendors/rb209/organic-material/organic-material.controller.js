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

  async getOrganicMaterialCategories() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
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
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getIncorporationMethodsByOrganicMaterialTypeId() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getIncorporationMethodByIncorporationMethodId() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getOrganicMaterialCategoryItemByOrganicMaterialCategoryId() {
    const { organicMaterialCategoryId } = this.#request.params;
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      console.error(
        "Error in getOrganicMaterialCategoryItemByOrganicMaterialCategoryId:",
        error
      );
      return this.#h.response({ error });
    }
  }

  async getOrganicMaterialTypeItemByOrganicMaterialTypeId() {
    const { organicMaterialTypeId } = this.#request.params;
    const url = this.#request.url.pathname.split("/rb209")[1];;

    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getOrganicMaterialTypeItemByOrganicMaterialTypeIdAndDryMatterSplit() {
    const { organicMaterialTypeId, dryMatterSplit } = this.#request.params;
    const url = this.#request.url.pathname.split("/rb209")[1];;

    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { RB209OrganicMaterialController };
