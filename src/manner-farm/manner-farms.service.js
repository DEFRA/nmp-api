const { AppDataSource } = require("../db/data-source");
const { In } = require("typeorm");

const { BaseService } = require("../base/base.service");
const { MannerFarmsEntity } = require("../db/entity/manner-farms.entity");
const {
  MannerEstimationsEntity,
} = require("../db/entity/manner-estimations.entity");
const {
  MannerEstimationApplicationsEntity,
} = require("../db/entity/manner-estimation-applications.entity");
const {
  MannerEstimationsService,
} = require("../manner-estimations/manner-estimations.service");
class MannerFarmsService extends BaseService {
  constructor() {
    super(MannerFarmsEntity);
    this.repository = AppDataSource.getRepository(MannerFarmsEntity);
    this.mannerEstimationsRepository = AppDataSource.getRepository(
      MannerEstimationsEntity,
    );
    this.mannerEstimationApplicationsRepository = AppDataSource.getRepository(
      MannerEstimationApplicationsEntity,
    );
    this.mannerEstimationsService = new MannerEstimationsService();
  }

  async createWithMannerEstimation(payload, userId, request) {
    const { MannerFarm, MannerEstimation, MannerEstimationApplication } =
      payload;
    return AppDataSource.transaction(async (transactionalManager) => {
      const mannerFarmEntity = transactionalManager.create(MannerFarmsEntity, {
        ...MannerFarm,
        CreatedByID: userId,
        CreatedOn: new Date(),
      });
      const savedMannerFarm = await transactionalManager.save(MannerFarmsEntity,mannerFarmEntity);
      const mappedMannerEstimation = {...MannerEstimation,MannerFarmID: savedMannerFarm.ID};
      const nutrientProductsData = await this.mannerEstimationsService.nutrientsProductService.getData("/nutrient-products",request);
      const nutrientProducts = nutrientProductsData.data.filter((product) => product.isNutrientDefaultProduct === true);
      const nutrients = await this.mannerEstimationsService.nutrientsService.getData("/nutrients", request);
      const mappedMannerEstimationApplication =await this.mannerEstimationsService.getMappedMannerEstimationApplication(
          savedMannerFarm,mappedMannerEstimation,
          MannerEstimationApplication,request
        );
      const nutrientFinancialValues = await this.mannerEstimationsService.calculateNutrientFinancialValuesByNutrientId(nutrientProducts,nutrients,mappedMannerEstimationApplication,request);
      const mannerEstimationFinancialValues = this.mannerEstimationsService.buildMannerEstimationFinancialValues(nutrientFinancialValues);
      const mannerEstimationApplicationFinancialValues = this.mannerEstimationsService.buildMannerEstimationApplicationFinancialValues(nutrientFinancialValues);
      const mannerEstimationEntity = transactionalManager.create(
        MannerEstimationsEntity,
        {
          ...mappedMannerEstimation,
          ...mannerEstimationFinancialValues,
          CreatedByID: userId,
          CreatedOn: new Date(),
        },
      );
      const savedMannerEstimation = await transactionalManager.save(MannerEstimationsEntity,mannerEstimationEntity);
      const mannerEstimationApplicationEntity = transactionalManager.create(
        MannerEstimationApplicationsEntity,
        {
          ...mappedMannerEstimationApplication,
          ...mannerEstimationApplicationFinancialValues,
          MannerEstimationID: savedMannerEstimation.ID,
          CreatedByID: userId,
          CreatedOn: new Date(),
        },
      );
      const savedMannerEstimationApplication = await transactionalManager.save(MannerEstimationApplicationsEntity,mannerEstimationApplicationEntity);
      return {
        MannerFarm: savedMannerFarm,MannerEstimation: savedMannerEstimation,MannerEstimationApplication: savedMannerEstimationApplication
      };
    });
  }

  async getByOrganisationId(organisationId) {
    const mannerFarms = await this.repository.find({
      where: { OrganisationID: organisationId },
    });

    if (!mannerFarms.length) {
      return mannerFarms;
    }

    const farmIds = mannerFarms.map((mannerFarm) => mannerFarm.ID);
    const mannerEstimations = await this.getMannerEstimationsByFarmIds(farmIds);
    const estimationIds = mannerEstimations.map(
      (mannerEstimation) => mannerEstimation.ID,
    );
    const mannerEstimationApplications =
      await this.getMannerEstimationApplicationsByEstimationIds(estimationIds);

    const { latestEstimationTimestampByFarmId, farmIdByEstimationId } =
      this.buildLatestEstimationTimestampByFarmId(mannerEstimations);
    const latestApplicationTimestampByFarmId =
      this.buildLatestApplicationTimestampByFarmId(
        mannerEstimationApplications,
        farmIdByEstimationId,
      );

    return this.mapFarmsWithLastUpdatedDate(
      mannerFarms,
      latestEstimationTimestampByFarmId,
      latestApplicationTimestampByFarmId,
    );
  }

