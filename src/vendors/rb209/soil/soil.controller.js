const RB209SoilService = require("./soil.service");
class RB209SoilController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new RB209SoilService();
  }

  async getSoilDataHander() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getSoilTypes() {
    try {
      const data = await this.#service.getSoilTypesList();
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getSoilTypeBySoilTypeId() {
    const { soilTypeId } = this.#request.params;

    try {
      const data = await this.#service.getSoilTypeBySoilTypeId(soilTypeId);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getMethodologiesByNutrientIdAndCountryId() {
    return this.getSoilDataHander();
  }

  async getMethodologyByNutrientIdAndMethodologyId() {
    return this.getSoilDataHander();
  }

  async getNutrientIndexByNutrientIdAndIndexId() {
    return this.getSoilDataHander();
  }

  async getNutrientIndexByNutrientIdAndNutrientValueAndMethodologyId() {
    return this.getSoilDataHander();
  }

  async getNutrientIndexByNutrientIdAndNutrientValueMethodologyIdAndCountryId() {
    return this.getSoilDataHander();
  }

  async getNutrientIndexMethodologyId() {
    return this.getSoilDataHander();
  }

  async getNutrientIndexIdFromValueByNutrientIdAndMethodologyIdAndNutrientValue() {
    return this.getSoilDataHander();
  }

  async getNutrientIndicesByNutrientIdAndMethodologyIdAndCountryId() {
    return this.getSoilDataHander();
  }

  async getNutrientTargetIndexByCropGroupIdAndNutrientIdAndCountryId() {
    return this.getSoilDataHander();
  }

  async getNvzActionProgramByCountryId() {
    return this.getSoilDataHander();
  }

  async getSoilPhRecommendationBySoilTypeIdAndCountryId() {
    return this.getSoilDataHander();
  }

  async getSoilPscByCropGroupIdAndPIndexId() {
    return this.getSoilDataHander();
  }
}

module.exports = { RB209SoilController };
