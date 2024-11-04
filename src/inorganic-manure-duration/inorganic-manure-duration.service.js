const { AppDataSource } = require("../db/data-source");
const {
  InOrganicManureDurationEntity,
} = require("../db/entity/inorganic-manure-duration.entity");
const { BaseService } = require("../base/base.service");

class InorganicManureDurationService extends BaseService {
  constructor() {
    super(InOrganicManureDurationEntity);
    this.repository = AppDataSource.getRepository(
      InOrganicManureDurationEntity
    );
  }

  async getInorganicManureDurations() {
    const inorganicManureDurations = await this.repository.find();
    return inorganicManureDurations.map((data) => ({
      ID: data.ID,
      Name: data.Name,
    }));
  }
}

module.exports = { InorganicManureDurationService };
