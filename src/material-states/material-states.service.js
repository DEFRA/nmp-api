const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { MaterialStatesEntity } = require("../db/entity/material-states.entity");

class MaterialStatesService extends BaseService {
  constructor() {
    super(MaterialStatesEntity);
    this.repository = AppDataSource.getRepository(MaterialStatesEntity);
  }
}

module.exports = { MaterialStatesService };
