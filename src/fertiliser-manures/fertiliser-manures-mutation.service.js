const { AppDataSource } = require("../db/data-source");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { CountryEntity } = require("../db/entity/country.entity");
const {
  WarningMessagesEntity,
} = require("../db/entity/warning-message.entity");
const { WarningCodesMapper } = require("../constants/warning-codes-mapper");

const fertiliserManuresMutationMethods = {
  async setOtherCropPKBalance(crop, latestSoilAnalysis, transactionalManager) {
    if (crop.CropTypeID !== CropTypeMapper.OTHER) {
      return { pBalance: null, kBalance: null };
    }
    return this.CalculatePKBalanceOther.calculatePKBalanceOther(
      crop,
      latestSoilAnalysis,
      transactionalManager,
    );
  },

  async preparePKBalanceUpdateData(
    latestSoilAnalysis,
    pBalance,
    kBalance,
    crop,
    field,
    existingPKBalance,
    userId,
  ) {
    const hasSoilAnalysis = Object.keys(latestSoilAnalysis || {}).length > 0;
    if (hasSoilAnalysis) {
      if (latestSoilAnalysis.PotassiumIndex === null) {
        kBalance = 0;
      }
      if (latestSoilAnalysis.PhosphorusIndex === null) {
        pBalance = 0;
      }
    } else {
      pBalance = 0;
      kBalance = 0;
    }
    const updateData = {
      Year: crop?.Year,
      FieldID: field?.ID,
      PBalance: pBalance,
      KBalance: kBalance,
    };
    return {
      ...existingPKBalance,
      ...updateData,
      ModifiedOn: new Date(),
      ModifiedByID: userId,
    };
  },

  async findAsArray(list, predicate) {
    const item = list.find(predicate);
    return item === undefined ? [] : [item];
  },

  async buildPKBalanceData(
    totalP205AndK20,
    fertiliserManure,
    recommendationData,
    field,
    crop,
    pkBalance,
    transactionalAndUserId,
  ) {
    const { transactionalManager, userId } = transactionalAndUserId;
    if (!totalP205AndK20 || !recommendationData) {
      return null;
    }
    let pBalance =
      totalP205AndK20.p205 + fertiliserManure?.P2O5 - recommendationData.p205;

    let kBalance =
      totalP205AndK20.k20 + fertiliserManure?.K2O - recommendationData.k20;

    const farmData = await this.farmRepository.findOneBy({
      ID: field.FarmID,
    });
    const rb209CountryData = await transactionalManager.findOne(CountryEntity, {
      where: { ID: farmData.CountryID },
    });

    const { latestSoilAnalysis } =
      await this.HandleSoilAnalysisService.handleSoilAnalysisValidation(
        field.ID,
        crop?.Year,
        rb209CountryData.RB209CountryID,
        transactionalManager,
      );

    const otherPKBalance = await this.setOtherCropPKBalance(
      crop,
      latestSoilAnalysis,
      transactionalManager,
    );

    if (otherPKBalance?.pBalance !== null) {
      pBalance = otherPKBalance.pBalance;
      kBalance = otherPKBalance.kBalance;
    }

    return this.preparePKBalanceUpdateData(
      latestSoilAnalysis,
      pBalance,
      kBalance,
      crop,
      field,
      pkBalance,
      userId,
    );
  },

  async saveWarningMessages(
    fertiliser,
    savedFertiliser,
    userId,
    transactionalManager,
  ) {
    const warningMessages = fertiliser.WarningMessages;
    if (!warningMessages?.length) {
      return;
    }
    const warningMessagesToSave = warningMessages.map((msg) =>
      this.warningMessageRepository.create({
        ...msg,
        JoiningID:
          msg?.WarningCodeID === WarningCodesMapper.NMAXLIMIT
            ? msg.FieldID
            : savedFertiliser.ID,
        CreatedByID: userId,
        CreatedOn: new Date(),
      }),
    );

    await transactionalManager.save(
      WarningMessagesEntity,
      warningMessagesToSave,
    );
  },

  checkNextYearPlanAndFertiliserExist(
    cropPlanForNextYear,
    managementPeriodAllData,
    fertiliserAllData,
    fertManure,
  ) {
    const isNextYearPlanExist = cropPlanForNextYear?.length > 0;
    if (!isNextYearPlanExist) {
      return { isNextYearPlanExist: false, isNextYearFertiliserExist: false };
    }

    const isNextYearFertiliserExist = cropPlanForNextYear.some((crop) => {
      const managementPeriodExists = managementPeriodAllData.some(
        (manData) => manData.CropID === crop.ID,
      );

      if (!managementPeriodExists) {
        return false;
      }

      return fertiliserAllData.some(
        (fertData) =>
          fertData.ManagementPeriodID === fertManure.ManagementPeriodID,
      );
    });

    return {
      isNextYearPlanExist,
      isNextYearFertiliserExist,
    };
  },

  async updatePKBalanceAndRegenerateRecommendations({
    fertiliserData,
    managementPeriodData,
    fertiliserManureData,
    recommandationAllData,
    fieldData,
    cropData,
    pkBalanceData,
    userId,
    transactionalManager,
    request,
  }) {
    const managementPeriodId = managementPeriodData[0]?.ID;
    const totalP205AndK20 = await this.getTotalP205AndK20(
      fertiliserData,
      managementPeriodId,
    );
    const recommandationData =
      await this.getTotalFertiliserP205AndK20FromRecommandation(
        managementPeriodId,
        recommandationAllData,
      );
    const updatePKBalance = await this.buildPKBalanceData(
      totalP205AndK20,
      fertiliserManureData[0]?.FertiliserManure,
      recommandationData,
      fieldData[0],
      cropData[0],
      pkBalanceData[0],
      {
        userId,
        transactionalManager,
      },
    );

    await transactionalManager.save(PKBalanceEntity, updatePKBalance);
    await this.currentAndFuture.regenerateCurrentAndFutureRecommendations(
      cropData[0],
      transactionalManager,
      request,
      userId,
    );
  },

  async handlePKBalanceAndFutureRecommendations({
    isNextYearPlanExist,
    isNextYearFertiliserExist,
    fieldData,
    cropData,
    request,
    userId,
    pkBalanceData,
    fertiliserData,
    managementPeriodData,
    fertiliserManureData,
    recommandationAllData,
    transactionalManager,
  }) {
    if (isNextYearPlanExist && isNextYearFertiliserExist) {
      await this.updatingFutureRecommendations.updateRecommendationsForField(
        fieldData[0]?.ID,
        cropData[0]?.Year,
        request,
        userId,
      );

      return;
    }

    if (pkBalanceData?.length > 0) {
      await this.updatePKBalanceAndRegenerateRecommendations({
        fertiliserData,
        managementPeriodData,
        fertiliserManureData,
        recommandationAllData,
        fieldData,
        cropData,
        pkBalanceData,
        userId,
        transactionalManager,
        request,
      });

      return;
    }
    console.log("PK Balance data not found for field and year:");
  },

  async createFertiliserManures(fertiliserManureData, userId, request) {
    const cropPlanAllData = await this.cropRepository.find();
    const recommandationAllData = await this.RecommendationRepository.find();
    const managementPeriodAllData =
      await this.managementPeriodRepository.find();
    const fieldAllData = await this.fieldRepository.find(),
      fertiliserAllData = await this.repository.find();
    return AppDataSource.transaction(async (transactionalManager) => {
      const fertiliserManures = [];
      for (const fertiliser of fertiliserManureData) {
        const fertiliserManure = fertiliser.FertiliserManure;
        // Save fertiliser first
        const savedFertiliser = await transactionalManager.save(
          FertiliserManuresEntity,
          this.repository.create({
            ...fertiliserManure,
            CreatedByID: userId,
            CreatedOn: new Date(),
          }),
        );
        fertiliserManures.push(savedFertiliser);
        await this.saveWarningMessages(
          fertiliser,
          savedFertiliser,
          userId,
          transactionalManager,
        );
        const cropAndField = await transactionalManager
          .createQueryBuilder(ManagementPeriodEntity, "mp")
          .leftJoin(CropEntity, "crop", "crop.ID = mp.CropID")
          .select(["mp.CropID AS CropID", "crop.FieldID AS FieldID"])
          .where("mp.ID = :managementPeriodID", {
            managementPeriodID: savedFertiliser.ManagementPeriodID,
          })
          .getRawOne();
        const isCurrentOrganicManure = false,
          isCurrentFertiliser = true;
        this.ProcessFutureManuresForWarnings.processFutureManures(
          cropAndField.FieldID,
          savedFertiliser.ApplicationDate,
          isCurrentOrganicManure,
          isCurrentFertiliser,
          savedFertiliser.ID,
          userId,
        ).catch((error) => {
          console.error(
            `Error processing future manure warnings for field ${cropAndField.FieldID}:`,
            error,
          );
        });
      }
      const soilAnalysisAllData = await this.soilAnalysisRepository.find(),
        pkBalanceAllData = await this.pkBalanceRepository.find();
      for (const fertManure of fertiliserManures) {
        const fertiliserData = fertiliserAllData.filter((fertData) => {
          return fertData.ManagementPeriodID === fertManure.ManagementPeriodID;
        });
        const managementPeriodData = await this.findAsArray(
          managementPeriodAllData,
          (manData) => manData.ID === fertManure.ManagementPeriodID,
        );
        const cropData = await this.findAsArray(
          cropPlanAllData,
          (crop) => crop.ID === managementPeriodData[0]?.CropID,
        );
        const fieldData = await this.findAsArray(
          fieldAllData,
          (field) => field.ID === cropData[0]?.FieldID,
        );
        const soilAnalsisData = soilAnalysisAllData.filter((soilAnalyses) => {
          return soilAnalyses.FieldID === cropData[0]?.FieldID;
        });
        let isSoilAnalysisHavePAndK = false;
        if (soilAnalsisData.length > 0) {
          isSoilAnalysisHavePAndK = !!soilAnalsisData.some(
            (item) =>
              item.PhosphorusIndex !== null || item.PotassiumIndex !== null,
          );
        }
        if (isSoilAnalysisHavePAndK) {
          const pkBalanceData = pkBalanceAllData.filter((pkBalance) => {
            return (
              pkBalance.FieldID === fieldData[0]?.ID &&
              pkBalance.Year === cropData[0]?.Year
            );
          });
          const cropPlanForNextYear = cropPlanAllData.filter((cropPlan) => {
            return (
              cropPlan.FieldID === fieldData[0]?.ID &&
              cropPlan.Year > cropData[0]?.Year
            );
          });
          const { isNextYearPlanExist, isNextYearFertiliserExist } =
            this.checkNextYearPlanAndFertiliserExist(
              cropPlanForNextYear,
              managementPeriodAllData,
              fertiliserAllData,
              fertManure,
            );
          await this.handlePKBalanceAndFutureRecommendations({
            isNextYearPlanExist,
            isNextYearFertiliserExist,
            fieldData,
            cropData,
            request,
            userId,
            pkBalanceData,
            fertiliserData,
            managementPeriodData,
            fertiliserManureData,
            recommandationAllData,
            transactionalManager,
          });
        }
        await this.currentAndFuture.regenerateCurrentAndFutureRecommendations(
          cropData[0],
          transactionalManager,
          request,
          userId,
        );
      }
      return fertiliserManures;
    });
  },

  async updateFertiliser(updatedFertiliserManureData, userId, request) {
    return AppDataSource.transaction(async (transactionalManager) => {
      const updatedFertilisers = [];
      for (const manure of updatedFertiliserManureData) {
        const inorganicManure = manure.FertiliserManure;
        const warningMessages = manure.WarningMessages;
        const { ID, CreatedByID, CreatedOn, ...updatedData } = inorganicManure;
        // Update fertiliseremanure
        const result = await transactionalManager.update(
          FertiliserManuresEntity,
          ID,
          {
            ...updatedData,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
          },
        );

        await this.CreateOrUpdateWarningMessage.syncWarningMessages(
          inorganicManure.ManagementPeriodID,
          inorganicManure,
          warningMessages,
          transactionalManager,
          userId,
        );

        if (result.affected === 0) {
          console.log(`Fertiliser Manures with ID ${ID} not found`);
        }

        const fertiliserManure = await transactionalManager.findOne(
          FertiliserManuresEntity,
          {
            where: { ID: ID },
          },
        );
        if (fertiliserManure) {
          updatedFertilisers.push(fertiliserManure);
        }
        const managementPeriod = await this.managementPeriodRepository.findOne({
          where: { ID: fertiliserManure.ManagementPeriodID },
        });
        const crop = await this.cropRepository.findOne({
          where: { ID: managementPeriod.CropID },
        });

        await this.currentAndFuture.regenerateCurrentAndFutureRecommendations(
          crop,
          transactionalManager,
          request,
          userId,
        );

        this.ProcessFutureManuresForWarnings.processWarningsByField(
          crop.FieldID,
          userId,
        ).catch((error) => {
          console.error(
            `Error processing warning recalculation for field ${crop.FieldID}:`,
            error,
          );
        });
      }
      return { FertiliserManure: updatedFertilisers };
    });
  },

  async deleteFertiliserManure(fertliserManureId, userId, request) {
    return AppDataSource.transaction(async (transactionalManager) => {
      // Check if the Organic Manure exists
      const fertiliserManureToDelete = await this.repository.findOneBy({
        ID: fertliserManureId,
      });
      // If the fertiliserManure does not exist, throw a not found error
      if (fertiliserManureToDelete == null) {
        console.log(`Fertiliser Manure with ID ${fertliserManureId} not found`);
      }
      const managementPeriod = await this.managementPeriodRepository.findOne({
        where: { ID: fertiliserManureToDelete.ManagementPeriodID },
        select: ["CropID"],
      });

      // If the managementPeriod does not exist, throw a not found error
      if (managementPeriod == null) {
        console.log(`managementPeriod not found`);
      }
      const crop = await this.cropRepository.findOne({
        where: { ID: managementPeriod.CropID },
      });

      // If the crop does not exist, throw a not found error
      if (crop == null) {
        console.log(`crop  not found`);
      }

      try {
        // Call the stored procedure to delete the fertliserManureId and related entities
        const storedProcedure =
          "EXEC [spFertiliserManures_DeleteFertiliserManures] @ID = @0";
        await transactionalManager.query(storedProcedure, [fertliserManureId]);
        await this.currentAndFuture.regenerateCurrentAndFutureRecommendations(
          crop,
          transactionalManager,
          request,
          userId,
        );
        this.ProcessFutureManuresForWarnings.processWarningsByCrop(
          crop.ID,
          userId,
        ).catch((error) => {
          console.error(
            `Error processing warning recalculation for crop ${crop.ID}:`,
            error,
          );
        });
        return { affectedRows: 1 }; // Success response
      } catch (error) {
        // Log the error and throw an internal server error
        console.error("Error deleting fertiliserManure:", error);
        return error;
      }
    });
  },
};

module.exports = { fertiliserManuresMutationMethods };
