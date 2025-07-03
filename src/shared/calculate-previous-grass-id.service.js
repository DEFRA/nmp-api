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
const { PreviousGrassIdMappingEntity } = require("../db/entity/previous-grass-Id-mapping.entity");
const { PreviousGrassesEntity } = require("../db/entity/previous-grasses-entity");
const { SoilGroupCategoriesEntity } = require("../db/entity/soil-group-categories-entity");

class CalculateGrassHistoryAndPreviousGrass {
  constructor() {}

  async calculateIsReseeded(
    grassCrop,
    harvestYear,
    fieldId,
    transactionalManager
  ) {
    // 🌱 Case 1: Grass from PreviousGrassesEntity
    if (!grassCrop?.ID || !grassCrop?.FieldType) {
 

      // First try getting crop from previous year
      const cropBefore = await this.getCropForYear(
        fieldId,
        harvestYear-1,
        transactionalManager
      );

      if (cropBefore?.FieldType === FieldTypeMapper.GRASS) {
        return 0; // Not reseeded
      }

      // Then try finding PreviousGrassesEntity from previous year
      const prevGrassBefore = await transactionalManager.findOne(
        PreviousGrassesEntity,
        {
          where: {
            FieldID: fieldId,
            HarvestYear: harvestYear-1,
          },
        }
      );

      if (prevGrassBefore) {
        return 0; // Not reseeded
      }

      // No data found before the grass year → Assume reseeded
      return 1;
    }


  }

