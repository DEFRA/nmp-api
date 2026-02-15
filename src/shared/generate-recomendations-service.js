const { In, Not } = require("typeorm");
const { CropEntity } = require("../db/entity/crop.entity");
const { FertiliserManuresEntity } = require("../db/entity/fertiliser-manures.entity");
const { ManagementPeriodEntity } = require("../db/entity/management-period.entity");
const RB209ArableService = require("../vendors/rb209/arable/arable.service");
const { HandleSoilAnalysisService } = require("./handle-soil-analysis");
const { FieldEntity } = require("../db/entity/field.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const { CountryEntity } = require("../db/entity/country.entity");
const { CalculateMannerOutputService } = require("./calculate-manner-output-service");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { CalculatePreviousCropService } = require("./previous-year-crop-service");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { CalculatePKBalanceOther } = require("./calculate-pk-balance-other");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { GrassGrowthService } = require("../grass-growth-plan/grass-growth-plan.service");
const { ExcessRainfallsEntity } = require("../db/entity/excess-rainfalls.entity");
const { CalculateGrassHistoryAndPreviousGrass } = require("./calculate-previous-grass-id.service");
const { RB209RecommendationService } = require("../vendors/rb209/recommendation/recommendation.service");
const { Boom } = require("@hapi/boom");
const { StaticStrings } = require("./static.string");
const { CropTypeLinkingEntity } = require("../db/entity/crop-type-linking.entity");
const { FieldTypeMapper } = require("../constants/field-type-mapper");
const { AppDataSource } = require("../db/data-source");
const { CropOrderMapper } = require("../constants/crop-order-mapper");
const { SavingRecommendationService } = require("./saving-recommendation-service");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { RecommendationCommentEntity } = require("../db/entity/recommendation-comment.entity");

class GenerateRecommendations {
  constructor() {
    this.rB209ArableService = new RB209ArableService();
    this.rB209RecommendationService = new RB209RecommendationService();
    this.HandleSoilAnalysisService = new HandleSoilAnalysisService();
    this.CalculateMannerOutput = new CalculateMannerOutputService();
    this.CalculatePreviousCropService = new CalculatePreviousCropService();
    this.organicManureRepository =
      AppDataSource.getRepository(OrganicManureEntity);
    this.CalculatePKBalanceOther = new CalculatePKBalanceOther();
    this.RecommendationRepository =
      AppDataSource.getRepository(RecommendationEntity);
    this.grassGrowthClass = new GrassGrowthService();
    this.calculateGrassId = new CalculateGrassHistoryAndPreviousGrass();
    this.savingRecommendationService = new SavingRecommendationService();
  }

  async getSnsAnalysesData(transactionalManager, crop) {
    const data = await transactionalManager.findOne(SnsAnalysesEntity, {
      where: { CropID: crop.ID },
    });

    if (data) {
      return {
        ...data,
        SNSCropOrder: crop.CropOrder,
      };
    }
  }

  async getManagementPeriods(transactionalManager, cropId) {
    const data = await transactionalManager.find(ManagementPeriodEntity, {
      where: {
        CropID: cropId,
      },
    });

    return data;
  }

  async getP205AndK20fromfertiliser(transactionalManager, managementPeriodIds) {
    // Normalize to array
    const ids = Array.isArray(managementPeriodIds)
      ? managementPeriodIds
      : [managementPeriodIds];

    let sumOfP205 = 0;
    let sumOfK20 = 0;

    if (ids.length === 0) {
      return { p205: 0, k20: 0 };
    }

    const fertiliserData = await transactionalManager.find(
      FertiliserManuresEntity,
      {
        where: {
          ManagementPeriodID: In(ids),
        },
        select: {
          P2O5: true,
          K2O: true,
        },
      },
    );

    for (const fertiliser of fertiliserData) {
      sumOfP205 += fertiliser.P2O5 ?? 0;
      sumOfK20 += fertiliser.K2O ?? 0;
    }

    return { p205: sumOfP205, k20: sumOfK20 };
  }

  async fetchSnsAnalysesForCrops(transactionalManager, crops) {
    const snsAnalysesData = [];

    for (const crop of crops) {
      const analysisData = await this.getSnsAnalysesData(
        transactionalManager,
        crop,
      );

      if (analysisData) {
        snsAnalysesData.push(analysisData);
      }
    }

    return snsAnalysesData;
  }

  async getFieldAndCountryData(fieldId, transactionalManager) {
    return (
      transactionalManager
        .createQueryBuilder(FieldEntity, "f")

        /* ---------- Farm ---------- */
        .leftJoin(FarmEntity, "farm", "farm.ID = f.FarmID")

        /* ---------- Country ---------- */
        .leftJoin(CountryEntity, "country", "country.ID = farm.CountryID")

        /* ---------- Select minimal required fields ---------- */
        .select([
          "f.ID AS ID",
          "f.Name AS FieldName",
          "f.SoilTypeID AS SoilTypeID",
          "f.IsWithinNVZ AS IsWithinNVZ",
          "f.SoilReleasingClay AS SoilReleasingClay",
          "f.NVZProgrammeID AS NVZProgrammeID",
          "farm.ID AS FarmID",
          "farm.ClimateDataPostCode AS ClimateDataPostCode",
          "farm.Rainfall AS Rainfall",
          "country.ID AS CountryID",
          "country.RB209CountryID AS RB209CountryID",
        ])

        .where("f.ID = :fieldId", { fieldId })

        .getRawOne()
    );
  }

  async calculateCropPOfftake(latestSoilAnalysis, cropTypeId, cropYield) {
    const potatoYield = 50;
    if (!latestSoilAnalysis?.PhosphorusIndex) {return 0;}
    const isLowPIndex = latestSoilAnalysis.PhosphorusIndex < 4;
    const isPotatoCrop =cropTypeId === CropTypeMapper.POTATOVARIETYGROUP1 || cropTypeId === CropTypeMapper.POTATOVARIETYGROUP2 ||
      cropTypeId === CropTypeMapper.POTATOVARIETYGROUP3 ||
      cropTypeId === CropTypeMapper.POTATOVARIETYGROUP4;

    if (!isLowPIndex || !isPotatoCrop) {return 0}
    return cropYield ?? potatoYield;
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

  async calculatePKBalanceFromSequences(
    calculations,
    cropPOfftake,
    fertiliserData,
  ) {
    let pBalance = 0;
    let kBalance = 0;

    const fertiliserP = fertiliserData?.p205 ?? 0;
    const fertiliserK = fertiliserData?.k20 ?? 0;

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

        for (const recommendation of defoliationItems) {
          const rec = recommendation.recommendation ?? 0;
          const man = recommendation.manures ?? 0;
          const pk = recommendation.pkBalance ?? 0;

          // Phosphorus (P)
          if (recommendation.nutrientId === 1) {
            pBalance += pk - rec - cropPOfftake + man;
          }

          // Potassium (K)
          if (recommendation.nutrientId === 2) {
            kBalance += pk - rec + man;
          }
        }
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
  kBalance
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
    pBalance:
      latestSoilAnalysis.PhosphorusIndex == null ? 0 : pBalance,
    kBalance:
      latestSoilAnalysis.PotassiumIndex == null ? 0 : kBalance,
  };
}
  

async buildPKBalancePayload(
  pkBalance,
  crop,
  pBalance,
  kBalance,
  userId
) {
  const baseData = {
    Year: crop.Year,
    FieldID: crop.FieldID,
    PBalance: pBalance,
    KBalance: kBalance
  };

  const now = new Date();

  // UPDATE
  if (pkBalance) {
    return {
      ...pkBalance,
      ...baseData,
      ModifiedOn: now,
      ModifiedByID: userId
    };
  }

  // CREATE
  return {
    ...baseData,
    CreatedOn: now,
    CreatedByID: userId
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
  if (crop.CropTypeID == CropTypeMapper.OTHER) {
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
        pBalance:
          fertiliserP -
          (0 - (previousYearPKBalance?.PBalance ?? 0)),
        kBalance:
          fertiliserK -
          (0 - (previousYearPKBalance?.KBalance ?? 0)),
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
      let saveAndUpdatePKBalance;
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
        kBalance
      );
      pBalance = adjustedBalances.pBalance;
      kBalance = adjustedBalances.kBalance;
      saveAndUpdatePKBalance = await this.buildPKBalancePayload(
        pkBalance,
        crop,
        pBalance,
        kBalance,
        userId
      );

      return { saveAndUpdatePKBalance };
    } catch (error) {
      console.error("Error while saving pkBalance data", error);
      throw error;
    }
  }

  async buildCropOrderData(OrganicManure, mannerOutputs, latestSoilAnalysis) {
    return {
      CropN: null,
      NBalance: null,
      ManureN: mannerOutputs
        ? mannerOutputs[0].availableN
        : OrganicManure.AvailableN,
      FertilizerN: null,

      CropP2O5: null,
      PBalance: null,
      ManureP2O5: mannerOutputs
        ? mannerOutputs[0].availableP
        : OrganicManure.AvailableP2O5,
      FertilizerP2O5: null,

      CropK2O: null,
      KBalance: null,
      ManureK2O: mannerOutputs
        ? mannerOutputs[0].availableK
        : OrganicManure.AvailableK2O,
      FertilizerK2O: null,

      CropMgO: null,
      MgBalance: null,
      ManureMgO: null,
      FertilizerMgO: null,

      CropSO3: null,
      SBalance: null,
      ManureSO3: mannerOutputs
        ? mannerOutputs[0].availableS
        : OrganicManure.AvailableSO3,
      FertilizerSO3: null,

      CropNa2O: null,
      NaBalance: null,
      ManureNa2O: null,
      FertilizerNa2O: null,

      CropLime: null,
      LimeBalance: null,
      ManureLime: null,
      FertilizerLime: null,

      PH: latestSoilAnalysis?.PH?.toString() || null,
      SNSIndex: latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString() || null,
      PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString() || null,
      KIndex: latestSoilAnalysis?.PotassiumIndex?.toString() || null,
      MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString() || null,

      SIndex: null,
      NIndex: null,
    };
  }

  async saveRecommendationForOtherCrops(
    transactionalManager,
    OrganicManure,
    mannerOutputs,
    userId,
    latestSoilAnalysis,
    crop
  ) {
    // Prepare cropOrderData with the values from latestSoilAnalysis, snsAnalysesData, and mannerOutputReq
    // ⬇️ Now simply call the new function
    const cropOrderData = await this.buildCropOrderData(
      OrganicManure,
      mannerOutputs,
      latestSoilAnalysis,
    );

    let managementPeriods = [];
    if (OrganicManure) {
      managementPeriods = [
        await transactionalManager.findOne(ManagementPeriodEntity, {
          where: { ID: OrganicManure.ManagementPeriodID },
        }),
      ];
    } else {
      managementPeriods = await transactionalManager.find(
        ManagementPeriodEntity,
        {
          where: { CropID: crop.ID },
        },
      );
    }
    const updatedRecommendations = [];

    for (const period of managementPeriods) {
      let recommendation = await transactionalManager.findOne(
        RecommendationEntity,
        {
          where: {
            ManagementPeriodID: period.ID,
          },
        },
      );

      if (recommendation) {
        // If a recommendation exists, update it
        recommendation = {
          ...recommendation,
          ...cropOrderData,
          ModifiedOn: new Date(),
          ModifiedByID: userId,
        };
        await transactionalManager.save(RecommendationEntity, recommendation);

        // Find and delete related recommendation comments
        const existingComments = await transactionalManager.find(
          RecommendationCommentEntity,
          {
            where: { RecommendationID: recommendation.ID },
          },
        );

        if (existingComments && existingComments.length > 0) {
          await transactionalManager.remove(
            RecommendationCommentEntity,
            existingComments,
          );
        }
        updatedRecommendations.push(recommendation);
      } else {
        // If no recommendation exists, create a new one
        recommendation = this.RecommendationRepository.create({
          ...cropOrderData,
          ManagementPeriodID: period.ID,
          Comments: "New recommendation created",
          CreatedOn: new Date(),
          CreatedByID: userId,
        });
        await transactionalManager.save(RecommendationEntity, recommendation);
        updatedRecommendations.push(recommendation);
      }
    }
    // Check if there's an existing recommendation for the current OrganicManure.ManagementPeriodID

    return updatedRecommendations;
  }

  async getWinterExcessRainfall(farmId, year, transactionalManager) {
    const excessRainfall = await transactionalManager.findOne(
      ExcessRainfallsEntity,
      {
        where: {
          FarmID: farmId,
          Year: year,
        },
      },
    );

    return excessRainfall ?? null;
  }

  async buildArableBody(
    dataMultipleCrops, // Accept either a single crop or multiple crops
    field,
    transactionalManager,
    cropTypesList,
  ) {
    const arableBody = [];

    // Ensure dataMultipleCrops is always treated as an array
    const crops = Array.isArray(dataMultipleCrops)
      ? dataMultipleCrops
      : [dataMultipleCrops];

    // Iterate over crops (single or multiple)
    for (const crop of crops) {
      const currentCropType = cropTypesList.find(
        (cropType) => cropType.cropTypeId === crop.CropTypeID,
      );

      if (currentCropType?.cropGroupId == null) {
        throw new Boom.HttpException(
          `Invalid CropTypeId for crop having field name ${field.FieldName}`,
          StaticStrings.HTTP_STATUS_BAD_REQUEST,
        );
      }
      let expectedYield = crop.Yield,
        cropTypeLinkingData;
      if (expectedYield == null) {
        cropTypeLinkingData = await transactionalManager.findOne(
          CropTypeLinkingEntity,
          {
            where: {
              CropTypeID: crop.CropTypeID,
            },
          },
        );
        expectedYield = cropTypeLinkingData.DefaultYield;
      }
      // Add crop to arableBody based on its CropOrder
      if (crop.CropTypeID !== CropTypeMapper.GRASS) {
        arableBody.push({
          cropOrder: crop.CropOrder,
          cropGroupId: currentCropType.cropGroupId,
          cropTypeId: crop.CropTypeID,
          cropInfo1Id: crop.CropInfo1,
          cropInfo2Id: crop.CropInfo2,
          sowingDate: crop.SowingDate,
          expectedYield: expectedYield,
        });
      }
    }

    // Return the list of crops sorted by CropOrder (if necessary)
    return arableBody.sort((a, b) => a.cropOrder - b.cropOrder);
  }

  async buildGrassObject(crop, grassGrowthClass, transactionalManager) {
    let grassCrop = null;

    if (crop.CropTypeID === CropTypeMapper.GRASS) {
      grassCrop = crop;
    } else {
      grassCrop = await transactionalManager.findOne(CropEntity, {
        where: {
          FieldID: crop.FieldID,
          Year: crop.Year,
          CropTypeID: CropTypeMapper.GRASS,
          ID: Not(crop.ID), // exclude the current crop
        },
      });
    }

    if (!grassCrop) {
      return {};
    }

    if (grassCrop.CropOrder === CropOrderMapper.FIRSTCROP) {
      return {
        cropOrder: grassCrop.CropOrder,
        swardTypeId: grassCrop.SwardTypeID,
        swardManagementId: grassCrop.SwardManagementID,
        defoliationSequenceId: grassCrop.DefoliationSequenceID,
        grassGrowthClassId: grassGrowthClass.grassGrowthClassId,
        yield: grassCrop.Yield,
        seasonId: grassCrop.Establishment,
      };
    }

    if (grassCrop.CropOrder === CropOrderMapper.SECONDCROP) {
      return {
        cropOrder: grassCrop.CropOrder,
        swardTypeId: grassCrop.SwardTypeID,
        swardManagementId: grassCrop.SwardManagementID,
        defoliationSequenceId: grassCrop.DefoliationSequenceID,
        grassGrowthClassId: grassGrowthClass.grassGrowthClassId,
        yield: grassCrop.Yield,
        seasonId: grassCrop.Establishment,
      };
    }

    return {};
  }

  async determineFieldType(crop, transactionalManager) {
    let crops;
    // Check if it's a single crop or already an array of crops
    if (Array.isArray(crop)) {
      crops = crop;
    } else {
      // Fetch all crops for the same FieldID and Year
      crops = await transactionalManager.find(CropEntity, {
        where: { FieldID: crop.FieldID, Year: crop.Year },
      });

      // If only one crop found in DB, use it
      if (crops.length === 0 && crop?.CropTypeID) {
        crops = [crop]; // fallback to single crop passed
      }
    }

    if (crops.length === 1) {
      const cropTypeID = crops[0].CropTypeID;
      if (cropTypeID === CropTypeMapper.GRASS) {
        return FieldTypeMapper.GRASS; // Grass
      } else if (
        cropTypeID !== CropTypeMapper.GRASS &&
        cropTypeID !== CropTypeMapper.OTHER
      ) {
        return FieldTypeMapper.ARABLE;
      }
    }

    if (crops.length === 2) {
      const cropTypeIDs = crops.map((c) => c.CropTypeID);
      const isBothGrass = cropTypeIDs.every(
        (id) => id === CropTypeMapper.GRASS,
      );
      const isOneGrass = cropTypeIDs.includes(CropTypeMapper.GRASS);
      const isOtherValid = cropTypeIDs.some(
        (id) => id !== CropTypeMapper.GRASS,
      );
      const isBothArable = cropTypeIDs.every(
        (id) => id !== CropTypeMapper.GRASS,
      );

      if (isBothGrass) {return FieldTypeMapper.GRASS}; 
      if (isOneGrass && isOtherValid) {return FieldTypeMapper.BOTH}; // Mixed
      if (isBothArable) {return FieldTypeMapper.ARABLE}; // Both are arable/horticulture
    }

    return FieldTypeMapper.ARABLE; // Default fallback
  }

  async resolveGrassHistoryAndPreviousGrass(crop, field, transactionalManager) {
    if (crop.CropTypeID === CropTypeMapper.GRASS) {
      return {
        grassHistoryID: await this.calculateGrassId.getGrassHistoryID(
          field,
          crop,
          transactionalManager,
          crop.Year,
        ),
        previousGrassId: null,
      };
    }

    return {
      grassHistoryID: null,
      previousGrassId: await this.calculateGrassId.getPreviousGrassID(
        crop,
        transactionalManager,
        crop.Year,
      ),
    };
  }

  async addSoilAnalysesToRequest(soilAnalysis, nutrientRecommendationReqBody) {
    if (!soilAnalysis || !Array.isArray(soilAnalysis)) {return};

    soilAnalysis.forEach((analysis) => {
      const soilAnalysisData = {
        ...(analysis.Date != null && {
          soilAnalysisDate: analysis.Date,
        }),
        ...(analysis.PH != null && {
          soilpH: analysis.PH,
        }),
        ...(analysis.SulphurDeficient != null && {
          sulphurDeficient: analysis.SulphurDeficient,
        }),
        ...(analysis.PhosphorusIndex != null && {
          pIndexId: analysis.PhosphorusIndex,
          pMethodologyId: analysis.PhosphorusMethodologyID,
        }),
        ...(analysis.PotassiumIndex != null && {
          kIndexId: analysis.PotassiumIndex,
          kMethodologyId: 4,
        }),
        ...(analysis.MagnesiumIndex != null && {
          mgIndexId: analysis.MagnesiumIndex,
          mgMethodologyId: 4,
        }),
      };

      // Push only when something meaningful exists
      if (Object.keys(soilAnalysisData).length > 0) {
        nutrientRecommendationReqBody.field.soil.soilAnalyses.push(
          soilAnalysisData,
        );
      }
    });
  }

  async addSnsAnalysesToRequest(
    snsAnalysesData,
    nutrientRecommendationReqBody,
  ) {
    if (!snsAnalysesData) {
      return;
    }

    const addSingleSnsAnalysis = (analysis) => {
      const snsAnalysisData = {
        ...(analysis.SampleDate != null && {
          soilAnalysisDate: analysis.SampleDate,
        }),
        ...(analysis.SoilNitrogenSupplyIndex != null && {
          snsIndexId: analysis.SoilNitrogenSupplyIndex,
          snsMethodologyId: 4,
        }),
        ...(analysis.SNSCropOrder != null && {
          SNSCropOrder: analysis.SNSCropOrder,
        }),
      };

      if (Object.keys(snsAnalysisData).length > 0) {
        nutrientRecommendationReqBody.field.soil.soilAnalyses.push(
          snsAnalysisData,
        );
      }
    };

    if (Array.isArray(snsAnalysesData)) {
      snsAnalysesData.forEach(addSingleSnsAnalysis);
    } else {
      addSingleSnsAnalysis(snsAnalysesData);
    }
  }

  async buildPreviousCroppingData({
    previousCrop,
    cropTypesList,
    grassHistoryID,
    previousGrassId,
  }) {
    // Case: previous crop exists
    if (previousCrop) {
      const cropType = cropTypesList.find(
        (cropTp) => cropTp?.cropTypeId === previousCrop?.CropTypeID,
      );

      const isGrass = previousCrop?.CropTypeID === CropTypeMapper.GRASS;

      return {
        previousGrassId: grassHistoryID ? null : previousGrassId,
        previousCropGroupId: isGrass ? null : (cropType?.cropGroupId ?? null),
        previousCropTypeId: isGrass ? null : (previousCrop?.CropTypeID ?? null),
        grassHistoryId: previousGrassId ? null : grassHistoryID,
        snsId: null,
        smnDepth: null,
        measuredSmn: null,
      };
    }

    // Case: no previous crop
    return {
      previousCropGroupId: null,
      previousCropTypeId: null,
      previousGrassId: 1,
      grassHistoryId: null,
      snsId: null,
      smnDepth: null,
      measuredSmn: null,
    };
  }

  async buildNutrientRecommendationReqBody(
    field,
    analysis,
    singleAndMultipleCrops,
    mannerOutputs,
    request,
    transactionalManager,
    cropTypesList,
  ) {
    const { soilAnalysisRecords: soilAnalysis, snsAnalysesData } = analysis;
    const { crops: dataMultipleCrops, crop } = singleAndMultipleCrops;
    const grassGrowthClass =await this.grassGrowthClass.calculateGrassGrowthClassByFieldId(field.ID,request);
    const cropType = cropTypesList.find((cropTp) => cropTp.cropTypeId === crop.CropTypeID);

    if (!cropType || cropType.cropGroupId === null) {console.log(`Invalid CropTypeId for crop having field name ${field.Name}`) }
    const previousCrop =await this.CalculatePreviousCropService.findPreviousCrop(field.ID,crop.Year, transactionalManager);
    const pkBalanceData = await this.getPKBalanceData(field.ID,crop.Year - 1,transactionalManager);
    const excessRainfall = await this.getWinterExcessRainfall(field.FarmID,crop.Year,transactionalManager);
    const { grassHistoryID, previousGrassId } =await this.resolveGrassHistoryAndPreviousGrass(crop,field,transactionalManager);

    const arableBody = await this.buildArableBody(dataMultipleCrops,field,transactionalManager,cropTypesList);
    const grassObject = await this.buildGrassObject(crop,grassGrowthClass,transactionalManager);
    const fieldType = await this.determineFieldType(crop, transactionalManager);
    const nutrientRecommendationnReqBody = {
      field: {
        fieldType: fieldType,
        multipleCrops: dataMultipleCrops.length > 1,
        arable: fieldType == FieldTypeMapper.GRASS ? [] : arableBody,
        grassland: {},
        grass:fieldType == FieldTypeMapper.BOTH || fieldType == FieldTypeMapper.GRASS ? grassObject: {},
        soil: {
         soilTypeId: field.SoilTypeID,
          kReleasingClay: field.SoilReleasingClay,
          nvzActionProgrammeId: field.NVZProgrammeID,
          psc:excessRainfall?.WinterRainfall == null ? 0: excessRainfall.WinterRainfall, //need to find it
          pkBalance: {
            phosphate: pkBalanceData == null ? 0 : pkBalanceData.PBalance,
            potash: pkBalanceData == null ? 0 : pkBalanceData.KBalance,
          },
          soilAnalyses: [],
        },
        harvestYear: crop.Year,
        rainfallAverage: field.Rainfall,
        excessWinterRainfall: 0, //need to find it
        mannerManures: mannerOutputs.length > 0,
        organicMaterials: [],
        mannerOutputs: [],
        previousCropping: {},
        countryId: field.RB209CountryID
      },
      nutrients: {
        nitrogen: true,
        phosphate: true,
        potash: true,
        magnesium: true,
        sodium: true,
        sulphur: true,
        lime: true,
      },
      totals: true,
      referenceValue: `${field.ID}-${crop.ID}-${crop.Year}`,
    };

    nutrientRecommendationnReqBody.field.mannerOutputs = mannerOutputs;

    await this.addSoilAnalysesToRequest(soilAnalysis,nutrientRecommendationnReqBody);

    await this.addSnsAnalysesToRequest(snsAnalysesData,nutrientRecommendationnReqBody);
    nutrientRecommendationnReqBody.field.previousCropping =await this.buildPreviousCroppingData({
        previousCrop,
        cropTypesList,
        grassHistoryID,
        previousGrassId,
      });
    nutrientRecommendationnReqBody.referenceValue = `${field.ID}-${crop.ID}-${crop.Year}`;

    return nutrientRecommendationnReqBody;
  }
  async generateRecommendations(
    fieldID,
    Year,
    newOrganicManure,
    transactionalManager,
    request,
    userId,
  ) {
    const cropTypesList =await this.rB209ArableService.getData("/Arable/CropTypes");
    const fieldRelatedData = await this.getFieldAndCountryData(
      fieldID,
      transactionalManager,
    );
    const crops = await transactionalManager.find(CropEntity, {
      where: { FieldID: fieldID, Year: Year },
    });
    let recommendation;
    const results = [];
    for (const crop of crops) {
      const managementPeriods = await this.getManagementPeriods(
        transactionalManager,
        crop.ID,
      );
      const managementPeriodIds = managementPeriods.map((mp) => mp.ID);
      const fertiliserData = await this.getP205AndK20fromfertiliser(
        transactionalManager,
        managementPeriodIds,
      );
      const snsAnalysesData = await this.fetchSnsAnalysesForCrops(
        transactionalManager,
        crops,
      );
      const { latestSoilAnalysis, soilAnalysisRecords } =await this.HandleSoilAnalysisService.handleSoilAnalysisValidation(
          fieldID,
          fieldRelatedData.Name,
          crop.Year,
          fieldRelatedData.RB209CountryID
        );
      let mannerOutputs = null;
      mannerOutputs =await this.CalculateMannerOutput.calculateMannerOutputForOrganicManure(
          crop,
          newOrganicManure,
          fieldRelatedData,
          fieldRelatedData,
          transactionalManager,
          request
        );
      const cropPOfftake = await this.calculateCropPOfftake(
        latestSoilAnalysis,
        crop.CropTypeID,
        crop.Yield
      );

      const previousCrop =await this.CalculatePreviousCropService.findPreviousCrop(
          fieldID,
          crop.Year,
          transactionalManager,
        );

      if (
        crop.CropTypeID === CropTypeMapper.OTHER ||
        crop?.IsBasePlan ||
        !previousCrop
      ) {
        recommendation = await this.saveRecommendationForOtherCrops(
          transactionalManager, // Transaction manager for transactional save
          newOrganicManure, // OrganicManure data
          mannerOutputs, // Manner output request
          userId, // User ID
          latestSoilAnalysis,
          crop // Latest soil analysis data
        );
        const saveAndUpdatePKBalance = await this.createOrUpdatePKBalance(
          crop,
          nutrientRecommendationsData,
          userId,
          fertiliserData,
          transactionalManager,
          {
          cropPOfftake,
          latestSoilAnalysis
          },
          previousCrop
        );

        if (saveAndUpdatePKBalance) {
          await transactionalManager.save(
            PKBalanceEntity,
            saveAndUpdatePKBalance.saveAndUpdatePKBalance,
          );
        }
        results.push({
          cropId: crop.ID,
          recommendations: recommendation,
          pkBalance: saveAndUpdatePKBalance ?? null,
        });

        continue;
      }

      const analysis = { soilAnalysisRecords, snsAnalysesData };
      const singleAndMultipleCrops = { crops, crop };

      const nutrientRecommendationnReqBody =await this.buildNutrientRecommendationReqBody(
          fieldRelatedData,
          analysis,
          singleAndMultipleCrops,
          mannerOutputs,
          request,
          transactionalManager,
          cropTypesList
        );

      const nutrientRecommendationsData =
        await this.rB209RecommendationService.postData(
          "Recommendation/Recommendations",
          nutrientRecommendationnReqBody,
        );

      recommendation =
        await this.savingRecommendationService.processAndSaveRecommendations(
          crops,
          latestSoilAnalysis,
          nutrientRecommendationsData,
          transactionalManager,
          userId,
          mannerOutputs,
        );

      const saveAndUpdatePKBalance = await this.createOrUpdatePKBalance(
        crop,
        nutrientRecommendationsData,
        userId,
        fertiliserData,
        transactionalManager,
        {
          cropPOfftake,
          latestSoilAnalysis,
        },
        previousCrop,
      );

      if (saveAndUpdatePKBalance) {
        await transactionalManager.save(
          PKBalanceEntity,
          saveAndUpdatePKBalance.saveAndUpdatePKBalance,
        );
      }

      // Push structured result per crop
      results.push({
        cropId: crop.ID,
        recommendations: recommendation,
        pkBalance: saveAndUpdatePKBalance ?? null,
      });
    }

    return results;
  }
}

module.exports = {
  GenerateRecommendations
};
