const { AppDataSource } = require("../db/data-source");
const { ScotlandNmaxValueEntity } = require("../db/entity/scotland-nmax-values.entity");
const { BaseService } = require("../base/base.service");

class ScotlandNmaxValueService extends BaseService {
  constructor() {
    super(ScotlandNmaxValueEntity);
    this.repository = AppDataSource.getRepository(ScotlandNmaxValueEntity);
  }
}

module.exports = { ScotlandNmaxValueService };