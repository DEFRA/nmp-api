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
    const { dateFrom, dateTo, confirm } = this.#request.query;

    try {
      const manureExists = await this.#organicManureService.checkManureExists(
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
}

module.exports = { OrganicManureController };
