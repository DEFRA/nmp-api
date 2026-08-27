const { AppDataSource } = require("../db/data-source");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const { MoreThan, In } = require("typeorm");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { CropTypeMapper } = require("../constants/crop-type-mapper");

const cropCopyPlanMethods = {
async savedDefault(
  cropData,
  userId,
  transactionalManager,
  managementPeriods,
  harvestYear,
  isOrganic,
  isFertiliser,
) {
  const ManagementPeriods = [],OrganicManures = [],FertiliserManures = [],OldToNewManagementPeriodMap = {};
  // 1. Save the new Crop
  const savedCrop = await transactionalManager.save(
    CropEntity,
    this.cropRepository.create({
      ...cropData.Crop,
      ID: null,
      FieldID: cropData.FieldID,Year: harvestYear,
      CreatedByID: userId,CreatedOn: new Date()
    }),
  );

  // 2. Copy and save all management periods, map old to new
  for (const oldPeriod of managementPeriods) {
    const newPeriod = {
      ...oldPeriod,
      ID: null,CropID: savedCrop.ID,
      CreatedByID: userId,CreatedOn: new Date()
    };
    const savedPeriod = await transactionalManager.save(ManagementPeriodEntity,newPeriod);
    OldToNewManagementPeriodMap[oldPeriod.ID] = savedPeriod.ID;
    ManagementPeriods.push(savedPeriod);
  }

  // 3. Copy OrganicManure if isOrganic is true
  if (isOrganic) {
    for (const oldPeriod of managementPeriods) {
      const organicManures = await transactionalManager.find(
        OrganicManureEntity,
        {where: { ManagementPeriodID: oldPeriod.ID }}
      );
      for (const manure of organicManures) {
        const newManure = {
          ...manure,
          ID: null, ManagementPeriodID: OldToNewManagementPeriodMap[oldPeriod.ID],
          CreatedByID: userId,CreatedOn: new Date()
        };
        const savedManure = await transactionalManager.save(
          OrganicManureEntity,newManure);
        OrganicManures.push(savedManure);
      }
    }
  }
  // 4. Copy FertiliserManures if isFertiliser is true
  if (isFertiliser) {
    for (const oldPeriod of managementPeriods) {
      const fertilisers = await transactionalManager.find(
        FertiliserManuresEntity,
        {where: { ManagementPeriodID: oldPeriod.ID }}
      );

      for (const fert of fertilisers) {
        const newFert = {
          ...fert,
          ID: null,ManagementPeriodID: OldToNewManagementPeriodMap[oldPeriod.ID],
          CreatedByID: userId,CreatedOn: new Date()
        };
        const savedFert = await transactionalManager.save(FertiliserManuresEntity,newFert);
        FertiliserManures.push(savedFert);
      }
    }
  }
  // 5. Return everything copied
  return {Crop: savedCrop,ManagementPeriods,OrganicManures,FertiliserManures};
},

async copyPlanOhercrop(requiredParametres) {
  const {
    crop,
    userId,
    transactionalManager,
    managementPeriods,
    harvestYear,
    isOrganic,
    isFertiliser,
    field,
    request,
    cropPlanOfNextYear,
    pkBalanceData,
    isSoilAnalysisHavePAndK,
    Recommendations,
    newOrganicManure,
  } = requiredParametres;
  await this.savedDefault(
    crop,
    userId,
    transactionalManager,
    managementPeriods,
    harvestYear,
    isOrganic,
    isFertiliser,
  );

  const otherRecommendations =
    await this.generateRecommendations.generateRecommendations(
      field.ID,
      harvestYear,
      newOrganicManure,
      transactionalManager,
      request,
      userId,
    );
  if (isSoilAnalysisHavePAndK && cropPlanOfNextYear.length === 0) {
    const newPKBalance = {
      ...pkBalanceData,
      FieldID: crop.FieldID,
      ID: null, // Make it a new insert
      Year: harvestYear, // New year
      CreatedByID: userId,
      CreatedOn: new Date(),
    };
    await transactionalManager.save(PKBalanceEntity, newPKBalance);
  } else if (isSoilAnalysisHavePAndK) {
    //call UpdateRecommendation function
    this.updatingFutureRecommendations.updateRecommendationsForField(
      crop.FieldID,
      cropPlanOfNextYear.Year,
      request,
      userId,
    );
  } else {
    console.log(
      "Skipping PK balance and recommendation update: No soil analysis P & K available",
    );
  }
  Recommendations.push({
    Recommendation: otherRecommendations,
  });
},

async getFields(manager, farmID) {
  return manager.find(FieldEntity, { where: { FarmID: farmID } });
},

async getCropsByFieldIdAndYear(manager, fields, year) {
  const ids = fields.map((f) => f.ID);
  return manager.find(CropEntity, {
    where: { FieldID: In(ids), Year: year },
  });
},

hasSoilPK(data) {
  return data.some(
    (d) => d.PhosphorusIndex !== null || d.PotassiumIndex !== null,
  );
},

isOtherCrop(crop) {
  return crop.CropTypeID === CropTypeMapper.OTHER;
},

initResults() {
  return {
    Recommendations: [],
    ManagementPeriods: [],
    OrganicManures: [],
    Fertilisers: [],
  };
},

async createNewCrop(manager, crop, harvestYear, userId) {
  const sowingDate = crop.SowingDate
    ? new Date(new Date(crop.SowingDate).setFullYear(harvestYear))
    : null;

  return manager.save(CropEntity, {
    ...crop,
    ID: null,
    Year: harvestYear,
    SowingDate: sowingDate,
    CreatedByID: userId,
    CreatedOn: new Date(),
  });
},

async handleOtherCrop(crop, field, managementPeriods, ctx, extra) {
  const {
    manager,
    userId,
    harvestYear,
    isOrganic,
    isFertiliser,
    request,
    results,
  } = ctx;

  const { nextYearCrop, pkBalance, hasPK } = extra;

  const newOrganicManure = null;

  await this.copyPlanOhercrop({
    crop,
    userId,
    transactionalManager: manager,
    managementPeriods,
    harvestYear,
    isOrganic,
    isFertiliser,
    field,
    request,
    cropPlanOfNextYear: nextYearCrop,
    pkBalanceData: pkBalance,
    isSoilAnalysisHavePAndK: hasPK,
    Recommendations: results.Recommendations,
    newOrganicManure,
  });
},

async processCrop(crop, fields, ctx) {
  const { manager, userId, harvestYear, isOrganic, isFertiliser, request, results} = ctx;
  const field = fields.find((f) => f.ID === crop.FieldID);
  const [soilAnalysis, pkBalance, nextYearCrop, managementPeriods] =
    await this.loadCropDependencies(manager, crop, harvestYear);
  const hasPK = this.hasSoilPK(soilAnalysis);
  await this.copyPKBalance(manager, pkBalance, crop, harvestYear, userId);
  if (this.isOtherCrop(crop)) {return this.handleOtherCrop(crop, field, managementPeriods, ctx, {nextYearCrop,pkBalance,hasPK})}
  const savedCrop = await this.createNewCrop(manager,crop,harvestYear,userId);
  const periodMap = await this.copyManagementPeriods(manager,managementPeriods,savedCrop,userId,results);
  if (isOrganic) {await this.copyOrganic(manager,managementPeriods,periodMap,harvestYear,userId,results)}
  if (isFertiliser) {await this.copyFertiliser(manager,managementPeriods,periodMap,harvestYear,userId,results)}
  await this.generateAndStoreRecommendations(field, ctx);
  this.triggerFutureUpdate(crop, nextYearCrop, request, userId);
  return {cropId: savedCrop.ID,fieldId: crop.FieldID};
},
async copyPKBalance(manager, pk, _crop, year, userId) {
  if (!pk) {return}
  await manager.save(PKBalanceEntity, {
    ...pk,
    ID: null,
    Year: year,
    CreatedByID: userId,
    CreatedOn: new Date(),
  });
},

async loadCropDependencies(manager, crop, harvestYear) {
  return Promise.all([
    manager.find(SoilAnalysisEntity, { where: { FieldID: crop.FieldID } }),
    manager.findOne(PKBalanceEntity, {
      where: { FieldID: crop.FieldID, Year: crop.Year },
    }),
    manager.findOne(CropEntity, {
      where: { FieldID: crop.FieldID, Year: MoreThan(harvestYear) },
    }),
    manager.find(ManagementPeriodEntity, { where: { CropID: crop.ID } }),
  ]);
},

async copyManagementPeriods(manager, periods, crop, userId, results) {
  const map = {};

  for (const p of periods) {
    const saved = await manager.save(ManagementPeriodEntity, {
      ...p,
      ID: null,
      CropID: crop.ID,
      CreatedByID: userId,
      CreatedOn: new Date(),
    });

    map[p.ID] = saved.ID;
    results.ManagementPeriods.push(saved);
  }

  return map;
},

async copyFertiliser(manager, periods, map, year, userId, results) {
  for (const p of periods) {
    const ferts = await manager.find(FertiliserManuresEntity, {
      where: { ManagementPeriodID: p.ID },
    });

    for (const f of ferts) {
      const date = f.ApplicationDate
        ? new Date(new Date(f.ApplicationDate).setFullYear(year))
        : null;

      const saved = await manager.save(FertiliserManuresEntity, {
        ...f,
        ID: null,
        ManagementPeriodID: map[p.ID],
        ApplicationDate: date,
        CreatedByID: userId,
        CreatedOn: new Date(),
      });

      results.Fertilisers.push(saved);
    }
  }
},

async copyOrganic(manager, periods, map, year, userId, results) {
  for (const p of periods) {
    const manures = await manager.find(OrganicManureEntity, {
      where: { ManagementPeriodID: p.ID },
    });

    for (const m of manures) {
      const date = this.adjustOrganicDate(m.ApplicationDate, year);

      const saved = await manager.save(OrganicManureEntity, {
        ...m,
        ID: null,
        ManagementPeriodID: map[p.ID],
        ApplicationDate: date,
        CreatedByID: userId,
        CreatedOn: new Date(),
      });

      results.OrganicManures.push(saved);
    }
  }
},

async generateAndStoreRecommendations(field, ctx) {
  const rec = await this.generateRecommendations.generateRecommendations(
    field.ID,
    ctx.harvestYear,
    null,
    ctx.manager,
    ctx.request,
    ctx.userId,
  );

  ctx.results.Recommendations.push({ Recommendation: rec });
},

triggerFutureUpdate(crop, nextYearCrop, request, userId) {
  if (!nextYearCrop) {
    return;
  }

  this.updatingFutureRecommendations
    .updateRecommendationsForField(
      crop.FieldID,
      nextYearCrop.Year,
      request,
      userId,
    )
    .catch(console.error);
},

async copyPlan(body, userId, request) {
  const { farmID, harvestYear, copyYear, isOrganic, isFertiliser } = body;

  return AppDataSource.transaction(async (manager) => {
    const fields = await this.getFields(manager, farmID);
    if (!fields.length) {
      return [];
    }

    const crops = await this.getCropsByFieldIdAndYear(
      manager,
      fields,
      copyYear,
    );

    const context = {
      manager,
      userId,
      harvestYear,
      isOrganic,
      isFertiliser,
      request,
      results: this.initResults(),
    };

    for (const crop of crops) {
      await this.processCrop(crop, fields, context);
    }

    return context.results;
  });
}
};

module.exports = { cropCopyPlanMethods };
