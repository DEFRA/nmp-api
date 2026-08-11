const { AppDataSource } = require("../db/data-source");

const { BaseService } = require("../base/base.service");
const { MannerFarmsEntity } = require("../db/entity/manner-farms.entity");
const {
  MannerEstimationsEntity,
} = require("../db/entity/manner-estimations.entity");
const {
  MannerEstimationApplicationsEntity,
} = require("../db/entity/manner-estimation-applications.entity");
const {
  MannerEstimationsService,
} = require("../manner-estimations/manner-estimations.service");
class MannerFarmsService extends BaseService {
  constructor() {
    super(MannerFarmsEntity);
    this.repository = AppDataSource.getRepository(MannerFarmsEntity);
    this.mannerEstimationsService = new MannerEstimationsService();
  }

  async createWithMannerEstimation(payload, userId, request) {
    const { MannerFarm, MannerEstimation, MannerEstimationApplication } =
      payload;

    return AppDataSource.transaction(async (transactionalManager) => {
      const mannerFarmEntity = transactionalManager.create(MannerFarmsEntity, {
        ...MannerFarm,
        CreatedByID: userId,
        CreatedOn: new Date(),
      });

      const savedMannerFarm = await transactionalManager.save(
        MannerFarmsEntity,
        mannerFarmEntity,
      );

      const mappedMannerEstimation = {
        ...MannerEstimation,
        MannerFarmID: savedMannerFarm.ID,
      };

      const nutrientProductsData =
        await this.mannerEstimationsService.nutrientsProductService.getData(
          "/nutrient-products",
          request,
        );

      const nutrientProducts = nutrientProductsData.data.filter(
        (product) => product.isNutrientDefaultProduct === true,
      );

      const nutrients =
        await this.mannerEstimationsService.nutrientsService.getData(
          "/nutrients",
          request,
        );

      const mappedMannerEstimationApplication =
        await this.mannerEstimationsService.getMappedMannerEstimationApplication(
          savedMannerFarm,
          mappedMannerEstimation,
          MannerEstimationApplication,
          request,
        );

      const nutrientFinancialValues =
        this.mannerEstimationsService.calculateNutrientFinancialValuesByNutrientId(
          nutrientProducts,
          nutrients,
          mappedMannerEstimationApplication,
        );

      const mannerEstimationFinancialValues =
        this.mannerEstimationsService.buildMannerEstimationFinancialValues(
          nutrientFinancialValues,
        );

      const mannerEstimationApplicationFinancialValues = this.mannerEstimationsService.buildMannerEstimationApplicationFinancialValues(nutrientFinancialValues,);

      const mannerEstimationEntity = transactionalManager.create(
        MannerEstimationsEntity,
        {
          ...mappedMannerEstimation,
          ...mannerEstimationFinancialValues, CreatedByID: userId, CreatedOn: new Date(),
        },
      );

      const savedMannerEstimation = await transactionalManager.save(MannerEstimationsEntity, mannerEstimationEntity,);

      const mannerEstimationApplicationEntity = transactionalManager.create(
        MannerEstimationApplicationsEntity,
        {
          ...mappedMannerEstimationApplication,
          ...mannerEstimationApplicationFinancialValues, MannerEstimationID: savedMannerEstimation.ID, CreatedByID: userId, CreatedOn: new Date(),
        },
      );

      const savedMannerEstimationApplication = await transactionalManager.save(MannerEstimationApplicationsEntity, mannerEstimationApplicationEntity,);

      return {
        MannerFarm: savedMannerFarm, MannerEstimation: savedMannerEstimation, MannerEstimationApplication: savedMannerEstimationApplication,
      };
    });
  }

  async getByOrganisationId(organisationId) {
    const mannerEstimationData = await this.repository.find({
      where: { OrganisationID: organisationId },
    });
    return mannerEstimationData;
  }
}

module.exports = { MannerFarmsService };
