const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");
const { CountryEntity } = require("../db/entity/country.entity");

class CountryService extends BaseService {
  constructor() {
    super(CountryEntity);
    this.repository = AppDataSource.getRepository(CountryEntity);
  }
}

module.exports = { CountryService };
