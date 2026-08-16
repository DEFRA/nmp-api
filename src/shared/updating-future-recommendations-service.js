const { MoreThan, In } = require("typeorm");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  InprogressCalculationsEntity,
} = require("../db/entity/inprogress-calculations-entity");
const {
  GenerateRecommendations,
} = require("./generate-recomendations-service");
const { AppDataSource } = require("../db/data-source");
const {
  runWithDeadlockRetry,
  isDeadlockError,
} = require("../db/transactionRetry");
const { BackgroundJobQueue } = require("./background-job-queue");

const parsedQueueConcurrency = Number.parseInt(
  process.env.FUTURE_RECOMMENDATION_MAX_CONCURRENCY,
  10,
);
const MAX_CONCURRENT_JOBS = Number.isFinite(parsedQueueConcurrency)
  ? Math.max(1, parsedQueueConcurrency)
  : 1;

const parsedDeadlockRetries = Number.parseInt(
  process.env.FUTURE_RECOMMENDATION_DEADLOCK_RETRIES,
  10,
);
const FUTURE_RECOMMENDATION_DEADLOCK_RETRIES = Number.isFinite(
  parsedDeadlockRetries,
)
  ? Math.max(0, parsedDeadlockRetries)
  : 4;

const parsedDeadlockDelayMs = Number.parseInt(
  process.env.FUTURE_RECOMMENDATION_DEADLOCK_DELAY_MS,
  10,
);
const minFutureRecommendationDeadlockDelayMs = 50;
const defaultFutureRecommendationDeadlockDelayMs = 150;
const FUTURE_RECOMMENDATION_DEADLOCK_DELAY_MS = Number.isFinite(
  parsedDeadlockDelayMs,
)
  ? Math.max(minFutureRecommendationDeadlockDelayMs, parsedDeadlockDelayMs)
  : defaultFutureRecommendationDeadlockDelayMs;

const parsedDeadlockJitterMs = Number.parseInt(
  process.env.FUTURE_RECOMMENDATION_DEADLOCK_JITTER_MS,
  10,
);
const FUTURE_RECOMMENDATION_DEADLOCK_JITTER_MS = Number.isFinite(
  parsedDeadlockJitterMs,
)
  ? Math.max(0, parsedDeadlockJitterMs)
  : 100;

const parsedRequeueRetries = Number.parseInt(
  process.env.FUTURE_RECOMMENDATION_REQUEUE_RETRIES,
  10,
);
const FUTURE_RECOMMENDATION_REQUEUE_RETRIES = Number.isFinite(
  parsedRequeueRetries,
)
  ? Math.max(0, parsedRequeueRetries)
  : 2;

const parsedRequeueDelayMs = Number.parseInt(
  process.env.FUTURE_RECOMMENDATION_REQUEUE_DELAY_MS,
  10,
);
const FUTURE_RECOMMENDATION_REQUEUE_DELAY_MS = Number.isFinite(
  parsedRequeueDelayMs,
)
  ? Math.max(100, parsedRequeueDelayMs)
  : 1000;

const parsedLockWaitRetries = Number.parseInt(
  process.env.FUTURE_RECOMMENDATION_LOCK_WAIT_RETRIES,
  10,
);
const FUTURE_RECOMMENDATION_LOCK_WAIT_RETRIES = Number.isFinite(
  parsedLockWaitRetries,
)
  ? Math.max(1, parsedLockWaitRetries)
  : 8;

const parsedLockWaitDelayMs = Number.parseInt(
  process.env.FUTURE_RECOMMENDATION_LOCK_WAIT_DELAY_MS,
  10,
);
const FUTURE_RECOMMENDATION_LOCK_WAIT_DELAY_MS = Number.isFinite(
  parsedLockWaitDelayMs,
)
  ? Math.max(200, parsedLockWaitDelayMs)
  : 1200;

const parsedRetryCooldownMs = Number.parseInt(
  process.env.FUTURE_RECOMMENDATION_RETRY_COOLDOWN_MS,
  10,
);
const FUTURE_RECOMMENDATION_RETRY_COOLDOWN_MS = Number.isFinite(
  parsedRetryCooldownMs,
)
  ? Math.max(5000, parsedRetryCooldownMs)
  : 60000;

