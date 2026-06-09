const { CloverMapper } = require("../constants/clover-mapper");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { FieldTypeMapper } = require("../constants/field-type-mapper");
const { GrassManagementOptionsMapper } = require("../constants/grass-management-options-mapper");
const { SoilNitrogenMapper } = require("../constants/soil-nitrogen-supply-mapper");
const { SwardManagementMapper } = require("../constants/sward-management-mapper");
const { SwardTypeMapper } = require("../constants/sward-type-mapper");
const { CropEntity } = require("../db/entity/crop.entity");
const { FertiliserManuresEntity } = require("../db/entity/fertiliser-manures.entity");
const { ManagementPeriodEntity } = require("../db/entity/management-period.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { PreviousCroppingEntity } = require("../db/entity/previous-cropping.entity");
const { PreviousGrassIdMappingEntity } = require("../db/entity/previous-grass-Id-mapping.entity");
const { SoilNitrogenSupplyItemsEntity } = require("../db/entity/soil-nitrogen-supply-items.entity");

const calculatePreviousGrassLookupMethods = {
async getGrassCropFromCropEntity(fieldId, year, transactionalManager) {
  const crop = await this.getCropForYear(fieldId, year, transactionalManager);

  if (!(await this.isValidGrassCrop(crop))) {
    return null;
  }

  const managementFlags = await this.getSwardManagementFlags(
    crop.SwardManagementID,
  );

  const isHighClover = (await this.isHighCloverCrop(crop.SwardTypeID))
    ? 1
    : 0;

  const { nitrogenUse } = await this.calculateTotalNitrogenUseForCrop(
    crop,
    transactionalManager,
  );

  return {
    crop,
    ...managementFlags,
    isHighClover,
    nitrogenUse,
  };
},

async getGrassCropFromPreviousCropping(fieldId, year, transactionalManager) {
  const prevGrass = await this.getPreviousGrass(
    fieldId,
    year,
    transactionalManager,
  );

  if (prevGrass?.CropTypeID !== CropTypeMapper.GRASS) {
    return null;
  }

  const managementFlags = await this.getPreviousGrassManagementFlags(
    prevGrass.GrassManagementOptionID,
  );

  const isHighClover = prevGrass.HasGreaterThan30PercentClover ? 1 : 0;

  const nitrogenUse =
    await this.calculateNitrogenUseFromPreviousGrass(prevGrass);

  return {
    crop: prevGrass,
    ...managementFlags,
    isHighClover,
    nitrogenUse,
  };
},

async getPreviousGrass(fieldId, year, transactionalManager) {
  return transactionalManager
    .createQueryBuilder(PreviousCroppingEntity, "pc")
    .leftJoin(
      SoilNitrogenSupplyItemsEntity,
      "sns",
      "sns.ID = pc.SoilNitrogenSupplyItemID",
    )
    .select([
      "pc.ID AS ID",
      "pc.CropTypeID AS CropTypeID",
      "pc.GrassManagementOptionID AS GrassManagementOptionID",
      "pc.HasGreaterThan30PercentClover AS HasGreaterThan30PercentClover",
      "pc.SoilNitrogenSupplyItemID AS SoilNitrogenSupplyItemID",
      "sns.SoilNitrogenSupplyId AS SoilNitrogenSupplyId",
    ])
    .where("pc.FieldID = :fieldId", { fieldId })
    .andWhere("pc.HarvestYear = :year", { year })
    .getRawOne();
},

async isValidGrassCrop(crop) {
  return crop && !crop.IsBasePlan && crop.FieldType === FieldTypeMapper.GRASS;
},

async getSwardManagementFlags(swardManagementId) {
  return {
    isGrazedOnly:
      swardManagementId === SwardManagementMapper.GRAZEDONLY ? 1 : 0,
    iscutOnly: [
      SwardManagementMapper.CUTFORSILAGEONLY,
      SwardManagementMapper.CUTFORHAYONLY,
    ].includes(swardManagementId)
      ? 1
      : 0,
    iscutAndGrazing: [
      SwardManagementMapper.GRAZINGANDHAY,
      SwardManagementMapper.GRAZINGANDSILAGE,
    ].includes(swardManagementId)
      ? 1
      : 0,
  };
},

async getPreviousGrassManagementFlags(mgmtId) {
  return {
    isGrazedOnly: mgmtId === GrassManagementOptionsMapper.GRAZEDONLY ? 1 : 0,
    iscutOnly: mgmtId === GrassManagementOptionsMapper.CUTONLY ? 1 : 0,
    iscutAndGrazing:
      mgmtId === GrassManagementOptionsMapper.GRAZEDANDCUT ? 1 : 0,
  };
},

async isHighCloverCrop(swardTypeID) {
  return [
    SwardTypeMapper.GRASSANDCLOVER,
    SwardTypeMapper.REDCLOVER,
    SwardTypeMapper.LUCERNE,
  ].includes(swardTypeID);
},

async calculateNitrogenUseFromPreviousGrass(prevGrass) {
  if (prevGrass.HasGreaterThan30PercentClover) {
    return CloverMapper.HighClover;
  }

  switch (prevGrass.SoilNitrogenSupplyId) {
    case SoilNitrogenMapper.HIGHN:
      return CloverMapper.HighClover;
    case SoilNitrogenMapper.MODERATEN:
      return CloverMapper.ModerateClover;
    case SoilNitrogenMapper.LOWN:
    default:
      return CloverMapper.LowClover;
  }
},

mapSoilNitrogenSupplyToNitrogenUse(soilNitrogenSupplyId) {
  switch (soilNitrogenSupplyId) {
    case SoilNitrogenMapper.HIGHN:
      return CloverMapper.HighClover;
    case SoilNitrogenMapper.MODERATEN:
      return CloverMapper.ModerateClover;
    case SoilNitrogenMapper.LOWN:
    default:
      return CloverMapper.LowClover;
  }
},

async getHistoryCropNitrogenUse(crop, transactionalManager) {
  const historyCrop = await transactionalManager
    .createQueryBuilder(PreviousCroppingEntity, "pc")
    .leftJoin(
      SoilNitrogenSupplyItemsEntity,
      "sns",
      "sns.ID = pc.SoilNitrogenSupplyItemID",
    )
    .select(["sns.SoilNitrogenSupplyId AS SoilNitrogenSupplyId"])
    .where("pc.ID = :id", { id: crop.ID })
    .getRawOne();

  if (!historyCrop?.SoilNitrogenSupplyId) {
    return null;
  }

  return this.mapSoilNitrogenSupplyToNitrogenUse(
    historyCrop.SoilNitrogenSupplyId,
  );
},

async getManagementPeriodsForCrop(cropId, transactionalManager) {
  return transactionalManager.find(ManagementPeriodEntity, {
    where: { CropID: cropId },
  });
},

async calculateCurrentCropNitrogenTotals(crop, transactionalManager) {
  const totals = {
    organicAvailableN: 0,
    organicNextDefoliationN: 0,
    fertiliserN: 0,
  };
  const managementPeriods = await this.getManagementPeriodsForCrop(
    crop.ID,
    transactionalManager,
  );

  for (const managementPeriod of managementPeriods) {
    await this.addOrganicNitrogenTotals(
      managementPeriod.ID,
      totals,
      transactionalManager,
    );
    await this.addFertiliserNitrogenTotal(
      managementPeriod.ID,
      totals,
      transactionalManager,
    );
  }

  return totals;
},

async addOrganicNitrogenTotals(managementPeriodId, totals, transactionalManager) {
  const organicManures = await transactionalManager.find(OrganicManureEntity, {
    where: { ManagementPeriodID: managementPeriodId },
  });

  for (const manure of organicManures) {
    totals.organicAvailableN += manure.AvailableN || 0;
    totals.organicNextDefoliationN +=
      manure.AvailableNForNextDefoliation || 0;
  }
},

async addFertiliserNitrogenTotal(managementPeriodId, totals, transactionalManager) {
  const fertiliserManures = await transactionalManager.find(
    FertiliserManuresEntity,
    { where: { ManagementPeriodID: managementPeriodId } },
  );

  for (const fertiliser of fertiliserManures) {
    totals.fertiliserN += fertiliser.N || 0;
  }
},

async calculatePreviousCropOrganicNextYearN(crop, transactionalManager) {
  const previousCrop = await this.getCropForYear(
    crop.FieldID,
    crop.Year - 1,
    transactionalManager,
  );

  if (!previousCrop?.ID) {
    return 0;
  }

  let organicPrevYearNextYearN = 0;
  const previousManagementPeriods = await this.getManagementPeriodsForCrop(
    previousCrop.ID,
    transactionalManager,
  );

  for (const managementPeriod of previousManagementPeriods) {
    const organicManures = await transactionalManager.find(
      OrganicManureEntity,
      { where: { ManagementPeriodID: managementPeriod.ID } },
    );
    for (const manure of organicManures) {
      organicPrevYearNextYearN += manure.AvailableNForNextYear || 0;
    }
  }

  return organicPrevYearNextYearN;
},

getNitrogenUseFromTotal(nitrogenTotal) {
  const nitrogenTotalTwoFiftyLimit = 250;
  const nitrogenTotalOneHundredLimit = 100;

  if (nitrogenTotal > nitrogenTotalTwoFiftyLimit) {
    return CloverMapper.HighClover;
  }

  if (nitrogenTotal > nitrogenTotalOneHundredLimit) {
    return CloverMapper.ModerateClover;
  }

  return CloverMapper.LowClover;
},

async calculateTotalNitrogenUseForCrop(crop, transactionalManager) {
  if (!crop?.ID) {
    return { nitrogenTotal: 0, nitrogenUse: CloverMapper.LowClover };
  }

  const historyNitrogenUse = await this.getHistoryCropNitrogenUse(
    crop,
    transactionalManager,
  );
  if (historyNitrogenUse !== null) {
    return { nitrogenUse: historyNitrogenUse };
  }

  const currentTotals = await this.calculateCurrentCropNitrogenTotals(
    crop,
    transactionalManager,
  );
  const organicPrevYearNextYearN =
    await this.calculatePreviousCropOrganicNextYearN(
      crop,
      transactionalManager,
    );
  const nitrogenTotal =
    currentTotals.organicAvailableN +
    currentTotals.organicNextDefoliationN +
    organicPrevYearNextYearN +
    currentTotals.fertiliserN;

  return {
    nitrogenTotal,
    nitrogenUse: this.getNitrogenUseFromTotal(nitrogenTotal),
  };
},

async findLastGrassCropDetails(fieldId, fromYear, transactionalManager) {
  const maxYear = 5;
  for (let year = fromYear - 1; year >= fromYear - maxYear; year--) {
    const cropResult = await this.getGrassCropFromCropEntity(
      fieldId,
      year,
      transactionalManager,
    );
    if (cropResult) {
      return cropResult;
    }

    const prevGrassResult = await this.getGrassCropFromPreviousCropping(
      fieldId,
      year,
      transactionalManager,
    );
    if (prevGrassResult) {
      return prevGrassResult;
    }
  }
  return null;
},

async getPreviousGrassID(crop, transactionalManager, harvestYear) {
  // Step 1: Fetch crops for current and previous years
  const cropThisYear = crop;
  if (!cropThisYear) {
     await transactionalManager.findOne(CropEntity, {
      where: { FieldID: crop.FieldID, Year: crop.Year },
    });
  }

  const { fieldTypes, fieldTypeMeta } =
    await this.getExtendedFieldTypesForLeyCheck(
      crop.FieldID,
      harvestYear,
      transactionalManager
    );

  const [firstHyFieldType, secondHyFieldType, thirdHyFieldType] = fieldTypes;
  if (
    firstHyFieldType === FieldTypeMapper.ARABLE &&
    secondHyFieldType === FieldTypeMapper.ARABLE &&
    thirdHyFieldType === FieldTypeMapper.ARABLE
  ) {
    return 1;
  }
  const leyDuration = await this.calculateLeyDuration(
    fieldTypeMeta,
    transactionalManager
  );
  const lastGrass = await this.findLastGrassCropDetails(
    crop.FieldID,
    harvestYear,
    transactionalManager
  );
  let {
    isGrazedOnly,
    iscutOnly,
    iscutAndGrazing,
    isHighClover,
    nitrogenUse,
  } = lastGrass;
  if (nitrogenUse === CloverMapper.ModerateClover) {
    nitrogenUse = CloverMapper.LowClover;
  }
  if (isHighClover) {
    nitrogenUse = CloverMapper.HighClover;
  }
  // Step 7: Lookup in PreviousGrassIdMapping
  const mapping = await transactionalManager.findOne(
    PreviousGrassIdMappingEntity,
    {
      where: {
        FirstHYFieldType: firstHyFieldType,
        SecondHYFieldType: secondHyFieldType,
        ThirdHYFieldType: thirdHyFieldType,
        LayDuration: leyDuration,
        IsGrazedOnly: isGrazedOnly,
        IsCutOnly: iscutOnly,
        IsGrazedNCut: iscutAndGrazing,
        IsHighClover: isHighClover,
        NitrogenUse: nitrogenUse
      },
    },
  );

  return mapping?.PreviousGrassID || null;
}
};

module.exports = { calculatePreviousGrassLookupMethods };
