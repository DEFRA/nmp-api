
const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { FarmsNVZEntity } = require("../db/entity/farms-nvz.entity");

class FarmsNVZService extends BaseService {
  constructor() {
    super(FarmsNVZEntity);
        this.repository = AppDataSource.getRepository(FarmsNVZEntity);
  }
}

module.exports = { FarmsNVZService };