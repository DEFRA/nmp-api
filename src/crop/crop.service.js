const { AppDataSource } = require("../db/data-source");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { BaseService } = require("../base/base.service");
const RB209ArableService = require("../vendors/rb209/arable/arable.service");
const RB209GrassService = require("../vendors/rb209/grass/grass.service");
const boom = require("@hapi/boom");
const { StaticStrings } = require("../shared/static.string");
const { FarmEntity } = require("../db/entity/farm.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const MannerManureTypesService = require("../vendors/manner/manure-types/manure-types.service");
const {
  UpdateRecommendation,
} = require("../shared/updateRecommendation.service");
const { FieldEntity } = require("../db/entity/field.entity");
const { MoreThan } = require("typeorm");
const { In } = require("typeorm");
const {
  UpdateRecommendationChanges,
} = require("../shared/updateRecommendationsChanges");
const { SecondCropLinkingEntity } = require("../db/entity/second-crop-linking.entity");
class CropService extends BaseService {
  constructor() {
    super(CropEntity);
    this.repository = AppDataSource.getRepository(CropEntity);
    this.managementPeriodRepository = AppDataSource.getRepository(
      ManagementPeriodEntity
    );
    this.rB209ArableService = new RB209ArableService();
    this.rB209GrassService = new RB209GrassService();
    this.UpdateRecommendation = new UpdateRecommendation();

    this.farmRepository = AppDataSource.getRepository(FarmEntity);
    this.organicManureRepository =
      AppDataSource.getRepository(OrganicManureEntity);
    this.fertiliserRepository = AppDataSource.getRepository(
      FertiliserManuresEntity
    );
    this.MannerManureTypesService = new MannerManureTypesService();
    this.UpdateRecommendationChanges = new UpdateRecommendationChanges();
  }

  async createCropWithManagementPeriods(
    fieldId,
    cropData,
    managementPeriodData,
    userId
  ) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      const crop = this.repository.create({
        ...cropData,
        FieldID: fieldId,
        CreatedByID: userId,
      });
      const savedCrop = await transactionalManager.save(CropEntity, crop);
      const managementPeriods = [];
      for (const managementPeriod of managementPeriodData) {
        const createdManagementPeriod = this.managementPeriodRepository.create({
          ...managementPeriod,
          CropID: savedCrop.ID,
          CreatedByID: userId,
        });
        const savedManagementPeriod = await transactionalManager.save(
          ManagementPeriodEntity,
          createdManagementPeriod
        );
        managementPeriods.push(savedManagementPeriod);
      }
      return { Crop: savedCrop, ManagementPeriods: managementPeriods };
    });
  }
  async getCrops(fieldId, year, confirm) {
    const confirmValue = confirm ? 1 : 0;
    const cropData = await this.repository.findOne({
      where: {
        FieldID: fieldId,
        Year: year,
        Confirm: confirmValue,
      },
    });
    return cropData;
  }
  async getCropTypeDataByFieldAndYear(fieldId, year, confirm) {
    const cropData = await this.repository.findOne({
      where: {
        FieldID: fieldId,
        Year: year,
        Confirm: confirm,
      },
    });
    const cropTypeId = cropData?.CropTypeID;

    if (cropTypeId == null || cropTypeId == undefined) {
      throw boom.notFound(StaticStrings.HTTP_STATUS_NOT_FOUND);
    }
    const cropTypesList = await this.rB209ArableService.getData(
      "/Arable/CropTypes"
    );

    const cropType = cropTypesList.find(
      (cropType) => cropType.cropTypeId === cropTypeId
    );

    return {
      cropTypeId: cropType.cropTypeId,
      cropType: cropType.cropType,
    };
  }
  async validateAndHandleSecondCrop(
    transactionalManager,
    updatedCrop,
    fieldId,
    year
  ) {
    if (updatedCrop?.CropOrder !== 1) return;
  
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
          },
        }
      );
  
      if (!linking) {
        const storedProcedureSecondCrop = "EXEC dbo.spCrops_DeleteCrops @CropsID = @0";
        await AppDataSource.query(storedProcedureSecondCrop, [secondCrop.ID]);
      }
    }
  }
  
  async updateCropByFieldYearAndConfirm(
    updatedCropData,
    userId,
    fieldId,
    year,
    confirm
  ) {
    const confirmValue = confirm ? 1 : 0;

    const result = await AppDataSource.transaction(
      async (transactionalManager) => {
        const existingCrop = await transactionalManager.findOne(CropEntity, {
          where: { FieldID: fieldId, Year: year, Confirm: confirmValue },
        });

        if (!existingCrop) {
          throw boom.notFound(
            `Crop for FieldID ${fieldId}, Year ${year}, and Confirm ${confirm} not found`
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
          FieldID: cropFieldID,
          ...updateData
        } = updatedCropData;

        const updateResult = await transactionalManager.update(
          CropEntity,
          { FieldID: fieldId, Year: year, Confirm: confirmValue },
          {
            ...updateData,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
          }
        );

        if (updateResult.affected === 0) {
          throw boom.notFound(
            `Crop for FieldID ${fieldId}, Year ${year}, and Confirm ${confirmValue} not found`
          );
        }

        const updatedCrop = await transactionalManager.findOne(CropEntity, {
          where: { FieldID: fieldId, Year: year, Confirm: confirmValue },
        });

        await this.validateAndHandleSecondCrop(
          transactionalManager,
          updatedCrop,
          fieldId,
          year
        );


        return updatedCrop;
      }
    );

    return result;
  }

  // Other methods...
  async mapCropTypeIdWithTheirNames(plans) {
    try {
      const unorderedMap = {};
      const cropTypesList = await this.rB209ArableService.getData(
        "/Arable/CropTypes"
      );

      for (const cropType of cropTypesList) {
        unorderedMap[cropType.cropTypeId] = cropType.cropType;
      }

      for (const plan of plans) {
        plan.CropTypeName = unorderedMap[plan.CropTypeID] || null;
      }

      return plans;
    } catch (error) {
      console.error("Error mapping CropTypeId with their names:", error);
      throw error;
    }
  }
  async getOrganicAndInorganicDetails(farmId, harvestYear, request) {
    const storedProcedure =
      "EXEC dbo.spCrops_GetPlansByHarvestYear @farmId = @0, @harvestYear = @1";
    const plans = await this.executeQuery(storedProcedure, [
      farmId,
      harvestYear,
    ]);
    const cropTypesList = await this.rB209ArableService.getData(
      "/Arable/CropTypes"
    );
    const findCropGroupId = (cropTypeId) => {
      const cropType = cropTypesList.find(
        (crop) => crop.cropTypeId === cropTypeId
      );
      return cropType ? cropType.cropGroupId : null;
    };

    const findCropGroupName = async (cropGroupId) => {
      try {
        const cropGroupResponse = await this.rB209ArableService.getData(
          `/Arable/CropGroup/${cropGroupId}`
        );

        return cropGroupResponse.cropGroupName;
      } catch (error) {
        console.error(
          `Error fetching crop group name for ID: ${cropGroupId}`,
          error
        );
        return "Unknown";
      }
    };

    const findCropDetailsFromRepo = async (CropID) => {
      try {
        const cropRecord = await this.repository.findOne({
          where: { ID: CropID },
        });
        return {
          PlantingDate: cropRecord ? cropRecord.SowingDate : null,
        };
      } catch (error) {
        console.error(
          `Error fetching crop details for CropID: ${CropID}`,
          error
        );
        return {
          CropId: null,
          PlantingDate: null,
        };
      }
    };

    const findManagementPeriodId = async (cropId) => {
      try {
        const managementPeriods = await this.managementPeriodRepository.find({
          where: { CropID: cropId },
          select: ["ID"],
        });

        return managementPeriods.map((period) => period.ID);
      } catch (error) {
        console.error(
          `Error fetching ManagementPeriodIDs for CropId: ${cropId}`,
          error
        );
        return [];
      }
    };
    const findOrganicManureData = async (managementPeriodIds) => {
      try {
        const organicManureEntries = await this.organicManureRepository.find({
          where: {
            ManagementPeriodID: In(managementPeriodIds),
          },
        });
        return organicManureEntries;
      } catch (error) {
        console.error(
          `Error fetching organic manure data for ManagementPeriodIDs: ${managementPeriodIds}`,
          error
        );
        return [];
      }
    };

    const findInorganicFertiliserData = async (managementPeriodIds) => {
      try {
        const fertiliserEntries = await this.fertiliserRepository.find({
          where: {
            ManagementPeriodID: In(managementPeriodIds),
          },
        });
        return fertiliserEntries;
      } catch (error) {
        console.error(
          `Error fetching inorganic fertiliser data for ManagementPeriodIDs: ${managementPeriodIds}`,
          error
        );
        return [];
      }
    };
    const findFarmRainfall = async (farmId) => {
      try {
        const farmRecord = await this.farmRepository.findOne({
          where: { ID: farmId },
          select: ["Rainfall"],
        });
        return farmRecord ? farmRecord.Rainfall : null;
      } catch (error) {
        console.error(`Error fetching rainfall for farmId: ${farmId}`, error);
        return null;
      }
    };

    const findDefoliationSequenceDescription = async (
      swardManagementId,
      PotentialCut,
      DefoliationSequenceID,
      establishment
    ) => {
      try {
        let newSward = establishment == 0 || null ? false : true;
        let defoliationSequenceDescription = null;
        let defoliationSequenceList = await this.rB209GrassService.getData(
          `Grass/DefoliationSequence/${swardManagementId}/${PotentialCut}/${newSward}`
        );

        if (
          defoliationSequenceList.data &&
          Array.isArray(defoliationSequenceList.data.list) &&
          defoliationSequenceList.data.list.length > 0
        ) {
          const matchingDefoliation = defoliationSequenceList.data.list.find(
            (x) => x.defoliationSequenceId === DefoliationSequenceID
          );
          if (matchingDefoliation != null) {
            defoliationSequenceDescription = matchingDefoliation
              ? matchingDefoliation.defoliationSequenceDescription
              : null;
          }
        }

        return defoliationSequenceDescription;
      } catch (error) {
        console.error(
          `Error fetching Defoliation Sequence for swardTypeId: ${SwardTypeID}&numberOfCuts=${PotentialCut}`,
          error
        );
        return "Unknown";
      }
    };
    const rainfall = await findFarmRainfall(farmId);
    const plansWithNames = await this.mapCropTypeIdWithTheirNames(plans);

    const cropDetails = [];

    for (const plan of plansWithNames) {
      const { PlantingDate } = await findCropDetailsFromRepo(plan.CropID);

      let defoliationSequenceDescription = null;

      if (
        plan.SwardTypeID != null &&
        plan.PotentialCut != null &&
        plan.DefoliationSequenceID != null
      ) {
        defoliationSequenceDescription =
          await findDefoliationSequenceDescription(
            plan.SwardManagementID,
            plan.PotentialCut,
            plan.DefoliationSequenceID,
            plan.Establishment
          );
      }

      cropDetails.push({
        CropId: plan.CropID,
        CropTypeID: plan.CropTypeID,
        CropTypeName: plan.CropTypeName,
        CropGroupName: plan.CropGroupName,
        FieldID: plan.FieldID,
        FieldName: plan.FieldName,
        CropVariety: plan.CropVariety,
        OtherCropName: plan.OtherCropName,
        CropInfo1: plan.CropInfo1,
        CropInfo2: plan.CropInfo2,
        Yield: plan.Yield,
        LastModifiedOn: plan.LastModifiedOn,
        PlantingDate: PlantingDate,
        Management: defoliationSequenceDescription,
      });
    }

    const organicMaterials = await Promise.all(
      cropDetails.map(async (crop) => {
        // Fetch the management period ID for the crop
        const managementPeriodId = await findManagementPeriodId(crop.CropId);

        // Fetch the organic manure data if management period ID exists
        const organicManureData = managementPeriodId
          ? await findOrganicManureData(managementPeriodId)
          : [];

        // Process each organicManure entry asynchronously
        return Promise.all(
          organicManureData.map(async (organicManure) => {
            // Fetch the manure type data from MannerManureTypesService
            let mannerManureTypeData = {};
            try {
              const manureTypeResponse =
                await this.MannerManureTypesService.getData(
                  `/manure-types/${organicManure.ManureTypeID}`,
                  request
                );

              mannerManureTypeData = manureTypeResponse.data;
            } catch (error) {
              console.error(
                `Error fetching manure type for ID: ${organicManure.ManureTypeID}`,
                error
              );
            }

            // Return the organic manure data with TypeOfManure fetched from the API
            return {
              OrganicMaterialId: organicManure.ID,
              ApplicationDate: organicManure.ApplicationDate,
              Field: crop.FieldName,
              FieldId: crop.FieldID,
              Crop: crop.CropTypeName,
              TypeOfManure: mannerManureTypeData.name, // Set the fetched manure type name here
              Rate: organicManure.ApplicationRate,
            };
          })
        );
      })
    );

    // Flatten the result (since Promise.all returns an array of arrays)
    const flattenedOrganicMaterials = organicMaterials.flat();

    const inorganicFertiliserApplications = await Promise.all(
      cropDetails.map(async (crop) => {
        const managementPeriodId = await findManagementPeriodId(crop.CropId);
        const fertiliserData = managementPeriodId
          ? await findInorganicFertiliserData(managementPeriodId)
          : [];
        return fertiliserData.map((fertiliser) => ({
          InorganicFertiliserId: fertiliser.ID,
          ApplicationDate: fertiliser.ApplicationDate,
          Field: crop.FieldName,
          Crop: crop.CropTypeName,
          N: fertiliser.N,
          P2O5: fertiliser.P2O5,
          K2O: fertiliser.K2O,
          MgO: fertiliser.MgO,
          SO3: fertiliser.SO3,
          Na2O: fertiliser.Na2O,
          Lime: fertiliser.Lime,
          NH4N: fertiliser.NH4N,
          NO3N: fertiliser.NO3N,
        }));
      })
    );

    return {
      farmDetails: {
        rainfall: rainfall || "Unknown",
      },
      CropDetails: cropDetails,
      OrganicMaterial: flattenedOrganicMaterials,
      InorganicFertiliserApplication: inorganicFertiliserApplications.flat(),
    };
  }
  async deleteCropById(CropsID, userId, request) {
    const crop = await this.repository.findOneBy({
      ID: CropsID,
    });

    // Construct the stored procedure to delete a single crop by its ID
    const storedProcedure = "EXEC dbo.spCrops_DeleteCrops @CropsID = @0";
    // If the crop's CropOrder is 1, check for a second crop (CropOrder = 2) in the same year
    if (crop.CropOrder === 1) {
      const secondCrop = await this.repository.findOne({
        where: {
          Year: crop.Year,
          CropOrder: 2, // Find the second crop with CropOrder 2
          FieldID: crop.FieldID,
        },
      });

      // If the second crop exists, delete it
      if (secondCrop) {
        const storedProcedureSecondCrop =
          "EXEC dbo.spCrops_DeleteCrops @CropsID = @0";
        await AppDataSource.query(storedProcedureSecondCrop, [secondCrop.ID]);
      }
    }

    // Pass the individual cropId to the stored procedure
    await AppDataSource.query(storedProcedure, [CropsID]);

    // Check if there are any records in the repository for crop.FieldID with a year greater than crop.Year
    const nextAvailableCrop = await this.repository.findOne({
      where: {
        FieldID: crop.FieldID,
        Year: MoreThan(crop.Year), // Find the next available year greater than the current crop.Year
      },
      order: {
        Year: "ASC", // Ensure we get the next immediate year
      },
    });
    if (nextAvailableCrop) {
      this.UpdateRecommendation.updateRecommendationsForField(
        crop.FieldID,
        nextAvailableCrop.Year,
        request,
        userId
      )
        .then((res) => {
          if (res === undefined) {
            console.log(
              "updateRecommendationAndOrganicManure returned undefined"
            );
          } else {
            console.log("updateRecommendationAndOrganicManure result:", res);
          }
        })
        .catch((error) => {
          console.error(
            "Error updating recommendation and organic manure:",
            error
          );
        });
    }
  }

  async CropGroupNameExists(cropIds, newGroupName, year, farmId) {
    return (
      (await this.existingGroupNameCount(cropIds, newGroupName, year, farmId)) >
      0
    );
  }
  async existingGroupNameCount(cropIds, newGroupName, year, farmId) {
    if (!newGroupName) {
      throw boom.badRequest("Group Name is required");
    }

    const existingGroupNameCount = await this.repository
      .createQueryBuilder("Crops")
      .leftJoin("Fields", "Field", "Field.ID = Crops.fieldId") // Join Fields table manually
      .leftJoin("Farms", "Farm", "Farm.ID = Field.farmId") // Join Farms table manually
      .where("Crops.CropGroupName = :groupName", {
        groupName: newGroupName.trim(),
      })
      .andWhere("Farm.ID = :farmId", { farmId }) // Use farmId passed in
      .andWhere("Crops.Year = :year", { year })
      .andWhere("Crops.ID NOT IN (:...cropIds)", { cropIds });

    return await existingGroupNameCount.getCount();
  }

  async updateCropGroupName(cropIds, cropGroupName, variety, year, userId) {
    console.log("cropGroupName", cropGroupName);
    const result = await AppDataSource.transaction(
      async (transactionalManager) => {
        const existingCrops = await transactionalManager.find(CropEntity, {
          where: { ID: In(cropIds), Year: year },
        });

        if (!existingCrops || existingCrops.length === 0) {
          throw boom.notFound(
            `No crops found for cropIds ${cropIds.join(", ")} in Year ${year}`
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
            }
          );
          if (updatedCrop.affected === 0) {
            throw boom.notFound(`Failed to update Crop with ID ${crop.ID}`);
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
      }
    );

    return result;
  }

  async updateCrop(body, userId, request) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      const updatedResults = [];
      const cropData = body.Crops;

      for (const cropEntry of cropData) {
        const crop = cropEntry?.Crop;
        const {
          ID,
          CreatedByID,
          CreatedOn,
          ModifiedOn,
          ModifiedByID,
          EncryptedCounter,
          FieldName,
          ...updatedCropData
        } = crop;

        // Update the crop record
        const cropUpdateResult = await transactionalManager.update(
          CropEntity,
          ID,
          {
            ...updatedCropData,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
          }
        );

        if (cropUpdateResult.affected === 0) {
          console.warn(`Crop with ID ${ID} not found`);
          continue;
        }

        const updatedCrop = await transactionalManager.findOne(CropEntity, {
          where: { ID: ID },
        });

        await this.validateAndHandleSecondCrop(
          transactionalManager,
          updatedCrop,
          updatedCrop.FieldID,
          updatedCrop.Year
        );

        // Update ManagementPeriods for this crop
        const updatedManagementPeriods = [];

        for (const period of cropEntry.ManagementPeriods || []) {
          const {
            ID: periodID,
            CreatedByID,
            CreatedOn,
            ...periodDataToUpdate
          } = period;

          if (periodID) {
            await transactionalManager.update(
              ManagementPeriodEntity,
              periodID,
              {
                ...periodDataToUpdate,
                ModifiedByID: userId,
                ModifiedOn: new Date(),
              }
            );

            const updatedPeriod = await transactionalManager.findOne(
              ManagementPeriodEntity,
              {
                where: { ID: periodID },
              }
            );

            if (updatedPeriod) {
              updatedManagementPeriods.push(updatedPeriod);
            }
          } else {
            throw new Error(
              `ManagementPeriod for CropID ${ID} missing ID — cannot update.`
            );
          }
        }

        // Recommendation update
        await this.UpdateRecommendationChanges.updateRecommendationAndOrganicManure(
          updatedCrop.FieldID,
          updatedCrop.Year,
          request,
          userId,
          transactionalManager
        );

        const nextAvailableCrop = await transactionalManager.find(CropEntity, {
          where: {
            FieldID: updatedCrop.FieldID,
            Year: MoreThan(updatedCrop.Year),
          },
          order: { Year: "ASC" },
          take: 1, // ensures only the first (earliest) one is returned
        });

        if (nextAvailableCrop.Year) {
          this.UpdateRecommendation.updateRecommendationsForField(
            updatedCrop.FieldID,
            nextAvailableCrop.Year,
            request,
            userId
          ).catch((error) => {
            console.error("Error updating next crop's recommendations:", error);
          });
        }

        // Final result: pair crop with its periods
        if (updatedCrop) {
          updatedResults.push({
            crop: updatedCrop,
            ManagementPeriods: updatedManagementPeriods,
          });
        }
      }

      return updatedResults;
    });
  }
}

module.exports = { CropService };
