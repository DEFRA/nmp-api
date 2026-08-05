const { AppDataSource } = require("../db/data-source");

const { BaseService } = require("../base/base.service");
const {
  MannerFarmsEntity,
} = require("../db/entity/manner-farms.entity");
class MannerFarmsService extends BaseService {
  constructor() {
     super(MannerFarmsEntity);
      this.repository = AppDataSource.getRepository(MannerFarmsEntity);
  }
  async getByOrganisationId(organisationId) {
    const mannerEstimationData = await this.repository.find({
      where: { OrganisationID: organisationId },
    });
    return mannerEstimationData;
  }

}

module.exports = { MannerFarmsService };