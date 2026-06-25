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
// const MannerApiNutrientsProductService = require("../vendors/manner/nutrient-products/nutrients-product.service");

//const MannerApiNutrientsProductController = require("../vendors/manner/nutrient-products/nutrients-product.controller");
const MannerApiNutrientsProductService = require("../vendors/manner/nutrient-products/nutrients-product.service");
const MannerApiNutrientsService = require("../vendors/manner/nutrients/nutrients.service");

class MannerEstimationsService extends BaseService {
  constructor() {
    super(MannerEstimationsEntity);
    this.repository = AppDataSource.getRepository(MannerEstimationsEntity);
    this.nutrientsService = new MannerApiNutrientsService();
    this.nutrientsProductService =
      new MannerApiNutrientsProductService();

  }

  async createMannerEstimation(payload, userId, request) {
    const {
      MannerEstimation,
      MannerEstimationApplication
    } = payload;


    return AppDataSource.transaction(async (transactionalManager) => {
      // Create & save MannerEstimation
      const mannerEstimationEntity = transactionalManager.create(
        MannerEstimationsEntity,
        {
          ...MannerEstimation,
          CreatedByID: userId,
          CreatedOn: new Date(),
        }
      );

      const savedMannerEstimation = await transactionalManager.save(
        MannerEstimationsEntity,
        mannerEstimationEntity
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
        mannerEstimationApplicationEntity
      );
      //financial data saving
      const nutrientProductsData = await this.nutrientsProductService.getData("/nutrient-products", request);
      const nutrientProducts = nutrientProductsData.data.filter(p => p.isNutrientDefaultProduct === true);
      const nutrients = await this.nutrientsService.getData("/nutrients", request);
      const MannerEstimationFinancialValues =await this.buildMannerEstimationFinancialValues(
        nutrientProducts,
        nutrients,
        savedMannerEstimationApplication
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

      const savedMannerEstimationFinancial = await transactionalManager.save(
        MannerFinancialValuesEntity,
         mannerEstimationFinancialEntity

      );




      return "saved successfully";
    });
  }

  async buildMannerEstimationFinancialValues(
    nutrientProducts,
    nutrients,
    savedMannerEstimationApplication
  ) {
    const MannerEstimationFinancialValues = { };

    for (const product of nutrientProducts) {
      const nutrient = nutrients.data.find(
        n => n.id === product.nutrientID
      );

      if (!nutrient) continue;

      const nutrientPercentage = product.nutrientPercentage;
      const cal1 = nutrientPercentage / 100;
      const cal2 = cal1 * 1000;
      const nutrientPrice = Math.round(cal2 * nutrient.unitRate);

      let totalNutrientValue = 0;

      switch (nutrient.id) {
        case 1:
          totalNutrientValue =
            savedMannerEstimationApplication.CropAvailableNCurrentCrop +
            savedMannerEstimationApplication.CropAvailableNitrogenFollowingCropYearTwo;
          break;

        case 2:
          totalNutrientValue =
            savedMannerEstimationApplication.TotalP2O5;
          break;

        case 3:
          totalNutrientValue =
            savedMannerEstimationApplication.TotalK2O;
          break;
      }

      const nutrientValue = Math.round(
        totalNutrientValue * nutrient.unitRate
      );

      switch (nutrient.id) {
        case 1:
          MannerEstimationFinancialValues.NitrogenValue = nutrientValue;
          MannerEstimationFinancialValues.NitrogenProductId = product.id;
          MannerEstimationFinancialValues.NitrogenProductName = product.name;
          MannerEstimationFinancialValues.NitrogenProductPrice = nutrientPrice;
          MannerEstimationFinancialValues.NitrogenPrice = nutrient.unitRate * 100;
          break;

        case 2:
          MannerEstimationFinancialValues.PhosphateValue = nutrientValue;
          MannerEstimationFinancialValues.PhosphateProductId = product.id;
          MannerEstimationFinancialValues.PhosphateProductName = product.name;
          MannerEstimationFinancialValues.PhosphateProductPrice = nutrientPrice;
          MannerEstimationFinancialValues.PhosphatePrice = nutrient.unitRate * 100;
          break;

        case 3:
          MannerEstimationFinancialValues.PotashValue = nutrientValue;
          MannerEstimationFinancialValues.PotashProductId = product.id;
          MannerEstimationFinancialValues.PotashProductName = product.name;
          MannerEstimationFinancialValues.PotashProductPrice = nutrientPrice;
          MannerEstimationFinancialValues.PotashPrice = nutrient.unitRate * 100;
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
      where: { OrganisationID: organisationId }
    });

    return mannerEstimationData;
  }
}

module.exports = { MannerEstimationsService };
