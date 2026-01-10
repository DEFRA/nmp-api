const boom = require("@hapi/boom");
const { OrganicManureService } = require("./organic-manure.service");

class OrganicManureController {
  #request;
  #h;
  #organicManureService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#organicManureService = new OrganicManureService();
  }

  async getTotalNitrogen() {
    const { fieldId } = this.#request.params;
    const { fromDate, toDate, confirm, organicManureID } = this.#request.query;

    try {
      const records = await this.#organicManureService.getTotalNitrogen(
        fieldId,
        fromDate,
        toDate,
        confirm,
        organicManureID
      );
      return this.#h.response({ TotalN: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getTotalNitrogenIfIsGreenFoodCompost() {
    const { fieldId } = this.#request.params;
    const { fromDate, toDate, confirm, isGreenFoodCompost, organicManureID } =
      this.#request.query;

    try {
      const records =
        await this.#organicManureService.getTotalNitrogenIfIsGreenFoodCompost(
          fieldId,
          fromDate,
          toDate,
          confirm,
          isGreenFoodCompost,
          organicManureID
        );
      return this.#h.response({ TotalN: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getManureTypeIdsByFieldAndYear() {
    const { fieldId } = this.#request.params;
    const { year, confirm } = this.#request.query;

    try {
      const records =
        await this.#organicManureService.getManureTypeIdsbyFieldAndYear(
          fieldId,
          year,
          confirm
        );
      if (!records) {
        throw boom.notFound("No manure types found.");
      }
      return this.#h.response({ ManureTypeIds: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getManureTypeIdsByManagementPeriod() {
    const { managementPeriodID } = this.#request.params;
    try {
      const records =
        await this.#organicManureService.getManureTypeIdsByManagementPeriod(
          managementPeriodID
        );
      if (!records) {
        throw boom.notFound("No manure types found.");
      }
      return this.#h.response({ ManureTypeIds: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async createOrganicManures() {
    const OrganicManures = this.#request.payload;
    const userId = this.#request.userId;

    try {
      const data =
        await this.#organicManureService.createOrganicManuresWithFarmManureType(
          this.#request,
          OrganicManures,
          userId
        );
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async checkManureExists() {
    const { managementPeriodID, dateFrom, dateTo, confirm, isSlurryOnly, organicManureID } =
      this.#request.query;

    try {
      const manureExists = await this.#organicManureService.checkManureExists(
        managementPeriodID,
        dateFrom,
        dateTo,
        confirm,
        organicManureID,
        isSlurryOnly,
        this.#request
      );
      return this.#h.response({ exists: manureExists });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async deleteOrganicManureByIds() {
    const { organicManureIds } = this.#request.payload; // assuming an array of IDs is passed in the payload
    const userId = this.#request.userId;

    try {
      // Loop through each organicManureId and call the service method to delete it
      for (let organicManureId of organicManureIds) {
        const result = await this.#organicManureService.deleteOrganicManure(
          organicManureId,
          userId,
          this.#request
        );

        if (result?.affectedRows === 0) {
          console.log(`Organic manure with ID ${organicManureId} not found.`);
        }
      }

      return this.#h.response({
        message: "Organic manures deleted successfully.",
      });
    } catch (error) {
      return this.#h.response({ error: error.message });
    }
  }

  async getOrganicManureDataById() {
    try {
      const { organicManureID } = this.#request.params;
      const { records } = await this.#organicManureService.getById(
        organicManureID
      );

      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getOrganicManureDataById controller:", error);
      return this.#h.response({ error });
    }
  }

  async getOrganicManureByFarmIdAndYear() {
    try {
      const { organicManureId } = this.#request.params;
      const { farmId } = this.#request.query;
      const { harvestYear } = this.#request.query;
      const records =
        await this.#organicManureService.getOrganicManureByFarmIdAndYear(
          organicManureId,
          farmId,
          harvestYear
        );

      return this.#h.response(records);
    } catch (error) {
      console.error(
        "Error in getOrganicManureByFarmIdAndYear controller:",
        error
      );
      return this.#h.response({ error });
    }
  }
  async updateOrganicManures() {
    const updatedOrganicManureData = this.#request.payload.OrganicManures; // Extract the array from payload
    const userId = this.#request.userId;

    try {
      // const results = []; // Array to store the results for each manure item
      // for (const manure of updatedFertiliserManureData) {
      // Process each manure object
      const data = await this.#organicManureService.updateOrganicManure(
        updatedOrganicManureData, // Pass the current manure object
        userId, // User ID
        // parseInt(fertiliserId), // Fertiliser ID
        this.#request // Original request
      );
      // results.push(data); // Store result of each update
      // }

      return this.#h.response({ data }); // Respond with the aggregated results
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getTotalAvailableNitrogenByManagementPeriodID() {
    const { managementPeriodID } = this.#request.params;
    try {
      const totalN =
        await this.#organicManureService.getTotalAvailableNitrogenByManagementPeriodID(
          managementPeriodID
        );
      return this.#h.response({ TotalN: totalN });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { OrganicManureController };
