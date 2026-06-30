const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");
const {
  MannerEstimationsEntity,
} = require("../db/entity/manner-estimations.entity");
const {
  MannerEstimationApplicationsEntity,
} = require("../db/entity/manner-estimation-applications.entity");
const MannerApiNutrientsProductService = require("../vendors/manner/nutrient-products/nutrients-product.service");
const MannerApiNutrientsService = require("../vendors/manner/nutrients/nutrients.service");
const MannerManureTypesService = require("../vendors/manner/manure-types/manure-types.service");
const MannerTopSoilsService = require("../vendors/manner/top-soil/top-soil.service");
const RB209ArableService = require("../vendors/rb209/arable/arable.service");
const MannerCountriesService = require("../vendors/manner/countries/countries.service");
const MannerApplicationMethodService = require("../vendors/manner/application-method/application-method.service");
const MannerIncorporationMethodService = require("../vendors/manner/incorporation-method/incorporation-method.service");
const MannerIncorporationDelayService = require("../vendors/manner/incorporation-delay/incorporation-delay.service");
const MannerMoistureTypesService = require("../vendors/manner/moisture-types/moisture-types.service");
const MannerWindspeedService = require("../vendors/manner/windspeed/windspeed.service");
const MannerRainTypesService = require("../vendors/manner/rain-types/rain-types.service");
const { CountryEntity } = require("../db/entity/country.entity");

const NUTRIENT_ID = {
  NITROGEN: 1,
  PHOSPHATE: 2,
  POTASH: 3,
};

class MannerEstimationsService extends BaseService {
  constructor() {
    super(MannerEstimationsEntity);
    this.repository = AppDataSource.getRepository(MannerEstimationsEntity);
    this.mannerEstimationApplicationRepository = AppDataSource.getRepository(
      MannerEstimationApplicationsEntity,
    );
    this.countryRepository = AppDataSource.getRepository(CountryEntity);
    this.nutrientsService = new MannerApiNutrientsService();
    this.nutrientsProductService = new MannerApiNutrientsProductService();
    this.MannerManureTypesService = new MannerManureTypesService();
    this.MannerTopSoilsService = new MannerTopSoilsService();
    this.rB209ArableService = new RB209ArableService();
    this.MannerCountriesService = new MannerCountriesService();
    this.MannerApplicationMethodService = new MannerApplicationMethodService();
    this.MannerIncorporationMethodService =
      new MannerIncorporationMethodService();
    this.MannerIncorporationDelayService =
      new MannerIncorporationDelayService();
    this.MannerMoistureTypesService = new MannerMoistureTypesService();
    this.MannerWindspeedService = new MannerWindspeedService();
    this.MannerRainTypesService = new MannerRainTypesService();
  }

  async copyMannerEstimation(payload, userId) {
    const sourceMannerEstimationId = payload?.ID;
    const copiedMannerEstimationName = payload?.Name;

    this.validateCopyMannerEstimationPayload(
      sourceMannerEstimationId,
      copiedMannerEstimationName,
    );

    return AppDataSource.transaction(async (transactionalManager) => {
      const sourceMannerEstimation = await this.getSourceMannerEstimation(
        transactionalManager,
        sourceMannerEstimationId,
      );

      const savedCopiedMannerEstimation =
        await this.createCopiedMannerEstimation(
          transactionalManager,
          sourceMannerEstimation,
          copiedMannerEstimationName,
          userId,
        );

      const savedCopiedApplications =
        await this.copyMannerEstimationApplications(
          transactionalManager,
          sourceMannerEstimationId,
          savedCopiedMannerEstimation.ID,
          userId,
        );

      return this.buildCopyMannerEstimationResponse(
        savedCopiedMannerEstimation.ID,
        savedCopiedApplications,
      );
    });
  }

  validateCopyMannerEstimationPayload(sourceMannerEstimationId, copiedName) {
    if (!sourceMannerEstimationId) {
      throw new Error("ID is required");
    }

    if (!copiedName) {
      throw new Error("Name is required");
    }
  }

