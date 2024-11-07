const { ManureGroupEntity } = require("../db/entity/manure-group.entity");
const { BaseService } = require("../base/base.service");

class ManureGroupService extends BaseService {
  constructor() {
    super(ManureGroupEntity);
  }
}

module.exports = { ManureGroupService };
