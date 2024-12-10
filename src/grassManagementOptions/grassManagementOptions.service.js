const { AppDataSource } = require("../db/data-source");

const { BaseService } = require("../base/base.service");
const { GrassManagementOptionsEntity } = require("../db/entity/grassManagementOptionsEntity");


class GrassManagementOptionsService extends BaseService {
  constructor() {
    super(GrassManagementOptionsEntity);
    this.repository = AppDataSource.getRepository(GrassManagementOptionsEntity);
  }
}

module.exports = { GrassManagementOptionsService };
