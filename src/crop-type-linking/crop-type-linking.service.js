const { AppDataSource } = require("../db/data-source");
const { CropTypeLinkingEntity } = require("../db/entity/crop-type-linking.entity");
const { BaseService } = require("../base/base.service");

class CropTypeLinkingsService extends BaseService {
    constructor() {
        super(CropTypeLinkingEntity);
        this.repository = AppDataSource.getRepository(CropTypeLinkingEntity);
    }

    async getCropTypeLinkingByCropTypeID(cropTypeID) {
        const cropType = await this.repository.findOneBy({ CropTypeID: cropTypeID });
        return cropType;
    }
}

module.exports = { CropTypeLinkingsService };