const parsedStaleLockRecoveryEnabled =
  process.env.FUTURE_RECOMMENDATION_STALE_LOCK_RECOVERY_ENABLED;
const FUTURE_RECOMMENDATION_STALE_LOCK_RECOVERY_ENABLED =
  parsedStaleLockRecoveryEnabled === undefined
    ? true
    : parsedStaleLockRecoveryEnabled.toLowerCase() === "true";

const parsedStaleLockRecoveryAttempts = Number.parseInt(
  process.env.FUTURE_RECOMMENDATION_STALE_LOCK_RECOVERY_ATTEMPTS,
  10,
);
const FUTURE_RECOMMENDATION_STALE_LOCK_RECOVERY_ATTEMPTS = Number.isFinite(
  parsedStaleLockRecoveryAttempts,
)
  ? Math.max(0, parsedStaleLockRecoveryAttempts)
  : 1;

const parsedStaleLockRecoveryDelayMs = Number.parseInt(
  process.env.FUTURE_RECOMMENDATION_STALE_LOCK_RECOVERY_DELAY_MS,
  10,
);
const FUTURE_RECOMMENDATION_STALE_LOCK_RECOVERY_DELAY_MS = Number.isFinite(
  parsedStaleLockRecoveryDelayMs,
)
  ? Math.max(200, parsedStaleLockRecoveryDelayMs)
  : 1200;

const parsedPurgeStaleInProgressOnQueue =
  process.env.FUTURE_RECOMMENDATION_PURGE_STALE_INPROGRESS_ON_QUEUE;
const FUTURE_RECOMMENDATION_PURGE_STALE_INPROGRESS_ON_QUEUE =
  parsedPurgeStaleInProgressOnQueue === undefined
    ? true
    : parsedPurgeStaleInProgressOnQueue.toLowerCase() === "true";

const createBackgroundRequestContext = (request) => ({
  headers: {
    authorization: request?.headers?.authorization,
  },
});

class UpdatingFutureRecommendations {
  static sharedQueue;

  static generateRecommendations;

  constructor() {
    if (!UpdatingFutureRecommendations.sharedQueue) {
      UpdatingFutureRecommendations.sharedQueue =
        UpdatingFutureRecommendations.createSharedQueue();
    }
  }

  static createSharedQueue() {
    console.log(
      "Future recommendation queue config:",
      JSON.stringify({
        concurrency: MAX_CONCURRENT_JOBS,
        deadlockRetries: FUTURE_RECOMMENDATION_DEADLOCK_RETRIES,
        deadlockDelayMs: FUTURE_RECOMMENDATION_DEADLOCK_DELAY_MS,
        deadlockJitterMs: FUTURE_RECOMMENDATION_DEADLOCK_JITTER_MS,
        requeueRetries: FUTURE_RECOMMENDATION_REQUEUE_RETRIES,
        requeueDelayMs: FUTURE_RECOMMENDATION_REQUEUE_DELAY_MS,
        lockWaitRetries: FUTURE_RECOMMENDATION_LOCK_WAIT_RETRIES,
        lockWaitDelayMs: FUTURE_RECOMMENDATION_LOCK_WAIT_DELAY_MS,
        retryCooldownMs: FUTURE_RECOMMENDATION_RETRY_COOLDOWN_MS,
        staleLockRecoveryEnabled:
          FUTURE_RECOMMENDATION_STALE_LOCK_RECOVERY_ENABLED,
        staleLockRecoveryAttempts:
          FUTURE_RECOMMENDATION_STALE_LOCK_RECOVERY_ATTEMPTS,
        staleLockRecoveryDelayMs:
          FUTURE_RECOMMENDATION_STALE_LOCK_RECOVERY_DELAY_MS,
        purgeStaleInProgressOnQueue:
          FUTURE_RECOMMENDATION_PURGE_STALE_INPROGRESS_ON_QUEUE,
      }),
    );

    return new BackgroundJobQueue({
      concurrency: MAX_CONCURRENT_JOBS,
      getJobKey: (job) => `${job.fieldID}:${job.year}`,
      runJob: (job) =>
        UpdatingFutureRecommendations.processQueuedRecommendationUpdate(job),
      onDuplicate: (job) => {
        console.log(
          `Job already queued or running for FieldID: ${job.fieldID}, Year: ${job.year}`,
        );
      },
      onSuccess: (job) => {
        console.log(
          `Successfully processed FieldID: ${job.fieldID}, Year: ${job.year}`,
        );
      },
      onError: (job, error) => {
        console.error(
          `Error processing FieldID: ${job.fieldID}, Year: ${job.year}:`,
          error,
        );
      },
    });
  }

