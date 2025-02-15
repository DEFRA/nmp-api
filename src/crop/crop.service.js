const { AppDataSource } = require("../db/data-source");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { BaseService } = require("../base/base.service");
const RB209ArableService = require("../vendors/rb209/arable/arable.service");
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

class CropService extends BaseService {
  constructor() {
    super(CropEntity);
    this.repository = AppDataSource.getRepository(CropEntity);
    this.managementPeriodRepository = AppDataSource.getRepository(
      ManagementPeriodEntity
    );
    this.rB209ArableService = new RB209ArableService();
    this.UpdateRecommendation = new UpdateRecommendation();

    this.farmRepository = AppDataSource.getRepository(FarmEntity);
    this.organicManureRepository =
      AppDataSource.getRepository(OrganicManureEntity);
    this.fertiliserRepository = AppDataSource.getRepository(
      FertiliserManuresEntity
    );
    this.MannerManureTypesService = new MannerManureTypesService();
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

  async updateCropByFieldYearAndConfirm(
    updatedCropData,
    userId,
    fieldId,
    year,
    confirm
  ) {
    // Convert confirm to integer for database (1 for true, 0 for false)
    const confirmValue = confirm ? 1 : 0;
    const result = await AppDataSource.transaction(
      async (transactionalManager) => {
        // Find the existing crop based on FieldID, Year, and Confirm
        const existingCrop = await transactionalManager.findOne(CropEntity, {
          where: { FieldID: fieldId, Year: year, Confirm: confirmValue },
        });

        if (!existingCrop) {
          throw boom.notFound(
            `Crop for FieldID ${fieldId}, Year ${year}, and Confirm ${confirm} not found`
          );
        }

        // Destructure out fields you don't want to update
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

        // Perform the update on the CropEntity using FieldID, Year, and Confirm
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

        // If needed, perform additional updates to related entities (e.g., Fields or any other logic)
        // Example:

        // Return the updated crop record
        const updatedCrop = await transactionalManager.findOne(CropEntity, {
          where: { FieldID: fieldId, Year: year, Confirm: confirmValue },
        });

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
    console.log("planssss", plans);

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
          `Error fetching crop details for FieldID: ${fieldId}`,
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
        const managementPeriod = await this.managementPeriodRepository.findOne({
          where: { CropID: cropId },
          select: ["ID"],
        });
        return managementPeriod ? managementPeriod.ID : null;
      } catch (error) {
        console.error(
          `Error fetching ManagementPeriodID for CropId: ${cropId}`,
          error
        );
        return null;
      }
    };

    const findOrganicManureData = async (managementPeriodId) => {
      try {
        const organicManureEntries = await this.organicManureRepository.find({
          where: { ManagementPeriodID: managementPeriodId },
        });
        return organicManureEntries;
      } catch (error) {
        console.error(
          `Error fetching organic manure data for ManagementPeriodID: ${managementPeriodId}`,
          error
        );
        return [];
      }
    };

    const findInorganicFertiliserData = async (managementPeriodId) => {
      try {
        const fertiliserEntries = await this.fertiliserRepository.find({
          where: { ManagementPeriodID: managementPeriodId },
        });
        return fertiliserEntries;
      } catch (error) {
        console.error(
          `Error fetching inorganic fertiliser data for ManagementPeriodID: ${managementPeriodId}`,
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

    const rainfall = await findFarmRainfall(farmId);
    const plansWithNames = await this.mapCropTypeIdWithTheirNames(plans);
    console.log("plansWithNames", plansWithNames);
    const cropDetails = await Promise.all(
      plansWithNames.map(async (plan) => {
        // const cropGroupId = findCropGroupId(plan.CropTypeID);
        // console.log("cropGroupId", cropGroupId);
        // const cropGroupName = cropGroupId
        //   ? await findCropGroupName(cropGroupId)
        //   : "Unknown";
        // console.log("cropGroupName", cropGroupName);
        console.log("plansWithNames", plansWithNames);
        const { PlantingDate } = await findCropDetailsFromRepo(plan.CropID);

        return {
          CropId: plan.CropID,
          CropTypeID: plan.CropTypeID,
          CropTypeName: plan.CropTypeName,
          // CropGroupID: cropGroupId,
          CropGroupName: plan.CropGroupName,
          FieldID: plan.FieldID,
          FieldName: plan.FieldName,
          CropVariety: plan.CropVariety,
          OtherCropName: plan.OtherCropName,
          CropInfo1: plan.CropInfo1,
          Yield: plan.Yield,
          LastModifiedOn: plan.LastModifiedOn,
          PlantingDate: PlantingDate,
        };
      })
    );
    console.log("cropDetails", cropDetails);
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
}

module.exports = { CropService };
