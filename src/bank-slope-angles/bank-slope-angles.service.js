const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { BankSlopeAnglesEntity } = require("../db/entity/bank-slope-angles-entity");


class BankSlopeAnglesService extends BaseService {
  constructor() {
    super(BankSlopeAnglesEntity);
    this.repository = AppDataSource.getRepository(BankSlopeAnglesEntity);
  }
}

module.exports = { BankSlopeAnglesService };