  static getGenerateRecommendationsService() {
    if (!UpdatingFutureRecommendations.generateRecommendations) {
      UpdatingFutureRecommendations.generateRecommendations =
        new GenerateRecommendations();
    }

    return UpdatingFutureRecommendations.generateRecommendations;
  }

  async getYearsGreaterThanGivenYear(fieldID, year) {
    const years = await AppDataSource.manager.find(CropEntity, {
      where: {
        FieldID: fieldID,
        Year: MoreThan(year), // Fetch records with Year greater than the provided year
      },
      select: ["Year"],
    });

    // Extract and return unique years
    return years.map((record) => record.Year);
  }

  async updateRecommendationsForField(fieldID, year, request, userId) {
    try {
      // Fetch all years greater than the provided year for the given FieldID.
      const yearsGreaterThanGivenYear = await this.getYearsGreaterThanGivenYear(
        fieldID,
        year,
      );

      const uniqueYears = [...new Set([year, ...yearsGreaterThanGivenYear])]
        .map(Number)
        .filter((item) => Number.isFinite(item))
        .sort((a, b) => a - b);

      await this.releaseStaleInProgressRowsForYears(fieldID, uniqueYears);
      this.processYearsInBackground(fieldID, uniqueYears, request, userId);
    } catch (error) {
      console.error(
        `Error queueing recommendation updates for FieldID: ${fieldID}, Year: ${year}`,
        error,
      );
    }
  }

  async releaseStaleInProgressRowsForYears(fieldID, years) {
    if (
      !FUTURE_RECOMMENDATION_PURGE_STALE_INPROGRESS_ON_QUEUE ||
      !Array.isArray(years) ||
      years.length === 0
    ) {
      return;
    }

    await runWithDeadlockRetry(
      async () => {
        const existingRows = await AppDataSource.manager.find(
          InprogressCalculationsEntity,
          {
            where: {
              FieldID: fieldID,
              Year: In(years),
            },
            select: ["FieldID", "Year"],
          },
        );

        if (!existingRows.length) {
          return;
        }

        const staleYears = existingRows
          .map((row) => Number(row.Year))
          .filter((rowYear) => Number.isFinite(rowYear))
          .filter((rowYear) => {
            const jobKey = `${fieldID}:${rowYear}`;
            return !UpdatingFutureRecommendations.sharedQueue.hasJobKey(jobKey);
          });

        if (!staleYears.length) {
          return;
        }

        await AppDataSource.manager.delete(InprogressCalculationsEntity, {
          FieldID: fieldID,
          Year: In(staleYears),
        });

        console.warn(
          `Cleared stale in-progress rows for FieldID: ${fieldID}, Years: ${staleYears.join(",")}`,
        );
      },
      {
        retries: FUTURE_RECOMMENDATION_DEADLOCK_RETRIES,
        delayMs: FUTURE_RECOMMENDATION_DEADLOCK_DELAY_MS,
        backoffMultiplier: 2,
        jitterMs: FUTURE_RECOMMENDATION_DEADLOCK_JITTER_MS,
        operationName: "future-recommendation-purge-stale-inprogress",
      },
    );
  }

  processYearsInBackground(fieldID, years, request, userId) {
    if (!Array.isArray(years) || years.length === 0) {
      console.log("No years greater than the given year were found.");
      return;
    }

    console.log(
      "Queueing the following years for background processing:",
      years,
    );

    const jobs = years.map((yearToQueue) => ({
      fieldID,
      year: yearToQueue,
      request: createBackgroundRequestContext(request),
      userId,
      requeueAttempt: 0,
      lockWaitAttempt: 0,
      staleLockRecoveryAttempt: 0,
    }));

    UpdatingFutureRecommendations.sharedQueue.enqueueMany(jobs);
  }

