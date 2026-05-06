const { AppDataSource } = require("../db/data-source");
const { ManureTypeEntity } = require("../db/entity/manure-type.entity");
const { BaseService } = require("../base/base.service");
const { In } = require("typeorm")
class ManureTypeService extends BaseService {
    constructor() {
        super(ManureTypeEntity);
        this.repository = AppDataSource.getRepository(ManureTypeEntity);
    }

    async getManureTypes(manureGroupId, countryId) {
        const countryIdThreshold = 3; 
        const manureTypes = await this.repository.find({
            where: {
                ManureGroupID: manureGroupId,
                CountryID: In([countryId, countryIdThreshold]),
            },
        });
        return { ManureTypes: manureTypes };
    }
}

module.exports = { ManureTypeService };
