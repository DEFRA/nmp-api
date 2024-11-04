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
  
  async getSoilTypes() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getSoilTypeBySoilTypeId() {
    const { soilTypeId } = this.#request.params;
    console.log("Soil Type ID:", soilTypeId);

    const url = this.#request.url.pathname.split("/rb209")[1];

    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getMethodologiesByNutrientIdAndCountryId() {
    const { nutrientId } = this.#request.params;
    console.log("Nutrient Id:", nutrientId);
    const { countryId } = this.#request.params;
    console.log("Country Id:", countryId);
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getMethodologyByNutrientIdAndMethodologyId() {
    const { nutrientId } = this.#request.params;
    console.log("Nutrient Id:", nutrientId);
    const { methodologyId } = this.#request.params;
    console.log("Methodology Id:", methodologyId);
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getNutrientIndexByNutrientIdAndIndexId() {
    const { nutrientId } = this.#request.params;
    console.log("Nutrient Id:", nutrientId);
    const { indexId } = this.#request.params;
    console.log("Index Id:", indexId);
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getNutrientIndexByNutrientIdAndNutrientValueAndMethodologyId() {
    const { nutrientId } = this.#request.params;
    console.log("Nutrient Id:", nutrientId);
    const { nutrientValue } = this.#request.params;
    console.log("Nutrient Value:", nutrientValue);
    const { methodologyId } = this.#request.params;
    console.log("Methodology Id:", methodologyId);
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getNutrientIndexIdFromValueByNutrientIdAndMethodologyIdAndNutrientValue() {
    const { nutrientId } = this.#request.params;
    console.log("Nutrient Id:", nutrientId);
    const { nutrientValue } = this.#request.params;
    console.log("Nutrient Value:", nutrientValue);
    const { methodologyId } = this.#request.params;
    console.log("Methodology Id:", methodologyId);
    const { countryId } = this.#request.params;
    console.log("Country Id:", countryId);
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getNutrientIndicesByNutrientIdAndMethodologyIdAndCountryId() {
    const { nutrientId } = this.#request.params;
    console.log("Nutrient Id:", nutrientId);
    const { methodologyId } = this.#request.params;
    console.log("Methodology Id:", methodologyId);
    const { countryId } = this.#request.params;
    console.log("Country Id:", countryId);
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getNutrientTargetIndexByCropGroupIdAndNutrientIdAndCountryId() {
    const { cropGroupId } = this.#request.params;
    console.log("Crop Group Id:", cropGroupId);
    const { nutrientId } = this.#request.params;
    console.log("Nutrient Id:", nutrientId);
    const { countryId } = this.#request.params;
    console.log("Country Id:", countryId);
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getNvzActionProgramByCountryId() {
    const { countryId } = this.#request.params;
    console.log("Country Id:", countryId);
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getSoilPhRecommendationBySoilTypeIdAndCountryId() {
    const { soilTypeId } = this.#request.params;
    console.log("Soil Type Id:", soilTypeId);
    const { countryId } = this.#request.params;
    console.log("Country Id:", countryId);
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getSoilPscByCropGroupIdAndPIndexId() {
    const { cropGroupId } = this.#request.params;
    console.log("Crop Group Id:", cropGroupId);
    const { pIndexId } = this.#request.params;
    console.log("pIndex Id:", pIndexId);
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { RB209SoilController };
