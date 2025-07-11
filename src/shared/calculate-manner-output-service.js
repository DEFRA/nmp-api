const { CropOrderMapper } = require("../constants/crop-order-mapper");
const { CropTypeLinkingEntity } = require("../db/entity/crop-type-linking.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const { ManagementPeriodEntity } = require("../db/entity/management-period.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { SoilTypeSoilTextureEntity } = require("../db/entity/soil-type-soil-texture.entity");
const MannerCalculateNutrientsService = require("../vendors/manner/calculate-nutrients/calculate-nutrients.service");
const MannerManureTypesService = require("../vendors/manner/manure-types/manure-types.service");
const { CalculateTotalAvailableNForNextYear } = require("./calculate-next-year-available-n");

class CalculateMannerOutputService {
  constructor() {
    this.MannerManureTypesService = new MannerManureTypesService();
    this.MannerCalculateNutrientsService =
      new MannerCalculateNutrientsService();
    this.CalculateTotalAvailableNForPreviousYear =
      new CalculateTotalAvailableNForNextYear();
  }

  async buildMannerOutputs(
    CropData,
    MannerOutput,
    managementPeriod,
    transactionalManager
  ) {
    let availableNForNextDefoliation = 0;
    let nextCropAvailableN =
      await this.CalculateTotalAvailableNForPreviousYear.calculateAvailableNForPreviousYear(
        CropData.FieldID,
        CropData.Year,
        transactionalManager
      );

    if (managementPeriod.Defoliation > 1) {
      const previousDefoliationManagementPeriods =
        await transactionalManager.find(ManagementPeriodEntity, {
          where: {
            CropID: CropData.ID,
            Defoliation: managementPeriod.Defoliation - 1,
          },
        });

      const prevManagementPeriodIDs = previousDefoliationManagementPeriods.map(
        (mp) => mp.ID
      );

      if (prevManagementPeriodIDs.length > 0) {
        const organicManures = await transactionalManager.find(
          OrganicManureEntity,
          {
            where: {
              ManagementPeriodID: In(prevManagementPeriodIDs),
            },
          }
        );

        availableNForNextDefoliation = organicManures.reduce(
          (sum, manure) => sum + (manure.AvailableNForNextDefoliation || 0),
          0
        );
      }
    }
    if (CropData.CropOrder == CropOrderMapper.SECONDCROP) {
      nextCropAvailableN = 0;
      availableNForNextDefoliation = 0;
    }
    return [
      {
        id: CropData.CropOrder,
        defoliationId: managementPeriod.Defoliation,
        totalN: MannerOutput.data.totalN,
        availableN:
          MannerOutput.data.currentCropAvailableN +
          nextCropAvailableN +
          availableNForNextDefoliation,
        totalP: MannerOutput.data.totalP2O5,
        availableP: MannerOutput.data.cropAvailableP2O5,
        totalK: MannerOutput.data.totalK2O,
        availableK: MannerOutput.data.cropAvailableK2O,
        totalS: MannerOutput.data.totalSO3,
        availableS: MannerOutput.data.cropAvailableSO3,
        totalM: MannerOutput.data.totalMgO,
      },
    ];
  }

  async getManureTypeData(ManureTypeID, request) {
    try {
      const manureTypeData = await this.MannerManureTypesService.getData(
        `/manure-types/${ManureTypeID}`,
        request
      );
      return manureTypeData;
    } catch (error) {
      console.error("Error fetching manure type data:", error);
      throw new Error("Failed to get manure type data");
    }
  }

  async buildManureApplications(
    managementPeriodID,
    organicManureData,
    request,
    transactionalManager
  ) {
    // Filter the organicManureAllData for the given managementPeriodID
    const mulOrganicManuresData = await transactionalManager.find(
      OrganicManureEntity,
      {
        where: { ManagementPeriodID: managementPeriodID },
      }
    );

    // Initialize an empty array for storing results
    const manureApplications = [];

    // Loop through the mulOrganicManuresData (array of objects)
    for (const manure of mulOrganicManuresData) {
      // Fetch manure type data for each manure by its ManureTypeID
      const manureTypeData = await this.getManureTypeData(
        manure.ManureTypeID,
        request
      );

      // Push each manure application details into the array
      manureApplications.push({
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
        applicationDate: new Date(manure.ApplicationDate)
          .toISOString()
          .split("T")[0],
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
        endOfDrainageDate: new Date(manure.EndOfDrain)
          .toISOString()
          .split("T")[0],
        rainfallPostApplication: manure.Rainfall,
        cropNUptake: manure.AutumnCropNitrogenUptake,
        windspeedID: manure.WindspeedID,
        rainTypeID: manure.RainfallWithinSixHoursID,
        topsoilMoistureID: manure.MoistureID,
      });
    }

    if (organicManureData != null) {
      if (organicManureData.ManagementPeriodID == managementPeriodID) {
        if (Object.keys(organicManureData).length !== 0) {
          // Handle the single organicManureData object and push its values into the array
          // Fetch manure type data for the single organicManureData object
          const manureTypeData = await this.getManureTypeData(
            organicManureData.ManureTypeID,
            request
          );

          manureApplications.push({
            manureDetails: {
              manureID: organicManureData.ManureTypeID,
              name: manureTypeData.data.name,
              isLiquid: manureTypeData.data.isLiquid,
              dryMatter: organicManureData.DryMatterPercent,
              totalN: organicManureData.N,
              nH4N: organicManureData.NH4N,
              uric: organicManureData.UricAcid,
              nO3N: organicManureData.NO3N,
              p2O5: organicManureData.P2O5,
              sO3: organicManureData.SO3,
              k2O: organicManureData.K2O,
              mgO: organicManureData.MgO,
            },
            applicationDate: new Date(organicManureData.ApplicationDate)
              .toISOString()
              .split("T")[0],
            applicationRate: {
              value: organicManureData.ApplicationRate,
              unit: "kg/hectare",
            },
            applicationMethodID: organicManureData.ApplicationMethodID,
            incorporationMethodID: organicManureData.IncorporationMethodID,
            incorporationDelayID: organicManureData.IncorporationDelayID,
            autumnCropNitrogenUptake: {
              value: organicManureData.AutumnCropNitrogenUptake,
              unit: "string",
            },
            endOfDrainageDate: new Date(organicManureData.EndOfDrain)
              .toISOString()
              .split("T")[0],
            rainfallPostApplication: organicManureData.Rainfall,
            cropNUptake: organicManureData.AutumnCropNitrogenUptake,
            windspeedID: organicManureData.WindspeedID,
            rainTypeID: organicManureData.RainfallWithinSixHoursID,
            topsoilMoistureID: organicManureData.MoistureID,
          });
        }
      }
    }

    // Return the manure applications array
    return manureApplications;
  }
  async buildMannerOutputReq(
    farmData,
    fieldData,
    cropTypeLinkingData,
    organicManureData,
    manureApplications,
    soilTypeTextureData
  ) {
    return {
      runType: farmData.EnglishRules ? 3 : 4,
      postcode: farmData.ClimateDataPostCode.split(" ")[0],
      countryID: farmData.EnglishRules ? 1 : 2,
      field: {
        fieldID: fieldData.ID,
        fieldName: fieldData.Name,
        MannerCropTypeID: cropTypeLinkingData.MannerCropTypeID,
        topsoilID: soilTypeTextureData.TopSoilID,
        subsoilID: soilTypeTextureData.SubSoilID,
        isInNVZ: fieldData.IsWithinNVZ,
      },
      manureApplications,
    };
  }
  async calculateMannerOutputForOrganicManure(
    cropData,
    organicManure,
    farmData,
    fieldData,
    transactionalManager,
    request
  ) {
    const allMannerOutputs = [];

    // Step 1: Get all crops for the field and year
    const allCrops = await transactionalManager.find(CropEntity, {
      where: {
        FieldID: cropData.FieldID,
        Year: cropData.Year,
      },
    });

    // Step 2: Process cropData first, then rest
    const cropsToProcess = [
      cropData,
      ...allCrops.filter((c) => c.ID !== cropData.ID),
    ];

    // Step 3: Loop through crops
    for (const crop of cropsToProcess) {
      // Fetch management periods for the crop
      const managementPeriods = await transactionalManager.find(
        ManagementPeriodEntity,
        { where: { CropID: crop.ID } }
      );

      const cropTypeLinkingData = await transactionalManager.findOne(
        CropTypeLinkingEntity,
        {
          where: {
            CropTypeID: crop.CropTypeID,
          },
        }
      );

      const soilTypeTextureData = await transactionalManager.findOne(
        SoilTypeSoilTextureEntity,
        {
          where: {
            SoilTypeID: fieldData.SoilTypeID,
          },
        }
      );

      let matchingPeriod = null,
        otherPeriods = null,
        orderedPeriods = null;

      if (organicManure != null) {
        // Separate periods: one matching organicManure.ManagementPeriodID, then others
        matchingPeriod = managementPeriods.find(
          (p) => p.ID === organicManure.ManagementPeriodID
        );
        otherPeriods = managementPeriods.filter(
          (p) => p.ID !== organicManure.ManagementPeriodID
        );

        orderedPeriods = matchingPeriod
          ? [matchingPeriod, ...otherPeriods]
          : otherPeriods;
      } else {
        orderedPeriods = managementPeriods;
      }

      // Step 4: Process each management period
      for (const period of orderedPeriods) {
        const managementPeriodID = period.ID;

        // 4.1: Build manureApplications
        const manureApplications = await this.buildManureApplications(
          managementPeriodID,
          organicManure,
          request,
          transactionalManager
        );
        let mannerOutputReq = null;
        // 4.2: Build mannerOutputReq
        if (manureApplications.length > 0) {
          mannerOutputReq = await this.buildMannerOutputReq(
            farmData,
            fieldData,
            cropTypeLinkingData,
            organicManure,
            manureApplications,
            soilTypeTextureData
          );
        } else {
          console.log("there is no manure for the crop");
        }
        let mannerOutput = null;
        // 4.3: Post to calculate nutrients
        if (mannerOutputReq) {
          mannerOutput = await this.MannerCalculateNutrientsService.postData(
            "/calculate-nutrients",
            mannerOutputReq,
            request
          );
        }
        let output = [];
        // 4.4: Build output and add to final array
        if (mannerOutput) {
          output = await this.buildMannerOutputs(
            crop,
            mannerOutput,
            period,
            transactionalManager
          );
        }
        allMannerOutputs.push(...output);
      }
    }

    return allMannerOutputs;
  }
}
module.exports = { CalculateMannerOutputService };
