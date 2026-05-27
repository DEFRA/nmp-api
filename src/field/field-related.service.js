const { CropEntity } = require("../db/entity/crop.entity");
const { ManagementPeriodEntity } = require("../db/entity/management-period.entity");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { PreviousGrassesEntity } = require("../db/entity/previous-grasses-entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { GrassManagementOptionsEntity } = require("../db/entity/grassManagementOptionsEntity");
const { MoreThan, Between } = require("typeorm");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { CountryMapper } = require("../constants/country-mapper");

const fieldRelatedMethods = {
async getFieldRelatedData(fieldIds, year, request) {
  const fields = await this.repository.findByIds(fieldIds);
  const cropTypeAllData = await this.rB209ArableService.getData(
    `/Arable/CropTypes`,
  );
  const farm = await this.FarmService.getFarmById(fields[0].FarmID);
  const applicationReferenceData =
    await this.fetchAllApplicationReferenceData(request);

  farm.Fields = await Promise.all(
    fields.map((field) =>
      this.buildFieldRelatedData(
        field,
        year,
        farm,
        cropTypeAllData,
        applicationReferenceData,
      ),
    ),
  );

  return { Farm: farm };
},

async buildFieldRelatedData(
  field,
  year,
  farm,
  cropTypeAllData,
  applicationReferenceData,
) {
  const crops = await this.cropRepository.find({
    where: { FieldID: field.ID, Year: year },
  });
  const previousCropData = await this.getPreviousCropData(
    field.ID,
    year,
  );
  const previousCropTypeName = previousCropData
    ? await this.getCropTypeName(previousCropData.CropTypeID, cropTypeAllData)
    : null;
  const previousGrasses = await this.getPreviousCropDataByFieldID(field.ID);
  const grassManagementOptionName =
    await this.getGrassManagementOptionName(previousGrasses);
  const pkBalance = await this.pkBalanceRepository.findOne({
    where: { FieldID: field.ID, Year: year },
  });

  await this.addGrassCropNames(crops);
  const { cropsWithManagement, soilAnalysis } =
    await this.buildCropsWithManagement(
      crops,
      field.ID,
      year,
      cropTypeAllData,
      applicationReferenceData,
    );
  const soilDetails = await this.buildSoilDetails(
    field,
    farm,
    pkBalance,
    soilAnalysis,
  );

  return {
    ...field,
    Management: grassManagementOptionName,
    PreviousCropID: previousCropData ? previousCropData.CropTypeID : null,
    PreviousCrop: previousCropTypeName,
    Crops: cropsWithManagement,
    // PreviousGrasses: previousGrasses,
    SoilAnalysis: soilAnalysis,
    SoilDetails: soilDetails,
  };
},

async getPreviousCropData(fieldId, year) {
  const previousCropData = await this.cropRepository.findOne({
    where: { FieldID: fieldId, Year: year - 1 },
    select: ["CropTypeID"],
    order: { CreatedOn: "DESC" },
  });

  if (previousCropData != null) {
    return previousCropData;
  }

  return this.previousCroppingRepository.findOne({
    where: { FieldID: fieldId, HarvestYear: year - 1 },
    select: ["CropTypeID"],
  });
},

async getGrassManagementOptionName(previousGrasses) {
  if (!previousGrasses?.GrassManagementOptionID) {
    return null;
  }

  const grassManagementOption =
    await this.grassManagementOptionsRepository.findOne({
      where: { ID: previousGrasses.GrassManagementOptionID },
      select: ["Name"],
    });
  console.log("grassManagementOption", grassManagementOption);

  return grassManagementOption ? grassManagementOption.Name : null;
},

async addGrassCropNames(crops) {
  if (crops == null) {
    return;
  }

  for (const crop of crops) {
    if (crop.CropTypeID === CropTypeMapper.GRASS) {
      await this.addGrassCropName(crop);
    }
  }
},

async addGrassCropName(crop) {
  const hasDefoliationData =
    crop.SwardTypeID != null &&
    crop.PotentialCut != null &&
    crop.DefoliationSequenceID != null;

  crop.DefoliationSequenceName = hasDefoliationData
    ? await this.findDefoliationSequenceDescription(
        crop.SwardManagementID,
        crop.PotentialCut,
        crop.DefoliationSequenceID,
        crop.Establishment,
      )
    : null;
  crop.SwardTypeName =
    crop.SwardTypeID != null ? await this.findSwardType(crop.SwardTypeID) : null;
  crop.SwardManagementName =
    crop.SwardManagementID != null
      ? await this.findSwardTypeManagment(crop.SwardManagementID)
      : null;
  crop.EstablishmentName =
    crop.Establishment != null
      ? await this.findGrassSeason(crop.Establishment)
      : null;
},

async buildCropsWithManagement(
  crops,
  fieldId,
  year,
  cropTypeAllData,
  applicationReferenceData,
) {
  const cropsWithManagement = [];
  let soilAnalysis = null;

  for (const crop of crops) {
    const cropResult = await this.buildCropWithManagement(
      crop,
      fieldId,
      year,
      cropTypeAllData,
      applicationReferenceData,
      soilAnalysis,
    );
    cropsWithManagement.push(cropResult.crop);
    soilAnalysis = cropResult.soilAnalysis;
  }

  return { cropsWithManagement, soilAnalysis };
},

async buildCropWithManagement(
  crop,
  fieldId,
  year,
  cropTypeAllData,
  applicationReferenceData,
  currentSoilAnalysis,
) {
  try {
    const snsAnalysis = await this.getSnsAnalysis(crop.ID);
    const managementPeriods = await this.managementPeriodRepository.find({
      where: { CropID: crop.ID },
    });
    const { managementWithSubData, soilAnalysis } =
      await this.buildManagementWithSubData(
        managementPeriods,
        fieldId,
        year,
        applicationReferenceData,
        currentSoilAnalysis,
      );
    const cropNames = await this.getCropNames(crop, cropTypeAllData);

    return {
      crop: {
        ...crop,
        ...cropNames,
        ManagementPeriods: managementWithSubData,
        SNSAnalysis: snsAnalysis,
      },
      soilAnalysis,
    };
  } catch (error) {
    console.error("Error processing crop", crop.ID, error);
    return {
      crop: {
        ...crop,
        error: error.message,
      },
      soilAnalysis: currentSoilAnalysis,
    };
  }
},

async getSnsAnalysis(cropId) {
  const snsAnalysis = await this.snsAnalysisRepository.findOne({
    where: { CropID: cropId },
  });

  return snsAnalysis
    ? {
        SNSValue: snsAnalysis.SoilNitrogenSupplyValue,
        SNSIndex: snsAnalysis.SoilNitrogenSupplyIndex,
        SNSMethod: "Not Entered",
      }
    : null;
},

async buildManagementWithSubData(
  managementPeriods,
  fieldId,
  year,
  applicationReferenceData,
  currentSoilAnalysis,
) {
  const managementWithSubData = [];
  let soilAnalysis = currentSoilAnalysis;
  let isSoilAnalysisAdded = null;

  for (const managementPeriod of managementPeriods) {
    const managementResult = await this.buildManagementPeriodData(
      managementPeriod,
      fieldId,
      year,
      applicationReferenceData,
      soilAnalysis,
      isSoilAnalysisAdded,
    );
    managementWithSubData.push(managementResult.managementPeriod);
    soilAnalysis = managementResult.soilAnalysis;
    isSoilAnalysisAdded = managementResult.isSoilAnalysisAdded;
  }

  return { managementWithSubData, soilAnalysis };
},

async buildManagementPeriodData(
  managementPeriod,
  fieldId,
  year,
  applicationReferenceData,
  soilAnalysis,
  isSoilAnalysisAdded,
) {
  const organicManuresWithNames = await this.getOrganicManuresWithNames(
    managementPeriod.ID,
    applicationReferenceData,
  );
  const recommendation = await this.recommendationRepository.findOne({
    where: { ManagementPeriodID: managementPeriod.ID },
  });
  const soilAnalysisResult = await this.getSoilAnalysisForManagementPeriod(
    fieldId,
    year,
    recommendation,
    soilAnalysis,
    isSoilAnalysisAdded,
  );
  const recommendationData = await this.getRecommendationData(
    fieldId,
    year,
    managementPeriod.ID,
    recommendation,
  );
  const fertiliserManures = await this.fertiliserManureRepository.find({
    where: { ManagementPeriodID: managementPeriod.ID },
  });

  return {
    managementPeriod: {
      ...managementPeriod,
      OrganicManures: organicManuresWithNames,
      Recommendation: recommendationData,
      FertiliserManures: fertiliserManures,
    },
    soilAnalysis: soilAnalysisResult.soilAnalysis,
    isSoilAnalysisAdded: soilAnalysisResult.isSoilAnalysisAdded,
  };
},

async getOrganicManuresWithNames(managementPeriodId, applicationReferenceData) {
  const organicManures = await this.organicManureRepository.find({
    where: { ManagementPeriodID: managementPeriodId },
  });

  return Promise.all(
    organicManures.map((manure) =>
      this.addOrganicManureNames(manure, applicationReferenceData),
    ),
  );
},

async addOrganicManureNames(manure, applicationReferenceData) {
  const {
    allManureData,
    allApplicationMethodsData,
    allIncorporationMethodsData,
    allIncorporationDelaysData,
  } = applicationReferenceData;

  return {
    ...manure,
    ManureTypeName: await this.getManureTypeName(
      manure.ManureTypeID,
      allManureData,
    ),
    ApplicationMethodName: await this.getApplicationMethodName(
      manure.ApplicationMethodID,
      allApplicationMethodsData,
    ),
    IncorporationMethodName: await this.getIncorporationMethodName(
      manure.IncorporationMethodID,
      allIncorporationMethodsData,
    ),
    IncorporationDelayName: await this.getIncorporationDelayName(
      manure.IncorporationDelayID,
      allIncorporationDelaysData,
    ),
  };
},

async getSoilAnalysisForManagementPeriod(
  fieldId,
  year,
  recommendation,
  soilAnalysis,
  isSoilAnalysisAdded,
) {
  if (isSoilAnalysisAdded != null) {
    return { soilAnalysis, isSoilAnalysisAdded };
  }

  const soilAnalysisRecords = await this.getRecentSoilAnalysisRecord(
    fieldId,
    year,
  );

  if (recommendation && soilAnalysisRecords != null) {
    return {
      soilAnalysis: this.mapSoilAnalysis(recommendation, soilAnalysisRecords),
      isSoilAnalysisAdded: true,
    };
  }

  return { soilAnalysis: null, isSoilAnalysisAdded };
},

async getRecentSoilAnalysisRecord(fieldId, year) {
  const fiveYearBack = 5;
  const soilAnalysisRecordsList = await this.soilAnalysisRepository.find({
    where: {
      FieldID: fieldId,
      Year: Between(year - fiveYearBack, year),
    },
    order: { Date: "DESC" },
    take: 1,
  });

  return soilAnalysisRecordsList[0] || null;
},

mapSoilAnalysis(recommendation, soilAnalysisRecords) {
  return {
    SulphurDeficient: soilAnalysisRecords.SulphurDeficient,
    Date: soilAnalysisRecords.Date,
    PH: recommendation.PH,
    PhosphorusMethodologyID: soilAnalysisRecords.PhosphorusMethodologyID,
    PhosphorusIndex: recommendation.PIndex,
    PotassiumIndex: recommendation.KIndex,
    MagnesiumIndex: recommendation.MgIndex,
    PhosphorusStatus: soilAnalysisRecords.PhosphorusStatus,
    PotassiumStatus: soilAnalysisRecords.PotassiumStatus,
    MagnesiumStatus: soilAnalysisRecords.MagnesiumStatus,
    OrganicMatter: soilAnalysisRecords.OrganicMatterPercentage,
  };
},

async getRecommendationData(fieldId, year, managementPeriodId, recommendation) {
  const mergedRecommendation = await this.getMergedRecommendation(
    fieldId,
    year,
    managementPeriodId,
  );

  if (!recommendation) {
    return null;
  }

  const recommendationComments =
    await this.recommendationCommentsRepository.find({
      where: { RecommendationID: recommendation.ID },
    });

  return {
    ...(mergedRecommendation == null ? recommendation : mergedRecommendation),
    RecommendationComments: recommendationComments,
  };
},

async getMergedRecommendation(fieldId, year, managementPeriodId) {
  const storedProcedure =
    "EXEC dbo.spRecommendations_GetRecommendations @fieldId = @0, @harvestYear = @1";
  const recommendations = await this.executeQuery(storedProcedure, [
    fieldId,
    year,
  ]);
  let mergedRecommendation = null;

  if (recommendations != null) {
    const recBasedOnManId = recommendations.filter(
      (rec) => rec.ManagementPeriod_ID === managementPeriodId,
    );

    for (const recommendationRow of recBasedOnManId) {
      mergedRecommendation = await this.mapRecommendationRow(
        recommendationRow,
        fieldId,
        year,
      );
    }
  }

  return mergedRecommendation;
},

async mapRecommendationRow(recommendationRow, fieldId, year) {
  const data = {
    Crop: {},
    Recommendation: {},
    ManagementPeriod: {},
    FertiliserManure: {},
  };
  const previousAppliedLime = await this.processSoilRecommendations(
    year,
    fieldId,
    recommendationRow,
  );

  data.Recommendation.PreviousAppliedLime = previousAppliedLime || 0;
  this.assignRecommendationRowData(recommendationRow, data);

  return {
    ...data.Recommendation,
    ...data.FertiliserManure,
  };
},

assignRecommendationRowData(recommendationRow, data) {
  const PREFIXES = {
    CROP: "Crop_",
    RECOMMENDATION: "Recommendation_",
    MANAGEMENT_PERIOD: "ManagementPeriod_",
    FERTILISER_MANURE: "FertiliserManure_",
  };

  Object.keys(recommendationRow).forEach((recDataKey) => {
    if (recDataKey.startsWith(PREFIXES.CROP)) {
      data.Crop[recDataKey.slice(PREFIXES.CROP.length)] =
        recommendationRow[recDataKey];
    } else if (recDataKey.startsWith(PREFIXES.RECOMMENDATION)) {
      data.Recommendation[recDataKey.slice(PREFIXES.RECOMMENDATION.length)] =
        recommendationRow[recDataKey];
    } else if (recDataKey.startsWith(PREFIXES.MANAGEMENT_PERIOD)) {
      data.ManagementPeriod[
        recDataKey.slice(PREFIXES.MANAGEMENT_PERIOD.length)
      ] = recommendationRow[recDataKey];
    } else if (recDataKey.startsWith(PREFIXES.FERTILISER_MANURE)) {
      data.FertiliserManure[
        recDataKey.slice(PREFIXES.FERTILISER_MANURE.length)
      ] = recommendationRow[recDataKey];
    } else {
      console.log("no assignment");
    }
  });
},

async getCropNames(crop, cropTypeAllData) {
  return {
    CropTypeName: await this.getCropTypeName(crop.CropTypeID, cropTypeAllData),
    CropInfo1Name: crop.CropInfo1
      ? await this.getCropInfo1Name(crop.CropTypeID, crop.CropInfo1)
      : "",
    CropInfo2Name: crop.CropInfo2
      ? await this.getCropInfo2Name(crop.CropInfo2)
      : "",
  };
},

async buildSoilDetails(field, farm, pkBalance, soilAnalysis) {
  const soil = await this.rB209SoilService.getData(
    `/Soil/SoilType/${Number(field.SoilTypeID)}`,
  );
  const pscIndex = await this.getPscIndex(field, farm);
  const soilDetails = {
    PscIndexName: pscIndex?.Name ?? null,
    SoilTypeId: field.SoilTypeID,
    SoilTypeName: soil?.soilType,
    PotashReleasingClay: field.SoilReleasingClay,
    SulphurDeficient: soilAnalysis?.SulphurDeficient ?? null,
    StartingP: pkBalance?.PBalance == null ? null : pkBalance.PBalance,
    Startingk: pkBalance?.KBalance == null ? null : pkBalance.KBalance,
  };
  console.log("soilDetails", soilDetails);

  return soilDetails;
},

async getPscIndex(field, farm) {
  if (farm.CountryID !== CountryMapper.SCOTLAND) {
    return null;
  }

  return this.pscIndexRepository.findOne({
    where: { ID: field.PscIndexID },
  });
}
};

module.exports = { fieldRelatedMethods };
