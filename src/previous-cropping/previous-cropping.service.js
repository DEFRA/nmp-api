const {
  PreviousCroppingEntity,
} = require("../db/entity/previous-cropping.entity");
const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { MoreThan, Between } = require("typeorm");
const { CropEntity } = require("../db/entity/crop.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const { CountryEntity } = require("../db/entity/country.entity");
const { GenerateRecommendations } = require("../shared/generate-recomendations-service");
const { UpdatingFutureRecommendations } = require("../shared/updating-future-recommendations-service");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { CountryMapper } = require("../constants/country-mapper");
const { CropOrderMapper } = require("../constants/crop-order-mapper");

class PreviousCroppingService extends BaseService {
  constructor() {
    super(PreviousCroppingEntity);
    this.repository = AppDataSource.getRepository(PreviousCroppingEntity);
    this.updatingFutureRecommendations = new UpdatingFutureRecommendations();
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.fieldRepository = AppDataSource.getRepository(FieldEntity);
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

  isGrassCropType(cropTypeID) {
    return cropTypeID === CropTypeMapper.GRASS;
  }

  isArableCropType(cropTypeID) {
    return cropTypeID !== null && cropTypeID !== CropTypeMapper.GRASS;
  }

  isScotlandCountry(rb209CountryID) {
    return rb209CountryID === CountryMapper.SCOTLAND;
  }

  async getRb209CountryIdByFieldId(fieldId, transactionalManager) {
    const fieldAndCountryData = await transactionalManager
      .createQueryBuilder(FieldEntity, "field")
      .leftJoin(FarmEntity, "farm", "farm.ID = field.FarmID")
      .leftJoin(CountryEntity, "country", "country.ID = farm.CountryID")
      .select(["country.RB209CountryID AS RB209CountryID"])
      .where("field.ID = :fieldId", { fieldId })
      .getRawOne();

    return fieldAndCountryData?.RB209CountryID ?? null;
  }

  async getNextYearFirstCrop(fieldId, harvestYear, transactionalManager) {
    return transactionalManager.findOne(CropEntity, {
      where: {
        FieldID: fieldId,
        Year: harvestYear + 1,
        CropOrder: CropOrderMapper.FIRSTCROP,
      },
    });
  }

  async applyScotlandGrassPreviousCroppingRule(
    cropData,
    userId,
    transactionalManager,
  ) {
    if (!this.isGrassCropType(cropData.CropTypeID)) {
      return cropData;
    }

    const rb209CountryID = await this.getRb209CountryIdByFieldId(
      cropData.FieldID,
      transactionalManager,
    );

    if (!this.isScotlandCountry(rb209CountryID)) {
      return cropData;
    }

    const nextYearFirstCrop = await this.getNextYearFirstCrop(
      cropData.FieldID,
      cropData.HarvestYear,
      transactionalManager,
    );

    if (nextYearFirstCrop && this.isArableCropType(nextYearFirstCrop.CropTypeID)) {
      const hasIncomingPreviousGrassId = Object.prototype.hasOwnProperty.call(
        cropData,
        "PreviousGrassID",
      );

      if (hasIncomingPreviousGrassId) {
        await transactionalManager.update(CropEntity, nextYearFirstCrop.ID, {
          PreviousGrass: cropData.PreviousGrassID ?? null,
          ModifiedByID: userId,
          ModifiedOn: new Date(),
        });
      }
    }

    return {
      ...cropData,
      PreviousGrassID: null,
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

      const processedCropData =
        await this.applyScotlandGrassPreviousCroppingRule(
          cropData,
          userId,
          transactionalManager,
        );

      previousCroppingData = await transactionalManager.save(
        PreviousCroppingEntity,
        processedCropData
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
    const cropExist = await transactionalManager.findOne(
      CropEntity,
      {
        where: {
          FieldID: fieldId,
          Year: year,
        },
      },
    );

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

  async triggerFutureRecommendationUpdate(fieldId, minYear, request, userId, transactionalManager) {
    const nextAvailableCrop = await transactionalManager.findOne(
      CropEntity,
      {
        where: {
          FieldID: fieldId,
          Year: MoreThan(minYear),
        },
        order: {
          Year: "ASC",
        },
      },
    );

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
      const existingCrops = await transactionalManager.find(
        PreviousCroppingEntity,
        {
          where: previousCroppingBody.map((crop) => ({
            FieldID: crop.FieldID,
          })),
        },
      );

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
        transactionalManager
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
