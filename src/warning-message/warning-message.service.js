const {
  WarningMessagesEntity,
} = require("../db/entity/warning-message.entity");
const {
  WarningCodeEntity,
} = require("../db/entity/warning-code.entity");
const {
  CropEntity,
} = require("../db/entity/crop.entity");
const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { MoreThan, Between } = require("typeorm");


class WarningMessageService extends BaseService {
  constructor() {
    super(WarningMessagesEntity);
    this.repository = AppDataSource.getRepository(WarningMessagesEntity);
       this.warningCodesRepository =
      AppDataSource.getRepository(WarningCodeEntity);
      this.cropRepository =
      AppDataSource.getRepository(CropEntity);
  }

async getWarningMessageByFieldIdsAndYear(fieldIds, harvestYear) {
  if (!fieldIds || !Array.isArray(fieldIds) || fieldIds.length === 0 || !harvestYear) {
    return [];
  }

  const results = [];

  // Loop through each fieldId
  for (const fieldId of fieldIds) {
      const data = await this.repository
      .createQueryBuilder("wm")
      .leftJoin("wm.Crop", "c")
      .where("wm.FieldID = :fieldId", { fieldId })
      .andWhere("c.Year = :harvestYear", { harvestYear })
      .select("DISTINCT wm.Header", "Header")
      .getRawMany();

    // Push results with fieldId included
    data.forEach(d => {
      results.push({
        fieldId,
        warningHeader: d.Header
      });
    });
  }

  return results;
}

}

module.exports = { WarningMessageService };
