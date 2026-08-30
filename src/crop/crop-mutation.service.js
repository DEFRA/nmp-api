const { AppDataSource } = require("../db/data-source");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const boom = require("@hapi/boom");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const { MoreThan, In } = require("typeorm");
const {
  SecondCropLinkingEntity,
} = require("../db/entity/second-crop-linking.entity");
const { CropOrderMapper } = require("../constants/crop-order-mapper");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const {
  RecommendationCommentEntity,
} = require("../db/entity/recommendation-comment.entity");
const { storedProcedure } = require("../constants/stored-procedures");

const cropMutationMethods = {
  async validateAndHandleSecondCrop(
    transactionalManager,
    updatedCrop,
    fieldId,
    year,
    rB209CountryID,
  ) {
    if (updatedCrop?.CropOrder !== 1) {
      return;
    }
    const secondCrop = await transactionalManager.findOne(CropEntity, {
      where: { FieldID: fieldId, Year: year, CropOrder: 2 },
    });

    if (secondCrop) {
      const firstCropTypeID = updatedCrop.CropTypeID;
      const secondCropTypeID = secondCrop.CropTypeID;
      const linking = await transactionalManager.findOne(
        SecondCropLinkingEntity,
        {
          where: {
            FirstCropID: firstCropTypeID,
            SecondCropID: secondCropTypeID,
            RB209CountryID: In([this.COUNTRY_BOTH, rB209CountryID]),
          },
        },
      );
      if (!linking) {
        const storedProcedureSecondCrop = storedProcedure.DELETE_CROP;
        await AppDataSource.query(storedProcedureSecondCrop, [secondCrop.ID]);
      }
    }
  },

  async updateCropByFieldYearAndConfirm(
    updatedCropData,
    userId,
    fieldId,
    year,
    confirm,
  ) {
    const confirmValue = confirm ? 1 : 0;
    const result = await AppDataSource.transaction(
      async (transactionalManager) => {
        const existingCrop = await transactionalManager.findOne(CropEntity, {
          where: { FieldID: fieldId, Year: year, Confirm: confirmValue },
        });
        if (!existingCrop) {
          throw boom.notFound(
            `Crop for FieldID ${fieldId}, Year ${year}, and Confirm ${confirm} not found`,
          );
        }
        const {
          ID,
          CreatedByID,
          CreatedOn,
          PreviousID,
          Year,
          FieldName,
          EncryptedCounter,
          FieldID,
          ...updateData
        } = updatedCropData;
        const updateResult = await transactionalManager.update(
          CropEntity,
          { FieldID: fieldId, Year: year, Confirm: confirmValue },
          {
            ...updateData,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
          },
        );
        if (updateResult.affected === 0) {
          throw boom.notFound(
            `Crop for FieldID ${fieldId}, Year ${year}, and Confirm ${confirmValue} not found`,
          );
        }
        const updatedCrop = await transactionalManager.findOne(CropEntity, {
          where: { FieldID: fieldId, Year: year, Confirm: confirmValue },
        });
        // Get the rb209CountryID of the farm
        const rb209CountryID = await this.fetchRb209CountryId(
          fieldId,
          transactionalManager,
        );
        await this.validateAndHandleSecondCrop(
          transactionalManager,
          updatedCrop,
          fieldId,
          year,
          rb209CountryID,
        );
        return updatedCrop;
      },
    );

    return result;
  },

  async deleteCrop(cropId, userId, request, transactionalManager) {
    // If a global transaction manager is provided, use it.
    if (transactionalManager) {
      return this.deleteCropById(cropId, userId, request, transactionalManager);
    }
    return AppDataSource.transaction(async (localManager) => {
      return this.deleteCropById(cropId, userId, request, localManager);
    });
  },

  async deleteCropById(CropsID, userId, request, transactionalManager) {
    const crop = await transactionalManager.findOne(this.repository.target, {
      where: { ID: CropsID },
    });
    if (!crop) {
      throw new Error("Crop not found");
    }
    const storedProcedureDeletePrimaryCrop = storedProcedure.DELETE_CROP;
    if (crop.CropOrder === 1) {
      const secondCrop = await transactionalManager.findOne(CropEntity, {
        where: {
          Year: crop.Year,
          CropOrder: CropOrderMapper.SECONDCROP,
          FieldID: crop.FieldID,
        },
      });
      if (secondCrop) {
        const storedProcedureSecondCrop = storedProcedure.DELETE_CROP;
        await transactionalManager.query(storedProcedureSecondCrop, [
          secondCrop.ID,
        ]);
      }
    }
    await transactionalManager.query(storedProcedureDeletePrimaryCrop, [
      CropsID,
    ]);
    await this.currentAndFuture.regenerateCurrentAndFutureRecommendations(
      crop,
      transactionalManager,
      request,
      userId,
    );
  },

  async cropGroupNameExists(cropIds, newGroupName, year, farmId) {
    return (
      (await this.existingGroupNameCount(cropIds, newGroupName, year, farmId)) >
      0
    );
  },

  async existingGroupNameCount(cropIds, newGroupName, year, farmId) {
    if (!newGroupName) {
      throw boom.badRequest("Group Name is required");
    }

    const existingGroupNameCount = this.repository
      .createQueryBuilder("Crops")
      .leftJoin("Fields", "Field", "Field.ID = Crops.fieldId") // Join Fields table manually
      .leftJoin("Farms", "Farm", "Farm.ID = Field.farmId") // Join Farms table manually
      .where("Crops.CropGroupName = :groupName", {
        groupName: newGroupName.trim(),
      })
      .andWhere("Farm.ID = :farmId", { farmId }) // Use farmId passed in
      .andWhere("Crops.Year = :year", { year })
      .andWhere("Crops.ID NOT IN (:...cropIds)", { cropIds });

    return existingGroupNameCount.getCount();
  },

  async updateCropGroupName(cropIds, cropGroupName, variety, year, userId) {
    console.log("cropGroupName", cropGroupName);
    const result = await AppDataSource.transaction(
      async (transactionalManager) => {
        const existingCrops = await transactionalManager.find(CropEntity, {
          where: { ID: In(cropIds), Year: year },
        });

        if (!existingCrops || existingCrops.length === 0) {
          throw boom.notFound(
            `No crops found for cropIds ${cropIds.join(", ")} in Year ${year}`,
          );
        }
        console.log("existingCrops", existingCrops);
        const updatedCrops = [];
        for (const crop of existingCrops) {
          const updatedCrop = await transactionalManager.update(
            CropEntity,
            { ID: crop.ID },
            {
              CropGroupName: cropGroupName,
              Variety: variety,
              ModifiedByID: userId,
              ModifiedOn: new Date(),
            },
          );
          if (updatedCrop.affected === 0) {
            throw boom.notFound("Failed to update Crop");
          }
          const cropDetails = await transactionalManager.findOne(CropEntity, {
            where: { ID: crop.ID },
          });

          if (cropDetails) {
            updatedCrops.push(cropDetails);
          }

          console.log("Updated Crop:", cropDetails);
        }

        return { Crops: updatedCrops };
      },
    );

    return result;
  },

  async syncManagementPeriodsBySequence(
    transactionalManager,
    cropID,
    userId,
    incomingPeriods,
  ) {
    const existingPeriods = await transactionalManager.find(
      ManagementPeriodEntity,
      { where: { CropID: cropID }, order: { CreatedOn: "ASC" } },
    );
    const updatedManagementPeriods = [],existingCount = existingPeriods.length,incomingCount = incomingPeriods.length;
    const minCount = Math.min(existingCount, incomingCount);
    for (let i = 0; i < minCount; i++) {
      const incoming = incomingPeriods[i],existing = existingPeriods[i];
      const { ID, CreatedByID, CreatedOn, CropID, ...dataToUpdate } = incoming;
      await transactionalManager.update(ManagementPeriodEntity, existing.ID, {
        ...dataToUpdate,
        ModifiedByID: userId,
        ModifiedOn: new Date(),
      });

      const updated = await transactionalManager.findOne(
        ManagementPeriodEntity,
        { where: { ID: existing.ID } },
      );
      if (updated) {updatedManagementPeriods.push(updated)}
    }
    for (let i = existingCount; i < incomingCount; i++) {
      const newPeriod = await transactionalManager.save(
        ManagementPeriodEntity,
        {
          ...incomingPeriods[i],
          CropID: cropID,
          CreatedByID: userId,
          CreatedOn: new Date(),
          ModifiedByID: userId,
          ModifiedOn: new Date(),
        },
      );
      if (newPeriod) {
        updatedManagementPeriods.push(newPeriod);
      }
    }
    for (let i = incomingCount; i < existingCount; i++) {
      const periodToDelete = existingPeriods[i];
      await transactionalManager.delete(OrganicManureEntity, {
        ManagementPeriodID: periodToDelete.ID,
      });
      await transactionalManager.delete(FertiliserManuresEntity, {
        ManagementPeriodID: periodToDelete.ID,
      });
      const recommendations = await transactionalManager.find(
        RecommendationEntity,
        {
          where: { ManagementPeriodID: periodToDelete.ID },
        },
      );
      for (const recommendation of recommendations) {
        await transactionalManager.delete(RecommendationCommentEntity, {
          RecommendationID: recommendation.ID,
        });
        await transactionalManager.delete(RecommendationEntity, {
          ID: recommendation.ID,
        });
      }
      await transactionalManager.delete(ManagementPeriodEntity, {
        ID: periodToDelete.ID,
      });
    }
    return updatedManagementPeriods;
  },

  async updateCropData(body, userId, request, transactionalManager) {
    // If a global transaction manager is provided, use it.
    if (transactionalManager) {
      const backgroundTasks = [];
      const updatedCrops = await this.updateCrop(body,userId,request,transactionalManager,backgroundTasks);
      return {updatedCrops, backgroundTasks};
    }
    const localBackgroundTasks = [];
    const localUpdatedCrops = await AppDataSource.transaction(
      async (localManager) => {
        return this.updateCrop(body,userId,request,localManager,localBackgroundTasks);
      },
    );
    cropMutationMethods.dispatchBackgroundTasks.call(this,localBackgroundTasks);
    return localUpdatedCrops;
  },

  dispatchBackgroundTasks(backgroundTasks) {
    if (!Array.isArray(backgroundTasks) || backgroundTasks.length === 0) {
      return;
    }

    const futureRecommendationKeys = new Set();
    const warningByCropKeys = new Set();

    for (const task of backgroundTasks) {
      if (task?.type === "futureRecommendation") {
        const futureRecommendationKey = `${task.fieldID}:${task.year}`;
        if (futureRecommendationKeys.has(futureRecommendationKey)) {
          continue;
        }

        futureRecommendationKeys.add(futureRecommendationKey);
        this.updatingFutureRecommendations
          .updateRecommendationsForField(
            task.fieldID,
            task.year,
            task.request,
            task.userId,
          )
          .catch((error) => {
            console.error(
              `Error updating next crop's recommendations for FieldID: ${task.fieldID}, Year: ${task.year}:`,
              error,
            );
          });
        continue;
      }

      if (task?.type === "warningByCrop") {
        const warningByCropKey = `${task.cropID}`;
        if (warningByCropKeys.has(warningByCropKey)) {
          continue;
        }

        warningByCropKeys.add(warningByCropKey);
        this.ProcessFutureManuresForWarnings.processWarningsByCrop(
          task.cropID,
          task.userId,
        ).catch((error) => {
          console.error(
            `Error processing warning recalculation for crop ${task.cropID}:`,
            error,
          );
        });
      }
    }
  },

  async updateCrop(body,userId, request, transactionalManager, backgroundTasks = null) {
    const updatedResults = [],cropData = body.Crops;
    for (const cropEntry of cropData) {
      const crop = cropEntry?.Crop;
      const { ID, CreatedByID, CreatedOn, ModifiedOn, ModifiedByID, EncryptedCounter, FieldName, IsDeleted,...updatedCropData} = crop;
      const cropUpdateResult = await transactionalManager.update(
        CropEntity,
        ID,
        { ...updatedCropData, ModifiedByID: userId, ModifiedOn: new Date() },
      );
      if (cropUpdateResult.affected === 0) {
        console.warn(`Crop with ID ${ID} not found`);
        continue;
      }
      const updatedCrop = await transactionalManager.findOne(CropEntity, {
        where: { ID: ID },
      });
      const rb209CountryID = await this.fetchRb209CountryId(crop.FieldID,transactionalManager);
      await this.validateAndHandleSecondCrop(transactionalManager,updatedCrop,updatedCrop.FieldID,updatedCrop.Year,rb209CountryID);
      const updatedManagementPeriods =await this.syncManagementPeriodsBySequence(transactionalManager,crop.ID,userId,cropEntry.ManagementPeriods);
      const organicManure = null;
      await this.generateRecommendations.generateRecommendations(updatedCrop.FieldID,updatedCrop.Year,
        organicManure, transactionalManager,
        request,userId
      );
      const nextAvailableCrop = await transactionalManager.findOne(CropEntity, {
        where: {
          FieldID: updatedCrop.FieldID,
          Year: MoreThan(updatedCrop.Year),
        },
        order: { Year: "ASC" },
      });
      console.log("nextAvailableCrop", nextAvailableCrop);
      if (nextAvailableCrop) {
        if (Array.isArray(backgroundTasks)) {
          backgroundTasks.push({
            type: "futureRecommendation",
            fieldID: updatedCrop.FieldID,
            year: nextAvailableCrop.Year,
            request,
            userId,
          });
        } else {
          this.updatingFutureRecommendations.updateRecommendationsForField(updatedCrop.FieldID,nextAvailableCrop.Year,request,userId)
            .catch((error) => {
              console.error(
                "Error updating next crop's recommendations:",
                error,
              );
            });
        }
      }
      if (Array.isArray(backgroundTasks)) {
        backgroundTasks.push({ type: "warningByCrop",cropID: updatedCrop.ID,userId});
      } else {
        this.ProcessFutureManuresForWarnings.processWarningsByCrop(
          updatedCrop.ID,
          userId,
        ).catch((error) => {
          console.error(
            `Error processing warning recalculation for crop ${updatedCrop.ID}:`,
            error,
          );
        });
      }
      if (updatedCrop) {
        updatedResults.push({crop: updatedCrop,ManagementPeriods: updatedManagementPeriods});
      }
    }
    return updatedResults;
  },

  async mergeCrop(userId, Crops, request) {
    const cropsWithID = {
      Crops: Crops.Crops.filter((crop) => crop.Crop.ID !== null),
    };
    const cropsWithoutID = Crops.Crops.filter((crop) => crop.Crop.ID === null);

    const cropIds = Crops.Crops.filter(
      (crop) => crop.Crop.ID !== null && crop.Crop.IsDeleted === true,
    ) // Adding condition for IsDeleted and ID not null
      .map((crop) => crop.Crop.ID);
    const result = await AppDataSource.transaction(
      async (transactionalManager) => {
        if (cropIds.length > 0) {
          for (const cropId of cropIds) {
            await this.deleteCrop(
              cropId,
              userId,
              request,
              transactionalManager,
            );
          }
        }
        const { backgroundTasks } = await this.updateCropData(
          cropsWithID,
          userId,
          request,
          transactionalManager,
        );

        const createdPlan =
          await this.planService.createNutrientsRecommendationForField(
            cropsWithoutID,
            userId,
            request,
            transactionalManager,
          );
        return {
          isSuccess: createdPlan != null,
          backgroundTasks,
        };
      },
    );

    cropMutationMethods.dispatchBackgroundTasks.call(
      this,
      result.backgroundTasks,
    );
    return result.isSuccess;
  },
};

module.exports = { cropMutationMethods };
