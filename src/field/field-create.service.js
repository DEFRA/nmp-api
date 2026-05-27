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
    const field = this.repository.create({
      ...body.Field,
      FarmID: farmId,
      CreatedByID: userId,
      CreatedOn: new Date(),
    });
    const Field = await transactionalManager.save(FieldEntity, field);

    let SoilAnalysis = null;
    if (body.SoilAnalysis) {
      SoilAnalysis = await transactionalManager.save(
        SoilAnalysisEntity,
        this.soilAnalysisRepository.create({
          ...body?.SoilAnalysis,
          FieldID: Field.ID,
          CreatedByID: userId,
          CreatedOn: new Date(),
        }),
      );
    }
    let PKBalance = null;
    if (body.SoilAnalysis != null) {
      if (
        SoilAnalysis.Potassium != null ||
        SoilAnalysis.Phosphorus != null ||
        SoilAnalysis.PotassiumIndex != null ||
        SoilAnalysis.PhosphorusIndex != null
      ) {
        if (body.PKBalance) {
          const { CreatedByID, CreatedOn, ...createdData } = body.PKBalance;
          PKBalance = await transactionalManager.save(
            PKBalanceEntity,
            this.pkBalanceRepository.create({
              ...createdData,
              FieldID: Field.ID,
              CreatedByID: userId,
              CreatedOn: new Date(),
            }),
          );
        }
      }
    }

    const Previouscrops = [];
    if (body.PreviousCroppings && body.PreviousCroppings.length > 0) {
      for (const cropsData of body.PreviousCroppings) {
        const { Action, ...createPrevCrops } = cropsData;
        const savedCrops = await transactionalManager.save(
          PreviousCroppingEntity,
          this.previousCroppingRepository.create({
            ...createPrevCrops,
            ...(cropsData.ID === 0 ? { ID: null } : {}),
            FieldID: Field.ID,
            CreatedByID: userId,
            CreatedOn: new Date(),
          }),
        );

        Previouscrops.push(savedCrops);
      }
    }
    const Crops = [];
    if (body.crops) {
      for (const cropData of body.Crops) {
        const savedCrop = await transactionalManager.save(
          CropEntity,
          this.cropRepository.create({
            ...cropData.Crop,
            FieldID: Field.ID,
            CreatedByID: userId,
            CreatedOn: new Date(),
          }),
        );
        const ManagementPeriods = [];
        let savedManagementPeriod;
        for (const managementPeriod of cropData.ManagementPeriods) {
          savedManagementPeriod = await transactionalManager.save(
            ManagementPeriodEntity,
            this.managementPeriodRepository.create({
              ...managementPeriod,
              CropID: savedCrop.ID,
              CreatedByID: userId,
              CreatedOn: new Date(),
            }),
          );
          ManagementPeriods.push(savedManagementPeriod);
        }
        await this.saveRecommendationCrops(
          transactionalManager,
          savedManagementPeriod.ID,
          userId,
        );

        Crops.push({ Crop: savedCrop, ManagementPeriods });
      }
    }
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
