const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");

const boom = require("@hapi/boom");
const { NutrientsLoadingManuresEntity } = require("../db/entity/nutrients-loading-manures-entity");


class NutrientsLoadingManuresService extends BaseService {
  constructor() {
    super(NutrientsLoadingManuresEntity);
    this.repository = AppDataSource.getRepository(
      NutrientsLoadingManuresEntity
    );
  }

  async getByFarmIdAndYear(farmId) {
    const record = await this.repository.findOneBy({
      FarmID: farmId,
    });

    return { NutrientsLoadingFarmDetails: record };
  }

  async checkRecordExists(farmId) {
    return await this.recordExists({
      FarmID: farmId,
    });
  }

  async createNutrientsLoadingManures(payload, userId) {
    const { FarmID } = payload;

    return await AppDataSource.transaction(async (transactionalManager) => {
      const existingRecord = await transactionalManager.findOne(
        NutrientsLoadingManuresEntity,
        { where: { FarmID: FarmID } }
      );

      if (existingRecord) {
        const { ID, CreatedByID, CreatedOn, ...rest } = payload;
        const saved = await transactionalManager.update(
          NutrientsLoadingManuresEntity,
          { FarmID: FarmID },
          {
            ...rest,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
          }
        );

        const updatedRecord = await transactionalManager.findOne(
          NutrientsLoadingManuresEntity,
          { where: { FarmID: FarmID } }
        );

        return updatedRecord;
      } else {
        const newRecord = transactionalManager.create(
          NutrientsLoadingManuresEntity,
          {
            ...payload,
            CreatedByID: userId,
            CreatedOn: new Date(),
          }
        );

        const saved = await transactionalManager.save(
          NutrientsLoadingManuresEntity,
          newRecord
        );

        return saved;
      }
    });
  }

  async updateNutrientsLoadingManures(payload, userId) {
    const {
      ID,
      FarmID,
      CreatedByID,
      CreatedOn,
      ...dataToUpdate
    } = payload;

    const result = await this.repository.update(
      { FarmID },
      {
        ...dataToUpdate,
        ModifiedByID: userId,
        ModifiedOn: new Date(),
      }
    );

    if (result.affected === 0) {
      throw boom.notFound(
        `NutrientsLoadingFarmDetails with FarmId ${FarmID}  not found`
      );
    }

    const updated = await this.repository.findOneBy({ FarmID });

    return updated;
  }
}

module.exports = { NutrientsLoadingManuresService };
