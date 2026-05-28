const { AppDataSource } = require("../db/data-source");
const { CropEntity } = require("../db/entity/crop.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const { ManagementPeriodEntity } = require("../db/entity/management-period.entity");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { PreviousCroppingEntity } = require("../db/entity/previous-cropping.entity");
const boom = require("@hapi/boom");
const { PreviousCroppingMapper } = require("../constants/action-mapper");

const fieldCreateMethods = {
async saveRecommendationCrops(
  transactionalManager,
  managementPeriodID,
  userId,
) {
  // Initialize variables for recommendations for both Crop Orders
  const cropData = {
    CropN: null,
    NBalance: null,
    ManureN: null,
    FertilizerN: null,
    CropP2O5: null,
    PBalance: null,
    ManureP2O5: null,
    FertilizerP2O5: null,
    CropK2O: null,
    KBalance: null,
    ManureK2O: null,
    FertilizerK2O: null,
    CropMgO: null,
    MgBalance: null,
    ManureMgO: null,
    FertilizerMgO: null,
    CropSO3: null,
    SBalance: null,
    ManureSO3: null,
    FertilizerSO3: null,
    CropNa2O: null,
    NaBalance: null,
    ManureNa2O: null,
    FertilizerNa2O: null,
    CropLime: null,
    LimeBalance: null,
    ManureLime: null,
    FertilizerLime: null,
    PH: null,
    SNSIndex: null,
    PIndex: null,
    KIndex: null,
    MgIndex: null,
    SIndex: null,
  };

  await transactionalManager.save(
    RecommendationEntity,
    this.recommendationRepository.create({
      ...cropData,
      ManagementPeriodID: managementPeriodID,
      Comments: null,
      CreatedOn: new Date(),
      CreatedByID: userId,
    }),
  );
},

async createFieldWithSoilAnalysisAndCrops(farmId, body, userId) {
  const exists = await this.checkFieldExists(farmId, body.Field.Name);
  if (exists) {
    throw boom.conflict("Field already exists with this Farm Id and Name");
  }

  return AppDataSource.transaction(async (transactionalManager) => {
    const Field = await fieldCreateMethods.createField.call(
      this,
      transactionalManager,
      farmId,
      body.Field,
      userId,
    );
    const SoilAnalysis = await fieldCreateMethods.createSoilAnalysis.call(
      this,
      transactionalManager,
      Field.ID,
      body.SoilAnalysis,
      userId,
    );
    const PKBalance = await fieldCreateMethods.createPKBalance.call(
      this,
      transactionalManager,
      Field.ID,
      SoilAnalysis,
      body.PKBalance,
      userId,
    );
    const Previouscrops = await fieldCreateMethods.createPreviousCroppings.call(
      this,
      transactionalManager,
      Field.ID,
      body.PreviousCroppings,
      userId,
    );
    const Crops = await fieldCreateMethods.createCrops.call(
      this,
      transactionalManager,
      Field.ID,
      body,
      userId,
    );

    return {
      Field,
      SoilAnalysis,
      // SnsAnalysis,
      Previouscrops,
      PKBalance,
      Crops
    };
  });
},

async createField(transactionalManager, farmId, fieldData, userId) {
  const field = this.repository.create({
    ...fieldData,
    FarmID: farmId,
    CreatedByID: userId,
    CreatedOn: new Date()
  });

  return transactionalManager.save(FieldEntity, field);
},

async createSoilAnalysis(
  transactionalManager,
  fieldId,
  soilAnalysisData,
  userId,
) {
  if (!soilAnalysisData) {
    return null;
  }

  return transactionalManager.save(
    SoilAnalysisEntity,
    this.soilAnalysisRepository.create({
      ...soilAnalysisData,
      FieldID: fieldId,
      CreatedByID: userId,
      CreatedOn: new Date(),
    }),
  );
},

async createPKBalance(
  transactionalManager,
  fieldId,
  soilAnalysis,
  pkBalanceData,
  userId,
) {
  if (!soilAnalysis || !pkBalanceData) {
    return null;
  }

  const hasPKValues =
    soilAnalysis.Potassium != null ||
    soilAnalysis.Phosphorus != null ||
    soilAnalysis.PotassiumIndex != null ||
    soilAnalysis.PhosphorusIndex != null;

  if (!hasPKValues) {
    return null;
  }

  const { CreatedByID, CreatedOn, ...createdData } = pkBalanceData;

  return transactionalManager.save(
    PKBalanceEntity,
    this.pkBalanceRepository.create({
      ...createdData,
      FieldID: fieldId,
      CreatedByID: userId,
      CreatedOn: new Date(),
    }),
  );
},

async createPreviousCroppings(
  transactionalManager,
  fieldId,
  previousCroppings,
  userId,
) {
  const Previouscrops = [];
  if (!previousCroppings || previousCroppings.length === 0) {
    return Previouscrops;
  }

  for (const cropsData of previousCroppings) {
    const { Action, ...createPrevCrops } = cropsData;
    const savedCrops = await transactionalManager.save(
      PreviousCroppingEntity,
      this.previousCroppingRepository.create({
        ...createPrevCrops,
        ...(cropsData.ID === 0 ? { ID: null } : {}),
        FieldID: fieldId,
        CreatedByID: userId,
        CreatedOn: new Date(),
      }),
    );

    Previouscrops.push(savedCrops);
  }

  return Previouscrops;
},

async createCrops(transactionalManager, fieldId, body, userId) {
  const Crops = [];
  if (!body.crops) {
    return Crops;
  }

  for (const cropData of body.Crops) {
    const savedCrop = await fieldCreateMethods.createCrop.call(
      this,
      transactionalManager,
      fieldId,
      cropData.Crop,
      userId,
    );
    const ManagementPeriods =
      await fieldCreateMethods.createManagementPeriods.call(
        this,
      transactionalManager,
      savedCrop.ID,
      cropData.ManagementPeriods,
      userId,
      );

    await this.saveRecommendationCrops(
      transactionalManager,
      ManagementPeriods.at(-1).ID,
      userId,
    );

    Crops.push({ Crop: savedCrop, ManagementPeriods });
  }

  return Crops;
},

async createCrop(transactionalManager, fieldId, cropData, userId) {
  return transactionalManager.save(
    CropEntity,
    this.cropRepository.create({
      ...cropData,
      FieldID: fieldId,
      CreatedByID: userId,
      CreatedOn: new Date(),
    }),
  );
},

async createManagementPeriods(
  transactionalManager,
  cropId,
  managementPeriodData,
  userId,
) {
  const ManagementPeriods = [];

  for (const managementPeriod of managementPeriodData) {
    const savedManagementPeriod = await transactionalManager.save(
      ManagementPeriodEntity,
      this.managementPeriodRepository.create({
        ...managementPeriod,
        CropID: cropId,
        CreatedByID: userId,
        CreatedOn: new Date(),
      }),
    );
    ManagementPeriods.push(savedManagementPeriod);
  }

  return ManagementPeriods;
},

async handlePreviousCroppingAction(
  transactionalManager,
  prevCrop,
  fieldId,
  userId
) {
  const {
    ID,
    CreatedOn,
    CreatedByID,
    PreviousCroppings,
    Action,
    ...prevCropData
  } = prevCrop;

  const existingPrevCrop = ID
    ? await transactionalManager.findOne(PreviousCroppingEntity, {
        where: { ID },
      })
    : null;

  switch (Action) {
    case PreviousCroppingMapper.INSERT:
      await transactionalManager.insert(PreviousCroppingEntity, {
        ...prevCropData,
        FieldID: fieldId,
        CreatedByID: userId,
        CreatedOn: new Date(),
      });

      return true;

    case PreviousCroppingMapper.UPDATE:
      if (!existingPrevCrop) {
        return false;
      }

      await transactionalManager.update(
        PreviousCroppingEntity,
        existingPrevCrop.ID,
        {
          ...prevCropData,
          ModifiedByID: userId,
          ModifiedOn: new Date(),
        },
      );

      return true;

    case PreviousCroppingMapper.DELETE:
      if (!existingPrevCrop) {
        return false;
      }

      await transactionalManager.delete(
        PreviousCroppingEntity,
        existingPrevCrop.ID,
      );

      return true;

    default:
      console.log("No action assigned");
      return false;
  }
},

async processPreviousCroppings(
  transactionalManager,
  PreviousCroppings,
  fieldId,
  request,
  userId,
) {
  if (!Array.isArray(PreviousCroppings) || PreviousCroppings.length === 0) {
    return [];
  }

  const crops = await transactionalManager.find(CropEntity, {
    where: { FieldID: fieldId },
  });

  const oldestCrop =
    crops.length > 0
      ? crops.reduce(
          (oldest, current) =>
            current.Year < oldest.Year ? current : oldest,
          crops[0],
        )
      : null;

  let hasPrevCropUpdated = false;

  for (const prevCrop of PreviousCroppings) {
    const isUpdated = await this.handlePreviousCroppingAction(
      transactionalManager,
      prevCrop,
      fieldId,
      userId,
    );

    hasPrevCropUpdated = hasPrevCropUpdated || isUpdated;
  }

  if (hasPrevCropUpdated && oldestCrop) {
    this.updatingFutureRecommendations.updateRecommendationsForField(
      fieldId,
      oldestCrop.Year,
      request,
      userId,
    );
  }

  return transactionalManager.find(PreviousCroppingEntity, {
    where: { FieldID: fieldId },
  });
}
};

module.exports = { fieldCreateMethods };
