const { AppDataSource } = require("../db/data-source");
const {
  ScotlandGrassNMaxValuesEntity,
} = require("../db/entity/scotland-grass-nmax-values.entity");
const { BaseService } = require("../base/base.service");

class ScotlandGrassNMaxValueService extends BaseService {
  constructor() {
    super(ScotlandGrassNMaxValuesEntity);
    this.repository = AppDataSource.getRepository(ScotlandGrassNMaxValuesEntity);
  }

  // Returns the SiteClass{n} value for the matching row, or null if no row exists.
  async getNMaxValue(
    swardTypeID,
    swardManagementID,
    defoliationSequenceID,
    siteClass,
  ) {
    const row = await this.repository.findOne({
      where: {
        SwardTypeID: swardTypeID,
        SwardManagementID: swardManagementID,
        DefoliationSequenceID: defoliationSequenceID,
      },
    });

    if (!row) {
      return null;
    }

    return row[`SiteClass${siteClass}`] ?? null;
  }
}

module.exports = { ScotlandGrassNMaxValueService };
