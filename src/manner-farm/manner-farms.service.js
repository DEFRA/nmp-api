const { AppDataSource } = require("../db/data-source");

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
const { BackgroundJobQueue } = require("../shared/background-job-queue");

const parsedQueueConcurrency = Number.parseInt(
  process.env.MANNER_FARM_UPDATE_MAX_CONCURRENCY,
  10,
);
const MAX_CONCURRENT_MANNER_FARM_UPDATE_JOBS = Number.isFinite(
  parsedQueueConcurrency,
)
  ? Math.max(1, parsedQueueConcurrency)
  : 2;

const createBackgroundRequestContext = (request) => ({
  headers: {
    authorization: request?.headers?.authorization,
  },
});

const mannerFarmEstimateRefreshQueue = new BackgroundJobQueue({
  concurrency: MAX_CONCURRENT_MANNER_FARM_UPDATE_JOBS,
  getJobKey: (job) => `${job.mannerEstimation.ID}`,
  runJob: async (job) => {
    const mannerEstimationsService = new MannerEstimationsService();
    await mannerEstimationsService.updateMannerEstimationWithApplications(
      {
        MannerEstimation: job.mannerEstimation,
      },
      job.userId,
      job.request,
    );
  },
  onDuplicate: (job) => {
    console.log(
      `Manner estimation refresh already queued for ID: ${job.mannerEstimation.ID}`,
    );
  },
  onSuccess: (job) => {
    console.log(
      `Successfully refreshed manner estimation ID: ${job.mannerEstimation.ID}`,
    );
  },
  onError: (job, error) => {
    console.error(
      `Failed refreshing manner estimation ID: ${job.mannerEstimation.ID}`,
      error,
    );
  },
});

