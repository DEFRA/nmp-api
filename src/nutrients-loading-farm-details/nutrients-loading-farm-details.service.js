const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");

const boom = require("@hapi/boom");
const { NutrientsLoadingFarmDetailsEntity } = require("../db/entity/nutrients-loading-farm-details-entity");

class NutrientsLoadingFarmDetailsService extends BaseService {
  constructor() {
    super(NutrientsLoadingFarmDetailsEntity);
    this.repository = AppDataSource.getRepository(
      NutrientsLoadingFarmDetailsEntity
    );
  }

  async getByFarmIdAndYear(farmId, year) {
    const record = await this.repository.findOneBy({
      FarmId: farmId,
      CalendarYear: year,
    });

    return { NutrientsLoadingFarmDetails: record };
  }

  async checkRecordExists(farmId, year) {
    return await this.recordExists({
      FarmId: farmId,
      CalendarYear: year,
    });
  }

  async createNutrientsLoadingFarmDetails(payload, userId) {
    const { FarmId, CalendarYear } = payload;

    const exists = await this.checkRecordExists(FarmId, CalendarYear);
    if (exists) {
      throw boom.conflict(
        "NutrientsLoadingFarmDetails already exists for this FarmId and CalendarYear"
      );
    }

    return await AppDataSource.transaction(async (transactionalManager) => {
      const data = this.repository.create({
        ...payload,
        CreatedByID: userId,
        CreatedOn: new Date(),
      });

      const saved = await transactionalManager.save(
        NutrientsLoadingFarmDetailsEntity,
        data
      );

      return { NutrientsLoadingFarmDetails: saved };
    });
  }

  async updateNutrientsLoadingFarmDetails(payload, userId) {
    const {
      Id,
      FarmId,
      CalendarYear,
      CreatedByID,
      CreatedOn,
      ...dataToUpdate
    } = payload;

    const result = await this.repository.update(
      { FarmId, CalendarYear },
      {
        ...dataToUpdate,
        ModifiedByID: userId,
        ModifiedOn: new Date(),
      }
    );

    if (result.affected === 0) {
      throw boom.notFound(
        `NutrientsLoadingFarmDetails with FarmId ${FarmId} and CalendarYear ${CalendarYear} not found`
      );
    }

    const updated = await this.repository.findOneBy({ FarmId, CalendarYear });

    return updated;
  }
}

module.exports = { NutrientsLoadingFarmDetailsService };
