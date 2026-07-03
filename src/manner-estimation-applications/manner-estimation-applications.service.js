const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");
const {
  MannerEstimationApplicationsEntity,
} = require("../db/entity/manner-estimation-applications.entity");
const { normalizeDateWithTime } = require("../shared/dataValidate");
const { ManureTypeMapper } = require("../constants/manure-type-mapper");

class MannerEstimationApplicationsService extends BaseService {
  constructor() {
    super(MannerEstimationApplicationsEntity);
    this.repository = AppDataSource.getRepository(
      MannerEstimationApplicationsEntity,
    );
  }

  async createMannerEstimationApplication(payload, userId) {
    const result = this.repository.create({
      ...payload,
      CreatedByID: userId,
      CreatedOn: new Date(),
    });
    const savedApplications = await this.repository.save(result);
    return savedApplications;
  }

  async getEstimationApplicationsByEstimationId(mannerEstimationId) {
    const mannerApplicationData = await this.repository.find({
      where: { MannerEstimationID: mannerEstimationId },
    });

    return mannerApplicationData;
  }

  async fetchTotalNByMannerEstimationIdAppDate(
    mannerEstimationId,
    startDate,
    endDate,
    mannerApplicationId,
  ) {
    const START_OF_DAY = {
      HOUR: 0,
      MINUTE: 0,
      SECOND: 0,
      MILLISECOND: 0,
    };

    const END_OF_DAY = {
      HOUR: 23,
      MINUTE: 59,
      SECOND: 59,
      MILLISECOND: 999,
    };

    const fromDateFormatted = normalizeDateWithTime(startDate, START_OF_DAY);
    const toDateFormatted = normalizeDateWithTime(endDate, END_OF_DAY);

    const query = this.repository
      .createQueryBuilder("MEA")
      .select("SUM(MEA.N * MEA.ApplicationRate)", "totalN")
      .where("MEA.MannerEstimationID = :mannerEstimationId", {
        mannerEstimationId,
      })
      .andWhere("MEA.ApplicationDate BETWEEN :startDate AND :endDate", {
        startDate: fromDateFormatted,
        endDate: toDateFormatted,
      });

    if (mannerApplicationId != null) {
      query.andWhere("MEA.ID != :mannerApplicationId", { mannerApplicationId });
    }

    const result = await query.getRawOne();
    return Number(result?.totalN ?? 0);
  }

  async fetchTotalNBasedByMannerEstimationIdAppDateAndIsGreenCompost(
    mannerEstimationId,
    startDate,
    endDate,
    isGreenFoodCompost,
    mannerApplicationId,
  ) {
    const START_OF_DAY = {
      HOUR: 0,
      MINUTE: 0,
      SECOND: 0,
      MILLISECOND: 0,
    };

    const END_OF_DAY = {
      HOUR: 23,
      MINUTE: 59,
      SECOND: 59,
      MILLISECOND: 999,
    };

    const fromDateFormatted = normalizeDateWithTime(startDate, START_OF_DAY);
    const toDateFormatted = normalizeDateWithTime(endDate, END_OF_DAY);
    const manureTypeIDs = [
      ManureTypeMapper.GreenCompost,
      ManureTypeMapper.GreenFoodCompost,
    ];

    const query = this.repository
      .createQueryBuilder("MEA")
      .select("SUM(MEA.N * MEA.ApplicationRate)", "totalN")
      .where("MEA.MannerEstimationID = :mannerEstimationId", {
        mannerEstimationId,
      })
      .andWhere("MEA.ApplicationDate BETWEEN :startDate AND :endDate", {
        startDate: fromDateFormatted,
        endDate: toDateFormatted,
      });

    if (isGreenFoodCompost) {
      query.andWhere("MEA.ManureTypeID IN (:...manureTypeIDs)", {
        manureTypeIDs,
      });
    } else {
      query.andWhere("MEA.ManureTypeID NOT IN (:...manureTypeIDs)", {
        manureTypeIDs,
      });
    }

    if (mannerApplicationId != null) {
      query.andWhere("MEA.ID != :mannerApplicationId", { mannerApplicationId });
    }

    const result = await query.getRawOne();
    return Number(result?.totalN ?? 0);
  }

  async checkMannerGreenCompostExistanceByDateRange(
    mannerEstimationId,
    dateFrom,
    dateTo,
    mannerApplicationId,
  ) {
    const START_OF_DAY = {
      HOUR: 0,
      MINUTE: 0,
      SECOND: 0,
      MILLISECOND: 0,
    };

    const END_OF_DAY = {
      HOUR: 23,
      MINUTE: 59,
      SECOND: 59,
      MILLISECOND: 999,
    };

    const fromDateFormatted = normalizeDateWithTime(dateFrom, START_OF_DAY);
    const toDateFormatted = normalizeDateWithTime(dateTo, END_OF_DAY);

    const query = this.repository
      .createQueryBuilder("MEA")
      .select("MEA.ID", "id")
      .where("MEA.MannerEstimationID = :mannerEstimationId", {
        mannerEstimationId,
      })
      .andWhere("MEA.ApplicationDate BETWEEN :fromDate AND :toDate", {
        fromDate: fromDateFormatted,
        toDate: toDateFormatted,
      })
      .andWhere("MEA.ManureTypeID IN (:...manureTypeIDs)", {
        manureTypeIDs: [
          ManureTypeMapper.GreenCompost,
          ManureTypeMapper.GreenFoodCompost,
        ],
      });

    if (mannerApplicationId != null) {
      query.andWhere("MEA.ID != :mannerApplicationId", { mannerApplicationId });
    }

    const result = await query.limit(1).getRawOne();
    return Boolean(result);
  }
}

module.exports = { MannerEstimationApplicationsService };
