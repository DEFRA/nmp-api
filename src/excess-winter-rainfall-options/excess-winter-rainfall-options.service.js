const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");
const { ExcessWinterRainfallOptionsEntity } = require("../db/entity/excess-winter-rainfall-options");
class ExcessWinterRainFallOptionsService extends BaseService {
  constructor() {
    super(ExcessWinterRainfallOptionsEntity);
    this.repository = AppDataSource.getRepository(
      ExcessWinterRainfallOptionsEntity
    );
  }

}

module.exports = { ExcessWinterRainFallOptionsService };
