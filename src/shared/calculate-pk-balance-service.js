const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { CalculatePKBalanceOther } = require("./calculate-pk-balance-other");

class CalculatePKBalance {
  constructor() {
    this.CalculatePKBalanceOther = new CalculatePKBalanceOther();
  }

 
  async getPKBalanceData(field, year, transactionalManager) {
    try {
      // Find the data by filtering allPKBalanceData
      const pkBalanceData = await transactionalManager.findOne(
        PKBalanceEntity,
        {
          where: {
            Year: year,
            FieldID: field.ID,
          },
        },
      );

      return pkBalanceData || null; // Return the found data or null if not found
    } catch (error) {
      console.error("Error fetching PK Balance data:", error);
      throw error; // Re-throw the error or handle it as needed
    }
  }

   processDefoliationRecommendations(defoliationItems, cropPOfftake) {
    let pBalance = 0,
      kBalance = 0;
    for (const recommendation of defoliationItems) {
      const rec = recommendation.recommendation ?? 0;
      const man = recommendation.manures ?? 0;
      const pk = recommendation.pkBalance ?? 0;

      if (recommendation.nutrientId === 1) {
        pBalance += pk - rec - cropPOfftake + man;
      }

      if (recommendation.nutrientId === 2) {
        kBalance += pk - rec + man;
      }
    }

    return { pBalance, kBalance };
  }

  async calculatePKBalanceFromSequences(
    calculations,
    cropPOfftake,
    fertiliserData
  ) {
    let pBalance = 0,
      kBalance = 0;
    const fertiliserP = fertiliserData?.p205,
      fertiliserK = fertiliserData?.k20;
    const sequenceIds = [...new Set(calculations.map((c) => c.sequenceId))];
    for (const sequenceId of sequenceIds) {
      const sequenceItems = calculations.filter(
        (c) => c.sequenceId === sequenceId,
      );
      const defoliationIds = [
        ...new Set(sequenceItems.map((c) => c.defoliationId)),
      ];
      for (const defoliationId of defoliationIds) {
        const defoliationItems = sequenceItems.filter(
          (c) => c.defoliationId === defoliationId,
        );
        const balances = this.processDefoliationRecommendations(
          defoliationItems,
          cropPOfftake
        );
        pBalance += balances.pBalance;
        kBalance += balances.kBalance;
      }
    }
    // Add fertiliser at the end
    pBalance += fertiliserP;
    kBalance += fertiliserK;

    return { pBalance, kBalance };
  }

  async adjustBalanceBasedOnSoilAnalysis(
    soilAndCropOffTakeContext,
    pBalance,
    kBalance,
  ) {
    const latestSoilAnalysis =
      soilAndCropOffTakeContext?.latestSoilAnalysis || {};

    // If no soil analysis exists
    if (Object.keys(latestSoilAnalysis).length === 0) {
      return {
        pBalance: 0,
        kBalance: 0,
      };
    }

    // If soil analysis exists but specific index is null
    return {
      pBalance: latestSoilAnalysis.PhosphorusIndex == null ? 0 : pBalance,
      kBalance: latestSoilAnalysis.PotassiumIndex == null ? 0 : kBalance,
    };
  }

  async buildPKBalancePayload(pkBalance, crop, pBalance, kBalance, userId) {
    const baseData = {
      Year: crop.Year,
      FieldID: crop.FieldID,
      PBalance: pBalance,
      KBalance: kBalance,
    };

    const now = new Date();

    // UPDATE
    if (pkBalance) {
      return {
        ...pkBalance,
        ...baseData,
        ModifiedOn: now,
        ModifiedByID: userId,
      };
    }

    // CREATE
    return {
      ...baseData,
      CreatedOn: now,
      CreatedByID: userId,
    };
  }

  async calculatePKBalance(
    crop,
    previousCrop,
    previousYearPKBalance,
    fertiliserData,
    nutrientRecommendationsData,
    soilAndCropOffTakeContext,
    transactionalManager
  ) {
    const fertiliserP = fertiliserData?.p205 ?? 0;
    const fertiliserK = fertiliserData?.k20 ?? 0;

    // CASE 1: OTHER crop
    if (crop.CropTypeID === CropTypeMapper.OTHER) {
      const otherPKBalance =
        await this.CalculatePKBalanceOther.calculatePKBalanceOther(
          crop,
          soilAndCropOffTakeContext.latestSoilAnalysis,
          transactionalManager
        );

      return {
        pBalance: otherPKBalance.pBalance,
        kBalance: otherPKBalance.kBalance,
      };
    }

    // CASE 2: No previous crop
    if (!previousCrop) {
      if (previousYearPKBalance) {
        return {
          pBalance: fertiliserP - (0 - (previousYearPKBalance?.PBalance ?? 0)),
          kBalance: fertiliserK - (0 - (previousYearPKBalance?.KBalance ?? 0)),
        };
      }

      return {
        pBalance: fertiliserP,
        kBalance: fertiliserK,
      };
    }

    // CASE 3: Has previous crop → use sequence calculation
    const pkBalCalcuationsFromNutrients =
      await this.calculatePKBalanceFromSequences(
        nutrientRecommendationsData.calculations,
        soilAndCropOffTakeContext.cropPOfftake,
        fertiliserData
      );

    return {
      pBalance: pkBalCalcuationsFromNutrients.pBalance,
      kBalance: pkBalCalcuationsFromNutrients.kBalance,
    };
  }

  async createOrUpdatePKBalance(
    crop,
    nutrientRecommendationsData,
    userId,
    fertiliserData,
    transactionalManager,
    soilAndCropOffTakeContext,
    previousCrop
  ) {
    try {
      const previousYearPKBalance = await this.getPKBalanceData(
        crop.FieldID,
        crop.Year - 1,
        transactionalManager,
      );

      // Calculate initial balances
      let { pBalance, kBalance } = await this.calculatePKBalance(
        crop,
        previousCrop,
        previousYearPKBalance,
        fertiliserData,
        nutrientRecommendationsData,
        soilAndCropOffTakeContext,
        transactionalManager
      );
      //geting current pKBalance
      const pkBalance = await this.getPKBalanceData(
        crop.FieldID,
        crop.Year,
        transactionalManager,
      );
      const adjustedBalances = await this.adjustBalanceBasedOnSoilAnalysis(
        soilAndCropOffTakeContext,
        pBalance,
        kBalance,
      );
      pBalance = adjustedBalances.pBalance;
      kBalance = adjustedBalances.kBalance;
      const saveAndUpdatePKBalance = await this.buildPKBalancePayload(
        pkBalance,
        crop,
        pBalance,
        kBalance,
        userId,
      );

      return { saveAndUpdatePKBalance };
    } catch (error) {
      console.error("Error while saving pkBalance data", error);
      throw error;
    }
  }
}

module.exports = {CalculatePKBalance};
