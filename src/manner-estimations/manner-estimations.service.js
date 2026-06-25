const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");
const {
  MannerEstimationsEntity,
} = require("../db/entity/manner-estimations.entity");
const {
  MannerEstimationApplicationsEntity,
} = require("../db/entity/manner-estimation-applications.entity");
const {
  MannerFinancialValuesEntity,
} = require("../db/entity/manner-financial-values.entity");
const MannerApiNutrientsProductService = require("../vendors/manner/nutrient-products/nutrients-product.service");
const MannerApiNutrientsService = require("../vendors/manner/nutrients/nutrients.service");
const NUTRIENT_ID = {
  NITROGEN: 1,
  PHOSPHATE: 2,
  POTASH: 3,
};
class MannerEstimationsService extends BaseService {
  constructor() {
    super(MannerEstimationsEntity);
    this.repository = AppDataSource.getRepository(MannerEstimationsEntity);
    this.nutrientsService = new MannerApiNutrientsService();
    this.nutrientsProductService = new MannerApiNutrientsProductService();
  }

  async copyMannerEstimation(payload, userId, request) {
    const { ID, Name } = payload;

    return AppDataSource.transaction(async (transactionalManager) => {
      const sourceMannerEstimation = await transactionalManager.findOne(
        MannerEstimationsEntity,
        { where: { ID } },
      );

      if (!sourceMannerEstimation) {
        throw new Error("Manner estimation not found");
      }

      const sourceApplications = await transactionalManager.find(
        MannerEstimationApplicationsEntity,
        {
          where: { MannerEstimationID: ID },
        },
      );

      const {
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
          Name,
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

      const nutrientProductsData = await this.nutrientsProductService.getData(
        "/nutrient-products",
        request,
      );
      const nutrientProducts = nutrientProductsData.data.filter(
        (product) => product.isNutrientDefaultProduct === true,
      );
      const nutrients = await this.nutrientsService.getData(
        "/nutrients",
        request,
      );

      for (const sourceApplication of sourceApplications) {
        const {
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
            MannerEstimationID: savedCopiedMannerEstimation.ID,
            CreatedByID: userId,
            CreatedOn: new Date(),
            ModifiedOn: null,
            ModifiedByID: null,
          },
        );

        const savedCopiedApplication = await transactionalManager.save(
          MannerEstimationApplicationsEntity,
          copiedApplicationEntity,
        );

        const mannerEstimationFinancialValues =
          await this.buildMannerEstimationFinancialValues(
            nutrientProducts,
            nutrients,
            savedCopiedApplication,
          );

        const copiedFinancialEntity = transactionalManager.create(
          MannerFinancialValuesEntity,
          {
            ...mannerEstimationFinancialValues,
            MannerEstimationApplicationID: savedCopiedApplication.ID,
            CreatedByID: userId,
            CreatedOn: new Date(),
            ModifiedOn: null,
            ModifiedByID: null,
          },
        );

        await transactionalManager.save(
          MannerFinancialValuesEntity,
          copiedFinancialEntity,
        );
      }

      return {
        message: "copied successfully",
        mannerEstimationId: savedCopiedMannerEstimation.ID,
      };
    });
  }

  async createMannerEstimation(payload, userId, request) {
    const { MannerEstimation, MannerEstimationApplication } = payload;

    return AppDataSource.transaction(async (transactionalManager) => {
      // Create & save MannerEstimation
      const mannerEstimationEntity = transactionalManager.create(
        MannerEstimationsEntity,
        {
          ...MannerEstimation,
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
          MannerEstimationID: savedMannerEstimation.ID,
          CreatedByID: userId,
          CreatedOn: new Date(),
        },
      );

      const savedMannerEstimationApplication = await transactionalManager.save(
        MannerEstimationApplicationsEntity,
        mannerEstimationApplicationEntity,
      );
      //financial data saving
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
      const MannerEstimationFinancialValues =
        await this.buildMannerEstimationFinancialValues(
          nutrientProducts,
          nutrients,
          savedMannerEstimationApplication,
        );

      const mannerEstimationFinancialEntity = transactionalManager.create(
        MannerFinancialValuesEntity,
        {
          ...MannerEstimationFinancialValues,
          MannerEstimationApplicationID: savedMannerEstimationApplication.ID,
          CreatedByID: userId,
          CreatedOn: new Date(),
        },
      );

      await transactionalManager.save(
        MannerFinancialValuesEntity,
        mannerEstimationFinancialEntity,
      );

      return "saved successfully";
    });
  }

  async buildMannerEstimationFinancialValues(
    nutrientProducts,
    nutrients,
    savedMannerEstimationApplication,
  ) {
    const MannerEstimationFinancialValues = {};

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
            savedMannerEstimationApplication.CropAvailableNCurrentCrop +
            savedMannerEstimationApplication.CropAvailableNitrogenFollowingCropYearTwo;
          break;

        case NUTRIENT_ID.PHOSPHATE:
          totalNutrientValue = savedMannerEstimationApplication.TotalP2O5;
          break;

        case NUTRIENT_ID.POTASH:
          totalNutrientValue = savedMannerEstimationApplication.TotalK2O;
          break;
        default:
          break;
      }

      const nutrientValue = Math.round(totalNutrientValue * nutrient.unitRate);

      switch (nutrient.id) {
        case NUTRIENT_ID.NITROGEN:
          MannerEstimationFinancialValues.NitrogenValue = nutrientValue;
          MannerEstimationFinancialValues.NitrogenProductId = product.id;
          MannerEstimationFinancialValues.NitrogenProductName = product.name;
          MannerEstimationFinancialValues.NitrogenProductPrice = nutrientPrice;
          MannerEstimationFinancialValues.NitrogenPrice = Math.round(
            nutrient.unitRate * 100,
          );
          break;

        case NUTRIENT_ID.PHOSPHATE:
          MannerEstimationFinancialValues.PhosphateValue = nutrientValue;
          MannerEstimationFinancialValues.PhosphateProductId = product.id;
          MannerEstimationFinancialValues.PhosphateProductName = product.name;
          MannerEstimationFinancialValues.PhosphateProductPrice = nutrientPrice;
          MannerEstimationFinancialValues.PhosphatePrice = Math.round(
            nutrient.unitRate * 100,
          );
          break;

        case NUTRIENT_ID.POTASH:
          MannerEstimationFinancialValues.PotashValue = nutrientValue;
          MannerEstimationFinancialValues.PotashProductId = product.id;
          MannerEstimationFinancialValues.PotashProductName = product.name;
          MannerEstimationFinancialValues.PotashProductPrice = nutrientPrice;
          MannerEstimationFinancialValues.PotashPrice = Math.round(
            nutrient.unitRate * 100,
          );
          break;
        default:
          break;
      }
    }

    return MannerEstimationFinancialValues;
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
}

module.exports = { MannerEstimationsService };
