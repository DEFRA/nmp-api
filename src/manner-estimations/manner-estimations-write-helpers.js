const { AppDataSource } = require("../db/data-source");
const {
  MannerEstimationsEntity,
} = require("../db/entity/manner-estimations.entity");
const {
  MannerEstimationApplicationsEntity,
} = require("../db/entity/manner-estimation-applications.entity");
const { CountryMapper } = require("../constants/country-mapper");
const { RunTypeMapper } = require("../constants/run-type-mapper");

const mannerEstimationsWriteHelpers = {
  async copyMannerEstimation(payload, userId) {
    const sourceMannerEstimationId = payload?.ID,
      copiedMannerEstimationName = payload?.Name;
    this.validateCopyMannerEstimationPayload(
      sourceMannerEstimationId,
      copiedMannerEstimationName,
    );
    return AppDataSource.transaction(async (transactionalManager) => {
      const sourceMannerEstimation = await this.getSourceMannerEstimation(
        transactionalManager,
        sourceMannerEstimationId,
      );
      const savedCopiedMannerEstimation =
        await this.createCopiedMannerEstimation(
          transactionalManager,
          sourceMannerEstimation,
          copiedMannerEstimationName,
          userId,
        );
      const savedCopiedApplications =
        await this.copyMannerEstimationApplications(
          transactionalManager,
          sourceMannerEstimationId,
          savedCopiedMannerEstimation.ID,
          userId,
        );
      return this.buildCopyMannerEstimationResponse(
        savedCopiedMannerEstimation.ID,
        savedCopiedApplications,
      );
    });
  },

  validateCopyMannerEstimationPayload(sourceMannerEstimationId, copiedName) {
    if (!sourceMannerEstimationId) {
      throw new Error("ID is required");
    }
    if (!copiedName) {
      throw new Error("Name is required");
    }
  },

  async getSourceMannerEstimation(
    transactionalManager,
    sourceMannerEstimationId,
  ) {
    const sourceMannerEstimation = await transactionalManager.findOne(
      MannerEstimationsEntity,
      { where: { ID: sourceMannerEstimationId } },
    );
    if (!sourceMannerEstimation) {
      throw new Error("Manner estimation not found");
    }
    return sourceMannerEstimation;
  },

  async createCopiedMannerEstimation(
    transactionalManager,
    sourceMannerEstimation,
    copiedMannerEstimationName,
    userId,
  ) {
    const {
      ID,
      CreatedOn,
      CreatedByID,
      ModifiedOn,
      ModifiedByID,
      ...mannerEstimationDataToCopy
    } = sourceMannerEstimation;
    const copiedMannerEstimationEntity = transactionalManager.create(
      MannerEstimationsEntity,
      {
        ...mannerEstimationDataToCopy,
        ID: null,
        Name: copiedMannerEstimationName,
        CreatedByID: userId,
        CreatedOn: new Date(),
        ModifiedOn: null,
        ModifiedByID: null,
      },
    );
    return transactionalManager.save(
      MannerEstimationsEntity,
      copiedMannerEstimationEntity,
    );
  },

  async copyMannerEstimationApplications(
    transactionalManager,
    sourceMannerEstimationId,
    copiedMannerEstimationId,
    userId,
  ) {
    const sourceApplications = await transactionalManager.find(
      MannerEstimationApplicationsEntity,
      { where: { MannerEstimationID: sourceMannerEstimationId } },
    );
    const savedCopiedApplications = [];
    for (const sourceApplication of sourceApplications) {
      const copiedApplicationEntity = this.buildCopiedApplicationEntity(
        transactionalManager,
        sourceApplication,
        copiedMannerEstimationId,
        userId,
      );
      savedCopiedApplications.push(
        await transactionalManager.save(
          MannerEstimationApplicationsEntity,
          copiedApplicationEntity,
        ),
      );
    }
    return savedCopiedApplications;
  },

  buildCopiedApplicationEntity(
    transactionalManager,
    sourceApplication,
    copiedMannerEstimationId,
    userId,
  ) {
    const {
      ID,
      MannerEstimationID,
      CreatedOn,
      CreatedByID,
      ModifiedOn,
      ModifiedByID,
      ...applicationDataToCopy
    } = sourceApplication;
    return transactionalManager.create(MannerEstimationApplicationsEntity, {
      ...applicationDataToCopy,
      ID: null,
      MannerEstimationID: copiedMannerEstimationId,
      CreatedByID: userId,
      CreatedOn: new Date(),
      ModifiedOn: null,
      ModifiedByID: null,
    });
  },

  buildCopyMannerEstimationResponse(
    mannerEstimationId,
    savedCopiedApplications,
  ) {
    return {
      message: "copied successfully",
      mannerEstimationId,
      copiedApplicationsCount: savedCopiedApplications.length,
      savedCopiedApplications,
    };
  },

  buildMannerOutputReq(mannerEstimation, manureApplications) {
    return {
      runType:
        mannerEstimation.CountryID === CountryMapper.ENGLAND ||
        mannerEstimation.CountryID == CountryMapper.WELSH
          ? RunTypeMapper.MANNERENGLAND
          : RunTypeMapper.MANNERSCOTLAND,
      postcode: mannerEstimation.Postcode.split(" ")[0],
      countryID: mannerEstimation.CountryID,
      field: {
        fieldID: 0,
        fieldName: mannerEstimation.Name,
        MannerCropTypeID: mannerEstimation.MannerCropTypeID,
        topsoilID: mannerEstimation.TopSoilID,
        subsoilID: mannerEstimation.SubSoilID,
        isInNVZ: mannerEstimation.IsWithinNVZ,
      },
      manureApplications,
      indivisualApplicationOutput: false,
    };
  },

  async createMannerEstimation(payload, userId, request) {
    const { MannerEstimation, MannerEstimationApplication } = payload;
    return AppDataSource.transaction(async (transactionalManager) => {
      const nutrientProductsData = await this.nutrientsProductService.getData(
        "/nutrient-products",
        request,
      );
      const nutrientProducts = nutrientProductsData.data.filter(
        (p) => p.isNutrientDefaultProduct === true,
      );
      const nutrients = await this.nutrientsService.getData(
        "/nutrients",
        request,
      );
      const mappedMannerEstimationApplication =
        await this.getMappedMannerEstimationApplication(
          MannerEstimation,
          MannerEstimationApplication,
          request,
        );

      const nutrientFinancialValues =
        this.calculateNutrientFinancialValuesByNutrientId(
          nutrientProducts,
          nutrients,
          mappedMannerEstimationApplication,
        );
      const mannerEstimationFinancialValues =
        this.buildMannerEstimationFinancialValues(nutrientFinancialValues);
      const mannerEstimationApplicationFinancialValues =
        this.buildMannerEstimationApplicationFinancialValues(
          nutrientFinancialValues,
        );
      const mannerEstimationEntitySavedData = transactionalManager.create(
        MannerEstimationsEntity,
        {
          ...MannerEstimation,
          ...mannerEstimationFinancialValues,
          CreatedByID: userId,
          CreatedOn: new Date(),
        },
      );
      const savedMannerEstimation = await transactionalManager.save(
        MannerEstimationsEntity,
        mannerEstimationEntitySavedData,
      );
      const mannerEstimationApplicationEntity = transactionalManager.create(
        MannerEstimationApplicationsEntity,
        {
          ...mappedMannerEstimationApplication,
          ...mannerEstimationApplicationFinancialValues,
          MannerEstimationID: savedMannerEstimation.ID,
          CreatedByID: userId,
          CreatedOn: new Date(),
        },
      );
      const savedMannerEstimationApplication = await transactionalManager.save(
        MannerEstimationApplicationsEntity,
        mannerEstimationApplicationEntity,
      );
      return savedMannerEstimationApplication;
    });
  },

  async getMappedMannerEstimationApplication(
    mannerEstimation,
    mannerEstimationApplication,
    request,
  ) {
    const manureTypeData = await this.MannerManureTypesService.getData(
      `/manure-types/${mannerEstimationApplication.ManureTypeID}`,
      request,
    );
    const manureApplication =
      await this.CalculateMannerOutputService.buildManureApplicationObject(
        mannerEstimationApplication,
        manureTypeData,
      );
    const manureApplications = [];
    manureApplications.push(manureApplication);
    const mannerEstimationApplicationsRequest = this.buildMannerOutputReq(
      mannerEstimation,
      manureApplications,
    );
    const mannerEstimationApplicationsOutput =
      await this.MannerCalculateNutrientsService.postData(
        "/calculate-nutrients",
        mannerEstimationApplicationsRequest,
        request,
      );

    const mannerOutput = mannerEstimationApplicationsOutput?.data ?? {};
    return this.bindMannerOutputToApplication(
      mannerEstimationApplication,
      mannerOutput,
    );
  },

  bindMannerOutputToApplication(mannerEstimationApplication, mannerOutput) {
    return {
      ...mannerEstimationApplication,
      TotalN: mannerOutput.totalN,
      CropAvailableNCurrentCrop: mannerOutput.currentCropAvailableN,
      CropAvailableNitrogenFollowingCropYearTwo:
        mannerOutput.followingCropYear2AvailableN,
      TotalP2O5: mannerOutput.totalP2O5,
      CropAvailableP2O5: mannerOutput.cropAvailableP2O5,
      TotalSO3: mannerOutput.totalSO3,
      CropAvailableSO3: mannerOutput.cropAvailableSO3 ?? 0,
      TotalMgO: mannerOutput.totalMgO,
      TotalK2O: mannerOutput.totalK2O,
      CropAvailableK2O: mannerOutput.cropAvailableK2O,
      NitrogenUseEfficiency: mannerOutput.nitrogenEfficiencePercentage,
      MineralisedNitrogenLosses: mannerOutput.mineralisedN,
      LostNitrateLosses: mannerOutput.nitrateNLoss,
      LostAmmonia: mannerOutput.ammoniaNLoss,
      LostDenitrified: mannerOutput.denitrifiedNLoss,
    };
  },
};

module.exports = { mannerEstimationsWriteHelpers };
