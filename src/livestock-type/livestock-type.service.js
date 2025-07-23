const { LivestockTypeEntity } = require("../db/entity/livestock-type-entity");
const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");

class LivestockTypeService extends BaseService {
  constructor() {
    super(LivestockTypeEntity);
    this.repository = AppDataSource.getRepository(LivestockTypeEntity);
  }


    async getLivestockTypesByLivestockGroupId(livestockGroupId) {
        const livestockTypes = await this.repository.find({
            where: {
                LivestockGroupID: livestockGroupId,
            },
        });
        return { LivestockTypes: livestockTypes };
    }



}

module.exports = { LivestockTypeService };
