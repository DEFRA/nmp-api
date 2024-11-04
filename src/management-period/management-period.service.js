const { ManagementPeriodEntity } = require("../db/entity/management-period.entity");
const { BaseService } = require("../base/base.service");

class ManagementPeriodService extends BaseService {
    constructor() {
        super(ManagementPeriodEntity);
    }
}

module.exports = { ManagementPeriodService };

