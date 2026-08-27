const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");
const { FieldEntity } = require("../db/entity/field.entity");
const RB209GrasslandService = require("../vendors/rb209/grassland/grassland.service");
const MannerRainfallPostApplicationService = require("../vendors/manner/rainfall-post-application/rainfall-post-application.service");
const { FarmEntity } = require("../db/entity/farm.entity");
const RB209GrassService = require("../vendors/rb209/grass/grass.service");
const { FieldAboveOrBelowSeaLevelMapper } = require("../constants/field-is-above-sea-level");

class GrassGrowthService extends BaseService {
  constructor() {
    super();
    this.fieldRepository = AppDataSource.getRepository(FieldEntity);
    this.farmRepository = AppDataSource.getRepository(FarmEntity);
    this.grassGrowthService = new RB209GrassService();
    this.MannerRainfallPostApplicationService =
      new MannerRainfallPostApplicationService();
  }

  async getGrassGrowthClassByFieldId(fieldIds, request) {
    return AppDataSource.transaction(async (transactionalManager) => {
      const results = [];

      for (const fieldId of fieldIds) {
        const fieldResult = await this.calculateGrassGrowthClassByFieldId(
          fieldId,
          request,
          transactionalManager,
        );

        results.push(fieldResult);
      }

      return results;
    });
  }

  async calculateGrassGrowthClassByFieldId(
    fieldId,
    request,
    transactionalManager,
    fieldRelatedData = null
  ) {
    try {
      // Fetch field details
      const field = await transactionalManager.findOne(FieldEntity, {
        where: { ID: fieldId },
      });

      if (!field) {
        return { fieldId, error: "Field not found" };
      }

      // Fetch farm details
      const farm = await transactionalManager.findOne(FarmEntity, {
        where: { ID: field.FarmID },
      });

      if (!farm) {
        return { fieldId, error: "Farm not found for this field" };
      }

      // Determine altitude based on IsAbove300SeaLevel
      const altitude = field.IsAbove300SeaLevel
        ? FieldAboveOrBelowSeaLevelMapper.ABOVETHREEHUNDRED
        : FieldAboveOrBelowSeaLevelMapper.BELOWTHREEHUNDRED;

      // Ensure SoilOverChalk is false if it's null
      const soilOverChalk = field.SoilOverChalk ?? false;
      const postcode = farm.ClimateDataPostCode;
      let summerRainfall=null;
      if (
        fieldRelatedData?.summerRainfall === undefined ||
        fieldRelatedData?.summerRainfall === null
      ) {
        const rainfall =
          await this.MannerRainfallPostApplicationService.getData(
            `climates/rainfall-april-to-september/${postcode}`,
            request,
          );
        summerRainfall = rainfall.data.value;
      } else {
        summerRainfall = fieldRelatedData?.summerRainfall;
      }


      // Fetch grass growth data
      const grassGrowthData = await this.grassGrowthService.getData(
        `Grass/GrassGrowthClass/${field.SoilTypeID}/${summerRainfall}/${altitude}/${soilOverChalk}`,
      );

      return {
        ...grassGrowthData,
        fieldId,
      };
    } catch (error) {
      return {
        fieldId,
        error: error.message || "Error fetching data",
      };
    }
  }
}

module.exports = { GrassGrowthService };
