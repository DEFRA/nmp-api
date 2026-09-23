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

    const field = await this.getFieldById(fieldId, transactionalManager);
    if (!field) {
      return { fieldId, error: "Field not found" };
    }

    const farm = await this.getFarmByField(field, transactionalManager);
    if (!farm) {
      return { fieldId, error: "Farm not found for this field" };
    }

    const soilTypeId = this.getSoilTypeId(field, fieldRelatedData);
    if (soilTypeId === null) {
      return { fieldId, error: "Soil type not found for this field" };
    }

    const altitude = this.getAltitude(field, farm, fieldRelatedData);
    const rainfall = await this.getRainfall(farm, fieldRelatedData);

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

  }

  async getFieldById(fieldId, transactionalManager) {
    return transactionalManager.findOne(FieldEntity, {
      where: { ID: fieldId },
    });
  }

  async getFarmByField(field, transactionalManager) {
    return transactionalManager.findOne(FarmEntity, {
      where: { ID: field.FarmID },
    });
  }

  getSoilTypeId(field, fieldRelatedData) {
    return fieldRelatedData?.soilTypeId ?? field.SoilTypeID;
  }

  getAltitude(field, farm, fieldRelatedData) {
    return (
      fieldRelatedData?.altitude ??
      farm.AverageAltitude ??
      (field.IsAbove300SeaLevel
        ? FieldAboveOrBelowSeaLevelMapper.ABOVETHREEHUNDRED
        : FieldAboveOrBelowSeaLevelMapper.BELOWTHREEHUNDRED)
    );
  }

  async getRainfall(farm, fieldRelatedData) {
    return (
      fieldRelatedData?.rainfall ??
      farm.Rainfall ??
      (this.getRainfallByPostcode(farm.ClimateDataPostCode))
    );
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
