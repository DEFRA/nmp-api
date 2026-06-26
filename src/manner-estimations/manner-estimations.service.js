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
    this.MannerManureTypesService = new MannerManureTypesService();
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

    const mannerEstimationApplicationsWithManureTypeName =
      mannerEstimationApplications.map((application) => ({
        ...application,
        ManureTypeName:
          manureTypeNameById.get(Number(application.ManureTypeID)) ?? null,
      }));

    const lastUpdatedOn = this.getLastUpdatedOn(
      mannerEstimationData,
      mannerEstimationApplicationsWithManureTypeName,
    );

    return {
      MannerEstimation: {
        ...mannerEstimationData,
        MannerEstimationApplication: mannerEstimationApplicationsWithManureTypeName,
        MannerEstimationApplications:
          mannerEstimationApplicationsWithManureTypeName,
      },
      LastUpdatedOn: lastUpdatedOn,
    };
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
}

module.exports = { MannerEstimationsService };
