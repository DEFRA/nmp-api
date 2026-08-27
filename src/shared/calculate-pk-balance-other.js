const { In } = require("typeorm");
const {
  PKBalanceIndexAdjustmentMapper,
} = require("../constants/other-crop-index");
const { OtherCropOfftake } = require("../constants/other-crop-offtake-mapper");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");

class CalculatePKBalanceOther {
  async getLastYearBalance(crop, transactionalManager) {
    return transactionalManager.findOneBy(PKBalanceEntity, {
      FieldID: crop.FieldID,
      Year: crop.Year - 1,
    });
  }

  async fetchAndCalculateNutrients(crop, transactionalManager) {
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
        },
      );

      const managementPeriodIds = managementPeriods.map((mp) => mp.ID);
      const organicManures = await transactionalManager.find(
        OrganicManureEntity,
        {
          where: {
            ManagementPeriodID: In(managementPeriodIds),
          },
        },
      );

      organicP2O5 = organicManures.reduce(
        (sum, o) => sum + (o.AvailableP2O5 || 0),
        0,
      );
      organicK2O = organicManures.reduce(
        (sum, o) => sum + (o.AvailableK2O || 0),
        0,
      );

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
        },
      );

      fertiliserP2O5 = fertiliserData.reduce(
        (sum, f) => sum + (f.P2O5 || 0),
        0,
      );
      fertiliserK2O = fertiliserData.reduce((sum, f) => sum + (f.K2O || 0), 0);
    }

    return {
      organicP2O5,
      organicK2O,
      fertiliserP2O5,
      fertiliserK2O,
    };
  }

  calculatePCropNeed(phosphorusIndex) {
    const indexValueZero = 0;
    const indexValueOne = 1;
    const indexValueTwo = 2;
    const indexValueThree = 3;

    if (phosphorusIndex >= indexValueThree) {
      return 0;
    } else if (phosphorusIndex === indexValueZero) {
      return (
        OtherCropOfftake.POFFTAKE + PKBalanceIndexAdjustmentMapper.INDEXZERO
      );
    } else if (phosphorusIndex === indexValueOne) {
      return (
        OtherCropOfftake.POFFTAKE + PKBalanceIndexAdjustmentMapper.INDEXONE
      );
    } else if (phosphorusIndex === indexValueTwo) {
      return (
        OtherCropOfftake.POFFTAKE + PKBalanceIndexAdjustmentMapper.INDEXTWO
      );
    } else {
      console.log("Unexpected PhosphorusIndex value:", phosphorusIndex);
      return 0;
    }
  }

  normalizePotassiumIndex(potassiumIndex) {
    if (potassiumIndex?.toString() === "-2") {
      return "2-";
    }
    return potassiumIndex;
  }

  calculateKCropNeed(potassiumIndex) {
    const indexValueZero = 0;
    const indexValueOne = 1;
    const normalizedIndex = this.normalizePotassiumIndex(potassiumIndex);

    if (normalizedIndex?.toString() === "2+") {
      return 0;
    } else if (normalizedIndex === indexValueZero) {
      return (
        OtherCropOfftake.KOFFTAKE + PKBalanceIndexAdjustmentMapper.INDEXZERO
      );
    } else if (normalizedIndex === indexValueOne) {
      return (
        OtherCropOfftake.KOFFTAKE + PKBalanceIndexAdjustmentMapper.INDEXONE
      );
    } else if (normalizedIndex?.toString() === "2-") {
      return (
        OtherCropOfftake.KOFFTAKE + PKBalanceIndexAdjustmentMapper.INDEXTWOMINUS
      );
    } else {
      console.log("Unexpected PotassiumIndex value:", normalizedIndex);
      return 0;
    }
  }

  calculatePBalance(pkBalanceLastYear, pCropNeed, organicP2O5, fertiliserP2O5) {
    return (
      (pkBalanceLastYear ? pkBalanceLastYear.PBalance : 0) -
      pCropNeed +
      organicP2O5 +
      fertiliserP2O5
    );
  }

  calculateKBalance(pkBalanceLastYear, kCropNeed, organicK2O, fertiliserK2O) {
    return (
      (pkBalanceLastYear ? pkBalanceLastYear.KBalance : 0) -
      kCropNeed +
      organicK2O +
      fertiliserK2O
    );
  }

  async calculatePKBalanceOther(
    crop,
    latestSoilAnalysis,
    transactionalManager,
  ) {
    const pkBalanceLastYear = await this.getLastYearBalance(
      crop,
      transactionalManager,
    );

    const { organicP2O5, organicK2O, fertiliserP2O5, fertiliserK2O } =
      await this.fetchAndCalculateNutrients(crop, transactionalManager);

    const pCropNeed = this.calculatePCropNeed(
      latestSoilAnalysis?.PhosphorusIndex,
    );
    const kCropNeed = this.calculateKCropNeed(
      latestSoilAnalysis.PotassiumIndex,
    );

    const pBalance = this.calculatePBalance(
      pkBalanceLastYear,
      pCropNeed,
      organicP2O5,
      fertiliserP2O5,
    );
    const kBalance = this.calculateKBalance(
      pkBalanceLastYear,
      kCropNeed,
      organicK2O,
      fertiliserK2O,
    );

    return {
      pBalance,
      kBalance,
    };
  }
}

module.exports = {
  CalculatePKBalanceOther,
};
