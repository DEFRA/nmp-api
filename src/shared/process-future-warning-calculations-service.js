const { AppDataSource } = require("../db/data-source");
const {
  runWithDeadlockRetry,
  isDeadlockError,
} = require("../db/transactionRetry");
const {
  CalculateFutureWarningMessageService,
} = require("./calculate-warning-messages-future-years");
const {
  CreateOrUpdateWarningMessage,
} = require("./create-update-warning-messages.service");
const { BackgroundJobQueue } = require("./background-job-queue");

const parsedWarningDeadlockRetries = Number.parseInt(
  process.env.WARNING_DEADLOCK_RETRIES,
  10,
);
const WARNING_DEADLOCK_RETRIES = Number.isFinite(parsedWarningDeadlockRetries)
  ? Math.max(0, parsedWarningDeadlockRetries)
  : 4;

const parsedWarningDeadlockDelayMs = Number.parseInt(
  process.env.WARNING_DEADLOCK_DELAY_MS,
  10,
);
const MIN_WARNING_DEADLOCK_DELAY_MS = 50;
const DEFAULT_WARNING_DEADLOCK_DELAY_MS = 150;
const WARNING_DEADLOCK_DELAY_MS = Number.isFinite(parsedWarningDeadlockDelayMs)
  ? Math.max(MIN_WARNING_DEADLOCK_DELAY_MS, parsedWarningDeadlockDelayMs)
  : DEFAULT_WARNING_DEADLOCK_DELAY_MS;

const parsedWarningDeadlockJitterMs = Number.parseInt(
  process.env.WARNING_DEADLOCK_JITTER_MS,
  10,
);
const WARNING_DEADLOCK_JITTER_MS = Number.isFinite(
  parsedWarningDeadlockJitterMs,
)
  ? Math.max(0, parsedWarningDeadlockJitterMs)
  : 100;

const parsedWarningQueueConcurrency = Number.parseInt(
  process.env.WARNING_BACKGROUND_MAX_CONCURRENCY,
  10,
);
const WARNING_BACKGROUND_MAX_CONCURRENCY = Number.isFinite(
  parsedWarningQueueConcurrency,
)
  ? Math.max(1, parsedWarningQueueConcurrency)
  : 1;

const WARNING_OPERATIONS = {
  FUTURE_MANURES: "warnings-future-manures",
  BY_FIELD: "warnings-by-field",
  BY_FARM: "warnings-by-farm",
  BY_CROP: "warnings-by-crop",
};

class ProcessFutureManuresForWarnings {
  static sharedQueue;

  constructor() {
    this.CreateOrUpdateWarningMessage = new CreateOrUpdateWarningMessage();
    this.CalculateFutureWarningMessageService =
      new CalculateFutureWarningMessageService();

    if (!ProcessFutureManuresForWarnings.sharedQueue) {
      ProcessFutureManuresForWarnings.sharedQueue =
        ProcessFutureManuresForWarnings.createSharedQueue(this);
    }
  }

  static createSharedQueue(instance) {
    console.log(
      "Warning background queue config:",
      JSON.stringify({
        concurrency: WARNING_BACKGROUND_MAX_CONCURRENCY,
        deadlockRetries: WARNING_DEADLOCK_RETRIES,
        deadlockDelayMs: WARNING_DEADLOCK_DELAY_MS,
        deadlockJitterMs: WARNING_DEADLOCK_JITTER_MS,
      }),
    );

    return new BackgroundJobQueue({
      concurrency: WARNING_BACKGROUND_MAX_CONCURRENCY,
      getJobKey: (job) => job.jobKey,
      runJob: (job) => instance.executeQueuedWarningJob(job),
      onDuplicate: (job) => {
        console.log(`Warning job already queued or running: ${job.jobKey}`);
      },
      onError: (job, error) => {
        console.error(`Warning job failed: ${job.jobKey}`, error);
      },
    });
  }

  enqueueWarningJob(job) {
    ProcessFutureManuresForWarnings.sharedQueue.enqueue(job);
    return true;
  }

