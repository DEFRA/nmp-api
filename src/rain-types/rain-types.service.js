const { AppDataSource } = require("../db/data-source");
const { RainTypeEntity } = require('../db/entity/rain-type.entity');
const { BaseService } = require("../base/base.service");
const MannerRainTypesService = require("../vendors/manner/rain-types/rain-types.service");
class RainTypeService extends BaseService {
  constructor() {
    super(RainTypeEntity);
    this.repository = AppDataSource.getRepository(RainTypeEntity);
    this.MannerRainTypesService = new MannerRainTypesService();
  }

  async getAll() {
    const records = await this.repository.find();
    return { records };
  }

  async findFirstRow(request) {
    // Fetch the rain types list from the service
    const rainMannerList = await this.MannerRainTypesService.getData(
      "rain-types",
      request
    );

    // Check if the response was successful and data exists
    if (rainMannerList.success && rainMannerList.data) {
      // Find the entry with ID 1
      const defaultEntry = rainMannerList.data.find(
        (item) => item.id === 1
      );

      if (defaultEntry) {
        return defaultEntry;
      } else {
        throw new Error("Rain type with ID 1 not found");
      }
    } else {
      throw new Error("Failed to fetch rain type data or data is unavailable");
    }
  }
}

module.exports = { RainTypeService };