  static async markInProgress(fieldID, year, transactionalManager) {
    const duplicateKeyErrorNumber = 2627,
      uniqueConstraintErrorNumber = 2601;
    try {
      await transactionalManager.insert(InprogressCalculationsEntity, {
        FieldID: fieldID,
        Year: year,
      });
      return true;
    } catch (error) {
      // SQL Server duplicate key violation means another worker already owns this job.
      const driverNumber = error?.driverError?.number ?? error?.number;
      if (
        driverNumber === duplicateKeyErrorNumber ||
        driverNumber === uniqueConstraintErrorNumber
      ) {
        return false;
      }

      throw error;
    }
  }

  static async clearInProgress(fieldID, year) {
    return runWithDeadlockRetry(
      () =>
        AppDataSource.manager.delete(InprogressCalculationsEntity, {
          FieldID: fieldID,
          Year: year,
        }),
      {
        retries: FUTURE_RECOMMENDATION_DEADLOCK_RETRIES,
        delayMs: FUTURE_RECOMMENDATION_DEADLOCK_DELAY_MS,
        backoffMultiplier: 2,
        jitterMs: FUTURE_RECOMMENDATION_DEADLOCK_JITTER_MS,
        operationName: "future-recommendation-clear-in-progress",
      },
    );
  }

  static async acquireInProgressSlot(fieldID, year) {
    return runWithDeadlockRetry(
      () =>
        UpdatingFutureRecommendations.markInProgress(
          fieldID,
          year,
          AppDataSource.manager,
        ),
      {
        retries: FUTURE_RECOMMENDATION_DEADLOCK_RETRIES,
        delayMs: FUTURE_RECOMMENDATION_DEADLOCK_DELAY_MS,
        backoffMultiplier: 2,
        jitterMs: FUTURE_RECOMMENDATION_DEADLOCK_JITTER_MS,
        operationName: "future-recommendation-acquire-in-progress",
      },
    );
  }

  static scheduleJobWithDelay(job, delayMs) {
    setTimeout(() => {
      UpdatingFutureRecommendations.sharedQueue.enqueue(job);
    }, delayMs);
  }

  static async handleLockContention(job, fieldID, year) {
    const lockWaitAttempt = Number.isFinite(job?.lockWaitAttempt)
      ? job.lockWaitAttempt
      : 0;

    if (lockWaitAttempt < FUTURE_RECOMMENDATION_LOCK_WAIT_RETRIES) {
      const nextLockWaitAttempt = lockWaitAttempt + 1;
      const waitDelay =
        FUTURE_RECOMMENDATION_LOCK_WAIT_DELAY_MS * Math.pow(2, lockWaitAttempt);

      console.warn(
        `FieldID: ${fieldID}, Year: ${year} is already in progress. Requeueing lock-wait attempt ${nextLockWaitAttempt}/${FUTURE_RECOMMENDATION_LOCK_WAIT_RETRIES} in ${waitDelay}ms.`,
      );

      UpdatingFutureRecommendations.scheduleJobWithDelay(
        {
          ...job,
          lockWaitAttempt: nextLockWaitAttempt,
        },
        waitDelay,
      );

      return;
    }

    const staleLockRecoveryAttempt = Number.isFinite(
      job?.staleLockRecoveryAttempt,
    )
      ? job.staleLockRecoveryAttempt
      : 0;

    if (
      FUTURE_RECOMMENDATION_STALE_LOCK_RECOVERY_ENABLED &&
      staleLockRecoveryAttempt <
        FUTURE_RECOMMENDATION_STALE_LOCK_RECOVERY_ATTEMPTS
    ) {
      const nextStaleLockRecoveryAttempt = staleLockRecoveryAttempt + 1;

      console.warn(
        `FieldID: ${fieldID}, Year: ${year} appears stuck in-progress after ${lockWaitAttempt} lock retries. Attempting stale lock recovery ${nextStaleLockRecoveryAttempt}/${FUTURE_RECOMMENDATION_STALE_LOCK_RECOVERY_ATTEMPTS}.`,
      );

      try {
        await UpdatingFutureRecommendations.clearInProgress(fieldID, year);
      } catch (cleanupError) {
        console.error(
          `Error clearing stale in-progress lock for FieldID: ${fieldID}, Year: ${year}`,
          cleanupError,
        );
      }

      UpdatingFutureRecommendations.scheduleJobWithDelay(
        {
          ...job,
          lockWaitAttempt: 0,
          staleLockRecoveryAttempt: nextStaleLockRecoveryAttempt,
        },
        FUTURE_RECOMMENDATION_STALE_LOCK_RECOVERY_DELAY_MS,
      );
      return;
    }

    console.warn(
      `FieldID: ${fieldID}, Year: ${year} remained locked after ${lockWaitAttempt} retries. Requeueing in cooldown ${FUTURE_RECOMMENDATION_RETRY_COOLDOWN_MS}ms.`,
    );

    UpdatingFutureRecommendations.scheduleJobWithDelay(
      {
        ...job,
        lockWaitAttempt: 0,
        staleLockRecoveryAttempt,
      },
      FUTURE_RECOMMENDATION_RETRY_COOLDOWN_MS,
    );
  }

