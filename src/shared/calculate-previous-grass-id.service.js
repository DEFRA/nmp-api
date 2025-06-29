const { FieldTypeMapper } = require("../constants/field-type-mapper");
const { GrassManagementOptionsMapper } = require("../constants/grass-management-options-mapper");
const { SoilGroupCategoriesMapper } = require("../constants/soil-group-categories-mapper");
const { SwardManagementMapper } = require("../constants/sward-management-mapper");
const { SwardTypeMapper } = require("../constants/sward-type-mapper");
const { CropGroupCategoriesEntity } = require("../db/entity/crop-group-categories.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const { FertiliserManuresEntity } = require("../db/entity/fertiliser-manures.entity");
const { GrassHistoryIdMappingEntity } = require("../db/entity/grass-history-id-mapping-entity");
const { ManagementPeriodEntity } = require("../db/entity/management-period.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { PreviousGrassIdMappingEntity } = require("../db/entity/previous-grass-Id-mapping.entity");
const { PreviousGrassesEntity } = require("../db/entity/previous-grasses-entity");
const { SoilGroupCategoriesEntity } = require("../db/entity/soil-group-categories-entity");

class CalculateGrassHistoryAndPreviousGrass {
  constructor() {}

  async getGrassHistoryID(
    field,
    cropThisYear,
    transactionalManager,
    harvestYear
  ) {
    // Step 1: Get crops for Year - 1 and Year - 2
    // const crop1 = await transactionalManager.findOne(CropEntity, {
    //   where: { FieldID: field.ID, Year: cropThisYear.Year - 1 },
    // });
    // const crop2 = await transactionalManager.findOne(CropEntity, {
    //   where: { FieldID: field.ID, Year: cropThisYear.Year - 2 },
    // });
    const crop1 = await this.getCropForYear(
      field.ID,
      harvestYear - 1,
      transactionalManager
    );
    const crop2 = await this.getCropForYear(
      field.ID,
      harvestYear - 2,
      transactionalManager
    );

    let FirstHYFieldType = crop1?.FieldType || null;
    let SecondHYFieldType = crop2?.FieldType || null;

    // 🟡 Check PreviousGrassesEntity if crops not found
    if (FirstHYFieldType === null) {
      const prevGrass1 = await transactionalManager.findOne(
        PreviousGrassesEntity,
        {
          where: { FieldID: field.ID, HarvestYear: harvestYear - 1 },
        }
      );
      FirstHYFieldType = prevGrass1
        ? FieldTypeMapper.GRASS
        : FieldTypeMapper.ARABLE; // If not found, assign ARABLE
    }

    if (SecondHYFieldType === null) {
      const prevGrass2 = await transactionalManager.findOne(
        PreviousGrassesEntity,
        {
          where: { FieldID: field.ID, HarvestYear: harvestYear - 2 },
        }
      );
      SecondHYFieldType = prevGrass2 ? 2 : 1;
    }

    // Step 2: IsReseeded - only when FirstHYFieldType === 2
    let IsReseeded = null;
    if (FirstHYFieldType === FieldTypeMapper.GRASS) {
      const establishment = cropThisYear?.Establishment;
      IsReseeded = establishment === 0 || establishment === null ? 0 : 1;
    }

    // Step 3: IsHighClover - from cropThisYear.SwardTypeID
    const SwardTypeID = cropThisYear?.SwardTypeID;
    const IsHighClover = [
      SwardTypeMapper.GRASSANDCLOVER,
      SwardTypeMapper.REDCLOVER,
      SwardTypeMapper.LUCERNE,
    ].includes(SwardTypeID)
      ? 1
      : 0;

    // Step 4: NitrogenUse - sum N from organic and fertiliser manures
    let nitrogenTotal = 0;

    if (cropThisYear?.ID) {
      const managementPeriods = await transactionalManager.find(
        ManagementPeriodEntity,
        {
          where: { CropID: cropThisYear.ID },
        }
      );

      const mgmtIds = managementPeriods.map((mp) => mp.ID);
      let organicN = 0;
      let fertiliserN = 0;

      for (const mgmtId of mgmtIds) {
        const organicManures = await transactionalManager.find(
          OrganicManureEntity,
          {
            where: { ManagementPeriodID: mgmtId },
          }
        );
        for (const o of organicManures) {
          organicN += o.N || 0;
        }

        const fertiliserManures = await transactionalManager.find(
          FertiliserManuresEntity,
          {
            where: { ManagementPeriodID: mgmtId },
          }
        );
        for (const f of fertiliserManures) {
          fertiliserN += f.N || 0;
        }
      }

      nitrogenTotal = organicN + fertiliserN;
    }

    const NitrogenUse = nitrogenTotal > 250 ? "High" : "Low"; //100 to 250 => moderate// below 100 => low// above 250 => high

    // Step 5: SoilGroupCategoryID - only if both FieldTypes are 1
    let SoilGroupCategoryID = null;
    if (
      FirstHYFieldType === FieldTypeMapper.ARABLE &&
      SecondHYFieldType === FieldTypeMapper.ARABLE
    ) {
      //enum
      // const field = await transactionalManager.findOne(FieldEntity, {
      //   where: { ID: field.FieldID },
      // });
      const soilTypeID = field?.SoilTypeID;

      const soilGroupCategory = await transactionalManager.findOne(
        SoilGroupCategoriesEntity,
        {
          where: { SoilTypeID: soilTypeID },
        }
      );
      SoilGroupCategoryID = soilGroupCategory?.ID || null;

      // Step 6: CropGroupCategoryID - only if SoilGroupCategoryID is 2
      if (SoilGroupCategoryID === SoilGroupCategoriesMapper.ALLOTHERSOILTYPES) {
        const cropGroupCategory = await transactionalManager.findOne(
          CropGroupCategoriesEntity,
          {
            where: { CropTypeID: cropThisYear?.CropTypeID },
          }
        );
        var CropGroupCategoryID = cropGroupCategory?.ID || null;
      } else {
        var CropGroupCategoryID = null;
      }
    } else {
      var CropGroupCategoryID = null;
    }

    // Step 7: Final lookup in GrassHistoryIdMapping
    const mapping = await transactionalManager.findOne(
      GrassHistoryIdMappingEntity,
      {
        where: {
          FirstHYFieldType,
          SecondHYFieldType,
          IsReseeded,
          IsHighClover,
          NitrogenUse,
          SoilGroupCategoryID,
          CropGroupCategoryID,
        },
      }
    );

    return mapping?.GrassHistoryID || null;
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

  async calculateLeyDuration(fieldTypes) {
    let leyCount = 0;
    let currentStreak = 0;

    for (const ft of fieldTypes) {
      if (ft === 2) {
        // 2 = Grass
        currentStreak++;
        if (currentStreak > leyCount) {
          leyCount = currentStreak;
        }
      } else {
        currentStreak = 0; // Reset on non-grass
      }
    }

    // Return ley duration category
    if (leyCount > 2) return 2;
    if (leyCount > 0) return 1;
    return 0;
  }

  async getExtendedFieldTypesForLeyCheck(
    fieldId,
    harvestYear,
    transactionalManager
  ) {
    const fieldTypes = [];

    // Step 1: Get field types for years: -1, -2, -3
    for (let i = 1; i <= 3; i++) {
      const crop = await this.getCropForYear(
        fieldId,
        harvestYear - i,
        transactionalManager
      );
      let fieldType = crop?.FieldType ?? null;

      if (!fieldType) {
        const prevGrass = await transactionalManager.findOne(
          PreviousGrassesEntity,
          {
            where: { FieldID: fieldId, HarvestYear: harvestYear - i },
          }
        );
        if (prevGrass) fieldType = FieldTypeMapper.GRASS;
      }

      fieldTypes.push(fieldType ?? FieldTypeMapper.ARABLE);
    }

    // Step 2: Handle additional years for Ley calculation
    const [first, second, third] = fieldTypes;

    if (
      first === FieldTypeMapper.ARABLE &&
      second === FieldTypeMapper.GRASS &&
      third === FieldTypeMapper.GRASS
    ) {
      const crop4 = await this.getCropForYear(
        fieldId,
        harvestYear - 4,
        transactionalManager
      );
      let fieldType4 = crop4?.FieldType ?? null;

      if (!fieldType4) {
        const prevGrass = await transactionalManager.findOne(
          PreviousGrassesEntity,
          {
            where: { FieldID: fieldId, HarvestYear: harvestYear - 4 },
          }
        );
        if (prevGrass) fieldType4 = FieldTypeMapper.GRASS;
      }

      if (fieldType4 === FieldTypeMapper.GRASS)
        fieldTypes.push(FieldTypeMapper.GRASS);
    }

    if (
      first === FieldTypeMapper.ARABLE &&
      second === FieldTypeMapper.ARABLE &&
      third === FieldTypeMapper.GRASS
    ) {
      for (let i = 4; i <= 5; i++) {
        const cropX = await this.getCropForYear(
          fieldId,
          harvestYear - i,
          transactionalManager
        );
        let fieldTypeX = cropX?.FieldType ?? null;

        if (!fieldTypeX) {
          const prevGrass = await transactionalManager.findOne(
            PreviousGrassesEntity,
            {
              where: { FieldID: fieldId, HarvestYear: harvestYear - i },
            }
          );
          if (prevGrass) fieldTypeX = FieldTypeMapper.GRASS;
        }

        if (fieldTypeX === FieldTypeMapper.GRASS) {
          fieldTypes.push(FieldTypeMapper.GRASS);
        }
      }
    }

    return fieldTypes;
  }

  async findLastGrassCropDetails(fieldId, fromYear, transactionalManager) {
    for (let y = fromYear - 1; y >= fromYear - 5; y--) {
      // Check CropEntity
      const crop = await this.getCropForYear(fieldId, y, transactionalManager);
      if (crop?.FieldType === 2) {
        const swardManagementId = crop.SwardManagementID;
        const swardTypeID = crop.SwardTypeID;

        const isGrazedOnly =
          swardManagementId === SwardManagementMapper.GRAZEDONLY ? 1 : 0;
        const iscutOnly = [
          SwardManagementMapper.CUTFORSILAGEONLY,
          SwardManagementMapper.CUTFORHAYONLY,
        ].includes(swardManagementId)
          ? 1
          : 0;
        const iscutAndGrazing = [
          SwardManagementMapper.GRAZINGANDHAY,
          SwardManagementMapper.GRAZINGANDSILAGE,
        ].includes(swardManagementId)
          ? 1
          : 0;

        const isHighClover = [
          SwardTypeMapper.GRASSANDCLOVER,
          SwardTypeMapper.REDCLOVER,
          SwardTypeMapper.LUCERNE,
        ].includes(swardTypeID)
          ? 1
          : 0;

        return { crop, isGrazedOnly, iscutOnly, iscutAndGrazing, isHighClover };
      }

      // Check PreviousGrassesEntity
      const prevGrass = await transactionalManager.findOne(
        PreviousGrassesEntity,
        {
          where: { FieldID: fieldId, HarvestYear: y },
        }
      );

      if (prevGrass) {
        const mgmtId = prevGrass.GrassManagementOptionID;

        const isGrazedOnly =
          mgmtId === GrassManagementOptionsMapper.GRAZEDONLY ? 1 : 0;
        const iscutOnly =
          mgmtId === GrassManagementOptionsMapper.CUTONLY ? 1 : 0;
        const iscutAndGrazing =
          mgmtId === GrassManagementOptionsMapper.GRAZEDANDCUT ? 1 : 0;

        const isHighClover = prevGrass.HasGreaterThan30PercentClover ? 1 : 0;

        return {
          crop: prevGrass,
          isGrazedOnly,
          iscutOnly,
          iscutAndGrazing,
          isHighClover,
        };
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

    const fieldTypes = await this.getExtendedFieldTypesForLeyCheck(
      crop.FieldID,
      harvestYear,
      transactionalManager
    );

    const [firstHyFieldType, secondHyFieldType, thirdHyFieldType] = fieldTypes;

    const leyDuration = await this.calculateLeyDuration(fieldTypes);
    const lastGrass = await this.findLastGrassCropDetails(
      crop.FieldID,
      harvestYear,
      transactionalManager
    );
     const {
    isGrazedOnly,
    iscutOnly,
    iscutAndGrazing,
    isHighClover,
  } = lastGrass;
    // Step 6: NitrogenUse
    let nitrogenTotal = 0;

    if (cropThisYear?.ID) {
      const managementPeriods = await transactionalManager.find(
        ManagementPeriodEntity,
        {
          where: { CropID: cropThisYear.ID },
        }
      );

      const mgmtIds = managementPeriods.map((mp) => mp.ID);
      let organicN = 0;
      let fertiliserN = 0;

      for (const mgmtId of mgmtIds) {
        const organicManures = await transactionalManager.find(
          OrganicManureEntity,
          {
            where: { ManagementPeriodID: mgmtId },
          }
        );
        for (const o of organicManures) {
          organicN += o.N || 0;
        }

        const fertiliserManures = await transactionalManager.find(
          FertiliserManuresEntity,
          {
            where: { ManagementPeriodID: mgmtId },
          }
        );
        for (const f of fertiliserManures) {
          fertiliserN += f.N || 0;
        }
      }

      nitrogenTotal = organicN + fertiliserN;
    }

    const nitrogenUse = nitrogenTotal > 250 ? "High" : "Low";

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
      }
    );

    return mapping?.PreviousGrassID || null;
  }
}
module.exports = { CalculateGrassHistoryAndPreviousGrass };
