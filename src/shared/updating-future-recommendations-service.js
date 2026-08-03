const { MoreThan } = require("typeorm");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  InprogressCalculationsEntity,
} = require("../db/entity/inprogress-calculations-entity");
const {
  GenerateRecommendations,
} = require("./generate-recomendations-service");
const { AppDataSource } = require("../db/data-source");
const { BackgroundJobQueue } = require("./background-job-queue");

const parsedQueueConcurrency = Number.parseInt(
  process.env.FUTURE_RECOMMENDATION_MAX_CONCURRENCY,
  10,
);
const MAX_CONCURRENT_JOBS = Number.isFinite(parsedQueueConcurrency)
  ? Math.max(1, parsedQueueConcurrency)
  : 2;

const createBackgroundRequestContext = (request) => ({
  headers: {
    authorization: request?.headers?.authorization,
  },
});

class UpdatingFutureRecommendations {
  constructor() {
    this.generateRecommendations = new GenerateRecommendations();
    this.backgroundQueue = new BackgroundJobQueue({
      concurrency: MAX_CONCURRENT_JOBS,
      getJobKey: (job) => `${job.fieldID}:${job.year}`,
      runJob: (job) =>
        this.updateRecommendationAndOrganicManure(
          job.fieldID,
          job.year,
          job.request,
          job.userId,
        ),
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

      const uniqueYears = [...new Set([year, ...yearsGreaterThanGivenYear])];
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
    }));

    this.backgroundQueue.enqueueMany(jobs);
  }

  async markInProgress(fieldID, year, transactionalManager) {
    const existingEntry = await transactionalManager.findOne(
      InprogressCalculationsEntity,
      {
        where: { FieldID: fieldID, Year: year },
      },
    );

    if (existingEntry) {
      return;
    }

    await transactionalManager.save(InprogressCalculationsEntity, {
      FieldID: fieldID,
      Year: year,
    });
  }

  async updateRecommendationAndOrganicManure(fieldID, year, request, userId) {
    return AppDataSource.transaction(async (transactionalManager) => {
      try {
        await this.markInProgress(fieldID, year, transactionalManager);
        console.log(`Saved entry for FieldID: ${fieldID}, Year: ${year}`);

        const newOrganicManure = null;
        await this.generateRecommendations.generateRecommendations(
          fieldID,
          year,
          newOrganicManure,
          transactionalManager,
          request,
          userId,
        );

        await transactionalManager.delete(InprogressCalculationsEntity, {
          FieldID: fieldID,
          Year: year,
        });
        console.log(`Deleted entry for FieldID: ${fieldID}, Year: ${year}`);
      } catch (error) {
        // Best-effort cleanup so stale in-progress rows do not block retries.
        try {
          await transactionalManager.delete(InprogressCalculationsEntity, {
            FieldID: fieldID,
            Year: year,
          });
        } catch (cleanupError) {
          console.error(
            `Error cleaning up in-progress entry for FieldID: ${fieldID}, Year: ${year}`,
            cleanupError,
          );
        }

        console.error(
          `Error saving entry for FieldID: ${fieldID}, Year: ${year}`,
          error,
        );
        throw error;
      }
    });
  }
}

module.exports = { UpdatingFutureRecommendations };
