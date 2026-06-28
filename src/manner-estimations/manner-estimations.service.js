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
    this.nutrientsService = new MannerApiNutrientsService();
    this.nutrientsProductService = new MannerApiNutrientsProductService();
    this.MannerTopSoilsService = new MannerTopSoilsService();
    this.rB209ArableService = new RB209ArableService();
    this.MannerCountriesService = new MannerCountriesService();
  }

  async copyMannerEstimation(payload, userId) {
    const sourceMannerEstimationId = payload?.ID;
    const copiedMannerEstimationName = payload?.Name ?? request?.payload?.Name;

    return AppDataSource.transaction(async (transactionalManager) => {
      const sourceMannerEstimation = await transactionalManager.findOne(
        MannerEstimationsEntity,
        { where: { ID: sourceMannerEstimationId } },
      );

      if (!sourceMannerEstimation) {
        throw new Error("Manner estimation not found");
      }

      if (!copiedMannerEstimationName) {
        throw new Error("Name is required");
      }

      const sourceApplications = await transactionalManager.find(
        MannerEstimationApplicationsEntity,
        {
          where: { MannerEstimationID: sourceMannerEstimationId },
        },
      );

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

      const savedCopiedMannerEstimation = await transactionalManager.save(
        MannerEstimationsEntity,
        copiedMannerEstimationEntity,
      );

      const savedCopiedApplications = [];

      for (const sourceApplication of sourceApplications) {
        const {
          ID,
          MannerEstimationID,
          CreatedOn,
          CreatedByID,
          ModifiedOn,
          ModifiedByID,
          ...applicationDataToCopy
        } = sourceApplication;

        const copiedApplicationEntity = transactionalManager.create(
          MannerEstimationApplicationsEntity,
          {
            ...applicationDataToCopy,
            ID: null,
            MannerEstimationID: savedCopiedMannerEstimation.ID,
            CreatedByID: userId,
            CreatedOn: new Date(),
            ModifiedOn: null,
            ModifiedByID: null,
          },
        );

        savedCopiedApplications.push(
          await transactionalManager.save(
            MannerEstimationApplicationsEntity,
            copiedApplicationEntity,
          ),
        );
      }

      return {
        message: "copied successfully",
        mannerEstimationId: savedCopiedMannerEstimation.ID,
        copiedApplicationsCount: savedCopiedApplications.length,
        savedCopiedApplications
      };
    });

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

    mannerEstimationData.cropTypeName = estimationNames.cropTypeName;
    mannerEstimationData.TopSoil = estimationNames.topSoil;
    mannerEstimationData.SubSoil = estimationNames.subSoil;
    mannerEstimationData.Country = estimationNames.country;
    mannerEstimationData.MannerEstimationApplication =
      mannerEstimationApplicationsWithManureTypeName;
    mannerEstimationData.MannerEstimationApplications =
      mannerEstimationApplicationsWithManureTypeName;

    return {
      MannerEstimation: mannerEstimationData,
      MannerEstimationApplication: mannerEstimationApplicationsWithManureTypeName,
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
    const country = await this.getMannerLookupNameById(
      this.MannerCountriesService,
      "/countries",
      mannerEstimationData.CountryID,
      request,
    );

    return {
      cropTypeName,
      topSoil,
      subSoil,
      country,
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

    for (const application of mannerEstimationApplications) {
      const manureTypeId = Number(application.ManureTypeID);

      if (!manureTypeId || manureTypeNameById.has(manureTypeId)) {
        continue;
      }

      const manureTypeData = await this.MannerManureTypesService.getData(
        `/manure-types/${manureTypeId}`,
        request,
      );

      manureTypeNameById.set(manureTypeId, manureTypeData?.data?.name ?? null);
    }

    return mannerEstimationApplications.map((application) => ({
      ...application,
      ManureTypeName: manureTypeNameById.get(Number(application.ManureTypeID)) ?? null,
    }));
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
