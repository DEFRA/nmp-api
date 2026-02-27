const { Not } = require("typeorm");
const { CropEntity } = require("../db/entity/crop.entity");
const RB209ArableService = require("../vendors/rb209/arable/arable.service");
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
const { StaticStrings } = require("./static.string");
const { CropTypeLinkingEntity } = require("../db/entity/crop-type-linking.entity");
const { FieldTypeMapper } = require("../constants/field-type-mapper");
const { AppDataSource } = require("../db/data-source");
const { CropOrderMapper } = require("../constants/crop-order-mapper");
const { SavingRecommendationService } = require("./saving-recommendation-service");
const { CalculatePKBalance } = require("./calculate-pk-balance-service");
const { TotalFertiliserByField } = require("./calculate-total-fertiliser-field-service");
const { SavingOtherCropRecommendations } = require("./saving-recommendations-other-crop-service");
const { FieldRelated } = require("./fetch-field-related-data-service");
const { HanldeMannerAndAnalysis } = require("./handle-manner-and-analysis-service");

class GenerateRecommendations {
  constructor() {
    this.rB209ArableService = new RB209ArableService();
    this.rB209RecommendationService = new RB209RecommendationService();
    this.CalculatePreviousCropService = new CalculatePreviousCropService();
    this.organicManureRepository = AppDataSource.getRepository(OrganicManureEntity);
    this.CalculatePKBalanceOther = new CalculatePKBalanceOther();
    this.RecommendationRepository = AppDataSource.getRepository(RecommendationEntity);
    this.grassGrowthClass = new GrassGrowthService();
    this.calculateGrassId = new CalculateGrassHistoryAndPreviousGrass();
    this.savingRecommendationService = new SavingRecommendationService();
    this.CalculatePKBalance = new CalculatePKBalance();
    this.totalFertiliserByField = new TotalFertiliserByField();
    this.savingOtherCropRecommendations = new SavingOtherCropRecommendations();
    this.fieldRelated = new FieldRelated();
    this.HanldeMannerAndAnalysis = new HanldeMannerAndAnalysis();
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
      const pkBalanceData = await transactionalManager.findOne(
        PKBalanceEntity,
        {where: {Year: year,FieldID: field.ID}}
      );
      return pkBalanceData
    } catch (error) {console.error("Error fetching PK Balance data:", error);
      return null
    }
  }
  async getWinterExcessRainfall(farmId, year, transactionalManager) {
    const excessRainfall = await transactionalManager.findOne(
      ExcessRainfallsEntity,
      {where: {FarmID: farmId,Year: year}}
    );
    return excessRainfall ?? null;
  }

  async buildArableBody(
    dataMultipleCrops, // Accept either a single crop or multiple crops
    field,
    transactionalManager,
    cropTypesList
  ) {
    const arableBody = [];
    // Ensure dataMultipleCrops is always treated as an array
    const crops = Array.isArray(dataMultipleCrops) ? dataMultipleCrops : [dataMultipleCrops];
    for (const crop of crops) {
      const currentCropType = cropTypesList.find((cT) => cT.cropTypeId === crop.CropTypeID);
      if (currentCropType?.cropGroupId == null) {
        console.log(`Invalid CropTypeId for crop having field name ${field.FieldName}`,StaticStrings.HTTP_STATUS_BAD_REQUEST);
      }
      let expectedYield = crop.Yield,cropTypeLinkingData;
      if (expectedYield == null) {
        cropTypeLinkingData = await transactionalManager.findOne(
          CropTypeLinkingEntity,
          {where: {CropTypeID: crop.CropTypeID}}
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
          expectedYield: expectedYield
        });
      }
    }
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
          ID: Not(crop.ID) 
        },
      });
    }
    if (!grassCrop) {return {}}
    if (grassCrop.CropOrder === CropOrderMapper.FIRSTCROP) {
      return {
        cropOrder: grassCrop.CropOrder,
        swardTypeId: grassCrop.SwardTypeID,
        swardManagementId: grassCrop.SwardManagementID,
        defoliationSequenceId: grassCrop.DefoliationSequenceID,
        grassGrowthClassId: grassGrowthClass.grassGrowthClassId,
        yield: grassCrop.Yield,
        seasonId: grassCrop.Establishment
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
        seasonId: grassCrop.Establishment
      };
    }
    return {};
  }
 
  async resolveCrops(crop, transactionalManager) {
  if (Array.isArray(crop)) {return crop}
  const crops = await transactionalManager.find(CropEntity, {
    where: { FieldID: crop.FieldID, Year: crop.Year }
  });
  if (!crops.length && crop?.CropTypeID) {return [crop]}
  return crops;
}
  async determineFieldType(crop, transactionalManager) {
    const crops = await this.resolveCrops(crop, transactionalManager);
     if (crops.length === 1) {
      const cropTypeID = crops[0].CropTypeID;
      if (cropTypeID === CropTypeMapper.GRASS) {
        return FieldTypeMapper.GRASS; // Grass
      } else if (
        cropTypeID !== CropTypeMapper.GRASS &&
        cropTypeID !== CropTypeMapper.OTHER
      ) {
        return FieldTypeMapper.ARABLE;
      } else {return FieldTypeMapper.ARABLE}
    }
    if (crops.length === 2) {
      const cropTypeIDs = crops.map((c) => c.CropTypeID);
      const isBothGrass = cropTypeIDs.every((id) => id === CropTypeMapper.GRASS);
      const isOneGrass = cropTypeIDs.includes(CropTypeMapper.GRASS);
      const isOtherValid = cropTypeIDs.some((id) => id !== CropTypeMapper.GRASS);
      const isBothArable = cropTypeIDs.every((id) => id !== CropTypeMapper.GRASS);
      if (isBothGrass) {return FieldTypeMapper.GRASS}; 
      if (isOneGrass && isOtherValid) {return FieldTypeMapper.BOTH}; // Mixed
      if (isBothArable) {return FieldTypeMapper.ARABLE}; // Both are arable/horticulture
    }
    return FieldTypeMapper.ARABLE; 
  }

  async resolveGrassHistoryAndPreviousGrass(crop, field, transactionalManager) {
    if (crop.CropTypeID === CropTypeMapper.GRASS) {
      return {
        grassHistoryID: await this.calculateGrassId.getGrassHistoryID(
          field,
          crop,
          transactionalManager,
          crop.Year
        ),
        previousGrassId: null,
      };
    }
    return {
      grassHistoryID: null,
      previousGrassId: await this.calculateGrassId.getPreviousGrassID(
        crop,
        transactionalManager,
        crop.Year
      ),
    };
  }
  async addSoilAnalysesToRequest(soilAnalysis, nutrientRecommendationReqBody) {
    if (!soilAnalysis || !Array.isArray(soilAnalysis)) {return};
    soilAnalysis.forEach((analysis) => {
      const soilAnalysisData = {
        ...(analysis.Date != null && {
          soilAnalysisDate: analysis.Date
        }),
        ...(analysis.PH != null && {
          soilpH: analysis.PH
        }),
        ...(analysis.SulphurDeficient != null && {
          sulphurDeficient: analysis.SulphurDeficient
        }),
        ...(analysis.PhosphorusIndex != null && {
          pIndexId: analysis.PhosphorusIndex,
          pMethodologyId: analysis.PhosphorusMethodologyID
        }),
        ...(analysis.PotassiumIndex != null && {
          kIndexId: analysis.PotassiumIndex,
          kMethodologyId: 4
        }),
        ...(analysis.MagnesiumIndex != null && {
          mgIndexId: analysis.MagnesiumIndex,
          mgMethodologyId: 4
        }),
      };
      if (Object.keys(soilAnalysisData).length > 0) {
        nutrientRecommendationReqBody.field.soil.soilAnalyses.push(soilAnalysisData);
      }
    });
  }
  async addSnsAnalysesToRequest(
    snsAnalysesData,
    nutrientRecommendationReqBody
  ) {
    if (!snsAnalysesData) {return}
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
        nutrientRecommendationReqBody.field.soil.soilAnalyses.push(snsAnalysisData);
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
    previousGrassId
  }) {
    if (previousCrop) {
      const cropType = cropTypesList.find((cropTp) => cropTp?.cropTypeId === previousCrop?.CropTypeID);
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
  }

  async buildNutrientRecommendationReqBody(
    field,
    analysis,
    singleAndMultipleCrops,
    mannerOutputs,
    request,
    transactionalManager,
    cropTypesList
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
        arable: fieldType === FieldTypeMapper.GRASS ? [] : arableBody,
        grassland: {},
        grass:fieldType === FieldTypeMapper.BOTH || fieldType === FieldTypeMapper.GRASS ? grassObject : {},
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
        rainfallAverage: field.Rainfall,
        excessWinterRainfall: excessRainfall === null ? 0 : excessRainfall?.WinterRainfall,
        mannerManures: mannerOutputs.length > 0,
        organicMaterials: [],
        mannerOutputs: [],
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

  async handleOtherCropRecommendation(
  otherCropContext,
  sharedContext
) {
  const {crop,previousCrop,mannerOutputs,latestSoilAnalysis,nutrientRecommendationsData,cropPOfftake,
  } = otherCropContext;

  const {
    transactionalManager,
    newOrganicManure,
    userId,
    fertiliserData,
  } = sharedContext;

  const recommendation =
    await this.savingOtherCropRecommendations.saveRecommendationForOtherCrops(
      transactionalManager,
      newOrganicManure,
      mannerOutputs,
      userId,
      latestSoilAnalysis,
      crop
    );

  const saveAndUpdateOtherPKBalance =await this.CalculatePKBalance.createOrUpdatePKBalance(
      crop,
      nutrientRecommendationsData,
      userId,
      fertiliserData,
      transactionalManager,
      { cropPOfftake, latestSoilAnalysis },
      previousCrop
    );

  if (saveAndUpdateOtherPKBalance) {
    await transactionalManager.save(
      PKBalanceEntity,
      saveAndUpdateOtherPKBalance.saveAndUpdatePKBalance
    );
  }
  return {
    cropId: crop.ID,
    recommendations: recommendation,
    pkBalance: saveAndUpdateOtherPKBalance ?? null,
  };
}


  async generateRecommendations(
    fieldID,
    Year,
    newOrganicManure,
    transactionalManager,
    request,
    userId
  ) {
    const cropTypesList =await this.rB209ArableService.getData("/Arable/CropTypes");
    const fieldRelatedData = await this.fieldRelated.getFieldAndCountryData(fieldID,transactionalManager);
    const crops = await transactionalManager.find(CropEntity, {
      where: { FieldID: fieldID, Year: Year }
    });
    const fertiliserData = await this.totalFertiliserByField.getTotalFertiliserByFieldAndYear(transactionalManager,fieldID,Year);
    let recommendation;
    const results = [];
    for (const crop of crops) { 
      const {snsAnalysesData,latestSoilAnalysis,soilAnalysisRecords,mannerOutputs,previousCrop} = await this.HanldeMannerAndAnalysis.getCropPreCalculationData(
        crop,
        fieldID,
        fieldRelatedData,
        newOrganicManure,
        transactionalManager,
        request
      );
      const cropPOfftake = await this.calculateCropPOfftake(latestSoilAnalysis,crop.CropTypeID,crop.Yield);
       let nutrientRecommendationsData = null;
      if (crop.CropTypeID === CropTypeMapper.OTHER ||crop?.IsBasePlan ||!previousCrop) {
    const otherCropContext = {crop,previousCrop,mannerOutputs,latestSoilAnalysis,nutrientRecommendationsData,cropPOfftake};
    const sharedContext = {transactionalManager,newOrganicManure,userId,fertiliserData};
    const result = await this.handleOtherCropRecommendation(otherCropContext,sharedContext);
    results.push(result);
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
      nutrientRecommendationsData =await this.rB209RecommendationService.postData("Recommendation/Recommendations",nutrientRecommendationnReqBody);
      recommendation = await this.savingRecommendationService.processAndSaveRecommendations(
          crops, latestSoilAnalysis,
          nutrientRecommendationsData,
          transactionalManager,userId,
          mannerOutputs
        );
      const saveAndUpdatePKBalance = await this.CalculatePKBalance.createOrUpdatePKBalance(
          crop,nutrientRecommendationsData,
          userId,fertiliserData,
          transactionalManager,
          {cropPOfftake,latestSoilAnalysis},
          previousCrop
        );
      if (saveAndUpdatePKBalance) {
        await transactionalManager.save(PKBalanceEntity,saveAndUpdatePKBalance.saveAndUpdatePKBalance);
      }
      results.push({cropId: crop.ID,recommendations: recommendation,pkBalance: saveAndUpdatePKBalance ?? null});
    }
    return results;
  }
}
module.exports = {GenerateRecommendations};
