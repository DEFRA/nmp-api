const { AppDataSource } = require("../db/data-source");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const boom = require("@hapi/boom");
const { StaticStrings } = require("../shared/static.string");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const { In } = require("typeorm");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const { ARABLE } = require("../constants/rb209-endpoints-mapper");
const { FieldEntity, FarmEntity, CountryEntity } = require("../organic-manure/organic-manure-dependencies");

async function findCropDetailsFromRepo(service, CropID) {
  try {
    const cropRecord = await service.repository.findOne({
      where: { ID: CropID },
    });
    return { PlantingDate: cropRecord ? cropRecord.SowingDate : null };
  } catch (error) {
    console.error(`Error fetching crop details for CropID: ${CropID}`, error);
    return { CropId: null, PlantingDate: null };
  }
}

async function findManagementPeriodIds(service, cropId) {
  try {
    const managementPeriods = await service.managementPeriodRepository.find({
      where: { CropID: cropId },
      select: ["ID"],
    });
    return managementPeriods.map((period) => period.ID);
  } catch (error) {
    console.error(
      `Error fetching ManagementPeriodIDs for CropId: ${cropId}`,
      error,
    );
    return [];
  }
}

async function findOrganicManureData(service, managementPeriodIds) {
  try {
    return service.organicManureRepository.find({
      where: { ManagementPeriodID: In(managementPeriodIds) },
    });
  } catch (error) {
    console.error(
      `Error fetching organic manure data for ManagementPeriodIDs: ${managementPeriodIds}`,
      error,
    );
    return [];
  }
}

async function findInorganicFertiliserData(service, managementPeriodIds) {
  try {
    return service.fertiliserRepository.find({
      where: { ManagementPeriodID: In(managementPeriodIds) },
    });
  } catch (error) {
    console.error(
      `Error fetching inorganic fertiliser data for ManagementPeriodIDs: ${managementPeriodIds}`,
      error,
    );
    return [];
  }
}

async function findFarmRainfall(service, farmID) {
  try {
    const farmRecord = await service.farmRepository.findOne({
      where: { ID: farmID },
      select: ["Rainfall"],
    });
    return farmRecord ? farmRecord.Rainfall : null;
  } catch (error) {
    console.error(`Error fetching rainfall for farmId: ${farmID}`, error);
    return null;
  }
}

async function findDefoliationSequenceDescription(
  service,
  DefoliationSequenceID,
) {
  try {
    const defoliationSequence = await service.rB209GrassService.getData(
      `Grass/DefoliationSequence/${DefoliationSequenceID}`,
    );
    return defoliationSequence
      ? defoliationSequence.defoliationSequenceDescription
      : null;
  } catch (error) {
    console.error(
      `Error fetching Defoliation Sequence by id ${DefoliationSequenceID}`,
      error,
    );
    return "Unknown";
  }
}

async function buildCropDetail(service, plan) {
  const { PlantingDate } = await findCropDetailsFromRepo(service, plan.CropID);
  const Management =
    plan.DefoliationSequenceID == null
      ? null
      : await findDefoliationSequenceDescription(
          service,
          plan.DefoliationSequenceID,
        );
  const lastModifiedDate = await service.getLatestModifiedDate(plan.CropID);

  return {
    CropId: plan.CropID,
    CropTypeID: plan.CropTypeID,
    CropTypeName: plan.CropTypeName,
    CropGroupName: plan.CropGroupName,
    FieldID: plan.FieldID,
    FieldName: plan.FieldName,
    CropVariety: plan.CropVariety,
    OtherCropName: plan.OtherCropName,
    CropInfo1: plan.CropInfo1,
    CropInfo2: plan.CropInfo2,
    Yield: plan.Yield,
    CropOrder: plan.CropOrder,
    LastModifiedOn: lastModifiedDate,
    PlantingDate,
    Management,
  };
}

