const { AppDataSource } = require("../db/data-source");
const { MoistureTypeEntity } = require("../db/entity/moisture-type.entity");
const { BaseService } = require("../base/base.service");
const { validateISODateFormat } = require("../shared/dataValidate");
const MannerMoistureTypesService = require("../vendors/manner/moisture-types/moisture-types.service");

class MoistureTypeService extends BaseService {
  constructor() {
    super(MoistureTypeEntity);
    this.repository = AppDataSource.getRepository(MoistureTypeEntity);
    this.moistureMannerService = new MannerMoistureTypesService();
  }

  async getDefaultSoilMoistureType(applicationDate, request) {
    const date = validateISODateFormat(applicationDate);
    //calling manner api
    const moisturTypeList = await this.moistureMannerService.getData(
      "moisture-types",
      request
    );

    if (moisturTypeList.success && moisturTypeList.data) {
      // Get the month from the application date
      const month = date.getMonth() + 1;

      // Determine soil moisture type based on the month
      const soilMoistureType =
        month === 5 || month === 6 || month === 7 ? "Dry" : "Moist";

      // Find the corresponding moisture type in the manner data
      const moistureType = moisturTypeList.data.find(
        (item) => item.name === soilMoistureType
      );

      return moistureType;
    } else {
      throw new Error("Failed to fetch moisture types or data is unavailable");
    }
  }
}

module.exports = { MoistureTypeService };