  async getSourceMannerEstimation(
    transactionalManager,
    sourceMannerEstimationId,
  ) {
    const sourceMannerEstimation = await transactionalManager.findOne(
      MannerEstimationsEntity,
      { where: { ID: sourceMannerEstimationId } },
    );

    if (!sourceMannerEstimation) {
      throw new Error("Manner estimation not found");
    }

    return sourceMannerEstimation;
  }

  async createCopiedMannerEstimation(
    transactionalManager,
    sourceMannerEstimation,
    copiedMannerEstimationName,
    userId,
  ) {
    const {
      ID,
      CreatedOn,
      CreatedByID,
      ModifiedOn,
      ModifiedByID,
      ...mannerEstimationDataToCopy
    } = sourceMannerEstimation;

    const copiedMannerEstimationEntity = transactionalManager.create(
      MannerEstimationsEntity,
      {
        ...mannerEstimationDataToCopy,
        ID: null,
        Name: copiedMannerEstimationName,
        CreatedByID: userId,
        CreatedOn: new Date(),
        ModifiedOn: null,
        ModifiedByID: null,
      },
    );

    return transactionalManager.save(
      MannerEstimationsEntity,
      copiedMannerEstimationEntity,
    );
  }

  async copyMannerEstimationApplications(
    transactionalManager,
    sourceMannerEstimationId,
    copiedMannerEstimationId,
    userId,
  ) {
    const sourceApplications = await transactionalManager.find(
      MannerEstimationApplicationsEntity,
      {
        where: { MannerEstimationID: sourceMannerEstimationId },
      },
    );

    const savedCopiedApplications = [];

    for (const sourceApplication of sourceApplications) {
      const copiedApplicationEntity = this.buildCopiedApplicationEntity(
        transactionalManager,
        sourceApplication,
        copiedMannerEstimationId,
        userId,
      );

      savedCopiedApplications.push(
        await transactionalManager.save(
          MannerEstimationApplicationsEntity,
          copiedApplicationEntity,
        ),
      );
    }

    return savedCopiedApplications;
  }

  buildCopiedApplicationEntity(
    transactionalManager,
    sourceApplication,
    copiedMannerEstimationId,
    userId,
  ) {
    const {
      ID,
      MannerEstimationID,
      CreatedOn,
      CreatedByID,
      ModifiedOn,
      ModifiedByID,
      ...applicationDataToCopy
    } = sourceApplication;

    return transactionalManager.create(MannerEstimationApplicationsEntity, {
      ...applicationDataToCopy,
      ID: null,
      MannerEstimationID: copiedMannerEstimationId,
      CreatedByID: userId,
      CreatedOn: new Date(),
      ModifiedOn: null,
      ModifiedByID: null,
    });
  }

  buildCopyMannerEstimationResponse(
    mannerEstimationId,
    savedCopiedApplications,
  ) {
    return {
      message: "copied successfully",
      mannerEstimationId,
      copiedApplicationsCount: savedCopiedApplications.length,
      savedCopiedApplications,
    };
  }

  async createMannerEstimation(payload, userId, request) {
    const { MannerEstimation, MannerEstimationApplication } = payload;

    return AppDataSource.transaction(async (transactionalManager) => {
      const nutrientProductsData = await this.nutrientsProductService.getData(
        "/nutrient-products",
        request,
      );
      const nutrientProducts = nutrientProductsData.data.filter(
        (p) => p.isNutrientDefaultProduct === true,
      );
      const nutrients = await this.nutrientsService.getData(
        "/nutrients",
        request,
      );

      const nutrientFinancialValues =
        this.calculateNutrientFinancialValuesByNutrientId(
          nutrientProducts,
          nutrients,
          MannerEstimationApplication,
        );
      const mannerEstimationFinancialValues =
        this.buildMannerEstimationFinancialValues(nutrientFinancialValues);

      const mannerEstimationApplicationFinancialValues =
        this.buildMannerEstimationApplicationFinancialValues(
          nutrientFinancialValues,
        );

      const mannerEstimationEntity = transactionalManager.create(
        MannerEstimationsEntity,
        {
          ...MannerEstimation,
          ...mannerEstimationFinancialValues,
          CreatedByID: userId,
          CreatedOn: new Date(),
        },
      );

      const savedMannerEstimation = await transactionalManager.save(
        MannerEstimationsEntity,
        mannerEstimationEntity,
      );

      const mannerEstimationApplicationEntity = transactionalManager.create(
        MannerEstimationApplicationsEntity,
        {
          ...MannerEstimationApplication,
          ...mannerEstimationApplicationFinancialValues,
          MannerEstimationID: savedMannerEstimation.ID,
          CreatedByID: userId,
          CreatedOn: new Date(),
        },
      );

      const savedMannerEstimationApplication = await transactionalManager.save(
        MannerEstimationApplicationsEntity,
        mannerEstimationApplicationEntity,
      );

      return savedMannerEstimationApplication;
    });
  }

