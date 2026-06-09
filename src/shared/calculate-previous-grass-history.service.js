const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { FieldTypeMapper } = require("../constants/field-type-mapper");
const {
  SoilGroupCategoriesMapper,
} = require("../constants/soil-group-categories-mapper");
const { SwardTypeMapper } = require("../constants/sward-type-mapper");
const {
  CropGroupCategoriesEntity,
} = require("../db/entity/crop-group-categories.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  GrassHistoryIdMappingEntity,
} = require("../db/entity/grass-history-id-mapping-entity");
const {
  PreviousCroppingEntity,
} = require("../db/entity/previous-cropping.entity");
const {
  SoilGroupCategoriesEntity,
} = require("../db/entity/soil-group-categories-entity");

const calculatePreviousGrassHistoryMethods = {
  async calculateIsReseeded(
    grassCrop,
    harvestYear,
    fieldId,
    transactionalManager,
  ) {
    if (grassCrop?.ID && grassCrop?.FieldType) {
      return this.getReseededValue(grassCrop.Establishment ?? null);
    }

    const cropBefore = await this.getCropForYear(
      fieldId,
      harvestYear - 1,
      transactionalManager,
    );

    if (cropBefore?.FieldType === FieldTypeMapper.GRASS) {
      return 0;
    }

    const prevGrassBefore = await transactionalManager.findOne(
      PreviousCroppingEntity,
      {
        where: {
          FieldID: fieldId,
          HarvestYear: harvestYear - 1,
        },
      },
    );

    if (prevGrassBefore?.CropTypeID === CropTypeMapper.GRASS) {
      return 0;
    }

    return 1;
  },

  isHighCloverSward(swardTypeID) {
    return [
      SwardTypeMapper?.GRASSANDCLOVER,
      SwardTypeMapper?.REDCLOVER,
      SwardTypeMapper?.LUCERNE,
    ].includes(swardTypeID)
      ? 1
      : 0;
  },

  getReseededValue(establishment) {
    return establishment === 0 || establishment === null ? 0 : 1;
  },

  async getFirstHarvestYearState(field, harvestYear, transactionalManager) {
    const crop1 = await this.getCropForYear(
      field.ID,
      harvestYear - 1,
      transactionalManager,
    );
    const state = {
      crop1,
      prevGrass1: null,
      firstHYFieldType: crop1?.FieldType ?? null,
      isHighClover: null,
      isReseeded: 0,
    };

    if (state.firstHYFieldType === FieldTypeMapper.GRASS && crop1 !== null) {
      state.isHighClover = this.isHighCloverSward(crop1?.SwardTypeID ?? null);
      state.isReseeded = this.getReseededValue(crop1?.Establishment ?? null);
      return state;
    }

    if (crop1?.IsBasePlan || !crop1) {
      return this.resolveFirstYearPreviousGrass(
        field,
        harvestYear,
        state,
        transactionalManager,
      );
    }

    state.firstHYFieldType = crop1?.FieldType || FieldTypeMapper.ARABLE;
    return state;
  },

  async resolveFirstYearPreviousGrass(
    field,
    harvestYear,
    state,
    transactionalManager,
  ) {
    state.prevGrass1 = await transactionalManager.findOne(
      PreviousCroppingEntity,
      {
        where: { FieldID: field.ID, HarvestYear: harvestYear - 1 },
      },
    );

    if (state.prevGrass1?.CropTypeID !== CropTypeMapper.GRASS) {
      state.firstHYFieldType = FieldTypeMapper.ARABLE;
      return state;
    }

    state.firstHYFieldType = FieldTypeMapper.GRASS;
    state.isHighClover = state.prevGrass1.HasGreaterThan30PercentClover ? 1 : 0;
    state.isReseeded = await this.calculateIsReseeded(
      state.prevGrass1,
      harvestYear - 1,
      field.ID,
      transactionalManager,
    );
    return state;
  },

  async getSecondHarvestYearState(
    field,
    harvestYear,
    firstYearState,
    transactionalManager,
  ) {
    const state = {
      ...firstYearState,
      crop2: null,
      prevGrass2: null,
      secondHYFieldType: null,
    };

    if (state.firstHYFieldType === FieldTypeMapper.GRASS) {
      return state;
    }

    state.crop2 = await this.getCropForYear(
      field.ID,
      harvestYear - 2,
      transactionalManager,
    );
    this.applySecondYearCropFlags(state);
    await this.resolveSecondYearPreviousGrass(
      field,
      harvestYear,
      state,
      transactionalManager,
    );
    return state;
  },

  applySecondYearCropFlags(state) {
    if (
      state.crop2 ||
      (!state.crop2?.IsBasePlan &&
        state.firstHYFieldType !== FieldTypeMapper.GRASS)
    ) {
      if (state.isHighClover === null) {
        state.isHighClover = this.isHighCloverSward(state.crop2?.SwardTypeID);
      }
      state.isReseeded = this.getReseededValue(state.crop1?.Establishment);
    }

    state.secondHYFieldType = state.crop2?.FieldType ?? null;
  },

  async resolveSecondYearPreviousGrass(
    field,
    harvestYear,
    state,
    transactionalManager,
  ) {
    if (state.secondHYFieldType !== null) {
      return;
    }

    state.prevGrass2 = await transactionalManager.findOne(
      PreviousCroppingEntity,
      {
        where: { FieldID: field.ID, HarvestYear: harvestYear - 2 },
      },
    );

    if (state.prevGrass2?.CropTypeID !== CropTypeMapper.GRASS) {
      state.secondHYFieldType = FieldTypeMapper.ARABLE;
      return;
    }

    state.secondHYFieldType = FieldTypeMapper.GRASS;
    state.isReseeded = await this.calculateIsReseeded(
      state.prevGrass2,
      harvestYear - 1,
      field.ID,
      transactionalManager,
    );
    this.applyPreviousGrassHighClover(state);
  },

  applyPreviousGrassHighClover(state) {
    if (
      state.isHighClover === null &&
      state.firstHYFieldType !== FieldTypeMapper.GRASS
    ) {
      state.isHighClover = state.prevGrass2?.HasGreaterThan30PercentClover
        ? 1
        : 0;
    }
  },

  isAllArableHistory(state) {
    return (
      state.firstHYFieldType === FieldTypeMapper.ARABLE &&
      state.secondHYFieldType === FieldTypeMapper.ARABLE
    );
  },

  getGrassCropForNitrogenUse(state) {
    if (
      state.firstHYFieldType === FieldTypeMapper.GRASS &&
      (state.crop1 || state.prevGrass1)
    ) {
      return state.crop1 || state.prevGrass1;
    }

    if (
      state.secondHYFieldType === FieldTypeMapper.GRASS &&
      (state.crop2 || state.prevGrass2)
    ) {
      return state.crop2 ? state.crop1 : state.prevGrass2;
    }

    return null;
  },

  async calculateGrassHistoryNitrogenUse(state, transactionalManager) {
    if (state.isHighClover === 1) {
      console.log("High clover detected");
      return null;
    }

    if (state.isHighClover !== 0) {
      console.log("no change in nitrogen use");
      return null;
    }

    const grassCrop = this.getGrassCropForNitrogenUse(state);
    if (!grassCrop) {
      return null;
    }

    const nitrogen = await this.calculateTotalNitrogenUseForCrop(
      grassCrop,
      transactionalManager,
    );
    return nitrogen?.nitrogenUse;
  },

  async getAllArableCategoryIds(field, cropThisYear, transactionalManager) {
    const soilGroupCategory = await transactionalManager.findOne(
      SoilGroupCategoriesEntity,
      {
        where: { SoilTypeID: field?.SoilTypeID },
      },
    );
    const soilGroupCategoryID = soilGroupCategory?.ID || null;
    let cropGroupCategoryID = null;

    if (soilGroupCategoryID === SoilGroupCategoriesMapper.ALLOTHERSOILTYPES) {
      const cropGroupCategory = await transactionalManager.findOne(
        CropGroupCategoriesEntity,
        {
          where: { CropTypeID: cropThisYear?.CropTypeID },
        },
      );
      cropGroupCategoryID = cropGroupCategory?.ID || null;
    }

    return { soilGroupCategoryID, cropGroupCategoryID };
  },

  async buildGrassHistoryMappingCriteria(
    field,
    cropThisYear,
    state,
    transactionalManager,
  ) {
    if (this.isAllArableHistory(state)) {
      const categoryIds = await this.getAllArableCategoryIds(
        field,
        cropThisYear,
        transactionalManager,
      );
      return {
        nitrogenUse: null,
        isHighClover: null,
        isReseeded: null,
        ...categoryIds,
      };
    }

    return {
      nitrogenUse: await this.calculateGrassHistoryNitrogenUse(
        state,
        transactionalManager,
      ),
      isHighClover: state.isHighClover,
      isReseeded: state.isReseeded,
      soilGroupCategoryID: null,
      cropGroupCategoryID: null,
    };
  },

  async getGrassHistoryID(
    field,
    cropThisYear,
    transactionalManager,
    harvestYear,
  ) {
    const firstYearState = await this.getFirstHarvestYearState(
      field,
      harvestYear,
      transactionalManager,
    );
    const state = await this.getSecondHarvestYearState(
      field,
      harvestYear,
      firstYearState,
      transactionalManager,
    );
    const criteria = await this.buildGrassHistoryMappingCriteria(
      field,
      cropThisYear,
      state,
      transactionalManager,
    );

    const mapping = await transactionalManager.findOne(
      GrassHistoryIdMappingEntity,
      {
        where: {
          FirstHYFieldType: state.firstHYFieldType,
          SecondHYFieldType: state.secondHYFieldType,
          IsReseeded: criteria.isReseeded,
          IsHighClover: criteria.isHighClover,
          NitrogenUse: criteria.nitrogenUse,
          SoilGroupCategoryID: criteria.soilGroupCategoryID,
          CropGroupCategoryID: criteria.cropGroupCategoryID,
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
  },
};

module.exports = { calculatePreviousGrassHistoryMethods };
