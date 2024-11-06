const { AppDataSource } = require("../db/data-source");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { BaseService } = require("../base/base.service");

class FertiliserManuresService extends BaseService {
  constructor() {
    super(FertiliserManuresEntity);
    this.repository = AppDataSource.getRepository(FertiliserManuresEntity);
    this.organicManureRepository =
      AppDataSource.getRepository(OrganicManureEntity);
  }
  async getFertiliserManureNitrogenSum(
    managementPeriodID,
    fromDate,
    toDate,
    confirm
  ) {
    const result = await this.repository
      .createQueryBuilder("fertiliserManures")
      .select(
        "SUM(fertiliserManures.N * fertiliserManures.ApplicationRate)",
        "totalN"
      )
      .where("fertiliserManures.ManagementPeriodID = :managementPeriodID", {
        managementPeriodID,
      })
      .andWhere(
        "fertiliserManures.ApplicationDate BETWEEN :fromDate AND :toDate",
        { fromDate, toDate }
      )
      .andWhere("fertiliserManures.Confirm = :confirm", { confirm })
      .getRawOne();
    return result.totalN;
  }

  async getTotalNitrogen(managementPeriodID, confirm) {
    const fertiliserManuresResult = await this.repository
      .createQueryBuilder("fertiliserManures")
      .select(
        "SUM(fertiliserManures.N * fertiliserManures.ApplicationRate)",
        "totalN"
      )
      .where("fertiliserManures.ManagementPeriodID = :managementPeriodID", {
        managementPeriodID,
      })
      .andWhere("fertiliserManures.Confirm = :confirm", { confirm })
      .getRawOne();
    const organicManuresResult = await this.organicManureRepository
      .createQueryBuilder("organicManures")
      .select(
        "SUM(organicManures.N * organicManures.ApplicationRate)",
        "totalN"
      )
      .where("organicManures.ManagementPeriodID = :managementPeriodID", {
        managementPeriodID,
      })
      .andWhere("organicManures.Confirm = :confirm", { confirm })
      .getRawOne();
    return fertiliserManuresResult.totalN + organicManuresResult.totalN;
  }

  async createFertiliserManures(fertiliserManureData, userId) {
    return await AppDataSource.transaction(async (transactionalManager) => {
     
      const fertiliserManures = fertiliserManureData.map(({ ID, ...rest }) => ({
        ...rest,
        CreatedByID: userId,
        CreatedOn: new Date(),
      }));

      const savedFertiliserManures = await transactionalManager.save(
        FertiliserManuresEntity,
        fertiliserManures
      );
      return savedFertiliserManures;
    });
  }
}

module.exports = { FertiliserManuresService };
