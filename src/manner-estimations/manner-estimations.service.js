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
      MannerEstimationApplication
    } = payload;


    return AppDataSource.transaction(async (transactionalManager) => {
      // Create & save MannerEstimation
       transactionalManager.create(
        MannerEstimationsEntity,
        {
          ...MannerEstimation,
          CreatedByID: userId,
          CreatedOn: new Date(),
        },
      );

      await transactionalManager.save(
        MannerEstimationsEntity,
        mannerEstimation
      );

       transactionalManager.create(
        MannerEstimationApplicationsEntity,
        {
          ...MannerEstimationApplication,
          MannerEstimationID: savedMannerEstimation.ID,
          CreatedByID: userId,
          CreatedOn: new Date(),
        },
      );

       await transactionalManager.save(
        MannerEstimationApplicationsEntity,
        mannerEstimationApplication
      );


      return "saved successfully";
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
