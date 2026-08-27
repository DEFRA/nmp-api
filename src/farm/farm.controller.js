const boom = require("@hapi/boom");
const { FarmService } = require("./farm.service");
const { StaticStrings } = require("../shared/static.string");

class FarmController {
  #request;
  #h;
  #farmService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#farmService = new FarmService();
  }

  async checkFarmExists() {
    try {
      const { Name, Postcode, Id, OrganisationID } = this.#request.query;
      const exists = await this.#farmService.farmExistsByNameAndPostcode(
        Name,
        Postcode,
        OrganisationID,
        Id,
      );
      return this.#h.response({ exists });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getAll() {
    try {
      const { records } = await this.#farmService.getAll();
      return this.#h.response({ Farms: records });
    } catch (error) {
      console.error(error);
      return this.#h.response({ error });
    }
  }

  async getAllWithLastUpdatedDate() {
  try {
    const { organisationId } = this.#request.params;

    const { records } =
      await this.#farmService.getAllWithLastUpdatedDate(
        organisationId
      );

    return this.#h.response({ Farms: records });
  } catch (error) {
    console.error(error);
    return this.#h.response({ error });
  }
}

  async getById() {
    try {
      const { farmId } = this.#request.params;
      const records = await this.#farmService.getFarmById(farmId);
      console.log("farmrecord", records);
      return this.#h.response({ Farm: records });
    } catch (error) {
      console.error(error);
      return this.#h.response({ error });
    }
  }

  async deleteFarmById() {
    try {
      const { farmId } = this.#request.params;
      await this.#farmService.deleteFarmAndRelatedEntities(farmId);
      return this.#h.response({ message: "Farm deleted successfully" });
    } catch (error) {
      console.error(error);
      return this.#h.response({ error });
    }
  }

  async createFarm() {
    try {
      const { Farm, FarmsNvz } = this.#request.payload;
      const exists = await this.#farmService.farmExistsByNameAndPostcode(
        Farm.Name,
        Farm.Postcode,
        Farm.OrganisationID,
      );
      if (exists) {
        throw boom.conflict("Farm already exists with this Name and Postcode");
      }
      const userId = this.#request.userId;
      const newFarm = await this.#farmService.createFarm(
        {
          Farm,
          FarmsNvz,
        },
        userId,
      );
      return this.#h.response(newFarm);
    } catch (error) {
      console.error(error);
      return this.#h.response({ error });
    }
  }

  async updateFarm() {
    try {
      const { Farm, FarmsNvz } = this.#request.payload;
      const userId = this.#request.userId;
      const updatedFarm = await this.#farmService.updateFarm(
        {
          Farm,
          FarmsNvz,
        },
        userId,
        Farm.ID,
        this.#request,
      );
      return this.#h.response({ Farm: updatedFarm });
    } catch (error) {
      console.error(error);
      return this.#h.response({ error });
    }
  }
  async getFarmsByOrganisationId() {
    try {
      const { organisationId } = this.#request.params;
      const { shortSummary = false } = this.#request.query;
      if (!organisationId) {
        throw boom.badRequest(StaticStrings.HTTP_STATUS_BAD_REQUEST);
      }
      let selectOptions = {};
      if (shortSummary) {
        selectOptions = { ID: true, Name: true, OrganisationID: true };
      }
      const farms = await this.#farmService.getBy(
        "OrganisationID",
        organisationId,
        selectOptions,
      );
      return this.#h.response({ Farms: farms.records });
    } catch (error) {
      console.error("Error in getFarmsByOrganisationId controller:", error);
      return this.#h.response({ error });
    }
  }

  async getLastUpdatedDates() {
    try {
    const { farmId } = this.#request.params;
    const { years } = this.#request.query;
      const yearsOfFarm = years.split(",").map(Number);
    const lastUpdatedDateData = await this.#farmService.getLastUpdatedDates(
      farmId,
      yearsOfFarm
    );
    return this.#h.response(lastUpdatedDateData);
    } catch (error) {
      console.error(error);
      return this.#h.response({ error });
    }
  }
}

module.exports = { FarmController };