  static handleDeadlockRequeue(job, fieldID, year, error) {
    const requeueAttempt = Number.isFinite(job?.requeueAttempt)
      ? job.requeueAttempt
      : 0;

    if (requeueAttempt < FUTURE_RECOMMENDATION_REQUEUE_RETRIES) {
      const nextAttempt = requeueAttempt + 1;
      const retryDelay =
        FUTURE_RECOMMENDATION_REQUEUE_DELAY_MS * Math.pow(2, requeueAttempt);

      console.warn(
        `Deadlock persisted for FieldID: ${fieldID}, Year: ${year}. Requeueing attempt ${nextAttempt}/${FUTURE_RECOMMENDATION_REQUEUE_RETRIES} in ${retryDelay}ms.`,
      );

      UpdatingFutureRecommendations.scheduleJobWithDelay(
        {
          ...job,
          requeueAttempt: nextAttempt,
          lockWaitAttempt: 0,
          staleLockRecoveryAttempt: 0,
        },
        retryDelay,
      );
      return;
    }

    console.error(
      `Deadlock persisted for FieldID: ${fieldID}, Year: ${year} after ${requeueAttempt} requeue attempts. Requeueing in cooldown ${FUTURE_RECOMMENDATION_RETRY_COOLDOWN_MS}ms.`,
      error,
    );

    UpdatingFutureRecommendations.scheduleJobWithDelay(
      {
        ...job,
        requeueAttempt: 0,
        lockWaitAttempt: 0,
        staleLockRecoveryAttempt: 0,
      },
      FUTURE_RECOMMENDATION_RETRY_COOLDOWN_MS,
    );
  }

  static async processQueuedRecommendationUpdate(job) {
    const { fieldID, year, request, userId } = job;
    let lockAcquired = false;

    try {
      lockAcquired = await UpdatingFutureRecommendations.acquireInProgressSlot(
        fieldID,
        year,
      );
      if (!lockAcquired) {
        await UpdatingFutureRecommendations.handleLockContention(
          job,
          fieldID,
          year,
        );
        return;
      }
      console.log(`Saved entry for FieldID: ${fieldID}, Year: ${year}`);
      const newOrganicManure = null;
      await runWithDeadlockRetry(
        () =>
          UpdatingFutureRecommendations.getGenerateRecommendationsService().generateRecommendations(
            fieldID,
            year,
            newOrganicManure,
            AppDataSource.manager,
            request,
            userId,
          ),
        {
          retries: FUTURE_RECOMMENDATION_DEADLOCK_RETRIES,
          delayMs: FUTURE_RECOMMENDATION_DEADLOCK_DELAY_MS,
          backoffMultiplier: 2,
          jitterMs: FUTURE_RECOMMENDATION_DEADLOCK_JITTER_MS,
          operationName: "future-recommendation-generate",
        },
      );
    } catch (error) {
      if (isDeadlockError(error)) {
        UpdatingFutureRecommendations.handleDeadlockRequeue(
          job,
          fieldID,
          year,
          error,
        );
        return;
      }

      throw error;
    } finally {
      if (lockAcquired) {
        try {
          await UpdatingFutureRecommendations.clearInProgress(fieldID, year);
          console.log(`Deleted entry for FieldID: ${fieldID}, Year: ${year}`);
        } catch (cleanupError) {
          console.error(
            `Error cleaning up in-progress entry for FieldID: ${fieldID}, Year: ${year}`,
            cleanupError,
          );
        }
      }
    }
  }
}

module.exports = { UpdatingFutureRecommendations };
