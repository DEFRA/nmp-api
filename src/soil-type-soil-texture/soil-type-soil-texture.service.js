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
}
module.exports = { SoilTypeSoilTextureService };
