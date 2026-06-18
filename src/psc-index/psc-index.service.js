const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { PscIndexEntity } = require("../db/entity/psc-index.entity");

class PscIndexService extends BaseService {
  constructor() {
    super(PscIndexEntity);
    this.repository = AppDataSource.getRepository(PscIndexEntity);
  }
}

module.exports = { PscIndexService };
