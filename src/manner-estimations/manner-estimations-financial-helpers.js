const { AppDataSource } = require("../db/data-source");
const {
  MannerEstimationsEntity,
} = require("../db/entity/manner-estimations.entity");
const {
  MannerEstimationApplicationsEntity,
} = require("../db/entity/manner-estimation-applications.entity");

const NUTRIENT_ID = { NITROGEN: 1, PHOSPHATE: 2, POTASH: 3 };
const AUGUST_MONTH = 7;
const JULY_MONTH = 6;

const {
  MannerFarmsEntity,
} = require("../db/entity/manner-farms.entity");

const mannerEstimationsFinancialHelpers = {
  async updateMannerEstimationWithApplications(payload, userId, request) {
    const { MannerEstimation } = payload;
    this.validateUpdateMannerEstimationPayload(MannerEstimation);

    return AppDataSource.transaction(async (transactionalManager) => {
      const mannerEstimationId = MannerEstimation.ID;
      const sourceMannerEstimationApplications =
        await this.getSourceMannerEstimationApplicationsForUpdate(
          transactionalManager,
          mannerEstimationId,
        );

        const mannerFarm = await transactionalManager.findOne(
        MannerFarmsEntity,
        {
          where: { ID: MannerEstimation.MannerFarmID },
        },
      );
        const mannerEstimationDetail = {
    ...MannerEstimation,
    ...mannerFarm
};
      const mannerEstimationFinancialValues =
        await this.getMannerEstimationFinancialValuesForUpdate(
          mannerFarm,
          mannerEstimationDetail,
          sourceMannerEstimationApplications[0],
          request,
        );

      await this.updateMannerEstimationEntityForUpdate(
        transactionalManager,
        MannerEstimation,
        mannerEstimationId,
        mannerEstimationFinancialValues,
        userId,
      );

      const updatedApplications = await this.updateApplicationsForUpdate(
        transactionalManager,
        sourceMannerEstimationApplications,
        MannerEstimation,
        mannerEstimationId,
        mannerFarm,
        userId,
        request
      );

      return this.buildUpdatedMannerEstimationPayload(
        transactionalManager,
        mannerEstimationId,
        updatedApplications,
      );
    });
  },

  async getSourceMannerEstimationApplicationsForUpdate(
    transactionalManager,
    mannerEstimationId,
  ) {
    const sourceMannerEstimationApplications = await transactionalManager.find(
      MannerEstimationApplicationsEntity,
      {
        where: { MannerEstimationID: mannerEstimationId },
        order: { ID: "ASC" },
      },
    );
    if (sourceMannerEstimationApplications.length === 0) {
      throw new Error("Manner estimation applications not found");
    }
    return sourceMannerEstimationApplications;
  },

  async getMannerEstimationFinancialValuesForUpdate(
    mannerFarm,
    mannerEstimation,
    sourceApplication,
    request,
  ) {
    const mappedSourceApplication =
      await this.getMappedMannerEstimationApplication(
        mannerFarm,
        mannerEstimation,
        sourceApplication,
        request,
      );
    const nutrientFinancialValues =
      await this.calculateNutrientFinancialValuesByNutrientIdForUpdate(
        mannerEstimation,
        mappedSourceApplication,
        request,
      );
    return this.buildMannerEstimationFinancialValues(nutrientFinancialValues);
  },

  async updateMannerEstimationEntityForUpdate(
    transactionalManager,
    mannerEstimation,
    mannerEstimationId,
    mannerEstimationFinancialValues,
    userId,
  ) {
    const { ID, CreatedByID, CreatedOn, ...mannerEstimationDataToUpdate } =
      mannerEstimation;
    const updatedMannerEstimationResult = await transactionalManager.update(
      MannerEstimationsEntity,
      { ID: mannerEstimationId },
      {
        ...mannerEstimationDataToUpdate,
        ...mannerEstimationFinancialValues,
        ModifiedByID: userId,
        ModifiedOn: new Date(),
      },
    );
    if (updatedMannerEstimationResult.affected !== 1) {
      throw new Error("Manner estimation not found");
    }
  },

  async updateApplicationsForUpdate(
    transactionalManager,
    sourceMannerEstimationApplications,
    mannerEstimation,
    mannerEstimationId,
    mannerFarm,
    userId,
    request,
  ) {
    const updatedApplications = [];
    for (const mannerEstimationApplication of sourceMannerEstimationApplications) {
      const updatedApplication = await this.updateSingleApplicationForUpdate(
        transactionalManager,
        mannerEstimation,
        mannerEstimationApplication,
        mannerEstimationId,
        mannerFarm,
        userId,
        request,
      );
      updatedApplications.push(updatedApplication);
    }
    return updatedApplications;
  },

  async updateSingleApplicationForUpdate(
    transactionalManager,
    mannerEstimation,
    mannerEstimationApplication,
    mannerEstimationId,
    mannerFarm,
    userId,
    request,
  ) {
    const mannerEstimationApplicationValues =
      this.setApplicationDateBasedOnSowingDate(
        mannerEstimation,
        mannerEstimationApplication,
      );
    const mappedMannerEstimationApplication =
      await this.getMappedMannerEstimationApplication(
        mannerFarm,
        mannerEstimation,
        mannerEstimationApplication,
        request,
      );
    const applicationNutrientFinancialValues =
      await this.calculateNutrientFinancialValuesByNutrientIdForUpdate(
        mannerEstimation,
        mappedMannerEstimationApplication,
        request,
      );
    const mannerEstimationApplicationFinancialValues =
      this.buildMannerEstimationApplicationFinancialValues(
        applicationNutrientFinancialValues,
      );
    const { ID: applicationId,EndOfDrain,Rainfall, ...applicationDataToUpdate } =
      mappedMannerEstimationApplication;
    const updatedApplicationResult = await transactionalManager.update(
      MannerEstimationApplicationsEntity,
      { ID: applicationId, MannerEstimationID: mannerEstimationId },
      {
        ...applicationDataToUpdate,
        ...mannerEstimationApplicationFinancialValues,
        ...mannerEstimationApplicationValues,
        ModifiedByID: userId,
        ModifiedOn: new Date(),
      },
    );
    if (updatedApplicationResult.affected !== 1) {
      throw new Error(`Manner estimation application not found for ID `);
    }
    return transactionalManager.findOneBy(MannerEstimationApplicationsEntity, {
      ID: applicationId,
      MannerEstimationID: mannerEstimationId,
    });
  },

  async buildUpdatedMannerEstimationPayload(
    transactionalManager,
    mannerEstimationId,
    updatedApplications,
  ) {
    const updatedMannerEstimation = await transactionalManager.findOneBy(
      MannerEstimationsEntity,
      { ID: mannerEstimationId },
    );
    return {
      MannerEstimation: updatedMannerEstimation,
      MannerEstimationApplications: updatedApplications,
    };
  },

  setApplicationDateBasedOnSowingDate(
    mannerEstimation,
    mannerEstimationApplication,
  ) {
    const mannerEstimationApplicationValues = {};
    if (
      mannerEstimation?.SowingDate &&
      mannerEstimationApplication?.ApplicationDate
    ) {
      const sowingDate = new Date(mannerEstimation.SowingDate);
      const applicationDate = new Date(
        mannerEstimationApplication.ApplicationDate,
      );
      const endOfDrainageDate = new Date(
        mannerEstimationApplication.EndOfDrainageDate,
      );

      const harvestStartYear =
        sowingDate.getMonth() >= AUGUST_MONTH
          ? sowingDate.getFullYear()
          : sowingDate.getFullYear() - 1;

      const updatedYear =
        applicationDate.getMonth() >= AUGUST_MONTH
          ? harvestStartYear
          : harvestStartYear + 1;

      mannerEstimationApplicationValues.ApplicationDate = new Date(
        updatedYear,
        applicationDate.getMonth(),
        applicationDate.getDate(),
      );
      const marchYear =
        applicationDate.getMonth() >= 0 &&
        applicationDate.getMonth() <= JULY_MONTH
          ? mannerEstimationApplicationValues.ApplicationDate.getFullYear()
          : mannerEstimationApplicationValues.ApplicationDate.getFullYear() + 1;
      mannerEstimationApplicationValues.EndOfDrainageDate = new Date(
        marchYear,
        endOfDrainageDate.getMonth(),
        endOfDrainageDate.getDate(),
      );
    }

    return mannerEstimationApplicationValues;
  },

  validateUpdateMannerEstimationPayload(mannerEstimation) {
    if (!mannerEstimation?.ID) {
      throw new Error("MannerEstimation ID is required");
    }
  },

  async calculateNutrientFinancialValuesByNutrientIdForUpdate(
    mannerEstimation,
    mannerEstimationApplication,
    request,
  ) {
    const nutrientConfigById = {
      [NUTRIENT_ID.NITROGEN]: {
        productId: mannerEstimation.NitrogenProductId,
        price: mannerEstimation.NitrogenPrice,
        ProductPrice:mannerEstimation.NitrogenProductPrice,
      },
      [NUTRIENT_ID.PHOSPHATE]: {
        productId: mannerEstimation.PhosphateProductId,
        price: mannerEstimation.PhosphatePrice,
        ProductPrice:mannerEstimation.PhosphateProductPrice,
      },
      [NUTRIENT_ID.POTASH]: {
        productId: mannerEstimation.PotashProductId,
        price: mannerEstimation.PotashPrice,
        ProductPrice:mannerEstimation.PotashProductPrice,
      },
    };
    const nutrientFinancialValuesByNutrientId = {};
    for (const nutrientId of Object.values(NUTRIENT_ID)) {
      const nutrientConfig = nutrientConfigById[nutrientId];
      if (!nutrientConfig?.productId || nutrientConfig.price == null) {
        continue;
      }
      const nutrientPercentageData = await this.nutrientsProductService.getData(
        `/nutrient-products/${nutrientConfig.productId}`,
        request,
      );
      const nutrientProduct =
        nutrientPercentageData?.data ?? nutrientPercentageData;
      
      let totalNutrientValue = 0;
      switch (nutrientId) {
        case NUTRIENT_ID.NITROGEN:
          totalNutrientValue =
            mannerEstimationApplication.CropAvailableNCurrentCrop +
            mannerEstimationApplication.CropAvailableNitrogenFollowingCropYearTwo;
          break;
        case NUTRIENT_ID.PHOSPHATE:
          totalNutrientValue = mannerEstimationApplication.TotalP2O5;
          break;
        case NUTRIENT_ID.POTASH:
          totalNutrientValue = mannerEstimationApplication.TotalK2O;
          break;
        default:
          break;
      }
     nutrientFinancialValuesByNutrientId[nutrientId] = {
        nutrientValue: Math.round(totalNutrientValue * nutrientConfig.price),
        productId: nutrientConfig.productId,
        productName: nutrientProduct?.name,
        productPrice: nutrientConfig.ProductPrice,
        price: nutrientConfig.price,
      };
    }
    return nutrientFinancialValuesByNutrientId;
  },

  calculateNutrientFinancialValuesByNutrientId(
    nutrientProducts,
    nutrients,
    mannerEstimationApplication,
  ) {
    const nutrientFinancialValuesByNutrientId = {};
    for (const product of nutrientProducts) {
      const nutrient = nutrients.data.find((n) => n.id === product.nutrientID);
      if (!nutrient) {
        continue;
      }
      const nutrientPercentage = product.nutrientPercentage;
      const cal1 = nutrientPercentage / 100;
      const cal2 = cal1 * 1000;
      const nutrientPrice = Math.round(cal2 * nutrient.unitRate);
      let totalNutrientValue = 0;
      switch (nutrient.id) {
        case NUTRIENT_ID.NITROGEN:
          totalNutrientValue =
            mannerEstimationApplication.CropAvailableNCurrentCrop +
            mannerEstimationApplication.CropAvailableNitrogenFollowingCropYearTwo;
          break;
        case NUTRIENT_ID.PHOSPHATE:
          totalNutrientValue = mannerEstimationApplication.TotalP2O5;
          break;
        case NUTRIENT_ID.POTASH:
          totalNutrientValue = mannerEstimationApplication.TotalK2O;
          break;
        default:
          break;
      }
      nutrientFinancialValuesByNutrientId[nutrient.id] = {
        nutrientValue: Math.round(totalNutrientValue * nutrient.unitRate),
        productId: product.id,
        productName: product.name,
        productPrice: nutrientPrice,
        price: nutrient.unitRate,
      };
    }
    return nutrientFinancialValuesByNutrientId;
  },

  buildMannerEstimationFinancialValues(nutrientFinancialValuesByNutrientId) {
    const mannerEstimationValues = {};
    const nitrogenValues =
      nutrientFinancialValuesByNutrientId[NUTRIENT_ID.NITROGEN];
    const phosphateValues =
      nutrientFinancialValuesByNutrientId[NUTRIENT_ID.PHOSPHATE];
    const potashValues =
      nutrientFinancialValuesByNutrientId[NUTRIENT_ID.POTASH];
    if (nitrogenValues) {
      mannerEstimationValues.NitrogenProductId = nitrogenValues.productId;
      mannerEstimationValues.NitrogenProductName = nitrogenValues.productName;
      mannerEstimationValues.NitrogenProductPrice = nitrogenValues.productPrice;
      mannerEstimationValues.NitrogenPrice = nitrogenValues.price;
    }
    if (phosphateValues) {
      mannerEstimationValues.PhosphateProductId = phosphateValues.productId;
      mannerEstimationValues.PhosphateProductName = phosphateValues.productName;
      mannerEstimationValues.PhosphateProductPrice =
        phosphateValues.productPrice;
      mannerEstimationValues.PhosphatePrice = phosphateValues.price;
    }
    if (potashValues) {
      mannerEstimationValues.PotashProductId = potashValues.productId;
      mannerEstimationValues.PotashProductName = potashValues.productName;
      mannerEstimationValues.PotashProductPrice = potashValues.productPrice;
      mannerEstimationValues.PotashPrice = potashValues.price;
    }
    return mannerEstimationValues;
  },

  buildMannerEstimationApplicationFinancialValues(
    nutrientFinancialValuesByNutrientId,
  ) {
    const mannerEstimationApplicationValues = {};
    const nitrogenValues =
      nutrientFinancialValuesByNutrientId[NUTRIENT_ID.NITROGEN];
    const phosphateValues =
      nutrientFinancialValuesByNutrientId[NUTRIENT_ID.PHOSPHATE];
    const potashValues =
      nutrientFinancialValuesByNutrientId[NUTRIENT_ID.POTASH];
    if (nitrogenValues) {
      mannerEstimationApplicationValues.NitrogenValue =
        nitrogenValues.nutrientValue;
    }
    if (phosphateValues) {
      mannerEstimationApplicationValues.PhosphateValue =
        phosphateValues.nutrientValue;
    }
    if (potashValues) {
      mannerEstimationApplicationValues.PotashValue =
        potashValues.nutrientValue;
    }
    return mannerEstimationApplicationValues;
  },
};

module.exports = { mannerEstimationsFinancialHelpers };