class MannerFarmsService extends BaseService {
  constructor() {
    super(MannerFarmsEntity);
    this.repository = AppDataSource.getRepository(MannerFarmsEntity);
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

      const savedMannerFarm = await transactionalManager.save(
        MannerFarmsEntity,
        mannerFarmEntity,
      );

      const mappedMannerEstimation = {
        ...MannerEstimation,
        MannerFarmID: savedMannerFarm.ID,
      };

      const nutrientProductsData =
        await this.mannerEstimationsService.nutrientsProductService.getData(
          "/nutrient-products",
          request,
        );

      const nutrientProducts = nutrientProductsData.data.filter(
        (product) => product.isNutrientDefaultProduct === true,
      );

      const nutrients =
        await this.mannerEstimationsService.nutrientsService.getData(
          "/nutrients",
          request,
        );

      const mappedMannerEstimationApplication =
        await this.mannerEstimationsService.getMappedMannerEstimationApplication(
          savedMannerFarm,
          mappedMannerEstimation,
          MannerEstimationApplication,
          request,
        );

      const nutrientFinancialValues =
        this.mannerEstimationsService.calculateNutrientFinancialValuesByNutrientId(
          nutrientProducts,
          nutrients,
          mappedMannerEstimationApplication,
        );

      const mannerEstimationFinancialValues =
        this.mannerEstimationsService.buildMannerEstimationFinancialValues(
          nutrientFinancialValues,
        );

      const mannerEstimationApplicationFinancialValues =
        this.mannerEstimationsService.buildMannerEstimationApplicationFinancialValues(
          nutrientFinancialValues,
        );

      const mannerEstimationEntity = transactionalManager.create(
        MannerEstimationsEntity,
        {
          ...mappedMannerEstimation,
          ...mannerEstimationFinancialValues,
          CreatedByID: userId,
          CreatedOn: new Date(),
        },
      );

      const savedMannerEstimation = await transactionalManager.save(
        MannerEstimationsEntity,
        mannerEstimationEntity,
      );

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

      const savedMannerEstimationApplication = await transactionalManager.save(
        MannerEstimationApplicationsEntity,
        mannerEstimationApplicationEntity,
      );

      return {
        MannerFarm: savedMannerFarm,
        MannerEstimation: savedMannerEstimation,
        MannerEstimationApplication: savedMannerEstimationApplication,
      };
    });
  }

  async getByOrganisationId(organisationId) {
    const mannerEstimationData = await this.repository.find({
      where: { OrganisationID: organisationId },
    });
    return mannerEstimationData;
  }

  async updateWithAssociatedEstimations(payload, userId, request) {
    const { MannerFarm } = payload;
    if (!MannerFarm?.ID) {
      throw new Error("MannerFarm ID is required");
    }

    const requestedMannerEstimationId = payload?.MannerEstimationID ?? null;

    const updateResult = await AppDataSource.transaction(
      async (transactionalManager) => {
        const existingMannerFarm = await transactionalManager.findOne(
          MannerFarmsEntity,
          {
            where: { ID: MannerFarm.ID },
          },
        );

        if (!existingMannerFarm) {
          throw new Error("Manner farm not found");
        }

        const { ID, CreatedByID, CreatedOn, ...mannerFarmDataToUpdate } =
          MannerFarm;

        const updatedMannerFarmResult = await transactionalManager.update(
          MannerFarmsEntity,
          { ID },
          {
            ...mannerFarmDataToUpdate,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
          },
        );

        if (updatedMannerFarmResult.affected !== 1) {
          throw new Error("Manner farm not found");
        }

        const updatedMannerFarm = await transactionalManager.findOneBy(
          MannerFarmsEntity,
          { ID },
        );

        const associatedMannerEstimations = await transactionalManager.find(
          MannerEstimationsEntity,
          {
            where: { MannerFarmID: ID },
            order: { ID: "ASC" },
          },
        );

        return {
          updatedMannerFarm,
          associatedMannerEstimations,
        };
      },
    );

    const { updatedMannerFarm, associatedMannerEstimations } = updateResult;

    if (!associatedMannerEstimations.length) {
      return {
        MannerFarm: updatedMannerFarm,
        UpdatedMannerEstimationID: null,
        BackgroundQueuedMannerEstimationIDs: [],
      };
    }

    let synchronouslyUpdatedMannerEstimation = null;
    const backgroundMannerEstimations = [];

    if (requestedMannerEstimationId) {
      const mannerEstimationToWaitFor = associatedMannerEstimations.find(
        (mannerEstimation) =>
          mannerEstimation.ID === Number(requestedMannerEstimationId),
      );

      if (!mannerEstimationToWaitFor) {
        throw new Error(
          "Provided MannerEstimationID does not belong to this MannerFarm",
        );
      }

      const updatedMannerEstimationResponse =
        await this.mannerEstimationsService.updateMannerEstimationWithApplications(
          {
            MannerEstimation: mannerEstimationToWaitFor,
          },
          userId,
          request,
        );

      synchronouslyUpdatedMannerEstimation =
        updatedMannerEstimationResponse?.MannerEstimation ?? null;

      for (const mannerEstimation of associatedMannerEstimations) {
        if (mannerEstimation.ID !== mannerEstimationToWaitFor.ID) {
          backgroundMannerEstimations.push(mannerEstimation);
        }
      }
    } else {
      backgroundMannerEstimations.push(...associatedMannerEstimations);
    }

    const backgroundRequestContext = createBackgroundRequestContext(request);
    const queuedMannerEstimationIds = [];

    for (const mannerEstimation of backgroundMannerEstimations) {
      const isQueued = mannerFarmEstimateRefreshQueue.enqueue({
        mannerEstimation,
        userId,
        request: backgroundRequestContext,
      });

      if (isQueued) {
        queuedMannerEstimationIds.push(mannerEstimation.ID);
      }
    }

    return {
      MannerFarm: updatedMannerFarm,
      UpdatedMannerEstimationID:
        synchronouslyUpdatedMannerEstimation?.ID ?? null,
      UpdatedMannerEstimation: synchronouslyUpdatedMannerEstimation,
      BackgroundQueuedMannerEstimationIDs: queuedMannerEstimationIds,
    };
  }
}

module.exports = { MannerFarmsService };