  async executeQueuedWarningJob(job) {
    const { operationName, payload } = job;

    switch (operationName) {
      case WARNING_OPERATIONS.FUTURE_MANURES:
        return this.executeProcessFutureManures(payload);
      case WARNING_OPERATIONS.BY_FIELD:
        return this.executeProcessWarningsByField(payload);
      case WARNING_OPERATIONS.BY_FARM:
        return this.executeProcessWarningsByFarm(payload);
      case WARNING_OPERATIONS.BY_CROP:
        return this.executeProcessWarningsByCrop(payload);
      default:
        console.warn(`Unsupported warning job: ${operationName}`);
        return null;
    }
  }

  async executeWarningWithDeadlockHandling(operationName, fn) {
    try {
      return await runWithDeadlockRetry(fn, {
        retries: WARNING_DEADLOCK_RETRIES,
        delayMs: WARNING_DEADLOCK_DELAY_MS,
        backoffMultiplier: 2,
        jitterMs: WARNING_DEADLOCK_JITTER_MS,
        operationName,
      });
    } catch (error) {
      if (isDeadlockError(error)) {
        console.error(
          `Deadlock persisted in ${operationName}. Skipping this warning recalculation cycle to keep service healthy.`,
          error,
        );
        return null;
      }

      throw error;
    }
  }

  async processCombinedManures(combinedManures, transactionalManager, userId) {
    if (!Array.isArray(combinedManures) || !combinedManures.length) {
      return;
    }

    for (const manure of combinedManures) {
      let warnings = [];
      const finalWarnings = [];

      if (manure.IsFertiliserManure && manure.N > 0) {
        warnings =
          await this.CalculateFutureWarningMessageService.calculateFertiliserWarningMessage(
            transactionalManager,
            manure,
          );
      }

      if (manure.IsOrganicManure && manure.N > 0) {
        warnings =
          await this.CalculateFutureWarningMessageService.calculateOrganicManureWarningMessage(
            transactionalManager,
            manure,
          );
      }

      if (Array.isArray(warnings)) {
        finalWarnings.push(...warnings);
      }

      await this.CreateOrUpdateWarningMessage.syncWarningMessages(
        manure.ManagementPeriodID,
        manure,
        finalWarnings,
        transactionalManager,
        userId,
      );
    }
  }

  async processCombinedManuresForNMax(
    combinedManures,
    transactionalManager,
    userId,
  ) {
    if (!Array.isArray(combinedManures) || !combinedManures.length) {
      return;
    }

    for (const manure of combinedManures) {
      let warnings = [];
      const finalWarnings = [];
      warnings =
        await this.CalculateFutureWarningMessageService.calculateOnlyNMaxMessage(
          transactionalManager,
          manure,
        );

      if (Array.isArray(warnings)) {
        finalWarnings.push(...warnings);
      }

      await this.CreateOrUpdateWarningMessage.syncWarningMessages(
        manure.ManagementPeriodID,
        manure,
        finalWarnings,
        transactionalManager,
        userId,
      );
    }
  }

  async processFutureManures(
    fieldId,
    applicationDate,
    isCurrentOrganicManure,
    isCurrentFertiliser,
    excludeId,
    userId,
  ) {
    return this.enqueueWarningJob({
      operationName: WARNING_OPERATIONS.FUTURE_MANURES,
      jobKey: `${WARNING_OPERATIONS.FUTURE_MANURES}:${fieldId}:${applicationDate}:${excludeId}`,
      payload: {
        fieldId,
        applicationDate,
        isCurrentOrganicManure,
        isCurrentFertiliser,
        excludeId,
        userId,
      },
    });
  }

