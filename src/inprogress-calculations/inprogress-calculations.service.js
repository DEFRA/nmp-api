const { BaseService } = require("../base/base.service");
const { InprogressCalculationsEntity } = require("../db/entity/inprogress-calculations-entity");
const { AppDataSource } = require("../db/data-source");

class InprogressCalculationsService extends BaseService {
  constructor() {
    super(InprogressCalculationsEntity);
    this.repository = AppDataSource.getRepository(InprogressCalculationsEntity);
  }

  async checkFarmExistsInCalculations(fieldId, year) {
    try {
      // Find if the farmId exists in any row of the InprogressCalculationsEntity
      const exists = await this.repository.findOne({
        where: {
          FieldID: fieldId,
          Year: year,
        },
      });

      // Return true if farmId exists, otherwise false
      return !!exists;
    } catch (error) {
      console.error("Error checking farm existence:", error);
      throw new Error("Error checking farm existence");
    }
  }
}

module.exports = { InprogressCalculationsService };