  calculateNutrientFinancialValuesByNutrientId(
    nutrientProducts,
    nutrients,
    mannerEstimationApplication,
  ) {
    const nutrientFinancialValuesByNutrientId = {};

    for (const product of nutrientProducts) {
      const nutrient = nutrients.data.find((n) => n.id === product.nutrientID);

      if (!nutrient) {
        continue;
      }

      const nutrientPercentage = product.nutrientPercentage;
      const cal1 = nutrientPercentage / 100;
      const cal2 = cal1 * 1000;
      const nutrientPrice = Math.round(cal2 * nutrient.unitRate);

      let totalNutrientValue = 0;

      switch (nutrient.id) {
        case NUTRIENT_ID.NITROGEN:
          totalNutrientValue =
            mannerEstimationApplication.CropAvailableNCurrentCrop +
            mannerEstimationApplication.CropAvailableNitrogenFollowingCropYearTwo;
          break;

        case NUTRIENT_ID.PHOSPHATE:
          totalNutrientValue = mannerEstimationApplication.TotalP2O5;
          break;

        case NUTRIENT_ID.POTASH:
          totalNutrientValue = mannerEstimationApplication.TotalK2O;
          break;
        default:
          break;
      }

      nutrientFinancialValuesByNutrientId[nutrient.id] = {
        nutrientValue: Math.round(totalNutrientValue * nutrient.unitRate),
        productId: product.id,
        productName: product.name,
        productPrice: nutrientPrice,
        price: Math.round(nutrient.unitRate * 100),
      };
    }

    return nutrientFinancialValuesByNutrientId;
  }

  buildMannerEstimationFinancialValues(nutrientFinancialValuesByNutrientId) {
    const mannerEstimationValues = {};

    const nitrogenValues =
      nutrientFinancialValuesByNutrientId[NUTRIENT_ID.NITROGEN];
    const phosphateValues =
      nutrientFinancialValuesByNutrientId[NUTRIENT_ID.PHOSPHATE];
    const potashValues =
      nutrientFinancialValuesByNutrientId[NUTRIENT_ID.POTASH];

    if (nitrogenValues) {
      mannerEstimationValues.NitrogenProductId = nitrogenValues.productId;
      mannerEstimationValues.NitrogenProductName = nitrogenValues.productName;
      mannerEstimationValues.NitrogenProductPrice = nitrogenValues.productPrice;
      mannerEstimationValues.NitrogenPrice = nitrogenValues.price;
    }

    if (phosphateValues) {
      mannerEstimationValues.PhosphateProductId = phosphateValues.productId;
      mannerEstimationValues.PhosphateProductName = phosphateValues.productName;
      mannerEstimationValues.PhosphateProductPrice =
        phosphateValues.productPrice;
      mannerEstimationValues.PhosphatePrice = phosphateValues.price;
    }

    if (potashValues) {
      mannerEstimationValues.PotashProductId = potashValues.productId;
      mannerEstimationValues.PotashProductName = potashValues.productName;
      mannerEstimationValues.PotashProductPrice = potashValues.productPrice;
      mannerEstimationValues.PotashPrice = potashValues.price;
    }

    return mannerEstimationValues;
  }

