const { AppDataSource } = require("../db/data-source");
const {
  ApplicationMethodsIncorpMethodEntity,
} = require("../db/entity/application-method-incorp-method.entity");
const {
  IncorporationMethodEntity,
} = require("../db/entity/incorporation-method.entity");
const { BaseService } = require("../base/base.service");
const { In, IsNull } = require("typeorm");
const boom = require("@hapi/boom");

class IncorporationMethodService extends BaseService {
  constructor() {
    super(IncorporationMethodEntity);
    this.repository = AppDataSource.getRepository(IncorporationMethodEntity);
    this.appMethodIncorpMethodRepository = AppDataSource.getRepository(
      ApplicationMethodsIncorpMethodEntity
    );
  }

  async getIncorporationMethods(fieldType, applicableFor, appId) {
    if (!["L", "S", "B", "l", "s", "b"].includes(applicableFor)) {
      throw boom.badRequest(
        "Invalid applicableFor. It must be one of 'L', 'S', or 'B'."
      );
    }
    const appMethodsIncorpMethods =
      await this.appMethodIncorpMethodRepository.find({
        where: { ApplicationMethodID: appId },
        relations: ["IncorporationMethod"],
      });

    const incorporationMethodIds = appMethodsIncorpMethods.map(
      (amim) => amim.IncorporationMethodID
    );

    let whereCondition = {};
    if (fieldType === 1) {
      whereCondition = [
        {
          ID: In(incorporationMethodIds),
          ApplicableForArableAndHorticulture: In([applicableFor, "B"]),
        },
        {
          ID: In(incorporationMethodIds),
          ApplicableForArableAndHorticulture: IsNull(),
        },
      ];
    } else if (fieldType === 2) {
      whereCondition = [
        {
          ID: In(incorporationMethodIds),
          ApplicableForGrass: In([applicableFor, "B"]),
        },
        {
          ID: In(incorporationMethodIds),
          ApplicableForGrass: IsNull(),
        },
      ];
    } else {
      throw boom.badRequest("Invalid fieldType. It must be either 1 or 2.");
    }

    const incorporationMethods = await this.repository.find({
      where: whereCondition,
    });

    return incorporationMethods;
  }
}

module.exports = { IncorporationMethodService };
