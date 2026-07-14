const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");
const {
  MannerEstimationApplicationsEntity,
} = require("../db/entity/manner-estimation-applications.entity");
const {
  MannerEstimationsEntity,
} = require("../db/entity/manner-estimations.entity");
const {
  MannerEstimationsService,
} = require("../manner-estimations/manner-estimations.service");
const { normalizeDateWithTime } = require("../shared/dataValidate");
const { ManureTypeMapper } = require("../constants/manure-type-mapper");
const MANNER_ESTIMATION_ID_CONDITION =
  "MEA.MannerEstimationID = :mannerEstimationId";
const MANNER_APPLICATION_ID_CONDITION = "MEA.ID != :mannerApplicationId";
class MannerEstimationApplicationsService extends BaseService {
  constructor() {
    super(MannerEstimationApplicationsEntity);
    this.repository = AppDataSource.getRepository(
      MannerEstimationApplicationsEntity,
    );
    this.mannerEstimationRepository = AppDataSource.getRepository(
      MannerEstimationsEntity,
    );
    this.mannerEstimationsService = new MannerEstimationsService();
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

  async updateMannerEstimationApplication(payload, userId, request) {
    return AppDataSource.transaction(async (transactionalManager) => {
      const applicationId = payload?.ID;

      if (!applicationId) {
        throw new Error("Manner estimation application ID is required");
      }

      const existingApplication = await transactionalManager.findOne(
        MannerEstimationApplicationsEntity,
        {
          where: { ID: applicationId },
        },
      );

      if (!existingApplication) {
        throw new Error("Manner estimation application not found");
      }

      const mergedApplication = {
        ...existingApplication,
        ...payload,
      };

      const mannerEstimation = await transactionalManager.findOne(
        MannerEstimationsEntity,
        {
          where: { ID: mergedApplication.MannerEstimationID },
        },
      );

      if (!mannerEstimation) {
        throw new Error("Manner estimation not found");
      }

      const nutrientFinancialValues =
        await this.mannerEstimationsService.calculateNutrientFinancialValuesByNutrientIdForUpdate(
          mannerEstimation,
          mergedApplication,
          request,
        );

      const nutrientValuesOnlyByNutrientId = Object.fromEntries(
        Object.entries(nutrientFinancialValues).map(([nutrientId, value]) => [
          nutrientId,
          {
            nutrientValue: value?.nutrientValue,
          },
        ]),
      );

      const mannerEstimationApplicationFinancialValues =
        this.mannerEstimationsService.buildMannerEstimationApplicationFinancialValues(
          nutrientValuesOnlyByNutrientId,
        );

      const {
        ID,
        CreatedByID,
        CreatedOn,
        ModifiedByID,
        ModifiedOn,
        ...applicationDataToUpdate
      } = mergedApplication;

      const updatePayload = {
        ...applicationDataToUpdate,
        ...mannerEstimationApplicationFinancialValues,
        ModifiedByID: userId,
        ModifiedOn: new Date(),
      };

      await transactionalManager.update(
        MannerEstimationApplicationsEntity,
        { ID: applicationId },
        updatePayload,
      );

      return transactionalManager.findOne(MannerEstimationApplicationsEntity, {
        where: { ID: applicationId },
      });
    });
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
      .where(MANNER_ESTIMATION_ID_CONDITION, { mannerEstimationId })
      .andWhere("MEA.ApplicationDate BETWEEN :startDate AND :endDate", {
        startDate: fromDateFormatted,
        endDate: toDateFormatted,
      });

    if (mannerApplicationId != null) {
      query.andWhere(MANNER_APPLICATION_ID_CONDITION, { mannerApplicationId });
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
      .where(MANNER_ESTIMATION_ID_CONDITION, { mannerEstimationId })
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
      query.andWhere(MANNER_APPLICATION_ID_CONDITION, { mannerApplicationId });
    }

    const result = await query.getRawOne();
    return Number(result?.totalN ?? 0);
  }

  async deleteMannerEstimationApplication(
    mannerEstimationApplicationId
  ) {
    return AppDataSource.transaction(async (manager) => {
      return manager.query(
        "EXEC dbo.spMannerEstimationApplications_Delete @MannerEstimationApplicationID = @0",
        [mannerEstimationApplicationId],
      );
    });
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
      .where(MANNER_ESTIMATION_ID_CONDITION, { mannerEstimationId })
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
      query.andWhere(MANNER_APPLICATION_ID_CONDITION, { mannerApplicationId });
    }

    const result = await query.limit(1).getRawOne();
    return Boolean(result);
  }
}

module.exports = { MannerEstimationApplicationsService };
