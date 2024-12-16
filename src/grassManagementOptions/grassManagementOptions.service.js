const { AppDataSource } = require("../db/data-source");

const { BaseService } = require("../base/base.service");
const { GrassManagementOptionsEntity } = require("../db/entity/grassManagementOptionsEntity");
const { GrassTypicalCutsEntity } = require("../db/entity/grassTypicalCutsEntity");
const { SoilNitrogenSupplyItemsEntity } = require("../db/entity/soil-nitrogen-supply-items.entity");


class GrassManagementOptionsService extends BaseService {
  constructor() {
    super(GrassManagementOptionsEntity);
    this.repository = AppDataSource.getRepository(GrassManagementOptionsEntity);
    this.grassTypicalCutsRepository = AppDataSource.getRepository(
      GrassTypicalCutsEntity
    );
    this.soilNitrogenSupplyRepository = AppDataSource.getRepository(
      SoilNitrogenSupplyItemsEntity
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
  async getAllSoilNitrogenSupplyItems() {
    try {
      return await this.soilNitrogenSupplyRepository.find();
    } catch (error) {
      console.error("Error fetching grass typical cuts:", error);
      throw new Error("Failed to fetch grass typical cuts");
    }
  }
}

module.exports = { GrassManagementOptionsService };