  async getGrassHistoryID(
    field,
    cropThisYear,
    transactionalManager,
    harvestYear
  ) {
    let isHighClover = null;
    let isReseeded = 0;

    // -----------------------------
    // Step 1: Year -1
    // -----------------------------
    const crop1 = await this.getCropForYear(
      field.ID,
      harvestYear - 1,
      transactionalManager
    );
    let firstHYFieldType = crop1?.FieldType ?? null;

    if (
      firstHYFieldType === 2 &&
      crop1!==null ||
      crop1?.CropInfo1 !== null &&
      crop1?.Yield !== null &&
      crop1?.DefoliationSequenceID !== null
    ) {
      // Grass found in crop1

      const SwardTypeID = crop1.SwardTypeID;
      isHighClover = [
        SwardTypeMapper.GRASSANDCLOVER,
        SwardTypeMapper.REDCLOVER,
        SwardTypeMapper.LUCERNE,
      ].includes(SwardTypeID)
        ? 1
        : 0;

      const establishment = crop1?.Establishment;
      isReseeded = establishment === 0 || establishment === null ? 0 : 1;
    } else if (
      (crop1?.CropInfo1 == null &&
        crop1?.Yield == null &&
        crop1?.DefoliationSequenceID == null) ||
      !crop1
    ) {
      const prevGrass1 = await transactionalManager.findOne(
        PreviousGrassesEntity,
        {
          where: { FieldID: field.ID, HarvestYear: harvestYear - 1 },
        }
      );

      if (prevGrass1) {
        firstHYFieldType = FieldTypeMapper.GRASS;
        isHighClover = prevGrass1.HasGreaterThan30PercentClover ? 1 : 0;
        isReseeded = await this.calculateIsReseeded(
          prevGrass1,
          harvestYear - 1,
          field.ID,
          transactionalManager
        );
      } else {
        firstHYFieldType = FieldTypeMapper.ARABLE;
      }
    } else {
      firstHYFieldType = crop1?.FieldType || FieldTypeMapper.ARABLE;
    }

    // -----------------------------
    // Step 2: Year -2
    // -----------------------------
    // const crop2 = await this.getCropForYear(
    //   field.ID,
    //   harvestYear - 2,
    //   transactionalManager
    // );
    // let secondHYFieldType = crop2?.FieldType ?? null;

    // if (secondHYFieldType === null) {
    //   const prevGrass2 = await transactionalManager.findOne(
    //     PreviousGrassesEntity,
    //     {
    //       where: { FieldID: field.ID, HarvestYear: harvestYear - 2 },
    //     }
    //   );

    //   if (prevGrass2) {
    //     secondHYFieldType = FieldTypeMapper.GRASS;
    //     if (
    //       isHighClover === null &&
    //       firstHYFieldType !== FieldTypeMapper.GRASS
    //     ) {
    //       isHighClover = prevGrass2.HasGreaterThan30PercentClover ? 1 : 0;
    //     }
    //   } else {
    //     secondHYFieldType = FieldTypeMapper.ARABLE;
    //   }
    // } else if (
    //   secondHYFieldType === FieldTypeMapper.GRASS &&
    //   isHighClover === null &&
    //   firstHYFieldType !== FieldTypeMapper.GRASS &&
    //   crop2
    // ) {
    //   if (
    //     crop2?.CropInfo1 !== null &&
    //     crop2?.Yield !== null &&
    //     crop2?.DefoliationSequenceID !== null
    //   ){

    //     const SwardTypeID = crop2.SwardTypeID;
    //     isHighClover = [
    //       SwardTypeMapper.GRASSANDCLOVER,
    //       SwardTypeMapper.REDCLOVER,
    //       SwardTypeMapper.LUCERNE,
    //     ].includes(SwardTypeID)
    //       ? 1
    //       : 0;
    //   }
    // }
    let secondHYFieldType = null,crop2
    if (firstHYFieldType !== FieldTypeMapper.GRASS) {
       crop2 = await this.getCropForYear(
        field.ID,
        harvestYear - 2,
        transactionalManager
      );

      // 🌿 Try determining isHighClover from crop2 first
      if (
        crop2 ||
        crop2?.CropInfo1 !== null &&
        crop2?.Yield !== null &&
        crop2?.DefoliationSequenceID !== null &&
        firstHYFieldType !== FieldTypeMapper.GRASS
      ) {
        const swardTypeID = crop2.SwardTypeID;
        const highCloverTypes = [
          SwardTypeMapper.GRASSANDCLOVER,
          SwardTypeMapper.REDCLOVER,
          SwardTypeMapper.LUCERNE,
        ];

        if (isHighClover === null) {
          isHighClover = highCloverTypes.includes(swardTypeID) ? 1 : 0;
        }
        const establishment = crop1?.Establishment;
        isReseeded = establishment === 0 || establishment === null ? 0 : 1;
      }

      // 🧠 Determine secondHYFieldType
      secondHYFieldType = crop2?.FieldType ?? null;

      if (secondHYFieldType === null) {
        const prevGrass2 = await transactionalManager.findOne(
          PreviousGrassesEntity,
          {
            where: { FieldID: field.ID, HarvestYear: harvestYear - 2 },
          }
        );

        if (prevGrass2) {
          secondHYFieldType = FieldTypeMapper.GRASS;
          isReseeded = await this.calculateIsReseeded(
            prevGrass2,
            harvestYear - 1,
            field.ID,
            transactionalManager
          );
          // ✅ Only derive isHighClover if not already set AND firstHY was not grass
          if (
            isHighClover === null &&
            firstHYFieldType !== FieldTypeMapper.GRASS
          ) {
            isHighClover = prevGrass2.HasGreaterThan30PercentClover ? 1 : 0;
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

    if (isHighClover === 1) {
      nitrogenUse = null; // Skip calculation
    } else if (isHighClover === 0) {
      let grassCrop = null;
      if (firstHYFieldType === FieldTypeMapper.GRASS && crop1) {
        grassCrop = crop1;
      } else if (secondHYFieldType === FieldTypeMapper.GRASS && crop2) {
        grassCrop = crop2;
      }

      if (grassCrop) {
        nitrogenUse = await this.calculateTotalNitrogenUseForCrop(
          grassCrop,
          transactionalManager
        );
        nitrogenUse = nitrogenUse.nitrogenUse
      }
    }

    // 🔘 Commented old nitrogen code
    // let nitrogenTotal = 0;
    // if (cropThisYear?.ID) {
    //   const managementPeriods = await transactionalManager.find(
    //     ManagementPeriodEntity,
    //     { where: { CropID: cropThisYear.ID } }
    //   );
    //   const mgmtIds = managementPeriods.map((mp) => mp.ID);
    //   for (const mgmtId of mgmtIds) {
    //     const organicManures = await transactionalManager.find(
    //       OrganicManureEntity,
    //       { where: { ManagementPeriodID: mgmtId } }
    //     );
    //     for (const o of organicManures) nitrogenTotal += o.N || 0;

    //     const fertiliserManures = await transactionalManager.find(
    //       FertiliserManuresEntity,
    //       { where: { ManagementPeriodID: mgmtId } }
    //     );
    //     for (const f of fertiliserManures) nitrogenTotal += f.N || 0;
    //   }
    // }
    // const NitrogenUse = nitrogenTotal > 250 ? "High" : "Low";

    // -----------------------------
    // Step 5: Soil and Crop Group Categories
    // -----------------------------
    if(firstHYFieldType == FieldTypeMapper.ARABLE && secondHYFieldType == FieldTypeMapper.ARABLE ){
      nitrogenUse=null
      isHighClover=null
      isReseeded=null
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
        }
      );

      soilGroupCategoryID = soilGroupCategory?.ID || null;

      if (soilGroupCategoryID === SoilGroupCategoriesMapper.ALLOTHERSOILTYPES) {
        const cropGroupCategory = await transactionalManager.findOne(
          CropGroupCategoriesEntity,
          {
            where: { CropTypeID: cropThisYear?.CropTypeID },
          }
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

  async calculateTotalNitrogenUseForCrop(crop, transactionalManager) {
    if (!crop?.ID) return { nitrogenTotal: 0, nitrogenUse: "Low" };

    let organicAvailableN = 0;
    let organicNextDefoliationN = 0;
    let organicPrevYearNextYearN = 0;
    let fertiliserN = 0;

    // Step 1: Current year's Organic Manures
    const managementPeriods = await transactionalManager.find(
      ManagementPeriodEntity,
      { where: { CropID: crop.ID } }
    );

    for (const mp of managementPeriods) {
      const organicManures = await transactionalManager.find(
        OrganicManureEntity,
        { where: { ManagementPeriodID: mp.ID } }
      );

      for (const manure of organicManures) {
        organicAvailableN += manure.AvailableN || 0;
        organicNextDefoliationN += manure.AvailableNForNextDefoliation || 0;
      }

      // Step 2: Fertiliser Manures for same ManagementPeriod
      const fertiliserManures = await transactionalManager.find(
        FertiliserManuresEntity,
        { where: { ManagementPeriodID: mp.ID } }
      );

      for (const fert of fertiliserManures) {
        fertiliserN += fert.N || 0;
      }
    }

    // Step 3: OrganicManure of previous year's crop (AvailableNForNextYear)
    const previousCrop = await this.getCropForYear(
      crop.FieldID,
      crop.Year - 1,
      transactionalManager
    );

    if (previousCrop?.ID) {
      const prevMgmtPeriods = await transactionalManager.find(
        ManagementPeriodEntity,
        { where: { CropID: previousCrop.ID } }
      );

      for (const mp of prevMgmtPeriods) {
        const organicManures = await transactionalManager.find(
          OrganicManureEntity,
          { where: { ManagementPeriodID: mp.ID } }
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
    const nitrogenUse =
      nitrogenTotal > 250 ? "High" : nitrogenTotal > 100 ? "Moderate" : "Low";

    return {
      nitrogenTotal,
      nitrogenUse,
    };
  }

  async findLastGrassCropDetails(fieldId, fromYear, transactionalManager) {
    let nitrogenUse = "Low";
    for (let y = fromYear - 1; y >= fromYear - 5; y--) {
      // Check CropEntity
      const crop = await this.getCropForYear(fieldId, y, transactionalManager);
      if (
        crop?.CropInfo1 !== null &&
        crop?.Yield !== null &&
        crop?.DefoliationSequenceID !== null
      ) {
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
          const { nitrogenUse } = await this.calculateTotalNitrogenUseForCrop(
            crop,
            transactionalManager
          );

          return {
            crop,
            isGrazedOnly,
            iscutOnly,
            iscutAndGrazing,
            isHighClover,
            nitrogenUse,
          };
        }
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

        nitrogenUse = null;

        if (prevGrass.HasGreaterThan30PercentClover) {
          nitrogenUse = "High";
        } else {
          const nitrogenId = prevGrass.SoilNitrogenSupplyItemID;
          if (nitrogenId === SoilNitrogenMapper.HIGHN) nitrogenUse = "High";
          else if (nitrogenId === SoilNitrogenMapper.MODERATEN)
            nitrogenUse = "Moderate";
          else if (nitrogenId === SoilNitrogenMapper.LOWN) nitrogenUse = "Low";
          else nitrogenUse = "Low"; // fallback
        }

        return {
          crop: prevGrass,
          isGrazedOnly,
          iscutOnly,
          iscutAndGrazing,
          isHighClover,
          nitrogenUse,
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
    if(firstHyFieldType ==1 && secondHyFieldType==1 && thirdHyFieldType ==1 ){
      return 1
    }
    const leyDuration = await this.calculateLeyDuration(fieldTypes);
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
    if(nitrogenUse =='Moderate'){
      nitrogenUse='Low'
    }
    // Step 6: NitrogenUse
    // let nitrogenTotal = 0;

    // if (cropThisYear?.ID) {
    //   const managementPeriods = await transactionalManager.find(
    //     ManagementPeriodEntity,
    //     {
    //       where: { CropID: cropThisYear.ID },
    //     }
    //   );

    //   const mgmtIds = managementPeriods.map((mp) => mp.ID);
    //   let organicN = 0;
    //   let fertiliserN = 0;

    //   for (const mgmtId of mgmtIds) {
    //     const organicManures = await transactionalManager.find(
    //       OrganicManureEntity,
    //       {
    //         where: { ManagementPeriodID: mgmtId },
    //       }
    //     );
    //     for (const o of organicManures) {
    //       organicN += o.N || 0;
    //     }

    //     const fertiliserManures = await transactionalManager.find(
    //       FertiliserManuresEntity,
    //       {
    //         where: { ManagementPeriodID: mgmtId },
    //       }
    //     );
    //     for (const f of fertiliserManures) {
    //       fertiliserN += f.N || 0;
    //     }
    //   }

    //   nitrogenTotal = organicN + fertiliserN;
    // }

    // nitrogenUse = nitrogenTotal > 250 ? "High" : "Low";

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