  async getMannerEstimationsByFarmIds(farmIds) {
    return this.mannerEstimationsRepository.find({
      where: { MannerFarmID: In(farmIds) },
      select: ["ID", "MannerFarmID", "CreatedOn", "ModifiedOn"],
    });
  }

  async getMannerEstimationApplicationsByEstimationIds(estimationIds) {
    if (!estimationIds.length) {
      return [];
    }

    return this.mannerEstimationApplicationsRepository.find({
      where: { MannerEstimationID: In(estimationIds) },
      select: ["MannerEstimationID", "CreatedOn", "ModifiedOn"],
    });
  }

  getLatestTimestamp(...dates) {
    const validTimestamps = dates
      .filter(Boolean)
      .map((date) => new Date(date).getTime())
      .filter((timestamp) => !Number.isNaN(timestamp));

    if (!validTimestamps.length) {
      return null;
    }

    return Math.max(...validTimestamps);
  }

  buildLatestEstimationTimestampByFarmId(mannerEstimations) {
    const latestEstimationTimestampByFarmId = new Map();
    const farmIdByEstimationId = new Map();

    for (const mannerEstimation of mannerEstimations) {
      farmIdByEstimationId.set(
        mannerEstimation.ID,
        mannerEstimation.MannerFarmID,
      );

      const latestEstimationTimestamp = this.getLatestTimestamp(
        mannerEstimation.ModifiedOn,
        mannerEstimation.CreatedOn,
      );

      if (latestEstimationTimestamp == null) {
        continue;
      }

      const existingTimestamp = latestEstimationTimestampByFarmId.get(
        mannerEstimation.MannerFarmID,
      );

      if (
        existingTimestamp == null ||
        latestEstimationTimestamp > existingTimestamp
      ) {
        latestEstimationTimestampByFarmId.set(
          mannerEstimation.MannerFarmID,
          latestEstimationTimestamp,
        );
      }
    }

    return { latestEstimationTimestampByFarmId, farmIdByEstimationId };
  }

  buildLatestApplicationTimestampByFarmId(
    mannerEstimationApplications,
    farmIdByEstimationId,
  ) {
    const latestApplicationTimestampByFarmId = new Map();

    for (const mannerEstimationApplication of mannerEstimationApplications) {
      const mannerFarmId = farmIdByEstimationId.get(
        mannerEstimationApplication.MannerEstimationID,
      );

      const latestApplicationTimestamp = mannerFarmId
        ? this.getLatestTimestamp(
            mannerEstimationApplication.ModifiedOn,
            mannerEstimationApplication.CreatedOn,
          )
        : null;

      if (mannerFarmId && latestApplicationTimestamp != null) {
        const existingTimestamp =
          latestApplicationTimestampByFarmId.get(mannerFarmId);

        if (
          existingTimestamp == null ||
          latestApplicationTimestamp > existingTimestamp
        ) {
          latestApplicationTimestampByFarmId.set(
            mannerFarmId,
            latestApplicationTimestamp,
          );
        }
      }
    }

    return latestApplicationTimestampByFarmId;
  }

  mapFarmsWithLastUpdatedDate(
    mannerFarms,
    latestEstimationTimestampByFarmId,
    latestApplicationTimestampByFarmId,
  ) {
    return mannerFarms.map((mannerFarm) => {
      const latestFarmTimestamp = this.getLatestTimestamp(
        mannerFarm.ModifiedOn,
        mannerFarm.CreatedOn,
      );
      const latestEstimationTimestamp = latestEstimationTimestampByFarmId.get(
        mannerFarm.ID,
      );
      const latestApplicationTimestamp = latestApplicationTimestampByFarmId.get(
        mannerFarm.ID,
      );

      const latestModifiedTimestamp = this.getLatestTimestamp(
        latestFarmTimestamp,
        latestEstimationTimestamp,
        latestApplicationTimestamp,
      );

      return {
        ...mannerFarm,
        LastUpdatedDate:
          latestModifiedTimestamp == null
            ? null
            : new Date(latestModifiedTimestamp),
      };
    });
  }

  async deleteMannerFarmsByIds(mannerFarmsIds) {
  return AppDataSource.transaction(async (transactionalManager) => {
    await transactionalManager.query("EXEC dbo.spMannerFarms_DeleteByIDs @0", [
      mannerFarmsIds.join(","),
    ]);
  });
}
async checkMannerFarmExists(organisationId, name) {
    const matchedMannerFarm = await this.repository.findOne({
      where: { OrganisationID: organisationId, Name: name },
      select: { ID: true, Name: true, OrganisationID: true },
    });
    return { exists: Boolean(matchedMannerFarm) };
  }
}

module.exports = { MannerFarmsService };
