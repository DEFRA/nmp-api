const { MoreThan } = require("typeorm");
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
const FUTURE_RECOMMENDATION_DEADLOCK_DELAY_MS = Number.isFinite(
  parsedDeadlockDelayMs,
)
  ? Math.max(50, parsedDeadlockDelayMs)
  : 150;

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
      this.processYearsInBackground(fieldID, uniqueYears, request, userId);
    } catch (error) {
      console.error(
        `Error queueing recommendation updates for FieldID: ${fieldID}, Year: ${year}`,
        error,
      );
    }
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
    }));

    UpdatingFutureRecommendations.sharedQueue.enqueueMany(jobs);
  }

  static async markInProgress(fieldID, year, transactionalManager) {
    try {
      await transactionalManager.insert(InprogressCalculationsEntity, {
        FieldID: fieldID,
        Year: year,
      });
      return true;
    } catch (error) {
      // SQL Server duplicate key violation means another worker already owns this job.
      const driverNumber = error?.driverError?.number ?? error?.number;
      if (driverNumber === 2627 || driverNumber === 2601) {
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

  static async processQueuedRecommendationUpdate(job) {
    const { fieldID, year, request, userId } = job;
    let lockAcquired = false;

    try {
      lockAcquired = await UpdatingFutureRecommendations.acquireInProgressSlot(
        fieldID,
        year,
      );

      if (!lockAcquired) {
        console.log(
          `Skipping processing for FieldID: ${fieldID}, Year: ${year} because it is already in progress.`,
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
      const requeueAttempt = Number.isFinite(job?.requeueAttempt)
        ? job.requeueAttempt
        : 0;

      if (
        isDeadlockError(error) &&
        requeueAttempt < FUTURE_RECOMMENDATION_REQUEUE_RETRIES
      ) {
        const nextAttempt = requeueAttempt + 1;
        const retryDelay =
          FUTURE_RECOMMENDATION_REQUEUE_DELAY_MS * Math.pow(2, requeueAttempt);

        console.warn(
          `Deadlock persisted for FieldID: ${fieldID}, Year: ${year}. Requeueing attempt ${nextAttempt}/${FUTURE_RECOMMENDATION_REQUEUE_RETRIES} in ${retryDelay}ms.`,
        );

        setTimeout(() => {
          UpdatingFutureRecommendations.sharedQueue.enqueue({
            ...job,
            requeueAttempt: nextAttempt,
          });
        }, retryDelay);

        return;
      }

      if (isDeadlockError(error)) {
        console.error(
          `Deadlock persisted for FieldID: ${fieldID}, Year: ${year} after ${requeueAttempt} requeue attempts. Skipping this background cycle to keep service healthy.`,
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
