const { In } = require("typeorm");
const { CropOrderMapper } = require("../constants/crop-order-mapper");
const {
  CropTypeLinkingEntity,
} = require("../db/entity/crop-type-linking.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const {
  SoilTypeSoilTextureEntity,
} = require("../db/entity/soil-type-soil-texture.entity");
const MannerCalculateNutrientsService = require("../vendors/manner/calculate-nutrients/calculate-nutrients.service");
const MannerManureTypesService = require("../vendors/manner/manure-types/manure-types.service");
const {
  CalculateTotalAvailableNForNextYear,
} = require("./calculate-next-year-available-n");
const { RunTypeMapper } = require("../constants/run-type-mapper");
const { CountryEntity } = require("../db/entity/country.entity");

class CalculateMannerOutputService {
  constructor() {
    this.MannerManureTypesService = new MannerManureTypesService();
    this.MannerCalculateNutrientsService =
      new MannerCalculateNutrientsService();
    this.CalculateTotalAvailableNForPreviousYear =
      new CalculateTotalAvailableNForNextYear();
  }

  async getNextCropAvailableN(
    CropData,
    managementPeriod,
    transactionalManager,
  ) {
    if (managementPeriod.Defoliation !== 1) {
      return 0;
    }

    return this.CalculateTotalAvailableNForPreviousYear.calculateAvailableNForPreviousYear(
      CropData.FieldID,
      CropData.Year,
      transactionalManager,
    );
  }

  async getAvailableNForNextDefoliation(
    CropData,
    managementPeriod,
    transactionalManager,
  ) {
    if (managementPeriod.Defoliation <= 1) {
      return 0;
    }

    const previousDefoliationManagementPeriods =
      await transactionalManager.find(ManagementPeriodEntity, {
        where: {
          CropID: CropData.ID,
          Defoliation: managementPeriod.Defoliation - 1,
        },
      });

    const prevManagementPeriodIDs = previousDefoliationManagementPeriods.map(
      (mp) => mp.ID,
    );

    if (prevManagementPeriodIDs.length === 0) {
      return 0;
    }

    const organicManures = await transactionalManager.find(
      OrganicManureEntity,
      {
        where: {
          ManagementPeriodID: In(prevManagementPeriodIDs),
        },
      },
    );

    return organicManures.reduce(
      (sum, manure) => sum + (manure.AvailableNForNextDefoliation || 0),
      0,
    );
  }

  async getCarryOverN(CropData, managementPeriod, transactionalManager) {
    if (CropData.CropOrder === CropOrderMapper.SECONDCROP) {
      return {
        nextCropAvailableN: 0,
        availableNForNextDefoliation: 0,
      };
    }

    const [nextCropAvailableN, availableNForNextDefoliation] =
      await Promise.all([
        this.getNextCropAvailableN(
          CropData,
          managementPeriod,
          transactionalManager,
        ),
        this.getAvailableNForNextDefoliation(
          CropData,
          managementPeriod,
          transactionalManager,
        ),
      ]);

    return {
      nextCropAvailableN,
      availableNForNextDefoliation,
    };
  }

  normalizeMannerNutrients(mannerData) {
    return {
      totalN: mannerData?.totalN || 0,
      currentCropAvailableN: mannerData?.currentCropAvailableN || 0,
      totalP: mannerData?.totalP2O5 || 0,
      availableP: mannerData?.cropAvailableP2O5 || 0,
      totalK: mannerData?.totalK2O || 0,
      availableK: mannerData?.cropAvailableK2O || 0,
      totalS: mannerData?.totalSO3 || 0,
      availableS: mannerData?.cropAvailableSO3 || 0,
      totalM: mannerData?.totalMgO || 0,
    };
  }

  async buildMannerOutputs(
    CropData,
    MannerOutput,
    managementPeriod,
    transactionalManager,
  ) {
    const { nextCropAvailableN, availableNForNextDefoliation } =
      await this.getCarryOverN(
        CropData,
        managementPeriod,
        transactionalManager,
      );

    const mannerData = MannerOutput?.data;
    const hasCarryOverN =
      nextCropAvailableN !== 0 || availableNForNextDefoliation !== 0;

    if (!mannerData && !hasCarryOverN) {
      return [];
    }

    const nutrients = this.normalizeMannerNutrients(mannerData);

    return [
      {
        id: CropData.CropOrder,
        defoliationId: managementPeriod.Defoliation,
        totalN: nutrients.totalN,
        availableN:
          nutrients.currentCropAvailableN +
          nextCropAvailableN +
          availableNForNextDefoliation,
        totalP: nutrients.totalP,
        availableP: nutrients.availableP,
        totalK: nutrients.totalK,
        availableK: nutrients.availableK,
        totalS: nutrients.totalS,
        availableS: nutrients.availableS,
        totalM: nutrients.totalM,
      },
    ];
  }

