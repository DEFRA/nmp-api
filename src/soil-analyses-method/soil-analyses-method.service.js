const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { SoilAnalysesMethodsEntity } = require("../db/entity/soil-analyses-methods.entity");


class SoilAnalysesMethodService extends BaseService {
  constructor() {
    super(SoilAnalysesMethodsEntity);
    this.repository = AppDataSource.getRepository(SoilAnalysesMethodsEntity);
  }
}

module.exports = { SoilAnalysesMethodService };
