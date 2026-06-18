const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { StorageTypesEntity } = require("../db/entity/storage-types.Entity");


class StorageTypesService extends BaseService {
  constructor() {
    super(StorageTypesEntity);
    this.repository = AppDataSource.getRepository(StorageTypesEntity);
  }




}

module.exports = { StorageTypesService };
