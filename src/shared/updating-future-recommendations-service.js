const { MoreThan } = require("typeorm");
const { CropEntity } = require("../db/entity/crop.entity");
const { InprogressCalculationsEntity } = require("../db/entity/inprogress-calculations-entity");
const RB209ArableService = require("../vendors/rb209/arable/arable.service");
const { GenerateRecommendations } = require("./generate-recomendations-service");
const { AppDataSource } = require("../db/data-source");

class UpdatingFutureRecommendations {
  constructor() {
    this.farmExistRepository = AppDataSource.getRepository(
      InprogressCalculationsEntity,
    );
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.rB209ArableService = new RB209ArableService();
    this.generateRecommendations = new GenerateRecommendations();
  }

  async getYearsGreaterThanGivenYear(fieldID, year) {
    const years = await this.cropRepository.find({
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
    // Fetch all years greater than the provided year for the given FieldID
    const yearsGreaterThanGivenYear = await this.getYearsGreaterThanGivenYear(
      fieldID,
      year,
    );
    const allYearsTogether = [year, ...yearsGreaterThanGivenYear];
    this.processYearsInBackground(fieldID, allYearsTogether, request, userId);
  }

  async processYearsInBackground(fieldID, years, request, userId) {
    for (const yearToSave of years) {
      try {
        // Check if FieldID and Year combination already exists
        const existingEntry = await this.farmExistRepository.findOne({
          where: { FieldID: fieldID, Year: yearToSave },
        });

        // If it doesn't exist, save it
        if (existingEntry) {
          console.log(
            `Entry for FieldID: ${fieldID}, Year: ${yearToSave} already exists`,
          );
        } else {
          await this.farmExistRepository.save({
            FieldID: fieldID,
            Year: yearToSave,
          });
          console.log(
            `Saved entry for FieldID: ${fieldID}, Year: ${yearToSave}`,
          );
        }
      } catch (error) {
        console.error(
          `Error saving entry for FieldID: ${fieldID}, Year: ${yearToSave}`,
          error,
        );
      }
    }

    // If there are remaining years, process them in the background
    if (years.length > 0) {
      console.log("Processing the following years in background:", years);
      for (const yearToUpdate of years) {
        try {
          // Call the updateRecommendationAndOrganicManure for each remaining year
          await this.updateRecommendationAndOrganicManure(
            fieldID,
            yearToUpdate,
            request,
            userId,
          );
          console.log(`Successfully processed year ${yearToUpdate}`);
        } catch (error) {
          console.error(`Error processing year ${yearToUpdate}:`, error);
        }
      }
    } else {
      console.log("No years greater than the given year were found.");
    }
  }

  async updateRecommendationAndOrganicManure(fieldID, year, request, userId) {
    return await AppDataSource.transaction(async (transactionalManager) => {
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
    });
  }
}

module.exports = { UpdatingFutureRecommendations };
