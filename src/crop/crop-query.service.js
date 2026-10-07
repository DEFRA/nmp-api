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
const { In, MoreThan } = require("typeorm");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const { ARABLE } = require("../constants/rb209-endpoints-mapper");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const {
  FieldEntity,
  FarmEntity,
  CountryEntity,
} = require("../organic-manure/organic-manure-dependencies");

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
    CropId: plan.CropID,CropTypeID: plan.CropTypeID,
    CropTypeName: plan.CropTypeName,CropGroupName: plan.CropGroupName,
    FieldID: plan.FieldID,FieldName: plan.FieldName,
    CropVariety: plan.CropVariety,OtherCropName: plan.OtherCropName,
    CropInfo1: plan.CropInfo1,CropInfo2: plan.CropInfo2,
    Yield: plan.Yield,CropOrder: plan.CropOrder,
    LastModifiedOn: lastModifiedDate,PlantingDate,
    Management
  };
}

async function buildCropDetails(service, plans) {
  const plansWithNames = await service.mapCropTypeIdWithTheirNames(plans);
  return Promise.all(
    plansWithNames.map((plan) => buildCropDetail(service, plan)),
  );
}

async function mapOrganicMaterial(service, crop, organicManure, allManureData) {
  let mannerManureTypeData = {};
  try {
    const manureTypeResponse = await service.getManureTypeById(allManureData,organicManure.ManureTypeID);
    mannerManureTypeData = manureTypeResponse.data;
  } catch (error) {
    console.error("Error fetching manure type", error);
  }
  return {
    OrganicMaterialId: organicManure.ID,ApplicationDate: organicManure.ApplicationDate,
    ManureTypeId: organicManure.ManureTypeID,Field: crop.FieldName,
    FieldId: crop.FieldID,Crop: crop.CropTypeName,
    TypeOfManure: mannerManureTypeData.name,Rate: organicManure.ApplicationRate
  };
}

async function buildOrganicMaterials(service, cropDetails, request) {
  const organicMaterials = await Promise.all(
    cropDetails.map(async (crop) => {
      const managementPeriodIds = await findManagementPeriodIds(
        service,
        crop.CropId,
      );
      const organicManureData = managementPeriodIds ? await findOrganicManureData(service, managementPeriodIds) : [];
      const allManureData =
        await service.MannerManureTypesService.getAllManureTypesList(request);

      return Promise.all(organicManureData.map((organicManure) =>
          mapOrganicMaterial(service, crop, organicManure, allManureData),
        ),
      );
    }),
  );

  return organicMaterials.flat();
}

