const { FieldTypeMapper } = require("../constants/field-type-mapper");
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
  async getPreviousGrassID(crop, transactionalManager, harvestYear) {
    // Step 1: Fetch crops for current and previous years
    let cropThisYear = crop;
    if (!cropThisYear) {
      cropThisYear = await transactionalManager.findOne(CropEntity, {
        where: { FieldID: crop.FieldID, Year: crop.Year },
      });
    }
    // const crop1 = await transactionalManager.findOne(CropEntity, {
    //   where: { FieldID: crop.FieldID, Year: crop.Year - 1 },
    // });
    // const crop2 = await transactionalManager.findOne(CropEntity, {
    //   where: { FieldID: crop.FieldID, Year: crop.Year - 2 },
    // });
    // const crop3 = await transactionalManager.findOne(CropEntity, {
    //   where: { FieldID: crop.FieldID, Year: crop.Year - 3 },
    // });

    const crop1 = await this.getCropForYear(
      crop.FieldID,
      harvestYear - 1,
      transactionalManager
    );
    const crop2 = await this.getCropForYear(
      crop.FieldID,
      harvestYear - 2,
      transactionalManager
    );
    const crop3 = await this.getCropForYear(
      crop.FieldID,
      harvestYear - 3,
      transactionalManager
    );

    let FirstHYFieldType = crop1?.FieldType || null;
    let SecondHYFieldType = crop2?.FieldType || null;
    let ThirdHYFieldType = crop3?.FieldType || null;

    // Step 2: Check PreviousGrass if crop not found
    const missingYears = [];
    if (!crop1) missingYears.push(harvestYear - 1);
    if (!crop2) missingYears.push(harvestYear - 2);
    if (!crop3) missingYears.push(harvestYear - 3);

    for (const y of missingYears) {
      const prevGrass = await transactionalManager.findOne(
        PreviousGrassesEntity,
        {
          where: { FieldID: crop.FieldID, HarvestYear: y },
        }
      );
      if (prevGrass) {
        if (y === harvestYear - 1) FirstHYFieldType = FieldTypeMapper.GRASS;
        if (y === harvestYear - 2) SecondHYFieldType = FieldTypeMapper.GRASS;
        if (y === harvestYear - 3) ThirdHYFieldType = FieldTypeMapper.GRASS;
      }
    }
    // 🆕 Assign default value `1` if still null
    if (FirstHYFieldType === null) FirstHYFieldType = FieldTypeMapper.ARABLE;
    if (SecondHYFieldType === null) SecondHYFieldType = FieldTypeMapper.ARABLE;
    if (ThirdHYFieldType === null) ThirdHYFieldType = FieldTypeMapper.ARABLE;

    // Step 8: If none of the FieldTypes is 2, return 1 directly
    if (
      FirstHYFieldType !== FieldTypeMapper.GRASS &&
      SecondHYFieldType !== FieldTypeMapper.GRASS &&
      ThirdHYFieldType !== FieldTypeMapper.GRASS
    ) {
      return 1;
    }

    // Step 3: LayDuration//need to check 5 yrs
    let layCount = 0;
    [FirstHYFieldType, SecondHYFieldType, ThirdHYFieldType].forEach((c) => {
      if (c === FieldTypeMapper.GRASS) layCount++;
    });
    const LayDuration = layCount > 2 ? 2 : layCount > 0 ? 1 : 0;

    // Step 4: IsGrazedOnly
    const SwardManagementID = cropThisYear?.SwardManagementID;
    const IsGrazedOnly = [SwardManagementMapper.GRAZEDONLY].includes(
      SwardManagementID
    )
      ? 1
      : 0;
    // const IscutOnly = [SwardManagementMapper.GRAZEDONLY].includes(
    //   SwardManagementID
    // )
    //   ? 1
    //   : 0;
    // const IscutAndGrazing = [SwardManagementMapper.GRAZEDONLY].includes(
    //   SwardManagementID
    // )
    //   ? 1
    //   : 0;
    // Step 5: IsHighClover
    const SwardTypeID = cropThisYear?.SwardTypeID;
    const IsHighClover = [
      SwardTypeMapper.GRASSANDCLOVER,
      SwardTypeMapper.REDCLOVER,
      SwardTypeMapper.LUCERNE,
    ].includes(SwardTypeID)
      ? 1
      : 0;

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

    const NitrogenUse = nitrogenTotal > 250 ? "High" : "Low";

    // Step 7: Lookup in PreviousGrassIdMapping
    const mapping = await transactionalManager.findOne(
      PreviousGrassIdMappingEntity,
      {
        where: {
          FirstHYFieldType: FirstHYFieldType,
          SecondHYFieldType: SecondHYFieldType,
          ThirdHYFieldType: ThirdHYFieldType,
          LayDuration: LayDuration,
          IsGrazedOnly: IsGrazedOnly,
          IsHighClover: IsHighClover,
          NitrogenUse: NitrogenUse, // This should be string: "High" or "Low"
        },
      }
    );

    return mapping?.PreviousGrassID || null;
  }
}
module.exports = { CalculateGrassHistoryAndPreviousGrass };
