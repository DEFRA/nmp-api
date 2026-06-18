const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");
const {
  MannerEstimationsEntity,
} = require("../db/entity/manner-estimations.entity");
const { MannerEstimationApplicationsEntity } = require("../db/entity/manner-estimation-applications.entity");

class MannerEstimationsService extends BaseService {
  constructor() {
    super(MannerEstimationsEntity);
    this.repository = AppDataSource.getRepository(MannerEstimationsEntity);
  }

  async createMannerEstimation(payload, userId) {
    const { MannerEstimation, MannerEstimationApplication } = payload;

    return AppDataSource.transaction(async (transactionalManager) => {
        // Create & save MannerEstimation
        const mannerEstimation = transactionalManager.create(
        MannerEstimationsEntity,
          {
            ...MannerEstimation,
            CreatedByID: userId,
            CreatedOn: new Date()
          }
        );

        const savedMannerEstimation =
          await transactionalManager.save(MannerEstimationsEntity,mannerEstimation);

        // Create & save MannerEstimationApplication
        const mannerEstimationApplication = transactionalManager.create(
          MannerEstimationApplicationsEntity,
          {
            ...MannerEstimationApplication,
            MannerEstimationID: savedMannerEstimation.ID,
            CreatedByID: userId,
            CreatedOn: new Date()
          }
        );

        const savedMannerEstimationApplication =
          await transactionalManager.save(MannerEstimationApplicationsEntity,mannerEstimationApplication);

        // Return combined result
        return {
          savedMannerEstimation,
          savedMannerEstimationApplication
        };
      }
    );
  }
}



module.exports = { MannerEstimationsService };
