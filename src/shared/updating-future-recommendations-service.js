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
const {
  createFutureRecommendationInprogressLock,
} = require("./future-recommendation-inprogress-lock");
const {
  createBackgroundRequestContext,
  createQueue,
  runWithFutureDeadlockRetry,
  handleDeadlockRequeue,
  handleInProgressContention,
} = require("./future-recommendation-background-optimization");

class UpdatingFutureRecommendations {
  static sharedQueue;

  static generateRecommendations;

  static inprogressLockManager;

  constructor() {
    if (!UpdatingFutureRecommendations.sharedQueue) {
      UpdatingFutureRecommendations.sharedQueue =
        UpdatingFutureRecommendations.createSharedQueue();
    }
  }

  static createSharedQueue() {
    return createQueue((job) =>
      UpdatingFutureRecommendations.processQueuedRecommendationUpdate(job),
    );
  }

  static getGenerateRecommendationsService() {
    if (!UpdatingFutureRecommendations.generateRecommendations) {
      UpdatingFutureRecommendations.generateRecommendations =
        new GenerateRecommendations();
    }

    return UpdatingFutureRecommendations.generateRecommendations;
  }

  static getInprogressLockManager() {
    if (!UpdatingFutureRecommendations.inprogressLockManager) {
      UpdatingFutureRecommendations.inprogressLockManager =
        createFutureRecommendationInprogressLock({
          AppDataSource,
          InprogressCalculationsEntity,
          runWithDeadlockRetry,
          runWithFutureDeadlockRetry,
        });
    }

    return UpdatingFutureRecommendations.inprogressLockManager;
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
      lockWaitAttempt: 0,
      staleLockRecoveryAttempt: 0,
    }));

    UpdatingFutureRecommendations.sharedQueue.enqueueMany(jobs);
  }

  static async processQueuedRecommendationUpdate(job) {
    const { fieldID, year, request, userId } = job;
    let lockAcquired = false;
    const lockManager =
      UpdatingFutureRecommendations.getInprogressLockManager();
    try {
      lockAcquired = await lockManager.acquireInProgressSlot(fieldID, year);
      if (!lockAcquired) {
        await handleInProgressContention({
          job,
          fieldID,
          year,
          sharedQueue: UpdatingFutureRecommendations.sharedQueue,
          clearInProgress: lockManager.clearInProgress,
        });
        return;
      }
      console.log(`Saved entry for FieldID: ${fieldID}, Year: ${year}`);
      const newOrganicManure = null;
      await runWithFutureDeadlockRetry(
        runWithDeadlockRetry,
        "future-recommendation-generate",
        () =>
          UpdatingFutureRecommendations.getGenerateRecommendationsService().generateRecommendations(
            fieldID,
            year,
            newOrganicManure,
            AppDataSource.manager,
            request,
            userId,
            {
              source: "future-background-queue",
              isBackground: true,
            },
          ),
      );
    } catch (error) {
      if (
        handleDeadlockRequeue({
          error,
          isDeadlockError,
          job,
          fieldID,
          year,
          sharedQueue: UpdatingFutureRecommendations.sharedQueue,
        })
      ) {
        return;
      }

      throw error;
    } finally {
      if (lockAcquired) {
        try {
          await lockManager.clearInProgress(fieldID, year);
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
