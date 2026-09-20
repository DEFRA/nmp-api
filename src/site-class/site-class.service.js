const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");
const { FieldEntity } = require("../db/entity/field.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const RB209GrassService = require("../vendors/rb209/grass/grass.service");
const RB209RainfallService = require("../vendors/rb209/rainfall/rainfall.service");
const {
  FieldAboveOrBelowSeaLevelMapper,
} = require("../constants/field-is-above-sea-level");

class SiteClassService extends BaseService {
  constructor() {
    super();
    this.fieldRepository = AppDataSource.getRepository(FieldEntity);
    this.farmRepository = AppDataSource.getRepository(FarmEntity);
    this.grassService = new RB209GrassService();
    this.rainfallService = new RB209RainfallService();
  }

  async getSiteClassIdByFieldId(fieldIds, request) {
    return AppDataSource.transaction(async (transactionalManager) => {
      const results = [];

      for (const fieldId of fieldIds) {
        const fieldResult = await this.calculateSiteClassIdByFieldId(
          fieldId,
          request,
          transactionalManager,
        );

        results.push(fieldResult);
      }

      return results;
    });
  }

  async calculateSiteClassIdByFieldId(
    fieldId,
    request,
    transactionalManager,
    fieldRelatedData = null,
  ) {
    try {
      const field = await transactionalManager.findOne(FieldEntity, {
        where: { ID: fieldId },
      });

      if (!field) {
        return { fieldId, error: "Field not found" };
      }

      const farm = await transactionalManager.findOne(FarmEntity, {
        where: { ID: field.FarmID },
      });

      if (!farm) {
        return { fieldId, error: "Farm not found for this field" };
      }

      const soilTypeId = fieldRelatedData?.soilTypeId ?? field.SoilTypeID;
      if (soilTypeId === null) {
        return { fieldId, error: "Soil type not found for this field" };
      }

      const altitude =
        fieldRelatedData?.altitude ??
        farm.AverageAltitude ??
        (field.IsAbove300SeaLevel
          ? FieldAboveOrBelowSeaLevelMapper.ABOVETHREEHUNDRED
          : FieldAboveOrBelowSeaLevelMapper.BELOWTHREEHUNDRED);

      const rainfall =
        fieldRelatedData?.rainfall ??
        farm.Rainfall ??
        (await this.getRainfallByPostcode(farm.ClimateDataPostCode));

      if (rainfall === null || rainfall === undefined) {
        return { fieldId, error: "Rainfall not found for this field" };
      }

      const siteClassData = await this.grassService.getData(
        `Grass/SiteClassId/${soilTypeId}/${rainfall}/${altitude}`,
        request,
      );

      return {
        ...siteClassData,
        fieldId,
      };
    } catch (error) {
      return {
        fieldId,
        error: error.message || "Error fetching data",
      };
    }
  }

  async getRainfallByPostcode(postcode) {
    if (!postcode) {
      return null;
    }

    const rainfallResponse = await this.rainfallService.getData(
      `RainFall/RainfallAverage/${postcode}`,
    );

    if (typeof rainfallResponse === "number") {
      return rainfallResponse;
    }

    if (rainfallResponse && typeof rainfallResponse.value === "number") {
      return rainfallResponse.value;
    }

    if (
      rainfallResponse &&
      typeof rainfallResponse.rainfallAverage === "number"
    ) {
      return rainfallResponse.rainfallAverage;
    }

    if (rainfallResponse && typeof rainfallResponse.rainfall === "number") {
      return rainfallResponse.rainfall;
    }

    return null;
  }
}

module.exports = { SiteClassService };