  buildMannerEstimationApplicationFinancialValues(
    nutrientFinancialValuesByNutrientId,
  ) {
    const mannerEstimationApplicationValues = {};

    const nitrogenValues =
      nutrientFinancialValuesByNutrientId[NUTRIENT_ID.NITROGEN];
    const phosphateValues =
      nutrientFinancialValuesByNutrientId[NUTRIENT_ID.PHOSPHATE];
    const potashValues =
      nutrientFinancialValuesByNutrientId[NUTRIENT_ID.POTASH];

    if (nitrogenValues) {
      mannerEstimationApplicationValues.NitrogenValue =
        nitrogenValues.nutrientValue;
    }

    if (phosphateValues) {
      mannerEstimationApplicationValues.PhosphateValue =
        phosphateValues.nutrientValue;
    }

    if (potashValues) {
      mannerEstimationApplicationValues.PotashValue =
        potashValues.nutrientValue;
    }

    return mannerEstimationApplicationValues;
  }

  async checkMannerEstimationExists(organisationId, name) {
    const matchedEstimation = await this.repository.findOne({
      where: {
        OrganisationID: organisationId,
        Name: name,
      },
      select: {
        ID: true,
        Name: true,
        OrganisationID: true,
      },
    });

    return {
      exists: Boolean(matchedEstimation),
    };
  }

  async getByOrganisationId(organisationId) {
    const mannerEstimationData = await this.repository.find({
      where: { OrganisationID: organisationId },
    });

    return mannerEstimationData;
  }

  async getMannerEstimationRelatedDataById(id, request) {
    const mannerEstimationData = await this.repository.findOne({
      where: {
        ID: id,
      },
    });

    if (!mannerEstimationData) {
      return null;
    }

    const estimationNames = await this.getMannerEstimationDisplayNames(
      mannerEstimationData,
      request,
    );

    const mannerEstimationApplicationsWithManureTypeName =
      await this.getMannerEstimationApplicationsWithManureTypeName(id, request);

    const lastUpdatedOn = this.getLastUpdatedOn(
      mannerEstimationData,
      mannerEstimationApplicationsWithManureTypeName,
    );

    mannerEstimationData.CropTypeName = estimationNames.cropTypeName;
    mannerEstimationData.TopSoil = estimationNames.topSoil;
    mannerEstimationData.SubSoil = estimationNames.subSoil;
    mannerEstimationData.Country = estimationNames.countryName;
    return {
      MannerEstimation: mannerEstimationData,
      MannerEstimationApplication:
        mannerEstimationApplicationsWithManureTypeName,
      LastUpdatedOn: lastUpdatedOn,
    };
  }

  async getMannerEstimationDisplayNames(mannerEstimationData, request) {
    const cropTypeName = await this.getCropTypeNameById(
      mannerEstimationData.CropTypeID,
    );
    const topSoil = await this.getMannerLookupNameById(
      this.MannerTopSoilsService,
      "/top-soils",
      mannerEstimationData.TopSoilID,
      request,
    );
    const subSoil = await this.getMannerLookupNameById(
      this.MannerTopSoilsService,
      "/sub-soils",
      mannerEstimationData.SubSoilID,
      request,
    );

    const countries = await this.countryRepository.findOne({
      where: {
        ID: mannerEstimationData.CountryID,
      },
    });
    const countryName = countries ? countries.Name : null;

    return {
      cropTypeName,
      topSoil,
      subSoil,
      countryName,
    };
  }

  async getCropTypeNameById(cropTypeIdValue) {
    const cropTypeId = this.toNumericId(cropTypeIdValue);

    if (cropTypeId === null) {
      return null;
    }

    const cropTypeData = await this.rB209ArableService.getData(
      `/Arable/CropType/${cropTypeId}`,
    );

    return cropTypeData?.cropTypeName ?? null;
  }

  async getMannerLookupNameById(service, endpoint, idValue, request) {
    const id = this.toNumericId(idValue);

    if (id === null) {
      return null;
    }

    const lookupData = await service.getData(`${endpoint}/${id}`, request);
    return lookupData?.data?.name ?? null;
  }

