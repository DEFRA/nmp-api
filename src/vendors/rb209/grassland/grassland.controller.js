const RB209GrasslandService = require('./grassland.service');

class RB209GrasslandController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new RB209GrasslandService();
  }

  async getGrasslandDataHelper() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getGrasslandSeasonsByCountryId() {
   return this.getGrasslandDataHelper();
  }

  async getGrasslandSeasonBySeasonId() {
   return this.getGrasslandDataHelper();
  }

  async getGrasslandFieldTypesByCountryId() {
   return this.getGrasslandDataHelper();
  }

  async getGrasslandFieldTypeByFieldTypeId() {
   return this.getGrasslandDataHelper();
  }

  async getGrassGrowthClassesByCountryId() {
   return this.getGrasslandDataHelper();
  }

  async getGrassGrowthClassByGrassGrowthClassId() {
   return this.getGrasslandDataHelper();
   
  }

  async getGrassGrowthClassBySoilTypeIdAndRainfallAndAltitudeAndChalk() {
   return this.getGrasslandDataHelper();
  }

  async getCropMaterialsByCountryId() {
   return this.getGrasslandDataHelper();
  }

  async getCropMaterialByCropMaterialId() {
      return this.getGrasslandDataHelper();
  }

  async getYieldTypeByYieldTypeId() {
   return this.getGrasslandDataHelper();
  }

  async getYieldTypesByCountryId() {
    return this.getGrasslandDataHelper();
  }

  async getSoilNitrogenSuppliesByCountryId() {
   return this.getGrasslandDataHelper();
  }

  async getSoilNitrogenSupplyItemBySoilNitrogenSupplyId() {
   return this.getGrasslandDataHelper();
  }

  async getGrassHistoriesByCountryId() {
    return this.getGrasslandDataHelper();
  }

  async getGrassHistoryByGrassHistoryId() {
    return this.getGrasslandDataHelper();
  }

  async getSequenceItemsByCountryId() {
    return this.getGrasslandDataHelper();
  }

  async getSequenceItemBySequenceItemId() {
    return this.getGrasslandDataHelper();
  }

  async getGrassSequencesBySeasonIdAndFieldTypeIdAndCountryId() {
    return this.getGrasslandDataHelper();
  }

  async getGrassSequenceItemByGrassSequenceId() {
    return this.getGrasslandDataHelper();
  }

  async getSoilNitrogenSupplyByGrassHistoryId() {
    return this.getGrasslandDataHelper();
  }

  async getGrasslandFieldTypeItemByFieldTypeId() {
    return this.getGrasslandDataHelper();
  }
}

module.exports = { RB209GrasslandController };
