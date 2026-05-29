const {
  AppDataSource,
  MoreThan,
  CropEntity,
  FarmManureTypeEntity,
  ManagementPeriodEntity,
  OrganicManureEntity,
  FieldEntity,
  WarningMessagesEntity,
  CropTypeMapper,
  WarningCodesMapper,
  ManureTypeMapper,
  normalizeDateWithTime,
  JOINS,
  MANAGEMENT_PERIOD_TO_CROP_JOIN,
  CROP_TO_FIELD_CONDITION,
  API_ENDPOINTS,
} = require("./organic-manure-dependencies");
const {
  organicManureFarmManureTypeMethods,
} = require("./organic-manure-farm-manure-type.service");
const {
  organicManureCreateHelperMethods,
} = require("./organic-manure-create-helper.service");

const organicManureCreateMethods = {
  async createOrganicManuresWithFarmManureType(request, body, userId) {
    return AppDataSource.transaction((transactionalManager) =>
      organicManureCreateMethods.createOrganicManuresTransaction.call(
        this,
        transactionalManager,
        request,
        body,
        userId,
      ),
    );
  },

  async createOrganicManuresTransaction(
    transactionalManager,
    request,
    body,
    userId,
  ) {
    const organicManures = [];
    const createContext =
      await organicManureCreateMethods.getCreateOrganicManureContext.call(
        this,
      );
    const farmManureTypeData =
      await organicManureCreateMethods.processOrganicManureCreateEntries.call(
        this,
        body.OrganicManures,
        createContext,
        transactionalManager,
        request,
        userId,
        organicManures,
      );
    const savedFarmManureType =
      await organicManureCreateMethods.saveFarmManureTypeDefault.call(
        this,
        farmManureTypeData,
        transactionalManager,
        userId,
      );

    return {
      OrganicManures: organicManures,
      FarmManureType: savedFarmManureType,
    };
  },

  async processOrganicManureCreateEntries(
    organicManureEntries,
    createContext,
    transactionalManager,
    request,
    userId,
    organicManures,
  ) {
    let farmManureTypeData;

    for (const organicManureData of organicManureEntries) {
      farmManureTypeData =
        (await organicManureCreateMethods.processOrganicManureCreateEntry.call(
          this,
          organicManureData,
          createContext,
          transactionalManager,
          request,
          userId,
          organicManures,
        )) || farmManureTypeData;
    }

    return farmManureTypeData;
  },

  async saveFarmManureTypeDefault(
    farmManureTypeData,
    transactionalManager,
    userId,
  ) {
    if (!farmManureTypeData) {
      return undefined;
    }

    return organicManureFarmManureTypeMethods.saveFarmManureTypeDefault.call(
      this,
      farmManureTypeData,
      transactionalManager,
      userId,
    );
  },

  async getCreateOrganicManureContext() {
    return {
      organicManureAllData: await this.repository.find(),
      cropPlanAllData: await this.cropRepository.find({
        select: ["ID", "FieldID", "Year"],
      }),
      managementPeriodAllData: await this.managementPeriodRepository.find(),
      soilAnalysisAllData: await this.soilAnalysisRepository.find(),
      fertiliserAllData: await this.fertiliserRepository.find(),
    };
  },

  async processOrganicManureCreateEntry(
    organicManureData,
    createContext,
    transactionalManager,
    request,
    userId,
    organicManures,
  ) {
    const { OrganicManure } = organicManureData;
    organicManureCreateMethods.logInvalidNitrogenTotal(OrganicManure);
    const relatedData =
      await organicManureCreateMethods.getOrganicManureRelatedData.call(
        this,
        organicManureData,
      );
    const isSoilAnalysisHavePAndK =
      organicManureCreateMethods.hasSoilAnalysisPAndK(
        relatedData.cropData.FieldID,
        createContext.soilAnalysisAllData,
      );
    const mannerOutputs =
      await this.CalculateMannerOutput.calculateMannerOutputForOrganicManure(
        relatedData.cropData,
        OrganicManure,
        relatedData.farmData,
        relatedData.fieldData,
        transactionalManager,
        request,
      );
    const futurePlanStatus =
      organicManureCreateHelperMethods.getFuturePlanStatus(
        isSoilAnalysisHavePAndK,
        relatedData.fieldData,
        relatedData.cropData,
        createContext,
      );

    await organicManureCreateMethods.saveOrganicManureEntry.call(
      this,
      organicManureData,
      relatedData,
      futurePlanStatus,
      mannerOutputs,
      {
      transactionalManager,
      request
      },
      userId,
      organicManures
    );

    return organicManureCreateMethods.buildFarmManureTypeData(
      organicManureData,
    );
  },

  logInvalidNitrogenTotal(OrganicManure) {
    if (
      OrganicManure.NH4N + OrganicManure.NO3N + OrganicManure.UricAcid >
      OrganicManure.N
    ) {
      console.log(
        "NH4N + NO3N + UricAcid must be less than or equal to TotalN",
      );
    }
  },

  async getOrganicManureRelatedData(organicManureData) {
    const { OrganicManure } = organicManureData;
    const managementPeriodData =
      await this.managementPeriodRepository.findOneBy({
        ID: OrganicManure.ManagementPeriodID,
      });
    const cropData = await this.cropRepository.findOneBy({
      ID: managementPeriodData.CropID,
    });
    const fieldData = await this.fieldRepository.findOneBy({
      ID: cropData.FieldID,
    });
    const farmData = await this.farmRepository.findOneBy({
      ID: organicManureData.FarmID,
    });

    return { managementPeriodData, cropData, fieldData, farmData };
  },

  hasSoilAnalysisPAndK(fieldId, soilAnalysisAllData) {
    const soilAnalysisData = soilAnalysisAllData?.filter((soilAnalyses) => {
      return soilAnalyses.FieldID === fieldId;
    });

    return !!soilAnalysisData?.some(
      (item) => item.PhosphorusIndex !== null || item.PotassiumIndex !== null,
    );
  },

  async saveOrganicManureEntry(
    organicManureData,
    relatedData,
    futurePlanStatus,
    mannerOutputs,
    transactionalRequest,
    userId,
    organicManures
  ) {
    const {transactionalManager, request} = transactionalRequest;
    const previousCrop =
      await this.CalculatePreviousCropService.findPreviousCrop(
        relatedData.fieldData.ID,
        relatedData.cropData.Year,
        transactionalManager,
      );

    if (
      relatedData.cropData.CropTypeID === CropTypeMapper.OTHER ||
      relatedData.cropData.IsBasePlan ||
      !previousCrop
    ) {
      await organicManureCreateMethods.saveOtherOrganicManureEntry.call(
        this,
        organicManureData,
        relatedData,
        mannerOutputs,
        transactionalManager,
        request,
        userId,
        organicManures,
      );
      return;
    }

    await organicManureCreateMethods.saveStandardOrganicManureEntry.call(
      this,
      organicManureData,
      relatedData,
      futurePlanStatus,
      transactionalManager,
      request,
      userId,
      organicManures,
    );
  },

  async saveOtherOrganicManureEntry(
    organicManureData,
    relatedData,
    mannerOutputs,
    transactionalManager,
    request,
    userId,
    organicManures,
  ) {
    await this.saveOrganicManureForOtherCropType(
      organicManureData,
      mannerOutputs,
      transactionalManager,
      userId,
      organicManures,
    );

    await this.generateRecommendations.generateRecommendations(
      relatedData.fieldData.ID,
      relatedData.cropData.Year,
      organicManureData.OrganicManure,
      transactionalManager,
      request,
      userId,
    );

    await organicManureCreateMethods.updateNextAvailableCropRecommendations.call(
      this,
      relatedData.cropData,
      request,
      userId,
    );
  },

  async updateNextAvailableCropRecommendations(cropData, request, userId) {
    const nextAvailableCrop = await this.cropRepository.findOne({
      where: {
        FieldID: cropData.FieldID,
        Year: MoreThan(cropData.Year),
      },
      order: { Year: "ASC" },
    });

    if (nextAvailableCrop) {
      this.updatingFutureRecommendations.updateRecommendationsForField(
        cropData.FieldID,
        nextAvailableCrop.Year,
        request,
        userId,
      );
    }
  },

  async saveStandardOrganicManureEntry(
    organicManureData,
    relatedData,
    futurePlanStatus,
    transactionalManager,
    request,
    userId,
    organicManures,
  ) {
    const savedOrganicManure =
      await organicManureCreateMethods.saveOrganicManure.call(
        this,
        organicManureData.OrganicManure,
        transactionalManager,
        userId,
      );

    await organicManureCreateMethods.saveWarningMessages.call(
      this,
      organicManureData.WarningMessages,
      relatedData.cropData,
      savedOrganicManure,
      transactionalManager,
      userId,
    );

    organicManures.push(savedOrganicManure);
    await organicManureCreateMethods.regenerateRecommendations.call(
      this,
      relatedData,
      transactionalManager,
      request,
      userId,
    );
    organicManureCreateMethods.updateFutureRecommendationsIfNeeded.call(
      this,
      futurePlanStatus,
      relatedData.cropData,
      request,
      userId,
    );
    organicManureCreateMethods.processFutureManureWarnings.call(
      this,
      relatedData.fieldData,
      savedOrganicManure,
      userId,
    );
  },

  async saveOrganicManure(OrganicManure, transactionalManager, userId) {
    return transactionalManager.save(
      OrganicManureEntity,
      this.repository.create({
        ...OrganicManure,
        CreatedByID: userId,
        CreatedOn: new Date(),
      }),
    );
  },

  async saveWarningMessages(
    WarningMessages,
    cropData,
    savedOrganicManure,
    transactionalManager,
    userId,
  ) {
    if (!WarningMessages || WarningMessages.length === 0) {
      return;
    }

    const warningMessagesToSave = WarningMessages.map((wm) =>
      transactionalManager.create(WarningMessagesEntity, {
        ...wm,
        JoiningID:
          wm.WarningCodeID === WarningCodesMapper.NMAXLIMIT
            ? cropData.FieldID
            : savedOrganicManure.ID,
        CreatedByID: userId,
        CreatedOn: new Date(),
      }),
    );

    await transactionalManager.save(
      WarningMessagesEntity,
      warningMessagesToSave,
    );
  },

  async regenerateRecommendations(
    relatedData,
    transactionalManager,
    request,
    userId,
  ) {
    const newOrganicManure = null;
    await this.generateRecommendations.generateRecommendations(
      relatedData.fieldData.ID,
      relatedData.cropData.Year,
      newOrganicManure,
      transactionalManager,
      request,
      userId,
    );
  },

  updateFutureRecommendationsIfNeeded(
    futurePlanStatus,
    cropData,
    request,
    userId,
  ) {
    const shouldUpdate =
      futurePlanStatus.isNextYearPlanExist ||
      futurePlanStatus.isNextYearOrganicManureExist ||
      futurePlanStatus.isNextYearFertiliserExist;

    if (shouldUpdate) {
      this.updatingFutureRecommendations.updateRecommendationsForField(
        cropData?.FieldID,
        cropData?.Year,
        request,
        userId,
      );
    }
  },

  processFutureManureWarnings(fieldData, savedOrganicManure, userId) {
    const isCurrentOrganicManure = true;
    const isCurrentFertiliser = false;
    this.ProcessFutureManuresForWarnings.processFutureManures(
      fieldData.ID,
      savedOrganicManure.ApplicationDate,
      isCurrentOrganicManure,
      isCurrentFertiliser,
      savedOrganicManure.ID,
      userId,
    );
  },

  buildFarmManureTypeData(organicManureData) {
    if (!organicManureData.SaveDefaultForFarm) {
      return null;
    }

    const { OrganicManure } = organicManureData;
    return {
      FarmID: organicManureData.FarmID,
      ManureTypeID: OrganicManure.ManureTypeID,
      ManureTypeName: OrganicManure.ManureTypeName,
      FieldTypeID: organicManureData.FieldTypeID,
      TotalN: OrganicManure.N,
      DryMatter: OrganicManure.DryMatterPercent,
      NH4N: OrganicManure.NH4N,
      Uric: OrganicManure.UricAcid,
      NO3N: OrganicManure.NO3N,
      P2O5: OrganicManure.P2O5,
      SO3: OrganicManure.SO3,
      K2O: OrganicManure.K2O,
      MgO: OrganicManure.MgO,
    };
  },


};

module.exports = { organicManureCreateMethods };
