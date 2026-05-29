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

const organicManureMutationMethods = {
  async deleteOrganicManure(organicManureId, userId, request) {
    return AppDataSource.transaction(async (transactionalManager) => {
      // Check if the Organic Manure exists
      const organicManureToDelete = await this.repository.findOneBy({
        ID: organicManureId,
      });

      // If the organicManure does not exist, throw a not found error
      if (organicManureToDelete == null) {
        console.log(`Organic Manure with ID ${organicManureId} not found`);
      }
      const managementPeriod = await this.managementPeriodRepository.findOne({
        where: { ID: organicManureToDelete.ManagementPeriodID },
        select: ["CropID"],
      });

      // If the managementPeriod does not exist, throw a not found error
      if (managementPeriod == null) {
        console.log(
          `managementPeriod with ID ${organicManureToDelete.ManagementPeriodID} not found`,
        );
      }
      const crop = await this.cropRepository.findOne({
        where: { ID: managementPeriod.CropID },
      });

      // If the crop does not exist, throw a not found error
      if (crop == null) {
        console.log(`crop with ID ${managementPeriod.CropID} not found`);
      }

      try {
        // Call the stored procedure to delete the organicManureId and related entities
        const storedProcedure =
          "EXEC [spOrganicManures_DeleteOrganicManures] @OrganicManureID = @0";
        await transactionalManager.query(storedProcedure, [organicManureId]);
        const newOrganicManure = null;
        await this.generateRecommendations.generateRecommendations(
          crop.FieldID,
          crop.Year,
          newOrganicManure,
          transactionalManager,
          request,
          userId,
        );
        // Check if there are any records in the repository for crop.FieldID with a year greater than crop.Year
        const nextAvailableCrop = await this.cropRepository.findOne({
          where: {
            FieldID: crop.FieldID,
            Year: MoreThan(crop.Year), // Find the next available year greater than the current crop.Year
          },
          order: {
            Year: "ASC", // Ensure we get the next immediate year
          },
        });
        if (nextAvailableCrop) {
          this.updatingFutureRecommendations.updateRecommendationsForField(
            crop.FieldID,
            nextAvailableCrop.Year,
            request,
            userId,
          );
        }
        this.ProcessFutureManuresForWarnings.processWarningsByCrop(
          crop.ID,
          userId,
        );

        return { affectedRows: 1 }; // Success response
      } catch (error) {
        // Log the error and throw an internal server error
        console.error("Error deleting organicManure:", error);
      }
    });
  }

,

  async updateOrganicManure(updatedOrganicManureData, userId, request) {
    return AppDataSource.transaction(async (transactionalManager) => {
      const updatedOrganicManures = [];
      let savedFarmManureType = null;

      for (const manureEntry of updatedOrganicManureData) {
        const {
          OrganicManure,
          WarningMessages,
          FarmID,
          FieldTypeID,
          SaveDefaultForFarm,
        } = manureEntry;

        const { ID, CreatedByID, CreatedOn, ...updatedData } = OrganicManure;
        // ?? Update recommendations
        const managementPeriod = await transactionalManager.findOne(
          ManagementPeriodEntity,
          {
            where: { ID: OrganicManure.ManagementPeriodID },
          },
        );

        const crop = await transactionalManager.findOne(CropEntity, {
          where: { ID: managementPeriod?.CropID },
        });

        const fieldData = await transactionalManager.findOne(FieldEntity, {
          where: { ID: crop?.FieldID },
        });
        let dataToUpdate;
        {
          dataToUpdate = {
            ...updatedData,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
            ManagementPeriodID: OrganicManure.ManagementPeriodID,
          };
        }

        await transactionalManager.update(
          OrganicManureEntity,
          ID,
          dataToUpdate,
        );

        await this.CreateOrUpdateWarningMessage.syncWarningMessages(
          OrganicManure.ManagementPeriodID,
          OrganicManure,
          WarningMessages,
          transactionalManager,
          userId,
        );

        // Fetch the updated version to return
        const organicManure = await transactionalManager.findOne(
          OrganicManureEntity,
          { where: { ID } },
        );

        if (organicManure) {
          updatedOrganicManures.push(organicManure);
        }

        // ? Update FarmManureType if SaveDefaultForFarm is true (no creation)
        if (SaveDefaultForFarm) {
          const farmManureTypeData = {
            FarmID,
            ManureTypeID: OrganicManure.ManureTypeID,
            ManureTypeName: OrganicManure.ManureTypeName,
            FieldTypeID,
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
        const newOrganicManure = null;
        await this.generateRecommendations.generateRecommendations(
          crop.FieldID,
          crop.Year,
          newOrganicManure,
          transactionalManager,
          request,
          userId,
        );

        const nextAvailableCrop = await this.cropRepository.findOne({
          where: {
            FieldID: crop.FieldID,
            Year: MoreThan(crop.Year),
          },
          order: { Year: "ASC" },
        });

        if (nextAvailableCrop) {
          this.updatingFutureRecommendations
            .updateRecommendationsForField(
              crop.FieldID,
              nextAvailableCrop.Year,
              request,
              userId,
            )
            .then((res) => {
              if (res === undefined) {
                console.log(
                  "updateRecommendationAndOrganicManure returned undefined",
                );
              } else {
                console.log(
                  "updateRecommendationAndOrganicManure result:",
                  res,
                );
              }
            })
            .catch((error) => {
              console.error(
                "Error updating recommendation and organic manure:",
                error,
              );
            });
        }
        const isCurrentOrganicManure = true,
          isCurrentFertiliser = false;
        this.ProcessFutureManuresForWarnings.processFutureManures(
          fieldData.ID,
          OrganicManure.ApplicationDate,
          isCurrentOrganicManure,
          isCurrentFertiliser,
          ID,
          userId,
        );
      }

      return {
        OrganicManure: updatedOrganicManures,
        FarmManureType: savedFarmManureType,
      };
    });
  }


};

module.exports = { organicManureMutationMethods };
