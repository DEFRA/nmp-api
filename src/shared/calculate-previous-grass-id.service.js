const { CloverMapper } = require("../constants/clover-mapper");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { FieldTypeMapper } = require("../constants/field-type-mapper");
const { GrassManagementOptionsMapper } = require("../constants/grass-management-options-mapper");
const { SoilGroupCategoriesMapper } = require("../constants/soil-group-categories-mapper");
const { SoilNitrogenMapper } = require("../constants/soil-nitrogen-supply-mapper");
const { SwardManagementMapper } = require("../constants/sward-management-mapper");
const { SwardTypeMapper } = require("../constants/sward-type-mapper");
const { CropGroupCategoriesEntity } = require("../db/entity/crop-group-categories.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const { FertiliserManuresEntity } = require("../db/entity/fertiliser-manures.entity");
const { GrassHistoryIdMappingEntity } = require("../db/entity/grass-history-id-mapping-entity");
const { ManagementPeriodEntity } = require("../db/entity/management-period.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { PreviousCroppingEntity } = require("../db/entity/previous-cropping.entity");
const { PreviousGrassIdMappingEntity } = require("../db/entity/previous-grass-Id-mapping.entity");
const { PreviousGrassesEntity } = require("../db/entity/previous-grasses-entity");
const { SoilGroupCategoriesEntity } = require("../db/entity/soil-group-categories-entity");
const { SoilNitrogenSupplyItemsEntity } = require("../db/entity/soil-nitrogen-supply-items.entity");

class CalculateGrassHistoryAndPreviousGrass {
  constructor() {}

  async calculateIsReseeded(
    grassCrop,
    harvestYear,
    fieldId,
    transactionalManager,
  ) {
    //  Case 1: Grass from PreviousGrassesEntity
    if (!grassCrop?.ID || !grassCrop?.FieldType) {
      // First try getting crop from previous year
      const cropBefore = await this.getCropForYear(
        fieldId,
        harvestYear - 1,
        transactionalManager,
      );

      if (cropBefore?.FieldType === FieldTypeMapper.GRASS) {
        return 0; // Not reseeded
      }

      // Then try finding PreviousGrassesEntity from previous year
      const prevGrassBefore = await transactionalManager.findOne(
        PreviousCroppingEntity,
        {
          where: {
            FieldID: fieldId,
            HarvestYear: harvestYear - 1,
          },
        },
      );

      if (prevGrassBefore.CropTypeID == CropTypeMapper.GRASS) {
        return 0;
      }

      // No data found before the grass year → Assume reseeded
      return 1;
    }
  }

  async getGrassHistoryID(
    field,
    cropThisYear,
    transactionalManager,
    harvestYear,
  ) {
    let isHighClover = null;
    let isReseeded = 0;

    // -----------------------------
    // Step 1: Year -1
    // -----------------------------
    const crop1 = await this.getCropForYear(
      field.ID,
      harvestYear - 1,
      transactionalManager,
    );
    let firstHYFieldType = crop1?.FieldType ?? null;
    let prevGrass1;
    if (firstHYFieldType === 2 && crop1 !== null) {
      // Grass found in crop1

      const SwardTypeID = crop1?.SwardTypeID ?? null;
      isHighClover = [
        SwardTypeMapper?.GRASSANDCLOVER,
        SwardTypeMapper?.REDCLOVER,
        SwardTypeMapper?.LUCERNE,
      ].includes(SwardTypeID)
        ? 1
        : 0;

      const establishment = crop1?.Establishment ?? null;
      isReseeded = establishment === 0 || establishment === null ? 0 : 1;
    } else if (crop1?.IsBasePlan || !crop1) {
      prevGrass1 = await transactionalManager.findOne(PreviousCroppingEntity, {
        where: { FieldID: field.ID, HarvestYear: harvestYear - 1 },
      });

      if (prevGrass1.CropTypeID == CropTypeMapper.GRASS) {
        firstHYFieldType = FieldTypeMapper.GRASS;
        isHighClover = prevGrass1.HasGreaterThan30PercentClover ? 1 : 0;
        isReseeded = await this.calculateIsReseeded(
          prevGrass1,
          harvestYear - 1,
          field.ID,
          transactionalManager,
        );
      } else {
        firstHYFieldType = FieldTypeMapper.ARABLE;
      }
    } else {
      firstHYFieldType = crop1?.FieldType || FieldTypeMapper.ARABLE;
    }
    let secondHYFieldType = null,
      crop2,
      prevGrass2;
    if (firstHYFieldType !== FieldTypeMapper.GRASS) {
      crop2 = await this.getCropForYear(
        field.ID,
        harvestYear - 2,
        transactionalManager,
      );

      if (
        crop2 ||
        (!crop2?.IsBasePlan && firstHYFieldType !== FieldTypeMapper.GRASS)
      ) {
        const swardTypeID = crop2?.SwardTypeID;
        const highCloverTypes = [
          SwardTypeMapper?.GRASSANDCLOVER,
          SwardTypeMapper?.REDCLOVER,
          SwardTypeMapper?.LUCERNE,
        ];

        if (isHighClover === null) {
          isHighClover = highCloverTypes.includes(swardTypeID) ? 1 : 0;
        }
        const establishment = crop1?.Establishment;
        isReseeded = establishment === 0 || establishment === null ? 0 : 1;
      }

      // Determine secondHYFieldType
      secondHYFieldType = crop2?.FieldType ?? null;

      if (secondHYFieldType === null) {
        prevGrass2 = await transactionalManager.findOne(
          PreviousCroppingEntity,
          {
            where: { FieldID: field.ID, HarvestYear: harvestYear - 2 },
          },
        );

        if (prevGrass2 && prevGrass2?.CropTypeID == CropTypeMapper.GRASS) {
          secondHYFieldType = FieldTypeMapper.GRASS;
          isReseeded = await this.calculateIsReseeded(
            prevGrass2,
            harvestYear - 1,
            field.ID,
            transactionalManager,
          );
          // ✅ Only derive isHighClover if not already set AND firstHY was not grass
          if (
            isHighClover === null &&
            firstHYFieldType !== FieldTypeMapper.GRASS
          ) {
            isHighClover = prevGrass2?.HasGreaterThan30PercentClover ? 1 : 0;
          }
        } else {
          secondHYFieldType = FieldTypeMapper.ARABLE;
        }
      }
    }

    // -----------------------------
    // Step 4: NitrogenUse
    // -----------------------------
    // Step 4: NitrogenUse
    let nitrogenUse = null;
    let grassCrop;

    if (isHighClover === 1) {
      nitrogenUse = null; // Skip calculation
    } else if (isHighClover === 0) {
      grassCrop = null;
      if (firstHYFieldType === FieldTypeMapper.GRASS && (crop1 || prevGrass1)) {
        grassCrop = crop1 || prevGrass1;
      } else if (
        secondHYFieldType === FieldTypeMapper.GRASS &&
        (crop2 || prevGrass2)
      ) {
        grassCrop = crop2 ? crop1 : prevGrass2;
      } else {
        grassCrop = null;
      }

      if (grassCrop) {
        nitrogenUse = await this.calculateTotalNitrogenUseForCrop(
          grassCrop,
          transactionalManager,
        );
        nitrogenUse = nitrogenUse?.nitrogenUse;
      }
    }

    // -----------------------------
    // Step 5: Soil and Crop Group Categories
    // -----------------------------
    if (
      firstHYFieldType === FieldTypeMapper.ARABLE &&
      secondHYFieldType === FieldTypeMapper.ARABLE
    ) {
      nitrogenUse = null;
      isHighClover = null;
      isReseeded = null;
    }
    let soilGroupCategoryID = null;
    let cropGroupCategoryID = null;

    if (
      firstHYFieldType === FieldTypeMapper.ARABLE &&
      secondHYFieldType === FieldTypeMapper.ARABLE
    ) {
      const soilTypeID = field?.SoilTypeID;
      const soilGroupCategory = await transactionalManager.findOne(
        SoilGroupCategoriesEntity,
        {
          where: { SoilTypeID: soilTypeID },
        },
      );

      soilGroupCategoryID = soilGroupCategory?.ID || null;

      if (soilGroupCategoryID === SoilGroupCategoriesMapper.ALLOTHERSOILTYPES) {
        const cropGroupCategory = await transactionalManager.findOne(
          CropGroupCategoriesEntity,
          {
            where: { CropTypeID: cropThisYear?.CropTypeID },
          },
        );
        cropGroupCategoryID = cropGroupCategory?.ID || null;
      }
    }

    // -----------------------------
    // Step 6: Final Mapping
    // -----------------------------
    const mapping = await transactionalManager.findOne(
      GrassHistoryIdMappingEntity,
      {
        where: {
          FirstHYFieldType: firstHYFieldType,
          SecondHYFieldType: secondHYFieldType,
          IsReseeded: isReseeded,
          IsHighClover: isHighClover,
          NitrogenUse: nitrogenUse,
          SoilGroupCategoryID: soilGroupCategoryID,
          CropGroupCategoryID: cropGroupCategoryID,
        },
      },
    );

    return mapping?.GrassHistoryID ?? null;
  }

  async getCropForYear(fieldId, targetYear, transactionalManager) {
    let crop = await transactionalManager.findOne(CropEntity, {
      where: { FieldID: fieldId, Year: targetYear, CropOrder: 2 },
    });
    if (!crop) {
      crop = await transactionalManager.findOne(CropEntity, {
        where: { FieldID: fieldId, Year: targetYear, CropOrder: 1 },
      });
    }
    return crop;
  }

  async calculateLeyFromHistory(fieldTypesArray, transactionalManager) {
    const historyData = fieldTypesArray.filter((ft) => ft.isHistory);

    for (const ft of historyData) {
      const previousCropData = await transactionalManager.findOne(
        PreviousCroppingEntity,
        {
          where: {
            FieldID: ft.fieldId,
            HarvestYear: ft.processingYear,
          },
        },
      );

      if (
        previousCropData?.CropTypeID === CropTypeMapper.GRASS &&
        previousCropData.LayDuration != null
      ) {
        return previousCropData.LayDuration;
      }
    }

    return null;
  }

  async calculateLeyFromCropData(fieldTypesArray) {
    let leyCount = 0;
    let currentStreak = 0;

    for (const ft of fieldTypesArray) {
      if (ft.isHistory) {
        continue;
      }
      if (ft.fieldType === FieldTypeMapper.GRASS) {
        currentStreak++;
        leyCount = Math.max(leyCount, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return leyCount;
  }

  async calculateLeyDuration(fieldTypesArray, transactionalManager) {
    const leyCount = await this.calculateLeyFromCropData(fieldTypesArray);

    // ✅ Check if fieldType 2 is consecutive
    const hasConsecutiveLey = fieldTypesArray
      .sort((a, b) => b.processingYear - a.processingYear) // latest → oldest
      .some((item, index, arr) => {
        if (index === arr.length - 1) return false;

        return (
          item.fieldType === 2 &&
          arr[index + 1].fieldType === 2 &&
          item.processingYear - arr[index + 1].processingYear === 1
        );
      });

    // ❌ If not consecutive, stop here
    if (!hasConsecutiveLey && leyCount > 0) {
      return leyCount;
    }

    // ✅ Only proceed to history if consecutive
    if (leyCount < 2) {
      const historyLey = await this.calculateLeyFromHistory(
        fieldTypesArray,
        transactionalManager,
      );

      if (historyLey != null) {
        return historyLey;
      }
    }

    if (leyCount > 2) return 2;
    if (leyCount > 0) return 1;

  }

  async getExtendedFieldTypesForLeyCheck(
    fieldId,
    harvestYear,
    transactionalManager,
  ) {
    const fieldTypes = [];
    const fieldTypeMeta = [];

    const pushMeta = (year, fieldType, isHistory) => {
      fieldTypeMeta.push({
        fieldId,
        processingYear: year,
        fieldType,
        isHistory,
      });
    };

    const resolveFieldTypeForYear = async (year) => {
      const crop = await this.getCropForYear(
        fieldId,
        year,
        transactionalManager,
      );

      if (crop?.FieldType != null) {
        pushMeta(year, crop.FieldType, false);
        return crop.FieldType;
      }

      const prevGrass = await transactionalManager.findOne(
        PreviousCroppingEntity,
        { where: { FieldID: fieldId, HarvestYear: year } },
      );

      const isGrass = prevGrass?.CropTypeID === CropTypeMapper.GRASS;
      const resolvedType = isGrass
        ? FieldTypeMapper.GRASS
        : FieldTypeMapper.ARABLE;

      pushMeta(year, resolvedType, true);
      return resolvedType;
    };

    const pushIfGrass = (fieldType) => {
      if (fieldType === FieldTypeMapper.GRASS) {
        fieldTypes.push(FieldTypeMapper.GRASS);
      }
    };

    // Step 1: Last 3 years
    for (let i = 1; i <= 3; i++) {
      const year = harvestYear - i;
      const fieldType = await resolveFieldTypeForYear(year);
      fieldTypes.push(fieldType);
    }

    const [first, second, third] = fieldTypes;

    // Step 2a: Arable → Grass → Grass
    if (await this.isArableGrassGrass(first, second, third)) {
      const year = harvestYear - 4;
      const fieldType = await resolveFieldTypeForYear(year);
      pushIfGrass(fieldType);
    }

    // Step 2b: Arable → Arable → Grass
    if (await this.isArableArableGrass(first, second, third)) {
      for (let i = 4; i <= 5; i++) {
        const year = harvestYear - i;
        const fieldType = await resolveFieldTypeForYear(year);
        pushIfGrass(fieldType);
      }
    }

    return {
      fieldTypes,
      fieldTypeMeta,
    };
  }

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
  }

  async getGrassCropFromPreviousCropping(fieldId, year, transactionalManager) {
    const prevGrass = await this.getPreviousGrass(
      fieldId,
      year,
      transactionalManager,
    );

    if (!prevGrass || prevGrass.CropTypeID !== CropTypeMapper.GRASS) {
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
  }
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
  }

  async isValidGrassCrop(crop) {
    return crop && !crop.IsBasePlan && crop.FieldType === FieldTypeMapper.GRASS;
  }

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
  }

  async getPreviousGrassManagementFlags(mgmtId) {
    return {
      isGrazedOnly: mgmtId === GrassManagementOptionsMapper.GRAZEDONLY ? 1 : 0,
      iscutOnly: mgmtId === GrassManagementOptionsMapper.CUTONLY ? 1 : 0,
      iscutAndGrazing:
        mgmtId === GrassManagementOptionsMapper.GRAZEDANDCUT ? 1 : 0,
    };
  }

  async isHighCloverCrop(swardTypeID) {
    return [
      SwardTypeMapper.GRASSANDCLOVER,
      SwardTypeMapper.REDCLOVER,
      SwardTypeMapper.LUCERNE,
    ].includes(swardTypeID);
  }

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
  }

  async calculateTotalNitrogenUseForCrop(crop, transactionalManager) {
    if (!crop?.ID) {
      return { nitrogenTotal: 0, nitrogenUse: CloverMapper.LowClover };
    }

    let organicAvailableN = 0;
    let organicNextDefoliationN = 0;
    let organicPrevYearNextYearN = 0;
    let fertiliserN = 0;
    const isHistoryCrop = await transactionalManager
      .createQueryBuilder(PreviousCroppingEntity, "pc")
      .leftJoin(
        SoilNitrogenSupplyItemsEntity,
        "sns",
        "sns.ID = pc.SoilNitrogenSupplyItemID",
      )
      .select(["sns.SoilNitrogenSupplyId AS SoilNitrogenSupplyId"])
      .where("pc.ID = :id", { id: crop.ID })
      .getRawOne();
    let nitrogenUse = null;
    if (isHistoryCrop) {
      const soilNitrogenSupplyItemID = isHistoryCrop.SoilNitrogenSupplyId;
      if (soilNitrogenSupplyItemID) {
        if (soilNitrogenSupplyItemID == SoilNitrogenMapper.LOWN) {
          nitrogenUse = CloverMapper.LowClover;
        } else if (soilNitrogenSupplyItemID == SoilNitrogenMapper.MODERATEN) {
          nitrogenUse = CloverMapper.ModerateClover;
        } else if (soilNitrogenSupplyItemID == SoilNitrogenMapper.HIGHN) {
          nitrogenUse = CloverMapper.HighClover;
        } else {
          nitrogenUse = CloverMapper.LowClover;
        }

        return { nitrogenUse };
      }
    }
    // Step 1: Current year's Organic Manures
    const managementPeriods = await transactionalManager.find(
      ManagementPeriodEntity,
      { where: { CropID: crop.ID } },
    );

    for (const mp of managementPeriods) {
      const organicManures = await transactionalManager.find(
        OrganicManureEntity,
        { where: { ManagementPeriodID: mp.ID } },
      );

      for (const manure of organicManures) {
        organicAvailableN += manure.AvailableN || 0;
        organicNextDefoliationN += manure.AvailableNForNextDefoliation || 0;
      }

      // Step 2: Fertiliser Manures for same ManagementPeriod
      const fertiliserManures = await transactionalManager.find(
        FertiliserManuresEntity,
        { where: { ManagementPeriodID: mp.ID } },
      );

      for (const fert of fertiliserManures) {
        fertiliserN += fert.N || 0;
      }
    }

    // Step 3: OrganicManure of previous year's crop (AvailableNForNextYear)
    const previousCrop = await this.getCropForYear(
      crop.FieldID,
      crop.Year - 1,
      transactionalManager,
    );

    if (previousCrop?.ID) {
      const prevMgmtPeriods = await transactionalManager.find(
        ManagementPeriodEntity,
        { where: { CropID: previousCrop.ID } },
      );

      for (const mp of prevMgmtPeriods) {
        const organicManures = await transactionalManager.find(
          OrganicManureEntity,
          { where: { ManagementPeriodID: mp.ID } },
        );

        for (const manure of organicManures) {
          organicPrevYearNextYearN += manure.AvailableNForNextYear || 0;
        }
      }
    }

    // Step 4: Total N
    const nitrogenTotal =
      organicAvailableN +
      organicNextDefoliationN +
      organicPrevYearNextYearN +
      fertiliserN;

    // Step 5: Classify nitrogen use
    nitrogenUse =
      nitrogenTotal > 250
        ? CloverMapper.HighClover
        : nitrogenTotal > 100
          ? CloverMapper.ModerateClover
          : CloverMapper.LowClover;

    return {
      nitrogenTotal,
      nitrogenUse,
    };
  }

  async isArableGrassGrass(first, second, third) {
    return (
      first === FieldTypeMapper.ARABLE &&
      second === FieldTypeMapper.GRASS &&
      third === FieldTypeMapper.GRASS
    );
  }

  async isArableArableGrass(first, second, third) {
    return (
      first === FieldTypeMapper.ARABLE &&
      second === FieldTypeMapper.ARABLE &&
      third === FieldTypeMapper.GRASS
    );
  }

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
  }

  async getPreviousGrassID(crop, transactionalManager, harvestYear) {
    // Step 1: Fetch crops for current and previous years
    let cropThisYear = crop;
    if (!cropThisYear) {
      cropThisYear = await transactionalManager.findOne(CropEntity, {
        where: { FieldID: crop.FieldID, Year: crop.Year },
      });
    }

    const { fieldTypes, fieldTypeMeta } =
      await this.getExtendedFieldTypesForLeyCheck(
        crop.FieldID,
        harvestYear,
        transactionalManager,
      );

    const [firstHyFieldType, secondHyFieldType, thirdHyFieldType] = fieldTypes;
    if (
      firstHyFieldType == FieldTypeMapper.ARABLE &&
      secondHyFieldType == FieldTypeMapper.ARABLE &&
      thirdHyFieldType == FieldTypeMapper.ARABLE
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
      transactionalManager,
    );
    let {
      isGrazedOnly,
      iscutOnly,
      iscutAndGrazing,
      isHighClover,
      nitrogenUse,
    } = lastGrass;
    if (nitrogenUse == CloverMapper.ModerateClover) {
      nitrogenUse = CloverMapper.LowClover;
    }
    if (isHighClover) {
      nitrogenUse = CloverMapper.HighClover;
    }
    // Step 6: NitrogenUse

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
          NitrogenUse: nitrogenUse,
        },
      },
    );

    return mapping?.PreviousGrassID || null;
  }
}
module.exports = { CalculateGrassHistoryAndPreviousGrass };
