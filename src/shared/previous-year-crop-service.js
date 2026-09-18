const { In } = require("typeorm");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { CropOrderMapper } = require("../constants/crop-order-mapper");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const { CountryEntity } = require("../db/entity/country.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const {
  PreviousCroppingEntity,
} = require("../db/entity/previous-cropping.entity");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { CountryMapper } = require("../constants/country-mapper");

class CalculatePreviousCropService {
  async getRb209CountryId(
    fieldID,
    transactionalManager,
    prefetchContext = null,
  ) {
    if (
      prefetchContext?.rb209CountryID !== undefined &&
      prefetchContext?.rb209CountryID !== null
    ) {
      return prefetchContext.rb209CountryID;
    }

    const fieldAndCountryData = await transactionalManager
      .createQueryBuilder(FieldEntity, "f")
      .leftJoin(FarmEntity, "farm", "farm.ID = f.FarmID")
      .leftJoin(CountryEntity, "country", "country.ID = farm.CountryID")
      .select(["country.RB209CountryID AS RB209CountryID"])
      .where("f.ID = :fieldID", { fieldID })
      .getRawOne();

    return fieldAndCountryData?.RB209CountryID ?? null;
  }

  getPrefetchedCropForYear(prefetchContext, year) {
    const yearCrops = prefetchContext?.historicalCropsByYear?.get(year) ?? [];
    return this.pickCropFromList(yearCrops);
  }

  getPrefetchedPreviousCroppingForYear(prefetchContext, year) {
    return (
      prefetchContext?.historicalPreviousCroppingsByYear?.get(year) ?? null
    );
  }

  pickCropFromList(crops) {
    if (crops.length > 1) {
      return (
        crops.find((crop) => crop.CropOrder === CropOrderMapper.SECONDCROP) ||
        null
      );
    }

    if (crops.length === 1) {
      return crops[0];
    }
    return null;
  }

  async findCropForYear(
    fieldID,
    year,
    transactionalManager,
    prefetchContext = null,
  ) {
    if (prefetchContext?.fieldID === fieldID) {
      const prefetchedCrop = this.getPrefetchedCropForYear(
        prefetchContext,
        year,
      );
      if (prefetchedCrop) {
        return prefetchedCrop;
      }

      return this.getPrefetchedPreviousCroppingForYear(prefetchContext, year);
    }

    const yearCrops = await transactionalManager.find(CropEntity, {
      where: { FieldID: fieldID, Year: year },
    });

    const selectedCrop = this.pickCropFromList(yearCrops);

    if (selectedCrop) {
      return selectedCrop;
    }

    return transactionalManager.findOne(PreviousCroppingEntity, {
      where: { FieldID: fieldID, HarvestYear: year },
    });
  }

  async getPreviousYearCrop(
    fieldID,
    currentYear,
    transactionalManager,
    prefetchContext = null,
  ) {
    const previousYear = currentYear - 1;

    if (prefetchContext?.fieldID === fieldID) {
      const prefetchedPreviousYearCrop = this.getPrefetchedCropForYear(
        prefetchContext,
        previousYear,
      );
      if (prefetchedPreviousYearCrop) {
        return prefetchedPreviousYearCrop;
      }

      return this.getPrefetchedPreviousCroppingForYear(
        prefetchContext,
        previousYear,
      );
    }

    const previousYearCrops = await transactionalManager.find(CropEntity, {
      where: { FieldID: fieldID, Year: previousYear },
    });

    if (previousYearCrops.length === 0) {
      return transactionalManager.findOne(PreviousCroppingEntity, {
        where: { FieldID: fieldID, HarvestYear: previousYear },
      });
    }

    return this.pickCropFromList(previousYearCrops);
  }

  async findPreviousCrop(
    fieldID,
    currentYear,
    transactionalManager,
    prefetchContext = null,
    rb209CountryID = null,
  ) {
    const yearOne = 1,
      yearTwo = 2,
      yearThree = 3;
    const yearsToCheck = [
      currentYear - yearOne,
      currentYear - yearTwo,
      currentYear - yearThree,
    ];
    const collectedCrops = [];

    for (const year of yearsToCheck) {
      const selectedCrop = await this.findCropForYear(
        fieldID,
        year,
        transactionalManager,
        prefetchContext,
      );
      collectedCrops.push(selectedCrop || null);
    }

    const lastYearCrop = collectedCrops[0];
    const secondLastYearCrop = collectedCrops[1];
    const thirdLastYearCrop = collectedCrops[2];

    const rb209CountryId =
      rb209CountryID ??
      (await this.getRb209CountryId(
        fieldID,
        transactionalManager,
        prefetchContext,
      ));

    if (rb209CountryId === CountryMapper.SCOTLAND) {
      if (!lastYearCrop) {
        return null;
      }
    } else if (
      rb209CountryId === CountryMapper.ENGLAND ||
      rb209CountryId === CountryMapper.WELSH
    ) {
      if (!lastYearCrop || !secondLastYearCrop || !thirdLastYearCrop) {
        return null;
      }
    } else {
      return null;
    }

    return this.getPreviousYearCrop(
      fieldID,
      currentYear,
      transactionalManager,
      prefetchContext,
    );
  }
}

module.exports = { CalculatePreviousCropService };
