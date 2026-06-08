const { CloverMapper } = require("../constants/clover-mapper");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { FieldTypeMapper } = require("../constants/field-type-mapper");
const { SoilGroupCategoriesMapper } = require("../constants/soil-group-categories-mapper");
const { SwardTypeMapper } = require("../constants/sward-type-mapper");
const { CropGroupCategoriesEntity } = require("../db/entity/crop-group-categories.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const { GrassHistoryIdMappingEntity } = require("../db/entity/grass-history-id-mapping-entity");
const { PreviousCroppingEntity } = require("../db/entity/previous-cropping.entity");
const { SoilGroupCategoriesEntity } = require("../db/entity/soil-group-categories-entity");

const calculatePreviousGrassHistoryMethods = {
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

    if (prevGrassBefore.CropTypeID === CropTypeMapper.GRASS) {
      return 0;
    }

    // No data found before the grass year → Assume reseeded
    return 1;
  }
},

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

    if (prevGrass1.CropTypeID === CropTypeMapper.GRASS) {
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

      if (prevGrass2 && prevGrass2?.CropTypeID === CropTypeMapper.GRASS) {
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
    console.log("High clover detected");
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
  } else {
    console.log("no change in nitrogen use")
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
},

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
};

module.exports = { calculatePreviousGrassHistoryMethods };