async function buildCropDetails(service, plans) {
  const plansWithNames = await service.mapCropTypeIdWithTheirNames(plans);
  const cropDetails = [];
  for (const plan of plansWithNames) {
    cropDetails.push(await buildCropDetail(service, plan));
  }
  return cropDetails;
}

async function mapOrganicMaterial(service, crop, organicManure, allManureData) {
  let mannerManureTypeData = {};
  try {
    const manureTypeResponse = await service.getManureTypeById(
      allManureData,
      organicManure.ManureTypeID,
    );
    mannerManureTypeData = manureTypeResponse.data;
  } catch (error) {
    console.error("Error fetching manure type", error);
  }

  return {
    OrganicMaterialId: organicManure.ID,
    ApplicationDate: organicManure.ApplicationDate,
    ManureTypeId: organicManure.ManureTypeID,
    Field: crop.FieldName,
    FieldId: crop.FieldID,
    Crop: crop.CropTypeName,
    TypeOfManure: mannerManureTypeData.name,
    Rate: organicManure.ApplicationRate,
  };
}

async function buildOrganicMaterials(service, cropDetails, request) {
  const organicMaterials = await Promise.all(
    cropDetails.map(async (crop) => {
      const managementPeriodIds = await findManagementPeriodIds(
        service,
        crop.CropId,
      );
      const organicManureData = managementPeriodIds
        ? await findOrganicManureData(service, managementPeriodIds)
        : [];
      const allManureData = await service.MannerManureTypesService.getData(
        "/manure-types",
        request,
      );

      return Promise.all(
        organicManureData.map((organicManure) =>
          mapOrganicMaterial(service, crop, organicManure, allManureData),
        ),
      );
    }),
  );

  return organicMaterials.flat();
}

function mapFertiliserApplication(crop, fertiliser) {
  return {
    InorganicFertiliserId: fertiliser.ID,
    ApplicationDate: fertiliser.ApplicationDate,
    Field: crop.FieldName,
    Crop: crop.CropTypeName,
    N: fertiliser.N,
    P2O5: fertiliser.P2O5,
    K2O: fertiliser.K2O,
    MgO: fertiliser.MgO,
    SO3: fertiliser.SO3,
    Na2O: fertiliser.Na2O,
    Lime: fertiliser.Lime,
    NH4N: fertiliser.NH4N,
    NO3N: fertiliser.NO3N,
  };
}

async function buildInorganicFertiliserApplications(service, cropDetails) {
  const fertiliserApplications = await Promise.all(
    cropDetails.map(async (crop) => {
      const managementPeriodIds = await findManagementPeriodIds(
        service,
        crop.CropId,
      );
      const fertiliserData = managementPeriodIds
        ? await findInorganicFertiliserData(service, managementPeriodIds)
        : [];
      return fertiliserData.map((fertiliser) =>
        mapFertiliserApplication(crop, fertiliser),
      );
    }),
  );

  return fertiliserApplications.flat();
}

