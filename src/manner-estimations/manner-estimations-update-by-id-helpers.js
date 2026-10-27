const { AppDataSource } = require("../db/data-source");
const {
  MannerEstimationsEntity,
} = require("../db/entity/manner-estimations.entity");
const {
  MannerEstimationApplicationsEntity,
} = require("../db/entity/manner-estimation-applications.entity");
const { MannerFarmsEntity } = require("../db/entity/manner-farms.entity");

const ERROR_MESSAGES = {
  MANNER_ESTIMATION_ID_REQUIRED: "MannerEstimation ID is required",
  INVALID_MANNER_ESTIMATION_ID: "Invalid MannerEstimation ID",
  MANNER_ESTIMATION_NOT_FOUND: "Manner estimation not found",
  APPLICATIONS_REQUIRED:
    "MannerEstimationApplications must contain at least one application",
  APPLICATION_ID_REQUIRED: "MannerEstimationApplication ID is required",
  INVALID_APPLICATION_ID: "Invalid MannerEstimationApplication ID",
  APPLICATION_NOT_FOUND: "Manner estimation application not found",
  APPLICATION_NOT_BELONGING:
    "Manner estimation application does not belong to the specified MannerEstimation",
};

const mannerEstimationsUpdateByIdHelpers = {
  async updateMannerEstimationAndApplicationsById(payload, userId, request) {
    this.validateUpdateMannerEstimationAndApplicationsByIdPayload(payload);

    const { MannerEstimation, MannerEstimationApplications } = payload;
    const mannerEstimationId = MannerEstimation.ID;

    return AppDataSource.transaction(async (transactionalManager) => {
      await this.getMannerEstimationForUpdateById(
        transactionalManager,
        mannerEstimationId,
      );

      const mannerFarm = await this.getMannerFarmForUpdateById(
        transactionalManager,
        MannerEstimation.MannerFarmID,
      );

      const updatedApplications =
        await this.updateMannerEstimationApplicationsById(
          transactionalManager,
          mannerEstimationId,
          MannerEstimation,
          MannerEstimationApplications,
          mannerFarm,
          userId,
          request,
        );

      const mannerEstimationFinancialValues =
        await this.getMannerEstimationFinancialValuesForUpdate(
          mannerFarm,
          MannerEstimation,
          updatedApplications[0],
          request,
        );

      await this.updateMannerEstimationEntityForUpdate(
        transactionalManager,
        MannerEstimation,
        mannerEstimationId,
        mannerEstimationFinancialValues,
        userId,
      );

      return this.buildUpdatedMannerEstimationPayload(
        transactionalManager,
        mannerEstimationId,
        updatedApplications,
      );
    });
  },

  validateUpdateMannerEstimationAndApplicationsByIdPayload(payload) {
    const mannerEstimationId = payload?.MannerEstimation?.ID;
    if (mannerEstimationId == null) {
      throw new Error(ERROR_MESSAGES.MANNER_ESTIMATION_ID_REQUIRED);
    }
    if (!Number.isInteger(mannerEstimationId) || mannerEstimationId <= 0) {
      throw new Error(ERROR_MESSAGES.INVALID_MANNER_ESTIMATION_ID);
    }

    const applications = payload?.MannerEstimationApplications;
    if (!Array.isArray(applications) || applications.length === 0) {
      throw new Error(ERROR_MESSAGES.APPLICATIONS_REQUIRED);
    }

    for (const application of applications) {
      this.validateApplicationIdForUpdateById(application?.ID);
    }
  },

  validateApplicationIdForUpdateById(applicationId) {
    if (applicationId == null) {
      throw new Error(ERROR_MESSAGES.APPLICATION_ID_REQUIRED);
    }
    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      throw new Error(ERROR_MESSAGES.INVALID_APPLICATION_ID);
    }
  },

  async getMannerEstimationForUpdateById(
    transactionalManager,
    mannerEstimationId,
  ) {
    const mannerEstimation = await transactionalManager.findOne(
      MannerEstimationsEntity,
      {
        where: { ID: mannerEstimationId },
      },
    );

    if (!mannerEstimation) {
      throw new Error(ERROR_MESSAGES.MANNER_ESTIMATION_NOT_FOUND);
    }

    return mannerEstimation;
  },

  async getMannerFarmForUpdateById(transactionalManager, mannerFarmId) {
    const mannerFarm = await transactionalManager.findOne(MannerFarmsEntity, {
      where: { ID: mannerFarmId },
    });

    if (!mannerFarm) {
      throw new Error(ERROR_MESSAGES.MANNER_ESTIMATION_NOT_FOUND);
    }

    return mannerFarm;
  },

  async updateMannerEstimationApplicationsById(
    transactionalManager,
    mannerEstimationId,
    mannerEstimation,
    applications,
    mannerFarm,
    userId,
    request,
  ) {
    const updatedApplications = [];

    for (const application of applications) {
      const updatedApplication = await this.updateSingleApplicationById(
        transactionalManager,
        mannerEstimationId,
        mannerEstimation,
        application,
        mannerFarm,
        userId,
        request,
      );
      updatedApplications.push(updatedApplication);
    }

    return updatedApplications;
  },

  async updateSingleApplicationById(
    transactionalManager,
    mannerEstimationId,
    mannerEstimation,
    application,
    mannerFarm,
    userId,
    request,
  ) {
    const sourceApplication = await this.getApplicationForUpdateById(
      transactionalManager,
      application.ID,
    );

    this.validateApplicationOwnershipForUpdateById(
      sourceApplication,
      mannerEstimationId,
    );

    const applicationToUpdate = {
      ...sourceApplication,
      ...application,
      MannerEstimationID: mannerEstimationId,
    };

    const applicationDateValues = this.setApplicationDateBasedOnSowingDate(
      mannerEstimation,
      applicationToUpdate,
    );

    const mappedMannerEstimationApplication =
      await this.getMappedMannerEstimationApplication(
        mannerFarm,
        mannerEstimation,
        applicationToUpdate,
        request,
      );

    const nutrientFinancialValues =
      await this.calculateNutrientFinancialValuesByNutrientIdForUpdate(
        mannerEstimation,
        mappedMannerEstimationApplication,
        request,
      );

    const mannerEstimationApplicationFinancialValues =
      this.buildMannerEstimationApplicationFinancialValues(
        nutrientFinancialValues,
      );

    const {
      ID: applicationId,
      EndOfDrain,
      Rainfall,
      ...applicationDataToUpdate
    } = mappedMannerEstimationApplication;

    const updatedApplicationResult = await transactionalManager.update(
      MannerEstimationApplicationsEntity,
      { ID: applicationId, MannerEstimationID: mannerEstimationId },
      {
        ...applicationDataToUpdate,
        ...mannerEstimationApplicationFinancialValues,
        ...applicationDateValues,
        ModifiedByID: userId,
        ModifiedOn: new Date(),
      },
    );

    if (updatedApplicationResult.affected !== 1) {
      throw new Error(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
    }

    return transactionalManager.findOneBy(MannerEstimationApplicationsEntity, {
      ID: applicationId,
      MannerEstimationID: mannerEstimationId,
    });
  },

  async getApplicationForUpdateById(transactionalManager, applicationId) {
    const application = await transactionalManager.findOne(
      MannerEstimationApplicationsEntity,
      {
        where: { ID: applicationId },
      },
    );

    if (!application) {
      throw new Error(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
    }

    return application;
  },

  validateApplicationOwnershipForUpdateById(application, mannerEstimationId) {
    if (application.MannerEstimationID !== mannerEstimationId) {
      throw new Error(ERROR_MESSAGES.APPLICATION_NOT_BELONGING);
    }
  },
};

module.exports = { mannerEstimationsUpdateByIdHelpers };
