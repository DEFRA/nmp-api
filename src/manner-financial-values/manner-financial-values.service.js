const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");
const {
  MannerFinancialValuesEntity,
} = require("../db/entity/manner-financial-values.entity");

class MannerFinancialValuesService extends BaseService {
  constructor() {
    super(MannerFinancialValuesEntity);
    this.repository = AppDataSource.getRepository(MannerFinancialValuesEntity);
  }

  async createMannerFinancialValues(payload, userId) {
    const result = this.repository.create({
      ...payload,
      CreatedByID: userId,
      CreatedOn: new Date(),
    });

    const savedMannerFinancialValues = await this.repository.save(result);
    return savedMannerFinancialValues;
  }
}

module.exports = { MannerFinancialValuesService };
