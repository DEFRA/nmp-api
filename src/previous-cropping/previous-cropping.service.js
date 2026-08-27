const {
  PreviousCroppingEntity,
} = require("../db/entity/previous-cropping.entity");
const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { MoreThan, Between } = require("typeorm");
const { CropEntity } = require("../db/entity/crop.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const { GenerateRecommendations } = require("../shared/generate-recomendations-service");
const { UpdatingFutureRecommendations } = require("../shared/updating-future-recommendations-service");

class PreviousCroppingService extends BaseService {
  constructor() {
    super(PreviousCroppingEntity);
    this.repository = AppDataSource.getRepository(PreviousCroppingEntity);
    this.updatingFutureRecommendations = new UpdatingFutureRecommendations();
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.fieldRepository=AppDataSource.getRepository(FieldEntity);
    this.generateRecommendations = new GenerateRecommendations();
  }

  getPreviousCroppingYearContext(previousCroppingBody) {
    previousCroppingBody.sort((a, b) => a.HarvestYear - b.HarvestYear);

    return {
      MaxYear: Math.max(
        ...previousCroppingBody.map((item) => item.HarvestYear)
      ),
      MinYear: Math.min(
        ...previousCroppingBody.map((item) => item.HarvestYear)
      ),
      greatestYearField: previousCroppingBody[0].FieldID,
    };
  }

  buildPreviousCroppingData(crop, previousCropExist, userId) {
    if (previousCropExist == null) {
      return {
        ...crop,
        CreatedByID: userId,
        CreatedOn: new Date(),
        ModifiedByID: null,
        ModifiedOn: null,
      };
    }

    return {
      ...crop,
      CreatedByID: previousCropExist.CreatedByID,
      CreatedOn: previousCropExist.CreatedOn,
      ModifiedByID: userId,
      ModifiedOn: new Date(),
    };
  }

  async savePreviousCroppingData(
    previousCroppingBody,
    existingCrops,
    userId,
    transactionalManager,
  ) {
    let previousCroppingData = null;

    for (const crop of previousCroppingBody) {
      const previousCropExist = existingCrops.find(
        (existingCrop) =>
          existingCrop.FieldID === crop.FieldID &&
          existingCrop.HarvestYear === crop.HarvestYear
      );
      const cropData = this.buildPreviousCroppingData(
        crop,
        previousCropExist,
        userId,
      );

      previousCroppingData = await transactionalManager.save(
        PreviousCroppingEntity,
        cropData
      );
    }

    return previousCroppingData;
  }

  async regenerateNextYearRecommendations(
    fieldId,
    year,
    userId,
    request,
    transactionalManager,
  ) {
    const cropExist = await this.cropRepository.findOne({
      where: {
        FieldID: fieldId,
        Year: year,
      },
    });

    if (cropExist == null) {
      return;
    }

    const organicManure = null;
    await this.generateRecommendations.generateRecommendations(
      fieldId,
      year,
      organicManure,
      transactionalManager,
      request,
      userId
    );
  }

  async triggerFutureRecommendationUpdate(fieldId, minYear, request, userId) {
    const nextAvailableCrop = await this.cropRepository.findOne({
      where: {
        FieldID: fieldId,
        Year: MoreThan(minYear),
      },
      order: {
        Year: "ASC",
      },
    });

    if (!nextAvailableCrop) {
      return;
    }

    this.updatingFutureRecommendations.updateRecommendationsForField(
        fieldId,
        nextAvailableCrop.Year,
        request,
        userId
      )
      .then((res) => {
        if (res === undefined) {
          console.log(
            "updateRecommendationAndOrganicManure returned undefined",
          );
        } else {
          console.log("updateRecommendationAndOrganicManure result:", res);
        }
      })
      .catch((error) => {
        console.error("Error updating recommendation:", error);
      });
  }

  async mergePreviousCropping(previousCroppingBody, userId, request) {
    return AppDataSource.transaction(async (transactionalManager) => {
      const { MaxYear, MinYear, greatestYearField } =
        this.getPreviousCroppingYearContext(previousCroppingBody);
      const existingCrops = await this.repository.find({
        where: previousCroppingBody.map((crop) => ({
          FieldID: crop.FieldID,
        })),
      });

      const previousCroppingData = await this.savePreviousCroppingData(
        previousCroppingBody,
        existingCrops,
        userId,
        transactionalManager,
      );
      await this.regenerateNextYearRecommendations(
        greatestYearField,
        MaxYear + 1,
        userId,
        request,
        transactionalManager,
      );
      await this.triggerFutureRecommendationUpdate(
        greatestYearField,
        MinYear,
        request,
        userId,
      );

      return previousCroppingData != null;
    });
  }

  async getPreviousCroppingDataByFieldIdAndYear(fieldId, year) {
    const whereClause = { FieldID: fieldId };
    let previousCroppingData = null;
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
    const threeYearAgo = 3; 
    if (year !== null && year !== undefined) {
      // Last 3 years BEFORE the given year
      const fromYear = year - threeYearAgo;
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
