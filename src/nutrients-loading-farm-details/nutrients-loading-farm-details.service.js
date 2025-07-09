const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");

const boom = require("@hapi/boom");
const {
  NutrientsLoadingFarmDetailsEntity,
} = require("../db/entity/nutrients-loading-farm-details-entity");

class NutrientsLoadingFarmDetailsService extends BaseService {
  constructor() {
    super(NutrientsLoadingFarmDetailsEntity);
    this.repository = AppDataSource.getRepository(
      NutrientsLoadingFarmDetailsEntity
    );
  }

  async getByFarmIdAndYear(farmId, year) {
    const whereClause = { FarmID: farmId };

    // Only include year in where clause if it's actually provided
    if (year !== undefined || year !== null || year !== "") {
      whereClause.CalendarYear = year;
    }

    const records = await this.repository.find({ where: whereClause });

    return { NutrientsLoadingFarmDetails: records };
  }

  async checkRecordExists(farmId, year) {
    return await this.recordExists({
      FarmID: farmId,
      CalendarYear: year,
    });
  }

  async createNutrientsLoadingFarmDetails(payload, userId) {
    const { FarmID, CalendarYear } = payload;

    return await AppDataSource.transaction(async (transactionalManager) => {
      const existingRecord = await transactionalManager.findOne(
        NutrientsLoadingFarmDetailsEntity,
        { where: { FarmID: FarmID, CalendarYear: CalendarYear } }
      );

      if (existingRecord) {
        const { ID, CreatedByID, CreatedOn, ...rest } = payload;
        const saved = await transactionalManager.update(
          NutrientsLoadingFarmDetailsEntity,
          { FarmID: FarmID, CalendarYear: CalendarYear },
          {
            ...rest,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
          }
        );

        const updatedRecord = await transactionalManager.findOne(
          NutrientsLoadingFarmDetailsEntity,
          { where: { FarmID: FarmID, CalendarYear: CalendarYear } }
        );

        return updatedRecord;
      } else {
        const newRecord = transactionalManager.create(
          NutrientsLoadingFarmDetailsEntity,
          {
            ...payload,
            CreatedByID: userId,
            CreatedOn: new Date(),
          }
        );

        const saved = await transactionalManager.save(
          NutrientsLoadingFarmDetailsEntity,
          newRecord
        );

        return saved;
      }
    });
  }

  async updateNutrientsLoadingFarmDetails(payload, userId) {
    const {
      ID,
      FarmID,
      CalendarYear,
      CreatedByID,
      CreatedOn,
      ...dataToUpdate
    } = payload;

    const result = await this.repository.update(
      { FarmID, CalendarYear },
      {
        ...dataToUpdate,
        ModifiedByID: userId,
        ModifiedOn: new Date(),
      }
    );

    if (result.affected === 0) {
      throw boom.notFound(
        `NutrientsLoadingFarmDetails with FarmId ${FarmID} and CalendarYear ${CalendarYear} not found`
      );
    }

    const updated = await this.repository.findOneBy({ FarmID, CalendarYear });

    return updated;
  }
}

module.exports = { NutrientsLoadingFarmDetailsService };
