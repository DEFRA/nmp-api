const { AppDataSource } = require("../db/data-source");

const { BaseService } = require("../base/base.service");
const { GrassManagementOptionsEntity } = require("../db/entity/grassManagementOptionsEntity");
const { GrassTypicalCutsEntity } = require("../db/entity/grassTypicalCutsEntity");


class GrassManagementOptionsService extends BaseService {
  constructor() {
    super(GrassManagementOptionsEntity);
    this.repository = AppDataSource.getRepository(GrassManagementOptionsEntity);
    this.grassTypicalCutsRepository = AppDataSource.getRepository(
      GrassTypicalCutsEntity
    );
  }

  async getAllgrassTypicalCuts() {
    try {
      return await this.grassTypicalCutsRepository.find();
    } catch (error) {
      console.error("Error fetching grass typical cuts:", error);
      throw new Error("Failed to fetch grass typical cuts");
    }
  }
}

module.exports = { GrassManagementOptionsService };
