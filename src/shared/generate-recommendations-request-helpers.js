const { Not } = require("typeorm");
const { CropEntity } = require("../db/entity/crop.entity");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const {
  ExcessRainfallsEntity,
} = require("../db/entity/excess-rainfalls.entity");
const {
  CropTypeLinkingEntity,
} = require("../db/entity/crop-type-linking.entity");
const { FieldTypeMapper } = require("../constants/field-type-mapper");
const { CropOrderMapper } = require("../constants/crop-order-mapper");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { StaticStrings } = require("./static.string");

const recommendationRequestHelpers = {
  async calculateCropPOfftake(latestSoilAnalysis, cropTypeId, cropYield) {
    const potatoYield = 50;
    if (!latestSoilAnalysis?.PhosphorusIndex) {
      return 0;
    }

    const isLowPIndex = latestSoilAnalysis.PhosphorusIndex < 4;
    const isPotatoCrop =
      cropTypeId === CropTypeMapper.POTATOVARIETYGROUP1 ||
      cropTypeId === CropTypeMapper.POTATOVARIETYGROUP2 ||
      cropTypeId === CropTypeMapper.POTATOVARIETYGROUP3 ||
      cropTypeId === CropTypeMapper.POTATOVARIETYGROUP4;

    if (!isLowPIndex || !isPotatoCrop) {
      return 0;
    }

    return cropYield ?? potatoYield;
  },

  async getPKBalanceData(fieldID, year, transactionalManager) {
    try {
      const pkBalanceData = await transactionalManager.findOne(
        PKBalanceEntity,
        {
          where: { Year: year, FieldID: fieldID },
        },
      );
      return pkBalanceData;
    } catch (error) {
      console.error("Error fetching PK Balance data:", error);
      return null;
    }
  },

  async getWinterExcessRainfall(farmId, year, transactionalManager) {
    const excessRainfall = await transactionalManager.findOne(
      ExcessRainfallsEntity,
      {
        where: { FarmID: farmId, Year: year },
      },
    );
    return excessRainfall ?? null;
  },

  async buildArableBody(
    dataMultipleCrops,
    field,
    transactionalManager,
    cropTypesList,
  ) {
    const arableBody = [];
    const crops = Array.isArray(dataMultipleCrops)
      ? dataMultipleCrops
      : [dataMultipleCrops];

    for (const crop of crops) {
      const currentCropType = cropTypesList.find(
        (cT) => cT.cropTypeId === crop.CropTypeID,
      );
      if (currentCropType?.cropGroupId == null) {
        console.log(
          `Invalid CropTypeId for crop having field name ${field.FieldName}`,
          StaticStrings.HTTP_STATUS_BAD_REQUEST,
        );
      }

      let expectedYield = crop.Yield;
      if (expectedYield == null) {
        const cropTypeLinkingData = await transactionalManager.findOne(
          CropTypeLinkingEntity,
          {
            where: { CropTypeID: crop.CropTypeID },
          },
        );
        expectedYield = cropTypeLinkingData.DefaultYield;
      }

      if (crop.CropTypeID !== CropTypeMapper.GRASS) {
        arableBody.push({
          cropOrder: crop.CropOrder,
          cropGroupId: currentCropType.cropGroupId,
          cropTypeId: crop.CropTypeID,
          cropInfo1Id: crop.CropInfo1,
          cropInfo2Id: crop.CropInfo2,
          sowingDate: crop.SowingDate,
          expectedYield,
        });
      }
    }

    return arableBody.sort((a, b) => a.cropOrder - b.cropOrder);
  },

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
          ID: Not(crop.ID),
        },
      });
    }

    if (!grassCrop) {
      return {};
    }

    if (
      grassCrop.CropOrder === CropOrderMapper.FIRSTCROP ||
      grassCrop.CropOrder === CropOrderMapper.SECONDCROP
    ) {
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
  },

  async resolveCrops(crop, transactionalManager) {
    if (Array.isArray(crop)) {
      return crop;
    }

    const crops = await transactionalManager.find(CropEntity, {
      where: { FieldID: crop.FieldID, Year: crop.Year },
    });

    if (!crops.length && crop?.CropTypeID) {
      return [crop];
    }

    return crops;
  },

  async determineFieldType(crops) {
    if (crops.length === 1) {
      const cropTypeID = crops[0].CropTypeID;
      if (cropTypeID === CropTypeMapper.GRASS) {
        return FieldTypeMapper.GRASS;
      }

      return FieldTypeMapper.ARABLE;
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

      if (isBothGrass) {
        return FieldTypeMapper.GRASS;
      }
      if (isOneGrass && isOtherValid) {
        return FieldTypeMapper.BOTH;
      }
      if (isBothArable) {
        return FieldTypeMapper.ARABLE;
      }
    }

    return FieldTypeMapper.ARABLE;
  },

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
  },

  addSoilAnalysisFieldIfPresent(target, key, value) {
    if (value != null) {
      target[key] = value;
    }
  },

  buildSoilAnalysisData(analysis) {
    const soilAnalysisData = {};

    this.addSoilAnalysisFieldIfPresent(
      soilAnalysisData,
      "soilAnalysisDate",
      analysis.Date,
    );
    this.addSoilAnalysisFieldIfPresent(soilAnalysisData, "soilpH", analysis.PH);
    this.addSoilAnalysisFieldIfPresent(
      soilAnalysisData,
      "sulphurDeficient",
      analysis.SulphurDeficient,
    );

    const nutrientFieldMappings = [
      {
        value: analysis.PhosphorusIndex ?? analysis.PhosphorusStatus,
        indexKey: "pIndexId",
        methodologyKey: "pMethodologyId",
        methodologyValue: analysis.PhosphorusMethodologyID,
      },
      {
        value: analysis.PotassiumIndex ?? analysis.PotassiumStatus,
        indexKey: "kIndexId",
        methodologyKey: "kMethodologyId",
        methodologyValue: analysis.PotassiumMethodologyID,
      },
      {
        value: analysis.MagnesiumIndex ?? analysis.MagnesiumStatus,
        indexKey: "mgIndexId",
        methodologyKey: "mgMethodologyId",
        methodologyValue: analysis.MagnesiumMethodologyID,
      },
    ];

    nutrientFieldMappings.forEach((mapping) => {
      if (mapping.value != null) {
        soilAnalysisData[mapping.indexKey] = mapping.value;
        soilAnalysisData[mapping.methodologyKey] = mapping.methodologyValue;
      }
    });

    return soilAnalysisData;
  },

  async addSoilAnalysesToRequest(soilAnalysis, nutrientRecommendationReqBody) {
    if (!soilAnalysis || !Array.isArray(soilAnalysis)) {
      return;
    }

    soilAnalysis.forEach((analysis) => {
      const soilAnalysisData = this.buildSoilAnalysisData(analysis);

      if (Object.keys(soilAnalysisData).length > 0) {
        nutrientRecommendationReqBody.field.soil.soilAnalyses.push(
          soilAnalysisData,
        );
      }
    });
  },

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
  },

  async buildPreviousCroppingData({
    previousCrop,
    cropTypesList,
    grassHistoryID,
    previousGrassId,
  }) {
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

    return {
      previousCropGroupId: null,
      previousCropTypeId: null,
      previousGrassId: 1,
      grassHistoryId: null,
      snsId: null,
      smnDepth: null,
      measuredSmn: null,
    };
  },

  async getRecommendationRequestContext(
    field,
    crop,
    dataMultipleCrops,
    request,
    transactionalManager,
    cropTypesList,
  ) {
    let grassGrowthClass = null;
    if(crop.CropTypeID === CropTypeMapper.GRASS) {
     grassGrowthClass =
      await this.grassGrowthClass.calculateGrassGrowthClassByFieldId(
        field.ID,
        request,
        transactionalManager,
        field
      );
    }
    const cropType = cropTypesList.find(
      (cropTp) => cropTp.cropTypeId === crop.CropTypeID,
    );
    if (!cropType || cropType.cropGroupId === null) {
      console.log(
        `Invalid CropTypeId for crop having field name ${field.Name}`,
      );
    }
    const previousCrop =
      await this.CalculatePreviousCropService.findPreviousCrop(
        field.ID,
        crop.Year,
        transactionalManager,
      );
    const pkBalanceData = await this.getPKBalanceData(
      field.ID,
      crop.Year - 1,
      transactionalManager,
    );
    const excessRainfall = await this.getWinterExcessRainfall(
      field.FarmID,
      crop.Year,
      transactionalManager,
    );
    const { grassHistoryID, previousGrassId } =
      await this.resolveGrassHistoryAndPreviousGrass(
        crop,
        field,
        transactionalManager,
      );
    const arableBody = await this.buildArableBody(
      dataMultipleCrops,
      field,
      transactionalManager,
      cropTypesList,
    );
    const grassObject = await this.buildGrassObject(
      crop,
      grassGrowthClass,
      transactionalManager,
    );
    const fieldType = await this.determineFieldType(
      dataMultipleCrops
    );

    return {
      previousCrop,
      pkBalanceData,
      excessRainfall,
      grassHistoryID,
      previousGrassId,
      arableBody,
      grassObject,
      fieldType,
    };
  },

  buildBaseNutrientRecommendationReqBody(
    field,
    crop,
    dataMultipleCrops,
    mannerOutputs,
    recommendationContext,
  ) {
    const {
      pkBalanceData,
      excessRainfall,
      arableBody,
      grassObject,
      fieldType,
    } = recommendationContext;

    return {
      field: {
        fieldType,
        multipleCrops: dataMultipleCrops.length > 1,
        arable: fieldType === FieldTypeMapper.GRASS ? [] : arableBody,
        grassland: {},
        grass:
          fieldType === FieldTypeMapper.BOTH ||
          fieldType === FieldTypeMapper.GRASS
            ? grassObject
            : {},
        soil: {
          soilTypeId: field.SoilTypeID,
          kReleasingClay: field.SoilReleasingClay,
          nvzActionProgrammeId: field.NVZProgrammeID,
          psc: field.RB209CountryID === 2 ? 1 : 0,
          pkBalance: {
            phosphate: pkBalanceData == null ? 0 : pkBalanceData.PBalance,
            potash: pkBalanceData == null ? 0 : pkBalanceData.KBalance,
          },
          soilAnalyses: [],
        },
        harvestYear: crop.Year,
        excessWinterRainfallManuallyEntered: excessRainfall != null,
        rainfallAverage: field.Rainfall,
        excessWinterRainfall:
          excessRainfall === null ? 0 : excessRainfall?.WinterRainfall,
        mannerManures: mannerOutputs.length > 0,
        organicMaterials: [],
        mannerOutputs,
        previousCropping: {},
        countryId: field.RB209CountryID,
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
  },

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
    const recommendationContext = await this.getRecommendationRequestContext(
      field,
      crop,
      dataMultipleCrops,
      request,
      transactionalManager,
      cropTypesList,
    );

    const nutrientRecommendationnReqBody =
      this.buildBaseNutrientRecommendationReqBody(
        field,
        crop,
        dataMultipleCrops,
        mannerOutputs,
        recommendationContext,
      );

    await this.addSoilAnalysesToRequest(
      soilAnalysis,
      nutrientRecommendationnReqBody,
    );
    await this.addSnsAnalysesToRequest(
      snsAnalysesData,
      nutrientRecommendationnReqBody,
    );
    nutrientRecommendationnReqBody.field.previousCropping =
      await this.buildPreviousCroppingData({
        previousCrop: recommendationContext.previousCrop,
        cropTypesList,
        grassHistoryID: recommendationContext.grassHistoryID,
        previousGrassId: recommendationContext.previousGrassId,
      });
    nutrientRecommendationnReqBody.referenceValue = `${field.ID}-${crop.ID}-${crop.Year}`;

    return nutrientRecommendationnReqBody;
  },
};

module.exports = { recommendationRequestHelpers };
