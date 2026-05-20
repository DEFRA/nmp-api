const RB209FieldService = require("./field.service");

class RB209FieldController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new RB209FieldService();
  }

  async getHandlerData() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getCountries() {
    return this.getHandlerData();
  }

  async getCountryByCountryId() {
    return this.getHandlerData();
  }

  async getFieldTypesByCountryId() {
    return this.getHandlerData();
  }

  async getFieldTypeByFieldTypeId() {
    return this.getHandlerData();
  }

  async getNutrientByNutrientId() {
    return this.getHandlerData();
  }

  async getNutrients() {
    return this.getHandlerData();
  }

  async getSecondCropTypeListByCropGroupId1AndCropTypeIdOneAndCropGroupIdTwoAndCountryId() {
    return this.getHandlerData();
  }

  async getSiteClassBySiteClassId() {
    return this.getHandlerData();
  }

  async getSiteClassesByCountryId() {
    return this.getHandlerData();
  }

  async getSiteClassItemBySoilTypeIdAndAltitudeAndPostcodeAndCountryId() {
    return this.getHandlerData();
  }
}

module.exports = { RB209FieldController };
