const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { FieldTypeMapper } = require("../constants/field-type-mapper");
const { PreviousCroppingEntity } = require("../db/entity/previous-cropping.entity");

const calculatePreviousGrassLeyMethods = {
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
},

async calculateLeyFromCropData(fieldTypesArray) {
  let leyCount = 0;
  let currentStreak = 0;

  for (const ft of fieldTypesArray) {
    if (ft.fieldType === FieldTypeMapper.GRASS) {
      currentStreak++;
      leyCount = Math.max(leyCount, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return leyCount;
},

async calculateLeyDuration(fieldTypesArray, transactionalManager) {
  const leyCount = await this.calculateLeyFromCropData(fieldTypesArray);
  // Check if fieldType 2 is consecutive
  const hasConsecutiveLey = fieldTypesArray
    .sort((a, b) => b.processingYear - a.processingYear) // latest → oldest
    .some((item, index, arr) => {
      if (index === arr.length - 1) {return false};
      return (
        item.fieldType === 2 &&
        arr[index + 1].fieldType === 2 &&
        item.processingYear - arr[index + 1].processingYear === 1
      );
    });

  // If not consecutive, stop here
  if (!hasConsecutiveLey && leyCount > 0) {
    return leyCount;
  }

  // Only proceed to history if consecutive
  if (leyCount < 2) {
    const historyLey = await this.calculateLeyFromHistory(
      fieldTypesArray,
      transactionalManager
    );

    if (historyLey != null) {
      return historyLey;
    }
  }

  if (leyCount > 2) {return 2};
  if (leyCount > 0) {return 1};
   return 1
},

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
  const threeYears= 3,fiveYears = 5;
  for (let i = 1; i <= threeYears; i++) {
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
    for (let i = 4; i <= fiveYears; i++) {
      const year = harvestYear - i;
      const fieldType = await resolveFieldTypeForYear(year);
      pushIfGrass(fieldType);
    }
  }

  return {
    fieldTypes,
    fieldTypeMeta,
  };
},

async isArableGrassGrass(first, second, third) {
  return (
    first === FieldTypeMapper.ARABLE &&
    second === FieldTypeMapper.GRASS &&
    third === FieldTypeMapper.GRASS
  );
},

async isArableArableGrass(first, second, third) {
  return (
    first === FieldTypeMapper.ARABLE &&
    second === FieldTypeMapper.ARABLE &&
    third === FieldTypeMapper.GRASS
  );
}
};

module.exports = { calculatePreviousGrassLeyMethods };
