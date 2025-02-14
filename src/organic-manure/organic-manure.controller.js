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
    const { managementPeriodID } = this.#request.params;
    const { fromDate, toDate, confirm } = this.#request.query;

    try {
      const records = await this.#organicManureService.getTotalNitrogen(
        managementPeriodID,
        fromDate,
        toDate,
        confirm
      );
      return this.#h.response({ TotalN: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getTotalNitrogenIfIsGreenFoodCompost() {
    const { managementPeriodID } = this.#request.params;
    const { fromDate, toDate, confirm, isGreenFoodCompost } =
      this.#request.query;

    try {
      const records =
        await this.#organicManureService.getTotalNitrogenIfIsGreenFoodCompost(
          managementPeriodID,
          fromDate,
          toDate,
          confirm,
          isGreenFoodCompost
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
    const { managementPeriodID, dateFrom, dateTo, confirm } =
      this.#request.query;

    try {
      const manureExists = await this.#organicManureService.checkManureExists(
        managementPeriodID,
        dateFrom,
        dateTo,
        confirm,
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
          throw boom.notFound(
            `Organic manure with ID ${organicManureId} not found.`
          );
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
}

module.exports = { OrganicManureController };