  async getManureTypeData(manureTypesResponse, manureTypeID) {
    const manureType = manureTypesResponse.data.find(
      (mt) => mt.id === manureTypeID,
    );

    if (!manureType) {
      console.log(`ManureType not found for ID ${manureTypeID}`);
    }

    //  Match API response structure
    return {
      data: manureType,
    };
  }

  async buildManureApplicationObject(manure, manureTypeData) {
    const applicationDate =
      this.formatDateOnly(manure.ApplicationDate) ??
      this.formatDateOnly(new Date());
    const endOfDrainageDate =
      this.formatDateOnly(manure.EndOfDrain) ?? applicationDate;

    return {
      manureDetails: {
        manureID: manure.ManureTypeID,
        name: manureTypeData.data.name,
        isLiquid: manureTypeData.data.isLiquid,
        dryMatter: manure.DryMatterPercent,
        totalN: manure.N,
        nH4N: manure.NH4N,
        uric: manure.UricAcid,
        nO3N: manure.NO3N,
        p2O5: manure.P2O5,
        sO3: manure.SO3,
        k2O: manure.K2O,
        mgO: manure.MgO,
      },
      applicationDate,
      applicationRate: {
        value: manure.ApplicationRate,
        unit: "kg/hectare",
      },
      applicationMethodID: manure.ApplicationMethodID,
      incorporationMethodID: manure.IncorporationMethodID,
      incorporationDelayID: manure.IncorporationDelayID,
      autumnCropNitrogenUptake: {
        value: manure.AutumnCropNitrogenUptake,
        unit: "string",
      },
      endOfDrainageDate,
      rainfallPostApplication: manure.Rainfall,
      cropNUptake: manure.AutumnCropNitrogenUptake,
      windspeedID: manure.WindspeedID,
      rainTypeID: manure.RainfallWithinSixHoursID,
      topsoilMoistureID: manure.MoistureID,
    };
  }

  formatDateOnly(value) {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const parsedDate = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate.toISOString().split("T")[0];
  }

  async processMultipleManures(
    mulOrganicManuresData,
    allManureData,
    manureApplications,
  ) {
    for (const manure of mulOrganicManuresData) {
      const manureTypeData = await this.getManureTypeData(
        allManureData,
        manure.ManureTypeID,
      );
      const manureApplication = await this.buildManureApplicationObject(
        manure,
        manureTypeData,
      );
      manureApplications.push(manureApplication);
    }
  }

  async processSingleManure(
    organicManureData,
    managementPeriodID,
    allManureData,
    manureApplications,
  ) {
    if (
      organicManureData &&
      organicManureData.ManagementPeriodID === managementPeriodID &&
      Object.keys(organicManureData).length !== 0
    ) {
      const manureTypeData = await this.getManureTypeData(
        allManureData,
        organicManureData.ManureTypeID,
      );
      const manureApplication = await this.buildManureApplicationObject(
        organicManureData,
        manureTypeData,
      );
      manureApplications.push(manureApplication);
    }
  }

  async buildManureApplications(
    managementPeriodID,
    organicManureData,
    allManureData,
    transactionalManager,
  ) {
    const mulOrganicManuresData = await transactionalManager.find(
      OrganicManureEntity,
      {
        where: { ManagementPeriodID: managementPeriodID },
      },
    );

    const manureApplications = [];

    await this.processMultipleManures(
      mulOrganicManuresData,
      allManureData,
      manureApplications,
    );

    await this.processSingleManure(
      organicManureData,
      managementPeriodID,
      allManureData,
      manureApplications,
    );

    return manureApplications;
  }
  async buildMannerOutputReq(
    farmData,
    fieldData,
    mannerCropTypeID,
    manureApplications,
    soilTypeTextureData,
    transactionalManager,
  ) {
    const rb209CountryData = await transactionalManager.findOne(CountryEntity, {
      where: {
        ID: farmData.CountryID,
      },
    });
    return {
      runType: farmData.EnglishRules
        ? RunTypeMapper.PLANETENGLAND
        : RunTypeMapper.PLANETSCOTLAND,
      postcode: farmData.ClimateDataPostCode.split(" ")[0],
      countryID: rb209CountryData.RB209CountryID,
      field: {
        fieldID: fieldData.ID,
        fieldName: fieldData.Name,
        MannerCropTypeID: mannerCropTypeID,
        topsoilID: soilTypeTextureData.TopSoilID,
        subsoilID: soilTypeTextureData.SubSoilID,
        isInNVZ: fieldData.IsWithinNVZ,
      },
      manureApplications,
    };
  }

