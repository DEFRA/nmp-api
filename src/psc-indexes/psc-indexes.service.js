const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { PscIndexesEntity } = require("../db/entity/psc-indexes.entity");


class PscIndexesService extends BaseService {
  constructor() {
    super(PscIndexesEntity);
    this.repository = AppDataSource.getRepository(PscIndexesEntity);
  }
}

module.exports = { PscIndexesService };
