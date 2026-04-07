const { AppDataSource } = require("../db/data-source");
const {  ScotlandNMaxValuesEntity } = require("../db/entity/scotland-nmax-values.entity");
const { BaseService } = require("../base/base.service");

class ScotlandNmaxValueService extends BaseService {
  constructor() {
    super(ScotlandNMaxValuesEntity);
    this.repository = AppDataSource.getRepository(ScotlandNMaxValuesEntity);
  }
}

module.exports = { ScotlandNmaxValueService };