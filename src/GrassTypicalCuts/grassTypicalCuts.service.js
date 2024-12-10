const { AppDataSource } = require("../db/data-source");

const { BaseService } = require("../base/base.service");
const { GrassTypicalCutsEntity } = require("../db/entity/grassTypicalCutsEntity");


class GrassTypicalCutsService extends BaseService {
  constructor() {
    super(GrassTypicalCutsEntity);
    this.repository = AppDataSource.getRepository(GrassTypicalCutsEntity);
  }
}

module.exports = { GrassTypicalCutsService };
