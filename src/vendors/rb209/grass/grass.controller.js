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
  async getGrassDefoliationSequenceByDefoliationSequenceId() {
    let url = this.#request.url.pathname.split("/rb209")[1];
    const { defoliationSequenceId } = this.#request.params;
    try {
      const data = await this.#service.getData(url);
      return this.#h.response({ data });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getGrassDefoliationSequence() {
    //let url = this.#request.url.pathname.split("/rb209")[1];
    const url = this.#request.url.pathname.split("/rb209")[1];

    //const { swardTypeId, numberOfCuts } = this.#request.query;
    const { swardManagementId, numberOfCuts } = this.#request.params;

    // const queryParams = [];
    // if (swardTypeId !== undefined) {
    //   queryParams.push(`swardTypeId=${swardTypeId}`);
    // }
    // if (numberOfCuts !== undefined) {
    //   queryParams.push(`numberOfCuts=${numberOfCuts}`);
    // }

    // if (queryParams.length > 0) {
    //   url += "?" + queryParams.join("&");
    // }

    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
      // console.log("data oof defoliation",data)
      // if (data.status != 404 ) {
      //   return this.#h.response(data);
      // } else {
      //   const data = await this.#service.getData(
      //     `Grass/DefoliationSequence/${swardTypeId}/${numberOfCuts}`
      //   );
      //   console.log("data needed", data);
      //   return this.#h.response({ list: data });
      // }
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getGrassGrowthClassesByCountryId() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getGrassHistoriesByCountryId() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getGrassHistoryByGrassHistoryId() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getGrassSeasonBySeasonId() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getGrassSeasonByCountryId() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getGrassGrowthClassByGrassGrowthClassId() {
    const { grassGrowthClassId } = this.#request.params;
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getGrassGrowthClassBySoilTypeIdAndRainfallAndAltitudeAndChalk() {
    const { soilTypeId, rainfall, altitude, chalk } = this.#request.params;
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getGrassCutsForField() {
    let url = this.#request.url.pathname.split("/rb209")[1];
    const { swardTypeId, swardManagementId } = this.#request.params;

    // const queryParams = [];
    // if (swardTypeId !== undefined) {
    //   queryParams.push(`swardTypeId=${swardTypeId}`);
    // }
    // if (swardManagementId !== undefined) {
    //   queryParams.push(`swardManagementId=${swardManagementId}`);
    // }

    // if (queryParams.length > 0) {
    //   url += "?" + queryParams.join("&");
    // }

    try {
      const data = await this.#service.getData(url);
      return this.#h.response({ data });

      // if(data.status!=404){

      //   return this.#h.response(data);
      // }else{
      //   console.log("swardTypeId", swardTypeId);
      //   console.log("swardManagementId", swardManagementId);
      // const data = await this.#service.getData(
      //   `Grass/PotentialCuts/${swardTypeId}/${swardManagementId}`
      // );
      // console.log("data needed for", data);

      //   return this.#h.response({data});

      // }
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getSwardManagementBySwardManagementId() {
    let url = this.#request.url.pathname.split("/rb209")[1];
    const { swardManagementId } = this.#request.params;
    try {
      const data = await this.#service.getData(url);
      return this.#h.response({ data });
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
  async getSwardManagementBySwardTypeId() {
    let url = this.#request.url.pathname.split("/rb209")[1];
    const { swardTypeId } = this.#request.params;
    try {
      const data = await this.#service.getData(url);
      return this.#h.response({ data });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getSwardTypeBySwardTypeId() {
    let url = this.#request.url.pathname.split("/rb209")[1];
    const { swardTypeId } = this.#request.params;
    try {
      const data = await this.#service.getData(url);
      return this.#h.response({ data });
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
    const { sequenceId, grassGrowthClassId } = this.#request.params;

    // const queryParams = [];
    // if (sequenceId !== undefined) {
    //   queryParams.push(`sequenceId=${sequenceId}`);
    // }
    // if (grassGrowthClassId !== undefined) {
    //   queryParams.push(`grassGrowthClassId=${grassGrowthClassId}`);
    // }

    // if (queryParams.length > 0) {
    //   url += "?" + queryParams.join("&");
    // }

    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
      // if (data.status != 404 || data.status != 422) {
      //   return this.#h.response(data);
      // } else {
      //   const data = await this.#service.getData(
      //     `Grass/YieldRangesEnglandAndWales/${sequenceId}/${grassGrowthClassId}`
      //   );
      //   return this.#h.response(data);
      // }
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { RB209GrassController };
