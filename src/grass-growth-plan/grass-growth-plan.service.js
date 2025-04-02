const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");
const { FieldEntity } = require("../db/entity/field.entity");
const RB209GrasslandService = require("../vendors/rb209/grassland/grassland.service");
const MannerRainfallPostApplicationService = require("../vendors/manner/rainfall-post-application/rainfall-post-application.service");
const { FarmEntity } = require("../db/entity/farm.entity");

class GrassGrowthService extends BaseService {
  constructor() {
    super();
    this.fieldRepository = AppDataSource.getRepository(FieldEntity);
    this.farmRepository = AppDataSource.getRepository(FarmEntity);
    this.grassGrowthService = new RB209GrasslandService();
    this.MannerRainfallPostApplicationService =
      new MannerRainfallPostApplicationService();
  }

  async getGrassGrowthClassByFieldId(fieldIds, harvestYear, request) {
    const results = [];

    for (const fieldId of fieldIds) {
      const fieldResult = await this.calculateGrassGrowthClassByFieldId(
        fieldId,
        harvestYear,
        request
      );
      results.push(fieldResult);
    }

    return results; // Return array of responses for each fieldId
  }

  async calculateGrassGrowthClassByFieldId(fieldId, harvestYear, request) {
    try {
      // Fetch field details
      const field = await this.fieldRepository.findOne({
        where: { ID: fieldId },
      });

      if (!field) {
        return { fieldId, error: "Field not found" };
      }

      // Fetch farm details
      const farm = await this.farmRepository.findOne({
        where: { ID: field.FarmID },
      });

      if (!farm) {
        return { fieldId, error: "Farm not found for this field" };
      }

      // Determine altitude based on IsAbove300SeaLevel
      const altitude = field.IsAbove300SeaLevel === 1 ? 350 : 150;

      // Determine chalk based on SoilOverChalk
      const chalk = field.SoilOverChalk === 1; // Boolean conversion

      // Prepare body for rainfall API request
      const body = {
        applicationDate: `${harvestYear}-04-01`,
        endOfSoilDrainageDate: `${harvestYear}-04-30`,
        climateDataPostcode: farm.ClimateDataPostCode,
      };

      // Fetch rainfall data
      const rainfall = await this.MannerRainfallPostApplicationService.postData(
        `rainfall-post-application`,
        body,
        request
      );

      const summerRainfall = rainfall.data.rainfallPostApplication.value;

      // Fetch grass growth data
      const grassGrowthData = await this.grassGrowthService.getData(
        `Grassland/GrassGrowthClass/${field.SoilTypeID}/${summerRainfall}/${altitude}/${chalk}`
      );

      return { ...grassGrowthData, fieldId };
    } catch (error) {
      return { fieldId, error: error.message || "Error fetching data" };
    }
  }
}

module.exports = { GrassGrowthService };
