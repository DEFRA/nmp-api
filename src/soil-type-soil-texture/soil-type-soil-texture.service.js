const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { SoilTypeSoilTextureEntity } = require("../db/entity/soil-type-soil-texture.entity");


class SoilTypeSoilTextureService extends BaseService {
  constructor() {
    super(SoilTypeSoilTextureEntity);
    this.repository = AppDataSource.getRepository(SoilTypeSoilTextureEntity);
  }

  async getTopSoilSubSoilBySoilTypeId(soilTypeId) {
    console.log("soilTypeId", soilTypeId);
    const soilTypeSoilTextureData = await this.repository.findOneBy({
       SoilTypeID: soilTypeId ,
    });
      console.log("soilTypeSoilTextureData", soilTypeSoilTextureData);
    return soilTypeSoilTextureData;
  }
  async getSoilTypeIdByTopSoilAndSubSoil(topSoilId, subSoilId) {
    const record = await this.repository.findOneBy({
        TopSoilID: topSoilId,
        SubSoilID: subSoilId
    });

    return record?.SoilTypeID ?? null;
  }
}
module.exports = { SoilTypeSoilTextureService };
