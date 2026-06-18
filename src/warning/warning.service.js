const {
  WarningMessagesEntity,
} = require("../db/entity/warning-message.entity");
const { WarningCodeEntity } = require("../db/entity/warning-code.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { MoreThan, Between } = require("typeorm");
const { WarningsEntity } = require("../db/entity/warning.entity");

class WarningService extends BaseService {
  constructor() {
    super(WarningsEntity);
    this.repository = AppDataSource.getRepository(WarningsEntity);
  }

  async getWarningMessageByCountryAndKey(CountryID, WarningKey) {
    const record = await this.repository.findOne({
      where: {
        CountryID: CountryID,
        WarningKey: WarningKey,
      },
    });

    return record
  }
}

module.exports = { WarningService };
