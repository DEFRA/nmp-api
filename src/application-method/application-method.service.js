const { AppDataSource } = require("../db/data-source");
const {
  ApplicationMethodEntity,
} = require("../db/entity/application-method.entity");
const { BaseService } = require("../base/base.service");
const boom = require("@hapi/boom");
const { In } = require("typeorm");

class ApplicationMethodService extends BaseService {
  constructor() {
    super(ApplicationMethodEntity);
    this.repository = AppDataSource.getRepository(ApplicationMethodEntity);
  }
  async getApplicationMethods(fieldType, applicableFor) {
    if (!["L", "S", "B", "l", "s", "b"].includes(applicableFor)) {
      throw boom.badRequest(
        "Invalid applicableFor. It must be one of 'L', 'S', or 'B'."
      );
    }
    let whereCondition = {};

    if (fieldType == 1) {
      whereCondition = {
        ApplicableForArableAndHorticulture: In([applicableFor, "B"]),
      };
    } else if (fieldType == 2) {
      whereCondition = {
        ApplicableForGrass: In([applicableFor, "B"]),
      };
    } else {
      throw boom.badRequest("Invalid fieldType. It must be either 1 or 2.");
    }

    const applicationMethods = await this.repository.find({
      where: whereCondition,
    });
    return applicationMethods;
  }

  async getApplicationMethodById(id) {
    const { records } = await this.getById(id);
    if (!records) {
      throw boom.notFound(`Application Method with ID ${id} not found`);
    }
    return records;
  }
}

module.exports = { ApplicationMethodService };
