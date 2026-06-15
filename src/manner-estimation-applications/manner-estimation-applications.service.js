const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");
const {
  MannerEstimationApplicationsEntity,
} = require("../db/entity/manner-estimation-applications.entity");

class MannerEstimationApplicationsService extends BaseService {
  constructor() {
    super(MannerEstimationApplicationsEntity);
    this.repository = AppDataSource.getRepository(
      MannerEstimationApplicationsEntity,
    );
  }

  async createMannerEstimationApplication(payload, userId) {
    const result = this.repository.create({
      ...payload,
      CreatedByID: userId,
      CreatedOn: new Date(),
    });

    return await this.repository.save(result);
  }
}

module.exports = { MannerEstimationApplicationsService };
