const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const {
  SolidManureTypesEntity,
} = require("../db/entity/solid-manure-types.entity");

class SolidManureTypesService extends BaseService {
  constructor() {
    super(SolidManureTypesEntity);
    this.repository = AppDataSource.getRepository(SolidManureTypesEntity);
  }
}

module.exports = { SolidManureTypesService };