  async executeProcessFutureManures({
    fieldId,
    applicationDate,
    isCurrentOrganicManure,
    isCurrentFertiliser,
    excludeId,
    userId,
  }) {
    return this.executeWarningWithDeadlockHandling(
      WARNING_OPERATIONS.FUTURE_MANURES,
      () =>
        AppDataSource.transaction(async (transactionalManager) => {
          const combinedManures = await transactionalManager.query(
            `EXEC spWarning_GetAllManuresByField
         @FieldID = @0,
         @ApplicationDate = @1,
         @IsCurrentOrganicManure = @2,
         @IsCurrentFertiliser = @3,
         @ExcludeID = @4`,
            [
              fieldId,
              applicationDate,
              isCurrentOrganicManure ? 1 : 0,
              isCurrentFertiliser ? 1 : 0,
              excludeId,
            ],
          );

          await this.processCombinedManures(
            combinedManures,
            transactionalManager,
            userId,
          );
        }),
    );
  }

  /* ============== FIELD-LEVEL PROCESSING ================================ */
  async processWarningsByField(fieldId, userId) {
    return this.enqueueWarningJob({
      operationName: WARNING_OPERATIONS.BY_FIELD,
      jobKey: `${WARNING_OPERATIONS.BY_FIELD}:${fieldId}`,
      payload: { fieldId, userId },
    });
  }

  async executeProcessWarningsByField({ fieldId, userId }) {
    return this.executeWarningWithDeadlockHandling(
      WARNING_OPERATIONS.BY_FIELD,
      () =>
        AppDataSource.transaction(async (transactionalManager) => {
          const combinedManures = await transactionalManager.query(
            `EXEC spWarning_GetAllManuresByFieldOnly @FieldID = @0`,
            [fieldId],
          );

          await this.processCombinedManures(
            combinedManures,
            transactionalManager,
            userId,
          );
        }),
    );
  }

  /* =====================FARM-LEVEL PROCESSING ========================== */
  async processWarningsByFarm(farmId, userId) {
    return this.enqueueWarningJob({
      operationName: WARNING_OPERATIONS.BY_FARM,
      jobKey: `${WARNING_OPERATIONS.BY_FARM}:${farmId}`,
      payload: { farmId, userId },
    });
  }

  async executeProcessWarningsByFarm({ farmId, userId }) {
    return this.executeWarningWithDeadlockHandling(
      WARNING_OPERATIONS.BY_FARM,
      () =>
        AppDataSource.transaction(async (transactionalManager) => {
          const combinedManures = await transactionalManager.query(
            `EXEC spWarning_GetAllManuresByFarm @FarmID = @0`,
            [farmId],
          );

          await this.processCombinedManures(
            combinedManures,
            transactionalManager,
            userId,
          );
        }),
    );
  }

  /* ==================CROP-LEVEL PROCESSING ====================== */
  async processWarningsByCrop(cropId, userId) {
    return this.enqueueWarningJob({
      operationName: WARNING_OPERATIONS.BY_CROP,
      jobKey: `${WARNING_OPERATIONS.BY_CROP}:${cropId}`,
      payload: { cropId, userId },
    });
  }

  async executeProcessWarningsByCrop({ cropId, userId }) {
    return this.executeWarningWithDeadlockHandling(
      WARNING_OPERATIONS.BY_CROP,
      () =>
        AppDataSource.transaction(async (transactionalManager) => {
          const combinedManures = await transactionalManager.query(
            `EXEC spWarning_GetAllManuresByCrop @CropID = @0`,
            [cropId],
          );
          console.log("combinedManuresbycrops", combinedManures);

          await this.processCombinedManures(
            combinedManures,
            transactionalManager,
            userId,
          );
        }),
    );
  }

  async processNMaxWarningsByCrop(cropId, userId, transactionalManager) {
    return this.executeWarningWithDeadlockHandling(
      "warnings-nmax-by-crop",
      async () => {
        const combinedManures = await transactionalManager.query(
          `EXEC spWarning_GetAllManuresByCrop @CropID = @0`,
          [cropId],
        );

        console.log("combinedManuresbycrops", combinedManures);

        await this.processCombinedManuresForNMax(
          combinedManures,
          transactionalManager,
          userId,
        );
      },
    );
  }
}

module.exports = {
  ProcessFutureManuresForWarnings,
};
