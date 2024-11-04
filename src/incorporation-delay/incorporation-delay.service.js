const { AppDataSource } = require("../db/data-source");
const {
  IncorpMethodsIncorpDelayEntity,
} = require("../db/entity/incorp-method-incorp-delay.entity");
const {
  IncorporationDelayEntity,
} = require("../db/entity/incorporation-delay.entity");
const { BaseService } = require("../base/base.service");
const { In, IsNull } = require("typeorm");
const boom = require("@hapi/boom");

class IncorporationDelayService extends BaseService {
  constructor() {
    super(IncorporationDelayEntity);
    this.repository = AppDataSource.getRepository(IncorporationDelayEntity);
    this.incorpMethodsIncorpDelayRepository = AppDataSource.getRepository(
      IncorpMethodsIncorpDelayEntity
    );
  }

  async getIncorporationDelays(methodId, applicableFor) {
    if (!["L", "S", "A", "l", "s", "a"].includes(applicableFor)) {
      throw boom.badRequest(
        "Invalid applicableFor. It must be one of 'L', 'S', or 'A'."
      );
    }
    const methodDelays = await this.incorpMethodsIncorpDelayRepository.find({
      where: { IncorporationMethodID: methodId },
      relations: ["IncorporationDelay"],
    });
    const incorporationDelaysId = methodDelays.map(
      (md) => md.IncorporationDelayID
    );
    const incorporationDelays = await this.repository.find({
      where: [
        {
          ID: In(incorporationDelaysId),
          ApplicableFor: In([applicableFor, "A"]),
        },
        {
          ID: In(incorporationDelaysId),
          ApplicableFor: IsNull(),
        },
      ],
    });

    return incorporationDelays;
  }
}

module.exports = { IncorporationDelayService };
