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

class MannerEstimationsService extends BaseService {
  constructor() {
    super(MannerEstimationsEntity);
    this.repository = AppDataSource.getRepository(MannerEstimationsEntity);
  }

  async createMannerEstimation(payload, userId) {
    const {
      MannerEstimation,
      MannerEstimationApplication,
      MannerEstimationFinancialValues,
    } = payload;
    const financialValuesPayload = MannerEstimationFinancialValues;

    return AppDataSource.transaction(async (transactionalManager) => {
      // Create & save MannerEstimation
      const mannerEstimation = transactionalManager.create(
        MannerEstimationsEntity,
        {
          ...MannerEstimation,
          CreatedByID: userId,
          CreatedOn: new Date(),
        },
      );

      const savedMannerEstimation = await transactionalManager.save(
        MannerEstimationsEntity,
        mannerEstimation,
      );

      // Create & save MannerEstimationApplication
      const mannerEstimationApplication = transactionalManager.create(
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
        mannerEstimationApplication,
      );

      // Create & save MannerFinancialValues
      const mannerFinancialValues = transactionalManager.create(
        MannerFinancialValuesEntity,
        {
          ...financialValuesPayload,
          MannerEstimationApplicationID: savedMannerEstimationApplication.ID,
          CreatedByID: userId,
          CreatedOn: new Date(),
        },
      );

      const savedMannerFinancialValues = await transactionalManager.save(
        MannerFinancialValuesEntity,
        mannerFinancialValues,
      );

      // Return combined result
      return {
        savedMannerEstimation,
        savedMannerEstimationApplication,
        savedMannerFinancialValues,
      };
    });
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
      mannerEstimation: matchedEstimation,
    };
  }
}

module.exports = { MannerEstimationsService };
