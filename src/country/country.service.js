const { AppDataSource } = require("../db/data-source");
const { ClimateDatabaseEntity } = require("../db/entity/climate.entity");
const { validateISODateFormat } = require(".././shared/dataValidate");
const { BaseService } = require("../base/base.service");
const boom = require("@hapi/boom");
const { CountryEntity } = require("../db/entity/country.entity");

class CountryService extends BaseService {
  constructor() {
    super(CountryEntity);
    this.repository = AppDataSource.getRepository(CountryEntity);
  }

  
}

module.exports = { CountryService };
