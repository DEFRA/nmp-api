const { In } = require("typeorm");
const {  PKBalanceIndexAdjustmentMapper } = require("../constants/other-crop-index");
const {
 OtherCropOfftake,
} = require("../constants/other-crop-offtake-mapper");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { FertiliserManuresEntity } = require("../db/entity/fertiliser-manures.entity");

class CalculatePKBalanceOther {
  constructor() {}

  


async calculatePKBalanceOther(
  crop,
  latestSoilAnalysis,
  transactionalManager
) {
  const pkBalanceLastYear = await transactionalManager.findOneBy(
    PKBalanceEntity,
    {
      FieldID: crop.FieldID,
      Year: crop.Year - 1,
    }
  );

  let organicP2O5 = 0;
  let organicK2O = 0;
  let fertiliserP2O5 = 0;
  let fertiliserK2O = 0;

  if (crop.ID) {
    const managementPeriods = await transactionalManager.find(
      ManagementPeriodEntity,
      {
        where: {
          CropID: crop.ID,
        },
      }
    );

    const managementPeriodIds = managementPeriods.map((mp) => mp.ID);

    if (managementPeriodIds.length > 0) {
      const organicManures = await transactionalManager.find(
        OrganicManureEntity,
        {
          where: {
            ManagementPeriodID: In(managementPeriodIds),
          },
        }
      );

      organicP2O5 = organicManures.reduce((sum, o) => sum + (o.AvailableP2O5 || 0), 0);
      organicK2O = organicManures.reduce((sum, o) => sum + (o.AvailableK2O || 0), 0);

      const fertiliserData = await transactionalManager.find(
        FertiliserManuresEntity,
        {
          where: {
            ManagementPeriodID: In(managementPeriodIds),
          },
          select: {
            P2O5: true,
            K2O: true,
          },
        }
      );

      fertiliserP2O5 = fertiliserData.reduce(
        (sum, f) => sum + (f.P2O5 || 0),
        0
      );
      fertiliserK2O = fertiliserData.reduce((sum, f) => sum + (f.K2O || 0), 0);
    }
  }

  let cropNeed = 0;

  // ---------- P Balance ----------
  if (
    latestSoilAnalysis.PhosphorusIndex &&
    latestSoilAnalysis.PhosphorusIndex >= 3
  ) {
    cropNeed = 0;
  } else if (latestSoilAnalysis.PhosphorusIndex == 0) {
    cropNeed =
      OtherCropOfftake.POFFTAKE + PKBalanceIndexAdjustmentMapper.INDEXZERO;
  } else if (latestSoilAnalysis.PhosphorusIndex == 1) {
    cropNeed =
      OtherCropOfftake.POFFTAKE + PKBalanceIndexAdjustmentMapper.INDEXONE;
  } else if (latestSoilAnalysis.PhosphorusIndex == 2) {
    cropNeed =
      OtherCropOfftake.POFFTAKE + PKBalanceIndexAdjustmentMapper.INDEXTWO;
  }

  const pBalance =
    (pkBalanceLastYear ? pkBalanceLastYear.PBalance : 0) -
    cropNeed +
    organicP2O5 +
    fertiliserP2O5;

  // ---------- K Balance ----------
  cropNeed = 0;

  // normalize PotassiumIndex value
  let potassiumIndex = latestSoilAnalysis.PotassiumIndex;

  // convert -2 => 2-
  if (potassiumIndex && potassiumIndex.toString() === "-2") {
    potassiumIndex = "2-";
  }

  if (potassiumIndex && potassiumIndex.toString() === "2+") {
    cropNeed = 0;
  } else if (potassiumIndex == 0) {
    cropNeed =
      OtherCropOfftake.KOFFTAKE + PKBalanceIndexAdjustmentMapper.INDEXZERO;
  } else if (potassiumIndex == 1) {
    cropNeed =
      OtherCropOfftake.KOFFTAKE + PKBalanceIndexAdjustmentMapper.INDEXONE;
  } else if (potassiumIndex && potassiumIndex.toString() === "2-") {
    cropNeed =
      OtherCropOfftake.KOFFTAKE + PKBalanceIndexAdjustmentMapper.INDEXTWOMINUS;
  }



  const kBalance =
    (pkBalanceLastYear ? pkBalanceLastYear.KBalance : 0) -
    cropNeed +
    organicK2O +
    fertiliserK2O;

  return {
    pBalance,
    kBalance,
  };
}


}

module.exports = {
  CalculatePKBalanceOther,
};
