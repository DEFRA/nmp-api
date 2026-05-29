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

const organicManureCreateMethods = {
  async createOrganicManuresWithFarmManureType(request, body, userId) {
    return AppDataSource.transaction(async (transactionalManager) => {
      let savedFarmManureType;
      let farmManureTypeData;
      const organicManures = [];
      const organicManureAllData = await this.repository.find();
      const cropPlanAllData = await this.cropRepository.find({
        select: ["ID", "FieldID", "Year"],
      });
      const managementPeriodAllData =
        await this.managementPeriodRepository.find();
      const soilAnalysisAllData = await this.soilAnalysisRepository.find();
      const fertiliserAllData = await this.fertiliserRepository.find();

      for (const organicManureData of body.OrganicManures) {
        const { OrganicManure } = organicManureData;
        if (
          OrganicManure.NH4N + OrganicManure.NO3N + OrganicManure.UricAcid >
          OrganicManure.N
        ) {
          console.log(
            "NH4N + NO3N + UricAcid must be less than or equal to TotalN",
          );
        }
 
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

        const soilAnalsisData = soilAnalysisAllData?.filter((soilAnalyses) => {
          return soilAnalyses.FieldID === cropData.FieldID;
        });

        let isSoilAnalysisHavePAndK = false;
        if (soilAnalsisData) {
          isSoilAnalysisHavePAndK = !!soilAnalsisData.some(
            (item) =>
              item.PhosphorusIndex !== null || item.PotassiumIndex !== null,
          );
        }
        let mannerOutputs = null;
        mannerOutputs =
          await this.CalculateMannerOutput.calculateMannerOutputForOrganicManure(
            cropData,
            OrganicManure,
            farmData,
            fieldData,
            transactionalManager,
            request,
          );

        // Call the new helper function to create mannerOutputReq

        let isNextYearPlanExist = false;
        let isNextYearOrganicManureExist = false;
        let isNextYearFertiliserExist = false;
        if (isSoilAnalysisHavePAndK) {
          const cropPlanForNextYear = cropPlanAllData?.filter((cropPlan) => {
            return (
              cropPlan.FieldID === fieldData.ID && cropPlan.Year > cropData.Year
            );
          });

          if (cropPlanForNextYear.length > 0) {
            isNextYearPlanExist = true;
            for (const crop of cropPlanForNextYear) {
              console.log("CropID", crop.ID);
              const managementPeriodDataId = managementPeriodAllData
                ?.filter((manData) => manData.CropID === crop.ID)
                .map((manData) => manData.ID);
              console.log("managementPeriodDataId", managementPeriodDataId);
              if (managementPeriodDataId.length > 0) {
                const filterOrganicManure = organicManureAllData?.filter(
                  (organicData) =>
                    organicData.ManagementPeriodID ===
                    managementPeriodDataId[0],
                );

                console.log("organicManureId", filterOrganicManure);
                const filterFertiliserData = fertiliserAllData?.filter(
                  (fertData) =>
                    fertData.ManagementPeriodID === managementPeriodDataId[0],
                );
                console.log("fertiliserId", filterFertiliserData);

                if (
                  filterOrganicManure != null &&
                  filterOrganicManure.length > 0
                ) {
                  console.log("filterOrganicManure", filterFertiliserData);
                  isNextYearOrganicManureExist = true;
                }
                if (
                  filterFertiliserData != null &&
                  filterFertiliserData.length > 0
                ) {
                  console.log("filterOrganicManure", filterFertiliserData);
                  isNextYearFertiliserExist = true;
                }
              }
            }
          }
        }

        const previousCrop =
          await this.CalculatePreviousCropService.findPreviousCrop(
            fieldData.ID,
            cropData.Year,
            transactionalManager,
          );

        if (
          cropData.CropTypeID === CropTypeMapper.OTHER ||
          cropData.IsBasePlan ||
          !previousCrop
        ) {
          await this.saveOrganicManureForOtherCropType(
            organicManureData,
            mannerOutputs,
            transactionalManager,
            userId,
            organicManures,
          );

          await this.generateRecommendations.generateRecommendations(
            fieldData.ID,
            cropData.Year,
            OrganicManure,
            transactionalManager,
            request,
            userId,
          );

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
        } else {
          const savedOrganicManure = await transactionalManager.save(
            OrganicManureEntity,
            this.repository.create({
              ...organicManureData.OrganicManure,
              CreatedByID: userId,
              CreatedOn: new Date(),
            }),
          );
          if (
            organicManureData.WarningMessages &&
            organicManureData.WarningMessages.length > 0
          ) {
            const warningMessagesToSave = organicManureData.WarningMessages.map(
              (wm) =>
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
          }

          organicManures.push(savedOrganicManure);
          const newOrganicManure = null;
          await this.generateRecommendations.generateRecommendations(
            fieldData.ID,
            cropData.Year,
            newOrganicManure,
            transactionalManager,
            request,
            userId,
          );

          if (
            isSoilAnalysisHavePAndK &&
            (isNextYearPlanExist ||
              isNextYearOrganicManureExist ||
              isNextYearFertiliserExist)
          ) {
            // UpdateRecommendation
            this.updatingFutureRecommendations.updateRecommendationsForField(
              cropData?.FieldID,
              cropData?.Year,
              request,
              userId,
            );
          }

          const isCurrentOrganicManure = true,
            isCurrentFertiliser = false;
          this.ProcessFutureManuresForWarnings.processFutureManures(
            fieldData.ID,
            savedOrganicManure.ApplicationDate,
            isCurrentOrganicManure,
            isCurrentFertiliser,
            savedOrganicManure.ID,
            userId,
          );
        }

        if (organicManureData.SaveDefaultForFarm) {
          farmManureTypeData = {
            FarmID: organicManureData.FarmID,
            ManureTypeID: OrganicManure.ManureTypeID,
            ManureTypeName: OrganicManure.ManureTypeName,
            FieldTypeID: organicManureData.FieldTypeID,
            TotalN: OrganicManure.N, //Nitogen
            DryMatter: OrganicManure.DryMatterPercent,
            NH4N: OrganicManure.NH4N, //ammonium
            Uric: OrganicManure.UricAcid, //uric acid
            NO3N: OrganicManure.NO3N, //nitrate
            P2O5: OrganicManure.P2O5,
            SO3: OrganicManure.SO3,
            K2O: OrganicManure.K2O,
            MgO: OrganicManure.MgO,
          };
        }
      }
      if (farmManureTypeData) {
        const existingFarmManureType =
          await this.farmManureTypeRepository.findOne({
            where: {
              FarmID: farmManureTypeData.FarmID,
              ManureTypeID: farmManureTypeData.ManureTypeID,
              ManureTypeName: farmManureTypeData.ManureTypeName,
            },
          });
        if (existingFarmManureType) {
          await this.farmManureTypeRepository.update(
            existingFarmManureType.ID,
            {
              ...farmManureTypeData,
              ModifiedByID: userId,
              ModifiedOn: new Date(),
            },
          );

          savedFarmManureType = {
            ...existingFarmManureType,
            ...farmManureTypeData,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
          };
        } else {
          savedFarmManureType = await transactionalManager.save(
            FarmManureTypeEntity,
            this.farmManureTypeRepository.create({
              ...farmManureTypeData,
              CreatedByID: userId,
              CreatedOn: new Date(),
            }),
          );
        }
      }

      return {
        OrganicManures: organicManures,
        FarmManureType: savedFarmManureType,
      };
    });
  }


};

module.exports = { organicManureCreateMethods };