function mapFertiliserApplication(crop, fertiliser) {
  return {
    InorganicFertiliserId: fertiliser.ID,ApplicationDate: fertiliser.ApplicationDate,
    Field: crop.FieldName,Crop: crop.CropTypeName,
    N: fertiliser.N,P2O5: fertiliser.P2O5,
    K2O: fertiliser.K2O,MgO: fertiliser.MgO,
    SO3: fertiliser.SO3,Na2O: fertiliser.Na2O,
    Lime: fertiliser.Lime,NH4N: fertiliser.NH4N,
    NO3N: fertiliser.NO3N
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
  async resolvePlannedCropTypeIdByFieldAndYear(fieldId, year) {
    let currentYearCrop = await this.repository.findOne({
      where: {
        FieldID: fieldId,
        Year: year
      },
    });
    if (!currentYearCrop) {
      currentYearCrop = await this.repository.findOne({
        where: {
          FieldID: fieldId,
          Year: year,
          CropOrder: 1,
        },
      });
    }
    if (currentYearCrop) {return currentYearCrop.CropTypeID}
    const previousCropping = await this.previousCroppingRepository.findOne({
      where: { FieldID: fieldId, HarvestYear: year },
    });
    return previousCropping?.CropTypeID;
  },

  async createCropWithManagementPeriods(fieldId,cropData,managementPeriodData,userId) {
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
    const cropData = await this.repository.findOne({where: { FieldID: fieldId, Year: year, Confirm: confirmValue }});
    return cropData;
  },

  async getCropTypeDataByFieldAndYear(fieldId, year, confirm) {
    const cropData = await this.repository.findOne({where: { FieldID: fieldId, Year: year, Confirm: confirm } });
    const cropTypeId = cropData?.CropTypeID;
    if (cropTypeId === null || cropTypeId === undefined) {console.log(StaticStrings.HTTP_STATUS_NOT_FOUND)}
    const cropTypesList = await this.rB209ArableService.getData(ARABLE.ALL_ARABLE_CROP_TYPES_ENDPOINT);
    const cropType = cropTypesList.find((cT) => cT.cropTypeId === cropTypeId);
    return {cropTypeId: cropType.cropTypeId,cropType: cropType.cropType,cropGroupId: cropType.cropGroupId};
  },

  async getPreviousAndNextCropTypeFlags(fieldId, year, cropTypeId) {
    const parsedYear = Number.parseInt(year, 10),parsedCropTypeId = Number.parseInt(cropTypeId, 10);
    const result = {isGrassInPreviousYear: false,isArableInNextYear: false};
    if (!Number.isFinite(parsedYear) || !Number.isFinite(parsedCropTypeId)) {return result}
    const isPlannedGrass = parsedCropTypeId === CropTypeMapper.GRASS;
    const isPlannedArable = parsedCropTypeId !== CropTypeMapper.GRASS;
    if (isPlannedArable) {
      const previousYearCrop = await this.repository.findOne({
        where: { FieldID: fieldId, Year: parsedYear - 1 },
        order: { CropOrder: "DESC" },
      });
      const previousYearCropTypeID = previousYearCrop
        ? previousYearCrop.CropTypeID : (
          await this.previousCroppingRepository.findOne({
            where: { FieldID: fieldId, HarvestYear: parsedYear - 1 },
          })
        )?.CropTypeID;
      result.isGrassInPreviousYear = previousYearCropTypeID === CropTypeMapper.GRASS;
    }

    if (isPlannedGrass) {
      const nextYearCrop = await this.repository.findOne({
        where: {
          FieldID: fieldId,
          Year: MoreThan(parsedYear),
        },
        order: { Year: "ASC" },
      });
      const nextYearCropTypeID = nextYearCrop
        ? nextYearCrop.CropTypeID
        : (
          await this.previousCroppingRepository.findOne({
            where: { FieldID: fieldId, HarvestYear: parsedYear + 1 },
          })
        )?.CropTypeID;
      result.isArableInNextYear = nextYearCropTypeID !== null && nextYearCropTypeID !== undefined && nextYearCropTypeID !== CropTypeMapper.GRASS;
    }
    return result;
  },

  async getPreviousAndNextCropTypeFlagsByFieldAndYear(fieldId, year) {
    const parsedYear = Number.parseInt(year, 10);
    const defaultResult = {isGrassInPreviousYear: false,isArableInNextYear: false};
    if (!Number.isFinite(parsedYear)) {return defaultResult}
    const previousYearCrop = await this.repository.findOne({
      where: { FieldID: fieldId, Year: parsedYear - 1 },
      order: { CropOrder: "DESC" },
    });
    const previousYearCropTypeID = previousYearCrop ? previousYearCrop.CropTypeID
      : (
        await this.previousCroppingRepository.findOne({
          where: { FieldID: fieldId, HarvestYear: parsedYear - 1 },
        })
      )?.CropTypeID;

    const nextYearCrop = await this.repository.findOne({
      where: {
        FieldID: fieldId,
        Year: MoreThan(parsedYear),
      },
      order: { Year: "ASC" },
    });
    const nextYearCropTypeID = nextYearCrop
      ? nextYearCrop.CropTypeID
      : (
        await this.previousCroppingRepository.findOne({
          where: { FieldID: fieldId, HarvestYear: parsedYear + 1 },
        })
      )?.CropTypeID;

    return {
      isGrassInPreviousYear: previousYearCropTypeID === CropTypeMapper.GRASS,
      isArableInNextYear: nextYearCropTypeID !== null && nextYearCropTypeID !== undefined && nextYearCropTypeID !== CropTypeMapper.GRASS,
    };
  },

  async getPreviousAndNextCropTypeFlagsByFieldIdsAndYear(fieldIds, year) {
    const parsedYear = Number.parseInt(year, 10);
    if (!Number.isFinite(parsedYear) || !Array.isArray(fieldIds)) {return []}
    const results = [];
    const collectFlagsByIndex = async (index) => {
      if (index >= fieldIds.length) {return}
      const fieldId = Number.parseInt(fieldIds[index], 10);
      if (Number.isFinite(fieldId)) {
        const flags = await this.getPreviousAndNextCropTypeFlagsByFieldAndYear(fieldId,parsedYear);
        results.push({fieldId,isGrassInPrevYear: flags.isGrassInPreviousYear,isArableInNextYear: flags.isArableInNextYear});
      }
      await collectFlagsByIndex(index + 1);
    };
    await collectFlagsByIndex(0);
    return results;
  },

  async getArableCheckByFieldAndYear(fieldId, year) {
    const parsedYear = Number.parseInt(year, 10);
    const defaultResult = { isGrassInPreviousYear: false };
    if (!Number.isFinite(parsedYear)) {return defaultResult}
    const plannedCropTypeID = await this.resolvePlannedCropTypeIdByFieldAndYear(fieldId,parsedYear);
    if (plannedCropTypeID === null || plannedCropTypeID === undefined || plannedCropTypeID === CropTypeMapper.GRASS) {return defaultResult}
    const flags = await this.getPreviousAndNextCropTypeFlags(fieldId,parsedYear,plannedCropTypeID);
    return { isGrassInPreviousYear: flags.isGrassInPreviousYear };
  },

  async getGrassCheckByFieldAndYear(fieldId, year) {
    const parsedYear = Number.parseInt(year, 10);
    const defaultResult = { isArableInNextYear: false };
    if (!Number.isFinite(parsedYear)) {return defaultResult}
    const plannedCropTypeID = await this.resolvePlannedCropTypeIdByFieldAndYear( fieldId,parsedYear);
    if (plannedCropTypeID !== CropTypeMapper.GRASS) {return defaultResult}
    const flags = await this.getPreviousAndNextCropTypeFlags(fieldId,parsedYear,plannedCropTypeID);
    return { isArableInNextYear: flags.isArableInNextYear };
  },

  async filterBySingleSequenceId(data, sequenceId) {
    const filteredCalculations = data.calculations.filter((item) => item.sequenceId === sequenceId);
    const filteredAdviceNotes = data.adviceNotes.filter((item) => item.sequenceId === sequenceId);
    return {...data,calculations: filteredCalculations, adviceNotes: filteredAdviceNotes};
  },
  async fetchRb209CountryId(fieldId, transactionalManager = null) {
    let rb209CountryID = this.COUNTRY_BOTH; // default value
    const manager = transactionalManager ?? this.fieldRepository.manager;
    const field = await manager.findOne(FieldEntity, {where: { ID: fieldId },select: ["FarmID"]});
    const farm = field ? await manager.findOne(FarmEntity, {where: { ID: field.FarmID },select: ["CountryID"]}): null;
    const country = farm ? await manager.findOne(CountryEntity, {where: { ID: farm.CountryID },select: ["RB209CountryID"]}): null;
    rb209CountryID = country?.RB209CountryID ?? this.COUNTRY_BOTH;
    return rb209CountryID;
  },
  async mapCropTypeIdWithTheirNames(plans) {
    try {
      const unorderedMap = {};
      const cropTypesList = await this.rB209ArableService.getData(ARABLE.ALL_ARABLE_CROP_TYPES_ENDPOINT);
      for (const cropType of cropTypesList) {unorderedMap[cropType.cropTypeId] = cropType.cropType}
      for (const plan of plans) {plan.CropTypeName = unorderedMap[plan.CropTypeID] || null}
      return plans;
    } catch (error) {
      console.error("Error mapping CropTypeId with their names:", error);
      throw error;
    }
  },

  async getManureTypeById(manureTypesResponse, manureTypeID) {
    const manureType = manureTypesResponse.data.find((mt) => mt.id === manureTypeID);
    if (!manureType) {console.log(`ManureType not found for ID ${manureTypeID}`)}
    return { data: manureType };
  },

  async getOrganicAndInorganicDetails(farmId, harvestYear, request) {
    const storedProcedureGetPlansByHarvestYear = "EXEC dbo.spCrops_GetPlansByHarvestYear @farmId = @0, @harvestYear = @1";
    const plans = await this.executeQuery(storedProcedureGetPlansByHarvestYear,[farmId, harvestYear]);
    const rainfall = await findFarmRainfall(this, farmId);
    const cropDetails = await buildCropDetails(this, plans);
    const flattenedOrganicMaterials = await buildOrganicMaterials(this,cropDetails,request);
    const inorganicFertiliserApplications = await buildInorganicFertiliserApplications(this, cropDetails);
    return {
      farmDetails: { rainfall: rainfall || "Unknown" },
      CropDetails: cropDetails,
      OrganicMaterial: flattenedOrganicMaterials,
      InorganicFertiliserApplication: inorganicFertiliserApplications,
    };
  },

  async getLatestModifiedDate(cropId) {
    return AppDataSource.transaction(async (transactionalManager) => {
      const crop = await transactionalManager.findOne(CropEntity, {
        where: { ID: cropId },
        select: ["CreatedOn", "ModifiedOn"],
      });
      let cropLatest = null;
      if (crop) {cropLatest = await this.maxDate(crop.CreatedOn, crop.ModifiedOn)}
      const periods = await transactionalManager.find(ManagementPeriodEntity, {
        where: { CropID: cropId },
        select: ["ID"],
      });
      const periodIds = periods.map((p) => p.ID);
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
      let recommendationLatest = null;
      if (periodIds.length) {
        const recommendations = await transactionalManager.find(
          RecommendationEntity,
          {
            where: { ManagementPeriodID: In(periodIds) },
            select: ["CreatedOn", "ModifiedOn"],
          },
        );
        const getRecommendationLatestByIndex = async (index, currentLatest) => {
          if (index >= recommendations.length) {return currentLatest}
          const latest = await this.maxDate(
            recommendations[index].CreatedOn,
            recommendations[index].ModifiedOn,
          );
          const nextLatest = await this.maxDate(currentLatest, latest);
          return getRecommendationLatestByIndex(index + 1, nextLatest);
        };
        recommendationLatest = await getRecommendationLatestByIndex(0, null);
      }
      const finalLatest = await this.maxDate(cropLatest,await this.maxDate(organicLatest,await this.maxDate(fertiliserLatest, recommendationLatest)),
      );
      return finalLatest;
    });
  },

  async maxDate(d1, d2) {
    if (!d1) {return d2 || null}
    if (!d2) {return d1 || null}
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
      const managementPeriods = await manager.find(ManagementPeriodEntity, {
        where: { CropID: cropId },
        select: ["ID"],
      });
      if (!managementPeriods.length) {return {fertiliserManures: [],organicManures: []}}
      const managementPeriodIds = managementPeriods.map((mp) => mp.ID);
      const organicManures = await manager.find(OrganicManureEntity, {
        where: {ManagementPeriodID: In(managementPeriodIds)},
      });
      const fertiliserManures = await manager.find(FertiliserManuresEntity, {
        where: {ManagementPeriodID: In(managementPeriodIds)},
      });
      return {fertiliserManures,organicManures};
    });
  },
};

module.exports = { cropQueryMethods };