  async getMannerEstimationApplicationsWithManureTypeName(id, request) {
    const mannerEstimationApplications =
      await this.mannerEstimationApplicationRepository.find({
        where: {
          MannerEstimationID: id,
        },
        order: {
          ID: "ASC",
        },
      });

    const manureTypeNameById = new Map();
    const applicationMethodNameById = new Map();
    const incorporationMethodNameById = new Map();
    const incorporationDelayNameById = new Map();
    const moistureTypeNameById = new Map();
    const windspeedNameById = new Map();
    const rainTypeNameById = new Map();

    for (const application of mannerEstimationApplications) {
      await this.setLookupNameInCache(
        manureTypeNameById,
        application.ManureTypeID,
        this.MannerManureTypesService,
        "/manure-types",
        request,
      );
      await this.setLookupNameInCache(
        applicationMethodNameById,
        application.ApplicationMethodID,
        this.MannerApplicationMethodService,
        "/application-methods",
        request,
      );
      await this.setLookupNameInCache(
        incorporationMethodNameById,
        application.IncorporationMethodID,
        this.MannerIncorporationMethodService,
        "/incorporation-methods",
        request,
      );
      await this.setLookupNameInCache(
        incorporationDelayNameById,
        application.IncorporationDelayID,
        this.MannerIncorporationDelayService,
        "/incorporation-delays",
        request,
      );
      await this.setLookupNameInCache(
        moistureTypeNameById,
        application.MoistureID,
        this.MannerMoistureTypesService,
        "/moisture-types",
        request,
      );
      await this.setLookupNameInCache(
        windspeedNameById,
        application.WindspeedID,
        this.MannerWindspeedService,
        "/windspeeds",
        request,
      );
      await this.setLookupNameInCache(
        rainTypeNameById,
        application.RainfallWithinSixHoursID,
        this.MannerRainTypesService,
        "/rain-types",
        request,
      );
    }

    return mannerEstimationApplications.map((application) => ({
      ...application,
      ManureTypeName:
        manureTypeNameById.get(Number(application.ManureTypeID)) ?? null,
      ApplicationMethodName:
        applicationMethodNameById.get(
          Number(application.ApplicationMethodID),
        ) ?? null,
      IncorporationMethodName:
        incorporationMethodNameById.get(
          Number(application.IncorporationMethodID),
        ) ?? null,
      IncorporationDelayName:
        incorporationDelayNameById.get(
          Number(application.IncorporationDelayID),
        ) ?? null,
      MoistureTypeName:
        moistureTypeNameById.get(Number(application.MoistureID)) ?? null,
      WindspeedName:
        windspeedNameById.get(Number(application.WindspeedID)) ?? null,
      RainTypeName:
        rainTypeNameById.get(Number(application.RainfallWithinSixHoursID)) ??
        null,
    }));
  }

  async setLookupNameInCache(cache, idValue, service, endpoint, request) {
    const id = this.toNumericId(idValue);

    if (id === null || cache.has(id)) {
      return;
    }

    const lookupData = await service.getData(`${endpoint}/${id}`, request);
    cache.set(id, lookupData?.data?.name ?? null);
  }

  getLastUpdatedOn(mannerEstimationData, mannerEstimationApplications) {
    const timestampCandidates = [
      mannerEstimationData.ModifiedOn,
      mannerEstimationData.CreatedOn,
      ...mannerEstimationApplications.flatMap((application) => [
        application.ModifiedOn,
        application.CreatedOn,
      ]),
    ]
      .filter(Boolean)
      .map((value) => new Date(value).getTime())
      .filter((value) => !Number.isNaN(value));

    if (timestampCandidates.length === 0) {
      return null;
    }

    return new Date(Math.max(...timestampCandidates));
  }

  toNumericId(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsedValue = Number(value);
      return Number.isFinite(parsedValue) ? parsedValue : null;
    }

    if (value && typeof value === "object") {
      if (typeof value.id === "number") {
        return value.id;
      }

      if (typeof value.ID === "number") {
        return value.ID;
      }
    }

    return null;
  }
}

module.exports = { MannerEstimationsService };