  async getMannerCropTypeId(crop, transactionalManager) {
    const SEPTEMBER_MONTH_INDEX = 8;
    const JULY_MONTH_INDEX = 6;
    const LATE_SOWN_START_DAY = 15;
    const LATE_SOWN_END_DAY = 31;
    if (crop?.CropTypeID === null) {
      console.log("Invalid crop data: CropTypeID is required");
    }

    const cropTypeLinkingData = await transactionalManager.findOne(
      CropTypeLinkingEntity,
      {
        where: {
          CropTypeID: crop.CropTypeID,
        },
      },
    );

    if (!cropTypeLinkingData) {
      console.log(
        `CropTypeLinking not found for CropTypeID ${crop.CropTypeID}`,
      );
    }

    // Default value
    const defaultMannerCropTypeId = cropTypeLinkingData?.MannerCropTypeID;

    if (!crop.SowingDate) {
      return defaultMannerCropTypeId;
    }

    const sowingDate = new Date(crop.SowingDate);

    const lateSownStartDate = new Date(
      crop.Year,
      SEPTEMBER_MONTH_INDEX,
      LATE_SOWN_START_DAY,
    );

    const lateSownEndDate = new Date(
      crop.Year + 1,
      JULY_MONTH_INDEX,
      LATE_SOWN_END_DAY,
    );

    const isLateSown =
      sowingDate > lateSownStartDate && sowingDate <= lateSownEndDate;

    if (isLateSown && cropTypeLinkingData.LateSownMannerCropTypeID) {
      return cropTypeLinkingData.LateSownMannerCropTypeID;
    }

    return defaultMannerCropTypeId;
  }

  getOrderedManagementPeriods(managementPeriods, organicManure) {
    if (!organicManure) {
      return managementPeriods;
    }

    const matchingPeriod = managementPeriods.find(
      (p) => p.ID === organicManure.ManagementPeriodID,
    );
    const otherPeriods = managementPeriods.filter(
      (p) => p.ID !== organicManure.ManagementPeriodID,
    );

    return matchingPeriod ? [matchingPeriod, ...otherPeriods] : otherPeriods;
  }

  async processManagementPeriod({
    crop,
    period,
    organicManure,
    allManureData,
    farmData,
    fieldData,
    mannerCropTypeID,
    soilTypeTextureData,
    transactionalManager,
    request,
  }) {
    const manureApplications = await this.buildManureApplications(
      period.ID,
      organicManure,
      allManureData,
      transactionalManager,
    );
    let mannerOutputReq = null,
      mannerOutput = null;
    if (manureApplications.length > 0) {
      mannerOutputReq = await this.buildMannerOutputReq(
        farmData,
        fieldData,
        mannerCropTypeID,
        manureApplications,
        soilTypeTextureData,
        transactionalManager,
      );
    }
    if (mannerOutputReq) {
      mannerOutput = await this.MannerCalculateNutrientsService.postData(
        "/calculate-nutrients",
        mannerOutputReq,
        request,
      );
    }
    const buildManureOutputs = await this.buildMannerOutputs(
      crop,
      mannerOutput,
      period,
      transactionalManager,
    );
    return buildManureOutputs;
  }

  async calculateMannerOutputForOrganicManure(
    cropData,
    organicManure,
    farmData,
    fieldData,
    transactionalManager,
    request,
  ) {
    const allMannerOutputs = [];

    const allCrops = await transactionalManager.find(CropEntity, {
      where: {
        FieldID: cropData.FieldID,
        Year: cropData.Year,
      },
    });

    const allManureData = await this.MannerManureTypesService.getData(
      "/manure-types",
      request,
    );

    const cropsToProcess = [
      cropData,
      ...allCrops.filter((c) => c.ID !== cropData.ID),
    ];

    for (const crop of cropsToProcess) {
      const managementPeriods = await transactionalManager.find(
        ManagementPeriodEntity,
        { where: { CropID: crop.ID } },
      );
      const mannerCropTypeID = await this.getMannerCropTypeId(
        crop,
        transactionalManager,
      );
      const soilTypeTextureData = await transactionalManager.findOne(
        SoilTypeSoilTextureEntity,
        {
          where: {
            SoilTypeID: fieldData.SoilTypeID,
          },
        },
      );

      const orderedPeriods = this.getOrderedManagementPeriods(
        managementPeriods,
        organicManure,
      );

      for (const period of orderedPeriods) {
        const output = await this.processManagementPeriod({
          crop,
          period,
          organicManure,
          allManureData,
          farmData,
          fieldData,
          mannerCropTypeID,
          soilTypeTextureData,
          transactionalManager,
          request,
        });

        allMannerOutputs.push(...output);
      }
    }

    return allMannerOutputs;
  }
}
module.exports = { CalculateMannerOutputService };
