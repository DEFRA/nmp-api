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

  getRb209Path() {
    return this.#request.url.pathname.split("/rb209")[1];
  }

  async handleGetData() {
    const url = this.getRb209Path();
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getGrassDefoliationSequenceByDefoliationSequenceId() {
    return this.handleGetData();
  }
  async getGrassDefoliationSequence() {
    return this.handleGetData();
  }
  async getGrassGrowthClassesByCountryId() {
    return this.handleGetData();
  }
  async getGrassHistoriesByCountryId() {
    return this.handleGetData();
  }
  async getGrassHistoryByGrassHistoryId() {
    return this.handleGetData();
  }
  async getGrassSeasonBySeasonId() {
    return this.handleGetData();
  }
  async getGrassSeasonByCountryId() {
    return this.handleGetData();
  }
  async getGrassGrowthClassByGrassGrowthClassId() {
    return this.handleGetData();
  }

  async getGrassGrowthClassBySoilTypeIdAndRainfallAndAltitudeAndChalk() {
    return this.handleGetData();
  }
  async getGrassCutsForField() {
    return this.handleGetData();
  }
  async getSwardManagementBySwardManagementId() {
    return this.handleGetData();
  }
  async getSiteClassIdBySoilTypeIdAndRainfallAndAltitude() {
    return this.handleGetData();
  }
  async getSwardManagementsForGrassFields() {
    return this.handleGetData();
  }
  async getSwardManagementBySwardTypeId() {
    return this.handleGetData();
  }
  async getSwardTypeBySwardTypeId() {
    return this.handleGetData();
  }
  async getSwardTypesForField() {
    return this.handleGetData();
  }

  async getSwardTypesFilterByCountryId() {
    const { countryId } = this.#request.params;
     try {
       const record = await this.#service.getSwardTypesFilterByCountryId(
         countryId
       );
       return this.#h.response(record);
     } catch (error) {
       console.error("Error in getSwardTypesFilterByCountryId:", error);
       return this.#h.response(error);
     }
  }

  async getSwardTypesFilterByCountryId() {
    const { countryId } = this.#request.params;
    try {
      const record =
        await this.#service.getSwardTypesFilterByCountryId(countryId);
      return this.#h.response(record);
    } catch (error) {
      console.error("Error in getSwardTypesFilterByCountryId:", error);
      return this.#h.response(error);
    }
  }

  async getYieldRangesForGrassFields() {
    return this.handleGetData();
  }
  async getYieldRangesForGrassFieldsBySequenceIdAndSiteClassId() {
    return this.handleGetData();
  }
}

module.exports = { RB209GrassController };
