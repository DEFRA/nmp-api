const { AppDataSource } = require("../db/data-source");

const mannerEstimationsReadHelpers = {
  async checkMannerEstimationExists(organisationId, name) {
    const matchedEstimation = await this.repository.findOne({
      where: { OrganisationID: organisationId, Name: name },
      select: { ID: true, Name: true, OrganisationID: true },
    });
    return { exists: Boolean(matchedEstimation) };
  },

  async getByOrganisationId(organisationId) {
    const mannerEstimationData = await this.repository.find({
      where: { OrganisationID: organisationId },
    });
    return mannerEstimationData;
  },

  async getMannerEstimationRelatedDataById(id, request) {
    const mannerEstimationData = await this.repository.findOne({
      where: { ID: id },
    });
 if (!mannerEstimationData) {
      return null;
    }
    const mannerFarm = await this.mannerFarmsRepository.findOne({
        where: { ID: mannerEstimationData.FarmID }
    });

   
    const estimationNames = await this.getMannerEstimationDisplayNames(
      mannerEstimationData,
      request,
    );


    const mannerEstimationApplicationsWithManureTypeName =
      await this.getMannerEstimationApplicationsWithManureTypeName(id, request);
    const mannerEstimationApplicationsWithCombinedResult =
      await this.addCombinedApplicationResult(
        mannerFarm,
        mannerEstimationData,
        mannerEstimationApplicationsWithManureTypeName,
        request,
      );
    const lastUpdatedOn = this.getLastUpdatedOn(
      mannerFarm,
      mannerEstimationDetail,
      mannerEstimationApplicationsWithManureTypeName,
    );
    mannerEstimationData.CropTypeName = estimationNames.cropTypeName;
    mannerEstimationData.TopSoil = estimationNames.topSoil;
    mannerEstimationData.SubSoil = estimationNames.subSoil;
    mannerEstimationData.Country = estimationNames.countryName;
 
    return {
      MannerFarm:mannerFarm,
      MannerEstimation: mannerEstimationData,
      MannerEstimationApplication:mannerEstimationApplicationsWithManureTypeName,
      TotalMannerCalculateNutrient:  mannerEstimationApplicationsWithCombinedResult,
      LastUpdatedOn: lastUpdatedOn,
    };
  },

  async addCombinedApplicationResult(mannerFarm,mannerEstimation, applications, request) {
      const allManureData = await this.MannerManureTypesService.getData(
           "/manure-types",
           request,
         );
    const manureApplications = [];
     await this.CalculateMannerOutputService.processMultipleManures(
       applications,
       allManureData,
       manureApplications
     );
     const mannerEstimationApplicationsRequest = this.buildMannerOutputReq(mannerFarm,
       mannerEstimation,
       manureApplications
     );
      const mannerEstimationApplicationsOutput =
      await this.MannerCalculateNutrientsService.postData(
        "/calculate-nutrients",
        mannerEstimationApplicationsRequest,
        request,
      );
     
    return mannerEstimationApplicationsOutput.data;
  },

  async getMannerEstimationDisplayNames(mannerEstimationData, request) {
    const cropTypeName = await this.getCropTypeNameById(
      mannerEstimationData.CropTypeID,
    );
    const topSoil = await this.getMannerLookupNameById(
      this.MannerTopSoilsService,
      "/top-soils",
      mannerEstimationData.TopSoilID,
      request,
    );
    const subSoil = await this.getMannerLookupNameById(
      this.MannerTopSoilsService,
      "/sub-soils",
      mannerEstimationData.SubSoilID,
      request,
    );
    const countries = await this.countryRepository.findOne({
      where: { ID: mannerEstimationData.CountryID },
    });
    const countryName = countries ? countries.Name : null;
    return { cropTypeName, topSoil, subSoil, countryName };
  },

  async getCropTypeNameById(cropTypeIdValue) {
    const cropTypeId = this.toNumericId(cropTypeIdValue);
    if (cropTypeId === null) {
      return null;
    }
    const cropTypeData = await this.rB209ArableService.getData(
      `/Arable/CropType/${cropTypeId}`,
    );
    return cropTypeData?.cropTypeName ?? null;
  },

  async getMannerLookupNameById(service, endpoint, idValue, request) {
    const id = this.toNumericId(idValue);
    if (id === null) {
      return null;
    }
    const lookupData = await service.getData(`${endpoint}/${id}`, request);
    return lookupData?.data?.name ?? null;
  },

  async getMannerEstimationApplicationsWithManureTypeName(id, request) {
    const mannerEstimationApplications =
      await this.getMannerEstimationApplications(id);
    const lookupConfigs = this.getApplicationLookupConfigs();
    await this.populateApplicationLookupCaches(
      mannerEstimationApplications,
      lookupConfigs,
      request,
    );
    return this.mapApplicationsWithLookupNames(
      mannerEstimationApplications,
      lookupConfigs,
    );
  },

  async getMannerEstimationApplications(mannerEstimationId) {
    return this.mannerEstimationApplicationRepository.find({
      where: { MannerEstimationID: mannerEstimationId },
      order: { ID: "ASC" },
    });
  },

  getApplicationLookupConfigs() {
    return [
      {
        outputField: "ManureType",
        sourceField: "ManureTypeID",
        service: this.MannerManureTypesService,
        endpoint: "/manure-types",
        cache: new Map(),
      },
      {
        outputField: "ApplicationMethod",
        sourceField: "ApplicationMethodID",
        service: this.MannerApplicationMethodService,
        endpoint: "/application-methods",
        cache: new Map(),
      },
      {
        outputField: "IncorporationMethod",
        sourceField: "IncorporationMethodID",
        service: this.MannerIncorporationMethodService,
        endpoint: "/incorporation-methods",
        cache: new Map(),
      },
      {
        outputField: "IncorporationDelay",
        sourceField: "IncorporationDelayID",
        service: this.MannerIncorporationDelayService,
        endpoint: "/incorporation-delays",
        cache: new Map(),
      },
      {
        outputField: "MoistureType",
        sourceField: "MoistureID",
        service: this.MannerMoistureTypesService,
        endpoint: "/moisture-types",
        cache: new Map(),
      },
      {
        outputField: "Windspeed",
        sourceField: "WindspeedID",
        service: this.MannerWindspeedService,
        endpoint: "/windspeeds",
        cache: new Map(),
      },
      {
        outputField: "RainType",
        sourceField: "RainfallWithinSixHoursID",
        service: this.MannerRainTypesService,
        endpoint: "/rain-types",
        cache: new Map(),
      },
    ];
  },

  async populateApplicationLookupCaches(
    mannerEstimationApplications,
    lookupConfigs,
    request,
  ) {
    for (const application of mannerEstimationApplications) {
      for (const config of lookupConfigs) {
        await this.setLookupNameInCache(
          config.cache,
          application[config.sourceField],
          config.service,
          config.endpoint,
          request,
        );
      }
    }
  },

  mapApplicationsWithLookupNames(mannerEstimationApplications, lookupConfigs) {
    return mannerEstimationApplications.map((application) => {
      const enrichedApplication = { ...application };
      for (const config of lookupConfigs) {
        const sourceId = Number(application[config.sourceField]);
        enrichedApplication[config.outputField] =
          config.cache.get(sourceId) ?? null;
      }
      return enrichedApplication;
    });
  },

  async setLookupNameInCache(cache, idValue, service, endpoint, request) {
    const id = this.toNumericId(idValue);
    if (id === null || cache.has(id)) {
      return;
    }
    const lookupData = await service.getData(`${endpoint}/${id}`, request);
    cache.set(id, lookupData?.data?.name ?? null);
  },

getLastUpdatedOn(mannerFarm, mannerEstimationData = [], mannerEstimationApplications = []) {
  const dates = [
    mannerFarm?.ModifiedOn || mannerFarm?.CreatedOn,

   
      mannerEstimationData.ModifiedOn || mannerEstimationData.CreatedOn,
    

    ...mannerEstimationApplications.map(application =>
      application.ModifiedOn || application.CreatedOn
    ),
  ]
    .filter(Boolean)
    .map(date => new Date(date).getTime())
    .filter(timestamp => !Number.isNaN(timestamp));

  if (dates.length === 0) {
    return null;
  }

  return new Date(Math.max(...dates));
},

  toNumericId(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsedValue = Number(value);
      return Number.isFinite(parsedValue) ? parsedValue : null;
    }
    if (value && typeof value === "object") {
      if (typeof value.id === "number") {
        return value.id;
      }
      if (typeof value.ID === "number") {
        return value.ID;
      }
    }
    return null;
  },

  async deleteMannerEstimations(mannerEstimationIds) {
    return AppDataSource.transaction(async (manager) => {
      await manager.query("EXEC spMannerEstimations_Delete @0", [
        mannerEstimationIds.join(","),
      ]);
    });
  },

 async getMannerEstimationByFarmId(farmId) {
    const mannerFarm = await this.mannerFarmsRepository.findOne({
        where: { ID: farmId }
    });

    const mannerEstimate = await this.repository.find({
        where: { FarmID: farmId },
        order: { ID: "ASC" },
    });

    return mannerEstimate.map(item => ({
        ...item,
        FarmName: mannerFarm.Name
    }));
},
};

module.exports = { mannerEstimationsReadHelpers };
