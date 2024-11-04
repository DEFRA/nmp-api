const { AppDataSource } = require("../db/data-source");
const {
  CropTypeLinkingEntity,
} = require("../db/entity/crop-type-linking.entity");
const {
  MannerCropTypeEntity,
} = require("../db/entity/manner-crop-type.entity");
const { BaseService } = require("../base/base.service");
const { In } = require("typeorm");

class MannerCropTypeService extends BaseService {
  constructor() {
    super(MannerCropTypeEntity);
    this.repository = AppDataSource.getRepository(MannerCropTypeEntity);
    this.cropTypeLinkingsRepository = AppDataSource.getRepository(
      CropTypeLinkingEntity
    );
  }

  async getMannerCropTypesByCropTypeID(cropTypeID) {
    const cropTypeLinkings = await this.cropTypeLinkingsRepository.find({
      where: { CropTypeID: cropTypeID },
      relations: ["MannerCropType"],
    });

    const mannerCropTypeIds = cropTypeLinkings.map(
      (link) => link.MannerCropTypeID
    );

    const mannerCropTypes = await this.repository.find({
      where: { ID: In(mannerCropTypeIds) },
    });

    const results = mannerCropTypes.map((mannerCropType) => ({
      MannerCropTypeID: mannerCropType.ID,
      CropUptakeFactor: mannerCropType.CropUptakeFactor,
    }));

    return results;
  }
}

module.exports = { MannerCropTypeService };