const cropQueryMethods = {
  async createCropWithManagementPeriods(
    fieldId,
    cropData,
    managementPeriodData,
    userId,
  ) {
    return AppDataSource.transaction(async (transactionalManager) => {
      const crop = this.repository.create({
        ...cropData,
        FieldID: fieldId,
        CreatedByID: userId,
      });
      const savedCrop = await transactionalManager.save(CropEntity, crop);
      const managementPeriods = [];
      for (const managementPeriod of managementPeriodData) {
        const createdManagementPeriod = this.managementPeriodRepository.create({
          ...managementPeriod,
          CropID: savedCrop.ID,
          CreatedByID: userId,
        });
        const savedManagementPeriod = await transactionalManager.save(
          ManagementPeriodEntity,
          createdManagementPeriod,
        );
        managementPeriods.push(savedManagementPeriod);
      }
      return { Crop: savedCrop, ManagementPeriods: managementPeriods };
    });
  },

  async getCrops(fieldId, year, confirm) {
    const confirmValue = confirm ? 1 : 0;
    const cropData = await this.repository.findOne({
      where: { FieldID: fieldId, Year: year, Confirm: confirmValue },
    });
    return cropData;
  },

  async getCropTypeDataByFieldAndYear(fieldId, year, confirm) {
    const cropData = await this.repository.findOne({
      where: { FieldID: fieldId, Year: year, Confirm: confirm },
    });
    const cropTypeId = cropData?.CropTypeID;
    if (cropTypeId === null || cropTypeId === undefined) {
      throw boom.notFound(StaticStrings.HTTP_STATUS_NOT_FOUND);
    }
    const cropTypesList = await this.rB209ArableService.getData(
      ARABLE.ALL_ARABLE_CROP_TYPES_ENDPOINT,
    );
    const cropType = cropTypesList.find((cT) => cT.cropTypeId === cropTypeId);
    return {
      cropTypeId: cropType.cropTypeId,
      cropType: cropType.cropType,
      cropGroupId: cropType.cropGroupId,
    };
  },

  async filterBySingleSequenceId(data, sequenceId) {
    const filteredCalculations = data.calculations.filter(
      (item) => item.sequenceId === sequenceId,
    );
    const filteredAdviceNotes = data.adviceNotes.filter(
      (item) => item.sequenceId === sequenceId,
    );
    return {
      ...data,
      calculations: filteredCalculations,
      adviceNotes: filteredAdviceNotes,
    };
  },

  async fetchRb209CountryId(fieldId, transactionalManager = null) {
    let rb209CountryID = this.COUNTRY_BOTH; // default value
    const manager = transactionalManager ?? this.fieldRepository.manager;

    const field = await manager.findOne(FieldEntity, {
      where: { ID: fieldId },
      select: ["FarmID"],
    });
    const farm = field
      ? await manager.findOne(FarmEntity, {
          where: { ID: field.FarmID },
          select: ["CountryID"],
        })
      : null;
    const country = farm
      ? await manager.findOne(CountryEntity, {
          where: { ID: farm.CountryID },
          select: ["RB209CountryID"],
        })
      : null;
    rb209CountryID = country?.RB209CountryID ?? this.COUNTRY_BOTH;
    return rb209CountryID;
  },

  async mapCropTypeIdWithTheirNames(plans) {
    try {
      const unorderedMap = {};
      const cropTypesList = await this.rB209ArableService.getData(
        ARABLE.ALL_ARABLE_CROP_TYPES_ENDPOINT,
      );
      for (const cropType of cropTypesList) {
        unorderedMap[cropType.cropTypeId] = cropType.cropType;
      }
      for (const plan of plans) {
        plan.CropTypeName = unorderedMap[plan.CropTypeID] || null;
      }
      return plans;
    } catch (error) {
      console.error("Error mapping CropTypeId with their names:", error);
      throw error;
    }
  },

  async getManureTypeById(manureTypesResponse, manureTypeID) {
    const manureType = manureTypesResponse.data.find(
      (mt) => mt.id === manureTypeID,
    );
    if (!manureType) {
      console.log(`ManureType not found for ID ${manureTypeID}`);
    }
    return { data: manureType };
  },

  async getOrganicAndInorganicDetails(farmId, harvestYear, request) {
    const storedProcedureGetPlansByHarvestYear =
      "EXEC dbo.spCrops_GetPlansByHarvestYear @farmId = @0, @harvestYear = @1";
    const plans = await this.executeQuery(
      storedProcedureGetPlansByHarvestYear,
      [farmId, harvestYear],
    );
    const rainfall = await findFarmRainfall(this, farmId);
    const cropDetails = await buildCropDetails(this, plans);
    const flattenedOrganicMaterials = await buildOrganicMaterials(
      this,
      cropDetails,
      request,
    );
    const inorganicFertiliserApplications =
      await buildInorganicFertiliserApplications(this, cropDetails);

    return {
      farmDetails: { rainfall: rainfall || "Unknown" },
      CropDetails: cropDetails,
      OrganicMaterial: flattenedOrganicMaterials,
      InorganicFertiliserApplication: inorganicFertiliserApplications,
    };
  },

  async getLatestModifiedDate(cropId) {
    return AppDataSource.transaction(async (transactionalManager) => {
      // 1. Crop latest
      const crop = await transactionalManager.findOne(CropEntity, {
        where: { ID: cropId },
        select: ["CreatedOn", "ModifiedOn"],
      });

      let cropLatest = null;
      if (crop) {
        cropLatest = await this.maxDate(crop.CreatedOn, crop.ModifiedOn);
      }

      // 2. Get ManagementPeriod IDs
      const periods = await transactionalManager.find(ManagementPeriodEntity, {
        where: { CropID: cropId },
        select: ["ID"],
      });
      const periodIds = periods.map((p) => p.ID);

      // 3. Organic manure latest
      let organicLatest = null;
      if (periodIds.length) {
        const organics = await transactionalManager.find(OrganicManureEntity, {
          where: { ManagementPeriodID: In(periodIds) },
          select: ["CreatedOn", "ModifiedOn"],
        });

        for (const o of organics) {
          const latest = await this.maxDate(o.CreatedOn, o.ModifiedOn);
          organicLatest = await this.maxDate(organicLatest, latest);
        }
      }

      // 4. Fertiliser latest
      let fertiliserLatest = null;
      if (periodIds.length) {
        const fertilisers = await transactionalManager.find(
          FertiliserManuresEntity,
          {
            where: { ManagementPeriodID: In(periodIds) },
            select: ["CreatedOn", "ModifiedOn"],
          },
        );

        for (const f of fertilisers) {
          const latest = await this.maxDate(f.CreatedOn, f.ModifiedOn);
          fertiliserLatest = await this.maxDate(fertiliserLatest, latest);
        }
      }

      // 5. Recommendation latest (one per ManagementPeriod)
      let recommendationLatest = null;
      if (periodIds.length) {
        const recommendations = await transactionalManager.find(
          RecommendationEntity,
          {
            where: { ManagementPeriodID: In(periodIds) },
            select: ["CreatedOn", "ModifiedOn"],
          },
        );

        for (const r of recommendations) {
          const latest = await this.maxDate(r.CreatedOn, r.ModifiedOn);
          recommendationLatest = await this.maxDate(
            recommendationLatest,
            latest,
          );
        }
      }

      // 6. Final latest among all four
      const finalLatest = await this.maxDate(
        cropLatest,
        await this.maxDate(
          organicLatest,
          await this.maxDate(fertiliserLatest, recommendationLatest),
        ),
      );

      return finalLatest;
    });
  },

  async maxDate(d1, d2) {
    if (!d1) {
      return d2 || null;
    }
    if (!d2) {
      return d1 || null;
    }
    return new Date(Math.max(d1.getTime(), d2.getTime()));
  },

  async getPlanByFieldIdAndYear(fieldId, year) {
    const cropData = await this.repository.find({
      where: {
        FieldID: fieldId,
        Year: year,
      },
    });

    return cropData;
  },

  async getOrganicInorganicManuresByCropId(cropId) {
    return AppDataSource.transaction(async (manager) => {
      // 1. Fetch Management Periods for the crop
      const managementPeriods = await manager.find(ManagementPeriodEntity, {
        where: { CropID: cropId },
        select: ["ID"],
      });

      if (!managementPeriods.length) {
        return {
          fertiliserManures: [],
          organicManures: [],
        };
      }

      const managementPeriodIds = managementPeriods.map((mp) => mp.ID);

      // 2. Fetch Organic Manures
      const organicManures = await manager.find(OrganicManureEntity, {
        where: {
          ManagementPeriodID: In(managementPeriodIds),
        },
      });

      // 3. Fetch Fertiliser Manures
      const fertiliserManures = await manager.find(FertiliserManuresEntity, {
        where: {
          ManagementPeriodID: In(managementPeriodIds),
        },
      });

      // 4. Return structured JSON
      return {
        fertiliserManures,
        organicManures,
      };
    });
  },
};

module.exports = { cropQueryMethods };
