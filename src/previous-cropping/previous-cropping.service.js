const {
  PreviousCroppingEntity,
} = require("../db/entity/previous-cropping.entity");
const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { MoreThan, Between } = require("typeorm");
const { UpdateRecommendationChanges } = require("../shared/updateRecommendationsChanges");
const { CropEntity } = require("../db/entity/crop.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const {
  UpdateRecommendation,
} = require("../shared/updateRecommendation.service");

class PreviousCroppingService extends BaseService {
  constructor() {
    super(PreviousCroppingEntity);
    this.repository = AppDataSource.getRepository(PreviousCroppingEntity);
    this.UpdateRecommendationChanges = new UpdateRecommendationChanges();
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.UpdateRecommendation = new UpdateRecommendation();
    this.fieldRepository=AppDataSource.getRepository(FieldEntity);
  }

  async mergePreviousCropping(previousCroppingBody, userId, request) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      let previousCroppingData = null;
      previousCroppingBody.sort((a, b) => a.HarvestYear - b.HarvestYear);
      // Get the field and greatest year
      let MaxYear = Math.max(
        ...previousCroppingBody.map((item) => item.HarvestYear)
      );
      let MinYear = Math.min(
        ...previousCroppingBody.map((item) => item.HarvestYear)
      );
      let greatestYearField = previousCroppingBody[0].FieldID;

      const existingCrops = await this.repository.find({
        where: previousCroppingBody.map((crop) => ({
          FieldID: crop.FieldID,
        })),
      });
      for (const crop of previousCroppingBody) {
        let cropData;
        const previousCropExist = existingCrops.find(
          (existingCrop) =>
            existingCrop.FieldID === crop.FieldID &&
            existingCrop.HarvestYear === crop.HarvestYear
        );

        if (previousCropExist == null) {
          cropData = {
            ...crop,
            CreatedByID: userId,
            CreatedOn: new Date(),
            ModifiedByID: null,
            ModifiedOn: null,
          };
        } else {
          cropData = {
            ...crop,
            CreatedByID: previousCropExist.CreatedByID,
            CreatedOn: previousCropExist.CreatedOn,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
          };
        }

        // Use save() for both insert and update (upsert)
        previousCroppingData = await transactionalManager.save(
          PreviousCroppingEntity,
          cropData
        );
      }

      const cropExist = await this.cropRepository.findOne({
        where: {
          FieldID: greatestYearField,
          Year: MaxYear + 1, // Find the next available year greater than the current MaxYear
        },
      });
      if (cropExist != null) {
        await this.UpdateRecommendationChanges.updateRecommendationAndOrganicManure(
          greatestYearField,
          MaxYear + 1,
          request,
          userId,
          transactionalManager
        );
      }

      // Check if there are any records in the repository for crop.FieldID with a year greater than crop.Year
      const nextAvailableCrop = await this.cropRepository.findOne({
        where: {
          FieldID: greatestYearField,
          Year: MoreThan(MinYear), // Find the next available year greater than the current MinYear
        },
        order: {
          Year: "ASC", // Ensure we get the next immediate year
        },
      });
      if (nextAvailableCrop) {
        this.UpdateRecommendation.updateRecommendationsForField(
          greatestYearField,
          nextAvailableCrop.Year,
          request,
          userId
        )
          .then((res) => {
            if (res === undefined) {
              console.log(
                "updateRecommendationAndOrganicManure returned undefined"
              );
            } else {
              console.log("updateRecommendationAndOrganicManure result:", res);
            }
          })
          .catch((error) => {
            console.error("Error updating recommendation:", error);
          });
      }

      // Return a boolean indicating if any data was saved/updated
      return previousCroppingData != null;
    });
  }

  async getPreviousCroppingDataByFieldIdAndYear(fieldId, year) {
    const whereClause = { FieldID: fieldId };
    var previousCroppingData = null;
    if (year !== null && year !== undefined) {
      whereClause.HarvestYear = year;

      previousCroppingData = await this.repository.findOne({
        where: whereClause,
      });
    } else {
      previousCroppingData = await this.repository.find({
        where: whereClause,
      });
    }

    console.log("previousCroppingData", previousCroppingData);
    return { PreviousCropping: previousCroppingData };
  }

  async getPreviousCroppingPreviousYearsDataByFieldIdAndYear(fieldId, year) {
    let previousCroppingData = null;

    if (year !== null && year !== undefined) {
      // Last 3 years BEFORE the given year
      const fromYear = year - 3;
      const toYear = year - 1;

      previousCroppingData = await this.repository.find({
        where: {
          FieldID: fieldId,
          HarvestYear: Between(fromYear, toYear),
        },
        order: { HarvestYear: "DESC" },
      });
    } else {
      previousCroppingData = await this.repository.find({
        where: { FieldID: fieldId },
      });
    }


    return { PreviousCropping: previousCroppingData };
  }

  async getPreviousCroppingYearByFarmId(farmId) {
  if (!farmId) {
    return { PreviousCropping: null };
  }
const yearsLimit = 3;

const oldestThree = await this.repository
  .createQueryBuilder("pc")
  .leftJoin("pc.Fields", "f")
  .where("f.FarmID = :farmId", { farmId })
  .select("DISTINCT pc.HarvestYear", "HarvestYear")
  .orderBy("pc.HarvestYear", "ASC")
  .limit(yearsLimit)
  .getRawMany();

   let topOneFromOldestThree = null;

   if (oldestThree.length > 0) {
     topOneFromOldestThree = oldestThree[oldestThree.length - 1];  
    }


return { OldestPreviousCropping: topOneFromOldestThree?.HarvestYear || null };

}

}

module.exports = { PreviousCroppingService };
