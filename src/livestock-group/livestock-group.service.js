const { LivestockGroupEntity } = require("../db/entity/livestock-group-entity");
const { BaseService } = require("../base/base.service");

class LivestockGroupService extends BaseService {
  constructor() {
    super(LivestockGroupEntity);
  }
}

module.exports = { LivestockGroupService };
