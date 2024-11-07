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

  async getCountries() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getCountryByCountryId() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getFieldTypesByCountryId() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getFieldTypeByFieldTypeId() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getNutrientByNutrientId() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getNutrients() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getSecondCropType_ListByCropGroupId1AndCropTypeId1AndCropGroupId2AndCountryId() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    const { cropGroupId1 } = this.#request.params;
    const { cropTypeId1 } = this.#request.params;
    const { cropGroupId2 } = this.#request.params;
    const { countryId } = this.#request.params;
    console.log("Crop Group ID1:", cropGroupId1);
    console.log("Crop Type ID1:", cropTypeId1);
    console.log("Crop Group ID2:", cropGroupId2);
    console.log("Country ID:", countryId);
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getSiteClassBySiteClassId() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    const { siteClassId } = this.#request.params;
    console.log("Site Class Id:", siteClassId);
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getSiteClassesByCountryId() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    const { countryId } = this.#request.params;
    console.log("Country Id:", countryId);
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getSiteClassItemBySoilTypeIdAndAltitudeAndPostcodeAndCountryId() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    const { soilTypeId } = this.#request.params;
    console.log("Soil Type Id:", soilTypeId);
    const { altitude } = this.#request.params;
    console.log("Altitude:", altitude);
    const { postcode } = this.#request.params;
    console.log("Post Code:", postcode);
    const { countryId } = this.#request.params;
    console.log("Country Id:", countryId);
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { RB209FieldController };
