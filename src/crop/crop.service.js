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
const { MoreThan, Between } = require("typeorm");
const { In } = require("typeorm");
const {
  UpdateRecommendationChanges,
} = require("../shared/updateRecommendationsChanges");
const { SecondCropLinkingEntity } = require("../db/entity/second-crop-linking.entity");
const { CountryEntity } = require("../db/entity/country.entity");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const RB209SoilService = require("../vendors/rb209/soil/soil.service");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { GrassGrowthService } = require("../grass-growth-plan/grass-growth-plan.service");
const { CropOrderMapper } = require("../constants/crop-order-mapper");
const { ExcessRainfallsEntity } = require("../db/entity/excess-rainfalls.entity");
const { CalculateGrassHistoryAndPreviousGrass } = require("../shared/calculate-previous-grass-id.service");
const { FieldTypeMapper } = require("../constants/field-type-mapper");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const { CalculateMannerOutputService } = require("../shared/calculate-manner-output-service");
const { RecommendationCommentEntity } = require("../db/entity/recommendation-comment.entity");
const { NutrientMapperNames } = require("../constants/nutrient-mapper-names");
const { RB209RecommendationService } = require("../vendors/rb209/recommendation/recommendation.service");
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
    this.RB209SoilService = new RB209SoilService();
    this.grassGrowthClass = new GrassGrowthService();
    this.calculateGrassId = new CalculateGrassHistoryAndPreviousGrass();
    this.CalculateMannerOutput = new CalculateMannerOutputService();
    this.rB209RecommendationService = new RB209RecommendationService();
    this.farmRepository = AppDataSource.getRepository(FarmEntity);
    this.organicManureRepository =
      AppDataSource.getRepository(OrganicManureEntity);
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.recommendationRepository =
      AppDataSource.getRepository(RecommendationEntity);
    this.fertiliserRepository = AppDataSource.getRepository(
      FertiliserManuresEntity
    );
    this.MannerManureTypesService = new MannerManureTypesService();
    this.UpdateRecommendationChanges = new UpdateRecommendationChanges();
    this.recommendationCommentRepository = AppDataSource.getRepository(
      RecommendationCommentEntity
    );
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

  async filterBySingleSequenceId(data, sequenceId) {
    const filteredCalculations = data.calculations.filter(
      (item) => item.sequenceId === sequenceId
    );

    const filteredAdviceNotes = data.adviceNotes.filter(
      (item) => item.sequenceId === sequenceId
    );

    return {
      ...data,
      calculations: filteredCalculations,
      adviceNotes: filteredAdviceNotes,
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
        const storedProcedureSecondCrop =
          "EXEC dbo.spCrops_DeleteCrops @CropsID = @0";
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
              ManureTypeId: organicManure.ManureTypeID,
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
  // Function to find indexId by matching index values
  async findIndexId(nutrient, indexValue, nutrientIndicesData) {
    // Return null immediately if indexValue is null
    if (indexValue === null) {
      return null;
    }
    const nutrientData = nutrientIndicesData[nutrient];

    // Special case for Potassium (nutrientId = 2)
    if (nutrient === "Potassium") {
      // Check if indexValue is 2 and match with "2+"
      if (indexValue === 2) {
        for (const data of nutrientData) {
          if (data.index.trim() === "2+") {
            return data.indexId;
          }
        }
      }

      // Check if indexValue is -2 and match with "2-"
      if (indexValue === -2) {
        for (const data of nutrientData) {
          if (data.index.trim() === "2-") {
            return data.indexId;
          }
        }
      }
    }

    for (const data of nutrientData) {
      if (data.index.trim() === indexValue.toString()) {
        return data.indexId;
      }
    }
    return null; // Return null if no match is found
  }

  async assignIndexIdToSoilRecords(soilAnalysisRecords, rb209CountryId) {
    const nutrientIndicesData = {};

    // Loop through each soil analysis record
    for (const record of soilAnalysisRecords) {
      // Loop through NutrientMapper to process each nutrient
      for (const nutrient of NutrientMapperNames) {
        const { nutrientId, nutrient: nutrientName, countryId } = nutrient;

        // Fetch data for each nutrient and country
        const getNutrientData = await this.RB209SoilService.getData(
          `Soil/Methodologies/${nutrientId}/${countryId}`
        );

        const methodologyId = getNutrientData[0]?.methodologyId;

        if (methodologyId != null) {
          // Use dynamic countryId for the NutrientIndices API call
          nutrientIndicesData[nutrientName] =
            await this.RB209SoilService.getData(
              `Soil/NutrientIndices/${nutrientId}/${methodologyId}/${rb209CountryId}`
            );
        }

        // Dynamically assign indexId to each nutrient in soil analysis record
        const nutrientIndexKey = `${nutrientName}Index`; // e.g., "PhosphateIndex"
        if (record[nutrientIndexKey] !== undefined) {
          const nutrientIndexId = await this.findIndexId(
            nutrientName,
            record[nutrientIndexKey],
            nutrientIndicesData
          );
          console.log(`${nutrientName}IndexId`, nutrientIndexId);
          record[nutrientIndexKey] =
            nutrientIndexId || record[nutrientIndexKey]; // Update the index with indexId
        }
      }
    }

    return soilAnalysisRecords;
  }

  async handleSoilAnalysisValidation(
    fieldId,
    fieldName,
    year,
    rb209CountryId,
    transactionalManager
  ) {
    const errors = [];
    const fiveYearsAgo = year - 4;

    // Inside your transaction block and crop loop
    const soilAnalysisRecordsFiveYears = await transactionalManager.find(
      SoilAnalysisEntity,
      {
        where: {
          FieldID: fieldId,
          Year: Between(fiveYearsAgo, year), // Replace with actual variables
        },
        order: { Date: "DESC" },
      }
    );

    // Define the fields we want the latest values for
    const fieldsToTrack = [
      "PH",
      "SoilNitrogenSupplyIndex",
      "PhosphorusIndex",
      "PotassiumIndex",
      "MagnesiumIndex",
    ];

    // Initialize the latest values object
    const latestSoilAnalysis = {};
    if (soilAnalysisRecordsFiveYears.length > 0) {
      fieldsToTrack.forEach((field) => {
        latestSoilAnalysis[field] = null;

        // Find the first record in descending date order where the field has a value
        const latestRecordWithFieldValue = soilAnalysisRecordsFiveYears.find(
          (record) => record[field] !== null && record[field] !== undefined
        );

        // if (latestRecordWithFieldValue) {

        if (latestRecordWithFieldValue) {
          latestSoilAnalysis[field] = latestRecordWithFieldValue[field];
        } else {
          // Explicitly set the field to null if no value was found
          latestSoilAnalysis[field] = null;
        }
      });
    }
    // Iterate over the fields and find the latest value for each field

    const soilAnalysisRecords = await this.assignIndexIdToSoilRecords(
      soilAnalysisRecordsFiveYears,
      rb209CountryId
    );

    return { latestSoilAnalysis, errors, soilAnalysisRecords };
  }

  async savedDefault(
    cropData,
    userId,
    transactionalManager,
    managementPeriods,
    harvestYear,
    isOrganic,
    isFertiliser
  ) {
    const ManagementPeriods = [];
    const OrganicManures = [];
    const FertiliserManures = [];
    const OldToNewManagementPeriodMap = {};

    // 1. Save the new Crop
    const savedCrop = await transactionalManager.save(
      CropEntity,
      this.cropRepository.create({
        ...cropData.Crop,
        ID: null,
        FieldID: cropData.FieldID,
        Year: harvestYear,
        CreatedByID: userId,
      })
    );

    // 2. Copy and save all management periods, map old to new
    for (const oldPeriod of managementPeriods) {
      const newPeriod = {
        ...oldPeriod,
        ID: null,
        CropID: savedCrop.ID,
        CreatedByID: userId,
      };

      const savedPeriod = await transactionalManager.save(
        ManagementPeriodEntity,
        newPeriod
      );

      OldToNewManagementPeriodMap[oldPeriod.ID] = savedPeriod.ID;
      ManagementPeriods.push(savedPeriod);
    }

    // 3. Copy OrganicManure if isOrganic is true
    if (isOrganic) {
      for (const oldPeriod of managementPeriods) {
        const organicManures = await transactionalManager.find(
          OrganicManureEntity,
          {
            where: { ManagementPeriodID: oldPeriod.ID },
          }
        );

        for (const manure of organicManures) {
          const newManure = {
            ...manure,
            ID: null,
            ManagementPeriodID: OldToNewManagementPeriodMap[oldPeriod.ID],
            CreatedByID: userId,
            CreatedByID: new Date(),
          };

          const savedManure = await transactionalManager.save(
            OrganicManureEntity,
            newManure
          );

          OrganicManures.push(savedManure);
        }
      }
    }

    // 4. Copy FertiliserManures if isFertiliser is true
    if (isFertiliser) {
      for (const oldPeriod of managementPeriods) {
        const fertilisers = await transactionalManager.find(
          FertiliserManuresEntity,
          {
            where: { ManagementPeriodID: oldPeriod.ID },
          }
        );

        for (const fert of fertilisers) {
          const newFert = {
            ...fert,
            ID: null,
            ManagementPeriodID: OldToNewManagementPeriodMap[oldPeriod.ID],
            CreatedByID: userId,
            CreatedOn: new Date(),
          };

          const savedFert = await transactionalManager.save(
            FertiliserManuresEntity,
            newFert
          );

          FertiliserManures.push(savedFert);
        }
      }
    }

    // 5. Return everything copied
    return {
      Crop: savedCrop,
      ManagementPeriods,
      OrganicManures,
      FertiliserManures,
    };
  }

  async createOrUpdatePKBalance(
    fieldId,
    crop,
    calculations,
    pkBalanceData,
    userId
  ) {
    try {
      let pBalance = 0;
      let kBalance = 0;
      let saveAndUpdatePKBalance;
      if (crop.CropTypeID === CropTypeMapper.OTHER || crop.CropInfo1 === null) {
      } else {
        for (const recommendation of calculations) {
          switch (recommendation.nutrientId) {
            case 1:
              pBalance = pBalance - recommendation.cropNeed;
              break;
            case 2:
              kBalance = kBalance - recommendation.cropNeed;
              break;
          }
        }
      }

      if (pkBalanceData) {
        const updateData = {
          Year: crop?.Year,
          FieldID: fieldId,
          PBalance: pBalance,
          KBalance: kBalance,
        };
        saveAndUpdatePKBalance = {
          ...pkBalanceData,
          ...updateData,
          ModifiedOn: new Date(),
          ModifiedByID: userId,
        };
      } else {
        saveAndUpdatePKBalance = {
          Year: crop?.Year,
          FieldID: fieldId,
          PBalance: pBalance,
          KBalance: kBalance,
          CreatedOn: new Date(),
          CreatedByID: userId,
        };
      }
      return { saveAndUpdatePKBalance };
    } catch (error) {
      console.error("Error while saving pkBalance data", error);
      throw error;
    }
  }

  async getFirstCropData(transactionalManager, FieldID, Year) {
    const data = await transactionalManager.findOne(CropEntity, {
      where: {
        FieldID: FieldID,
        Year: Year,
        Confirm: false, // Or 0 if using numeric
        CropOrder: CropOrderMapper.FIRSTCROP,
      },
    });
    return data;
  }

  async buildArableBody(crop, field, transactionalManager) {
    const arableBody = [];

    // Fetch cropType for the current crop (CropOrder 1 or 2)
    const cropTypesList = await this.rB209ArableService.getData(
      "/Arable/CropTypes"
    );
    const currentCropType = cropTypesList.find(
      (cropType) => cropType.cropTypeId === crop.CropTypeID
    );

    if (!currentCropType || currentCropType.cropGroupId === null) {
      throw new HttpException(
        `Invalid CropTypeId for crop having field name ${field.Name}`,
        HttpStatus.BAD_REQUEST
      );
    }

    // If CropOrder is 1, add only the current crop's data
    if (
      crop.CropOrder === CropOrderMapper.FIRSTCROP &&
      crop.CropTypeID !== CropTypeMapper.GRASS
    ) {
      arableBody.push({
        cropOrder: crop.CropOrder,
        cropGroupId: currentCropType.cropGroupId,
        cropTypeId: crop.CropTypeID,
        cropInfo1Id: crop.CropInfo1,
        cropInfo2Id: crop.CropInfo2,
        sowingDate: crop.SowingDate,
        expectedYield: crop.Yield,
      });
    }

    // If CropOrder is 2, find the crop with CropOrder 1 and add both crops
    if (crop.CropOrder === CropOrderMapper.SECONDCROP) {
      // Find the previous crop with CropOrder 1

      const previousCrop = await this.getFirstCropData(
        transactionalManager,
        field.ID,
        crop.Year
      );

      if (previousCrop && previousCrop.CropTypeID !== CropTypeMapper.GRASS) {
        // Fetch cropType for the previous crop
        const previousCropType = cropTypesList.find(
          (cropType) => cropType.cropTypeId === previousCrop.CropTypeID
        );

        if (!previousCropType || previousCropType.cropGroupId === null) {
          throw new HttpException(
            `Invalid CropTypeId for previous crop having field name ${field.Name}`,
            HttpStatus.BAD_REQUEST
          );
        }

        // Add CropOrder 1 (previous crop)
        arableBody.push({
          cropOrder: previousCrop.CropOrder,
          cropGroupId: previousCropType.cropGroupId,
          cropTypeId: previousCrop.CropTypeID,
          cropInfo1Id: previousCrop.CropInfo1,
          cropInfo2Id: previousCrop.CropInfo2,
          sowingDate: previousCrop.SowingDate,
          expectedYield: previousCrop.Yield,
        });
      }

      if (crop.CropTypeID !== CropTypeMapper.GRASS) {
        // Add CropOrder 2 (current crop)
        arableBody.push({
          cropOrder: crop.CropOrder,
          cropGroupId: currentCropType.cropGroupId,
          cropTypeId: crop.CropTypeID,
          cropInfo1Id: crop.CropInfo1,
          cropInfo2Id: crop.CropInfo2,
          sowingDate: crop.SowingDate,
          expectedYield: crop.Yield,
        });
      }
    }

    return arableBody;
  }

  async findPreviousCrop(fieldID, currentYear, transactionalManager) {
    // Find all crops from the previous year for the field
    const previousCrops = await transactionalManager.find(CropEntity, {
      where: {
        FieldID: fieldID,
        Year: currentYear - 1,
      },
    });

    // Check if previousCrops is a non-empty array
    if (Array.isArray(previousCrops) && previousCrops.length > 0) {
      if (previousCrops.length > 1) {
        // If more than one crop, return the one with CropOrder = 2
        return previousCrops.find(
          (crop) => crop.CropOrder === CropOrderMapper.SECONDCROP
        );
      }

      // Only one crop found, return the first one
      return previousCrops[0];
    }

    // No crops found
    return null;
  }

  async getWinterExcessRainfall(farmId, year, transactionalManager) {
    const excessRainfall = await transactionalManager.findOne(
      ExcessRainfallsEntity,
      {
        where: {
          FarmID: farmId,
          Year: year,
        },
      }
    );
    if (excessRainfall) {
      return excessRainfall;
    } else {
      return null;
    }
  }

  async buildGrassObject(crop, field, grassGrowthClass, transactionalManager) {
    // Case: Only one crop with CropOrder 1 and CropTypeID 140
    if (
      crop.CropOrder === CropOrderMapper.FIRSTCROP &&
      crop.CropTypeID === CropTypeMapper.GRASS
    ) {
      return {
        cropOrder: crop.CropOrder,
        swardTypeId: crop.SwardTypeID,
        swardManagementId: crop.SwardManagementID,
        defoliationSequenceId: crop.DefoliationSequenceID,
        grassGrowthClassId: grassGrowthClass.grassGrowthClassId,
        yield: crop.Yield,
        seasonId: crop.Establishment,
      };
    }

    // Case: CropOrder is 2 and it's grass
    if (crop.CropOrder === CropOrderMapper.SECONDCROP) {
      if (crop.CropTypeID === CropTypeMapper.GRASS) {
        return {
          cropOrder: crop.CropOrder,
          swardTypeId: crop.SwardTypeID,
          swardManagementId: crop.SwardManagementID,
          defoliationSequenceId: crop.DefoliationSequenceID,
          grassGrowthClassId: grassGrowthClass.grassGrowthClassId,
          yield: crop.Yield,
          seasonId: crop.Establishment,
        };
      } else {
        // Look up CropOrder 1
        const firstCrop = await this.getFirstCropData(
          transactionalManager,
          field.ID,
          crop.Year
        );

        if (firstCrop && firstCrop.CropTypeID === CropTypeMapper.GRASS) {
          return {
            cropOrder: firstCrop.CropOrder,
            swardTypeId: firstCrop.SwardTypeID,
            swardManagementId: firstCrop.SwardManagementID,
            defoliationSequenceId: firstCrop.DefoliationSequenceID,
            grassGrowthClassId: grassGrowthClass.grassGrowthClassId,
            yield: firstCrop.Yield,
            seasonId: firstCrop.Establishment,
          };
        }
      }
    }

    // Default return
    return {};
  }

  async determineFieldType(crop, transactionalManager) {
    let crops;

    // Check if it's a single crop or already an array of crops
    if (Array.isArray(crop)) {
      crops = crop;
    } else {
      // Fetch all crops for the same FieldID and Year
      crops = await transactionalManager.find(CropEntity, {
        where: { FieldID: crop.FieldID, Year: crop.Year },
      });

      // If only one crop found in DB, use it
      if (crops.length === 0 && crop?.CropTypeID) {
        crops = [crop]; // fallback to single crop passed
      }
    }

    if (crops.length === 1) {
      const cropTypeID = crops[0].CropTypeID;
      if (cropTypeID === CropTypeMapper.GRASS) {
        return FieldTypeMapper.GRASS; // Grass
      } else if (
        cropTypeID !== CropTypeMapper.GRASS &&
        cropTypeID !== CropTypeMapper.OTHER
      ) {
        return FieldTypeMapper.ARABLE;
      }
    }

    if (crops.length === 2) {
      const cropTypeIDs = crops.map((c) => c.CropTypeID);
      const isBothGrass = cropTypeIDs.every(
        (id) => id === CropTypeMapper.GRASS
      );
      const isOneGrass = cropTypeIDs.includes(CropTypeMapper.GRASS);
      const isOtherValid = cropTypeIDs.some(
        (id) => id !== CropTypeMapper.GRASS && id !== CropTypeMapper.GRASS
      );
      const isBothArable = cropTypeIDs.every(
        (id) => id !== CropTypeMapper.GRASS
      );

      if (isBothGrass) return FieldTypeMapper.GRASS;
      if (isOneGrass && isOtherValid) return FieldTypeMapper.BOTH;
      if (isBothArable) return FieldTypeMapper.ARABLE;
    }

    return FieldTypeMapper.ARABLE; // Default fallback
  }

  async isGrassCropPresent(crop, transaction) {
    if (crop.CropOrder === CropOrderMapper.FIRSTCROP) {
      if (crop.CropTypeID === CropTypeMapper.GRASS) {
        return true;
      } else {
        return false;
      }
    } else if (crop.CropOrder === CropOrderMapper.SECONDCROP) {
      if (crop.CropTypeID === CropTypeMapper.GRASS) {
        return true;
      } else {
        const firstCropData = await this.getFirstCropData(
          transaction,
          crop.FieldID,
          crop.Year
        );
        if (firstCropData.CropTypeID === CropTypeMapper.GRASS) {
          return true;
        } else {
          return false;
        }
      }
    }
  }

  async extractNutrientData(calculations, defoliationId) {
    return calculations.filter((c) => c.defoliationId === defoliationId);
  }

  async buildNutrientRecommendationReqBody(
    field,
    farm,
    soilAnalysis,
    snsAnalysesData,
    crop,
    rb209CountryId,
    request,
    transactionalManager,
    harvestYear,
    mannerOutput
  ) {
    const cropTypesList = await this.rB209ArableService.getData(
      "/Arable/CropTypes"
    );

    const grassGrowthClass =
      await this.grassGrowthClass.calculateGrassGrowthClassByFieldId(
        field.ID,
        request
      );
    const cropType = cropTypesList.find(
      (cropType) => cropType.cropTypeId === crop.CropTypeID
    );

    if (!cropType || cropType.cropGroupId === null) {
      throw boom.HttpException(
        `Invalid CropTypeId for crop having field name ${field.Name}`,
        HttpStatus.BAD_REQUEST
      );
    }

    const previousCrop = await this.findPreviousCrop(
      field.ID,
      harvestYear,
      transactionalManager
    );

    // Use the buildArableBody function to get the arable array
    const arableBody = await this.buildArableBody(
      crop,
      field,
      transactionalManager
    );
    const grassObject = await this.buildGrassObject(
      crop,
      field,
      grassGrowthClass,
      transactionalManager
    );

    const pkBalanceData = await transactionalManager.findOne(PKBalanceEntity, {
      where: {
        FieldID: crop.FieldID,
        Year: harvestYear - 1,
      },
    });

    const excessRainfall = await this.getWinterExcessRainfall(
      farm.ID,
      harvestYear,
      transactionalManager
    );

    const fieldType = await this.determineFieldType(crop, transactionalManager);
    let grassHistoryID = null;
    let previousGrassId = null;
    if (crop.CropTypeID == CropTypeMapper.GRASS) {
      grassHistoryID = await this.calculateGrassId.getGrassHistoryID(
        field,
        crop,
        transactionalManager,
        harvestYear
      );
    } else {
      previousGrassId = await this.calculateGrassId.getPreviousGrassID(
        crop,
        transactionalManager,
        harvestYear
      );
    }

    const isCropGrass = await this.isGrassCropPresent(
      crop,
      transactionalManager
    );
    const nutrientRecommendationnReqBody = {
      field: {
        fieldType: fieldType,
        multipleCrops:
          crop.CropOrder == CropOrderMapper.SECONDCROP ? true : false,
        arable: crop.FieldType == FieldTypeMapper.GRASS ? [] : arableBody,
        grassland: {},
        grass:
          crop.FieldType == FieldTypeMapper.BOTH ||
          crop.FieldType == FieldTypeMapper.GRASS
            ? grassObject
            : {},
        soil: {
          soilTypeId: field.SoilTypeID,
          kReleasingClay: field.SoilReleasingClay,
          nvzActionProgrammeId: field.NVZProgrammeID,
          psc: 0, //TODO:: need to find it
          pkBalance: {
            phosphate: pkBalanceData != null ? pkBalanceData.PBalance : 0,
            potash: pkBalanceData != null ? pkBalanceData.KBalance : 0,
          },
          soilAnalyses: [],
        },
        harvestYear: crop.Year,
        area: field.TotalArea,
        postcode: farm.ClimateDataPostCode,
        altitude: farm.AverageAltitude,
        rainfallAverage: farm.Rainfall,
        excessWinterRainfall:
          excessRainfall?.WinterRainfall != null
            ? excessRainfall.WinterRainfall
            : 0, //TODO:: need to find it
        mannerManures:
          mannerOutput != null && mannerOutput.length > 0 ? true : false,
        organicMaterials: [],
        previousCropping: {},
        //countryId: farm.EnglishRules ? 1 : 2,
        countryId: rb209CountryId,
      },
      nutrients: {
        nitrogen: true,
        phosphate: true,
        potash: true,
        magnesium: true,
        sodium: true,
        sulphur: isCropGrass ? false : true,
        lime: isCropGrass ? false : true,
      },
      totals: true,
      referenceValue: `${field.ID}-${crop.ID}-${crop.Year}`,
    };

    if (mannerOutput != null || mannerOutput.length > 0) {
      nutrientRecommendationnReqBody.field.mannerOutputs = mannerOutput;
    }
    if (soilAnalysis) {
      soilAnalysis?.forEach((soilAnalysis) => {
        const soilAnalysisData = {
          ...(soilAnalysis.Date != null && {
            soilAnalysisDate: soilAnalysis.Date,
          }),
          ...(soilAnalysis.PH != null && { soilpH: soilAnalysis.PH }),
          ...(soilAnalysis.SulphurDeficient && {
            sulphurDeficient: soilAnalysis.SulphurDeficient,
          }),
          ...(soilAnalysis.SoilNitrogenSupplyIndex != null && {
            snsIndexId: soilAnalysis.SoilNitrogenSupplyIndex,
            snsMethodologyId: 4,
          }),
          ...(soilAnalysis.PhosphorusIndex != null && {
            pIndexId: soilAnalysis.PhosphorusIndex,
            pMethodologyId: soilAnalysis.PhosphorusMethodologyID,
          }),
          ...(soilAnalysis.PotassiumIndex != null && {
            kIndexId: soilAnalysis.PotassiumIndex,
            kMethodologyId: 4,
          }),
          ...(soilAnalysis.MagnesiumIndex != null && {
            mgIndexId: soilAnalysis.MagnesiumIndex,
            mgMethodologyId: 4,
          }),
        };

        nutrientRecommendationnReqBody.field.soil.soilAnalyses.push(
          soilAnalysisData
        );
      });
    }

    // Add SnsAnalyses data
    if (snsAnalysesData) {
      nutrientRecommendationnReqBody.field.soil.soilAnalyses.push({
        soilAnalysisDate: snsAnalysesData.SampleDate, // Using snsAnalysesData.SampleDate
        snsIndexId: snsAnalysesData.SoilNitrogenSupplyIndex, // Using snsAnalysesData.SoilNitrogenSupplyIndex
        snsMethodologyId: 4,
        pMethodologyId: 0,
        kMethodologyId: 4,
        mgMethodologyId: 4,
      });
    }

    if (previousCrop) {
      const cropType = cropTypesList.find(
        (cropType) => cropType?.cropTypeId === previousCrop?.CropTypeID
      );
      nutrientRecommendationnReqBody.field.previousCropping = {
        previousGrassId: grassHistoryID ? null : previousGrassId,
        previousCropGroupId: grassHistoryID
          ? null
          : cropType?.cropGroupId !== undefined &&
            cropType?.cropGroupId !== null
          ? cropType?.cropGroupId
          : null,
        // previousCropTypeId:
        //   previousCrop?.CropTypeID == 140
        //     ? null
        //     : previousCrop?.CropTypeID !== undefined &&
        //       previousCrop?.CropTypeID !== null
        //     ? previousCrop?.CropTypeID
        //     : null,
        previousCropTypeId: grassHistoryID
          ? null
          : previousCrop?.CropTypeID !== undefined &&
            previousCrop?.CropTypeID !== null
          ? previousCrop?.CropTypeID
          : null,
        grassHistoryId: previousGrassId ? null : grassHistoryID,
        snsId: null,
        smnDepth: null,
        measuredSmn: null,
      };
    } else {
      // If no previousCrop found, assign null except for previousGrassId
      nutrientRecommendationnReqBody.field.previousCropping = {
        previousCropGroupId: null,
        previousCropTypeId: null,
        previousGrassId:
          previousCrop?.CropTypeID == CropTypeMapper.GRASS ? null : 1,
        grassHistoryId: null,
        snsId: null,
        smnDepth: null,
        measuredSmn: null,
      };
    }
    nutrientRecommendationnReqBody.referenceValue = `${field.ID}-${crop.ID}-${crop.Year}`;

    return nutrientRecommendationnReqBody;
  }
  async saveRecommendationForOtherCrops(
    transactionalManager,
    OrganicManure,
    mannerOutputs,
    userId,
    latestSoilAnalysis,
    snsAnalysesData,
    allRecommendations
  ) {
    // Prepare cropOrderData with the values from latestSoilAnalysis, snsAnalysesData, and mannerOutputReq
    let cropOrderData = {
      CropN: null,
      ManureN: mannerOutputs
        ? mannerOutputs.data.currentCropAvailableN
        : OrganicManure.AvailableN,
      FertilizerN: null,
      CropP2O5: null,
      ManureP2O5: mannerOutputs
        ? mannerOutputs.data.cropAvailableP2O5
        : OrganicManure.AvailableP2O5,
      FertilizerP2O5: null,
      ManureK2O: mannerOutputs
        ? mannerOutputs.data.cropAvailableK2O
        : OrganicManure.AvailableK2O,
      CropMgO: null,
      ManureMgO: null,
      FertilizerMgO: null,
      CropSO3: null,
      ManureSO3: mannerOutputs
        ? mannerOutputs.data.cropAvailableSO3
        : OrganicManure.AvailableSO3,
      FertilizerSO3: null,
      CropNa2O: null, // assuming Na2O is present in mannerOutputReq if not remove this
      ManureNa2O: null,
      FertilizerNa2O: null, // assuming Na2O is present
      CropLime: null,
      ManureLime: null,
      FertilizerLime: null, // Assuming no data for FertilizerLime
      PH: latestSoilAnalysis?.PH?.toString() || null,
      SNSIndex: latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString() || null,
      PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString() || null,
      KIndex: latestSoilAnalysis?.PotassiumIndex?.toString() || null,
      MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString() || null,
      SIndex: null,
      NIndex: null,
    };

    // Check if there's an existing recommendation for the current OrganicManure.ManagementPeriodID
    let recommendation = allRecommendations.find(
      (rec) => rec.ManagementPeriodID === OrganicManure.ManagementPeriodID
    );

    if (recommendation) {
      // If a recommendation exists, update it
      recommendation = {
        ...recommendation,
        ...cropOrderData,
        ModifiedOn: new Date(),
        ModifiedByID: userId,
      };
      await transactionalManager.save(RecommendationEntity, recommendation);
    } else {
      // If no recommendation exists, create a new one
      recommendation = this.RecommendationRepository.create({
        ...cropOrderData,
        ManagementPeriodID: OrganicManure.ManagementPeriodID,
        Comments: "New recommendation created",
        CreatedOn: new Date(),
        CreatedByID: userId,
      });
      await transactionalManager.save(RecommendationEntity, recommendation);
    }

    return recommendation;
  }
  async getPKBalanceData(field, year, transactionalManager) {
    try {
      // Find the data by filtering allPKBalanceData
      const pkBalanceData = await transactionalManager.findOne(
        PKBalanceEntity,
        {
          where: {
            Year: year,
            FieldID: field.ID,
          },
        }
      );

      return pkBalanceData || null; // Return the found data or null if not found
    } catch (error) {
      console.error("Error fetching PK Balance data:", error);
      throw error; // Re-throw the error or handle it as needed
    }
  }

  async buildCropRecommendationData(
    cropData,
    latestSoilAnalysis,
    nutrientRecommendationsData,
    transactionalManager,
    userId,
    mannerOutput,
    managementPeriodData
  ) {
    // First filter based on CropOrder from nutrientRecommendationsData
    const filteredData = await this.filterBySingleSequenceId(
      nutrientRecommendationsData,
      cropData.CropOrder
    );
    const cropID = cropData.ID;
    const results = [];

    // Get all unique defoliationIds from filtered calculations
    const defoliationIds = [
      ...new Set(filteredData.calculations.map((calc) => calc.defoliationId)),
    ];

    // Loop over each defoliationId
    for (const defoliationId of defoliationIds) {
      // Extract all calculations with this defoliationId
      const defoliationData = await this.extractNutrientData(
        filteredData.calculations,
        defoliationId
      );
      let relevantMannerOutput = null;
      if (mannerOutput != null) {
        relevantMannerOutput = mannerOutput.find(
          (m) =>
            m.defoliationId === defoliationId && m.id === cropData.CropOrder
        );
      }

      // Initialize crop recommendation object for this defoliation group
      const cropRecData = {
        CropN: null,
        CropP2O5: null,
        CropK2O: null,
        CropMgO: null,
        CropSO3: null,
        CropNa2O: null,
        CropLime: null,
        FertilizerN: null,
        FertilizerP2O5: null,
        FertilizerK2O: null,
        FertilizerMgO: null,
        FertilizerSO3: null,
        FertilizerNa2O: null,
        FertilizerLime: null,
        PH: latestSoilAnalysis?.PH?.toString() || null,
        SNSIndex:
          latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString() || null,
        PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString() || null,
        KIndex: latestSoilAnalysis?.PotassiumIndex?.toString() || null,
        MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString() || null,
        SIndex: null,
        NIndex: null,
      };

      // Loop through each calculation inside this defoliation group.
      // Each calculation corresponds to a nutrient for this defoliation.
      for (const calc of defoliationData) {
        // Use a switch to update cropRecData based on nutrientId
        switch (calc.nutrientId) {
          case 0:
            cropRecData.CropN = calc.recommendation;
            cropRecData.FertilizerN = calc.cropNeed;
            cropRecData.ManureN =
              relevantMannerOutput != null
                ? relevantMannerOutput?.availableN
                : null;
            cropRecData.NIndex = calc.indexpH;
            break;
          case 1:
            cropRecData.CropP2O5 = calc.recommendation;
            cropRecData.ManureP2O5 =
              relevantMannerOutput != null
                ? relevantMannerOutput?.availableP
                : null;
            cropRecData.FertilizerP2O5 = calc.cropNeed;
            break;
          case 2:
            cropRecData.CropK2O = calc.recommendation;
            cropRecData.ManureK2O =
              relevantMannerOutput != null
                ? relevantMannerOutput?.availableK
                : null;
            cropRecData.FertilizerK2O = calc.cropNeed;
            break;
          case 3:
            cropRecData.CropMgO = calc.recommendation;
            cropRecData.FertilizerMgO = calc.cropNeed;
            break;
          case 4:
            cropRecData.CropNa2O = calc.recommendation;
            cropRecData.FertilizerNa2O = calc.cropNeed;
            break;
          case 5:
            cropRecData.CropSO3 = calc.recommendation;
            cropRecData.ManureSO3 =
              relevantMannerOutput != null
                ? relevantMannerOutput?.availableS
                : null;
            cropRecData.FertilizerSO3 = calc.cropNeed;
            break;
          case 6:
            cropRecData.CropLime = calc.recommendation;
            cropRecData.FertilizerLime = calc.cropNeed;
            break;
          default:
            console.warn(`Unhandled nutrientId: ${calc.nutrientId}`);
        }
      }

      // Retrieve the management period that matches the crop and defoliationId.
      const managementPeriods = managementPeriodData.filter(
        (mp) => mp.CropID === cropID && mp.Defoliation === defoliationId
      );

      if (!managementPeriods.length) continue;

      const managementPeriod = managementPeriods[0];

      // Create a new recommendation record
      const created = this.recommendationRepository.create({
        ...cropRecData,
        ManagementPeriodID: managementPeriod.ID,
        Comments: `Reference Value: ${filteredData.referenceValue}\nVersion: ${filteredData.versionNumber}`,
        CreatedOn: new Date(),
        CreatedByID: userId,
      });
      const saved = await transactionalManager.save(
        RecommendationEntity,
        created
      );
      results.push(saved);
    }

    return results;
  }

  async UpdatePKBalance(
    fieldId,
    crop,
    nutrientRecommendationsData,
    pkBalanceData,
    userId,
    secondCropManagementData,
    fertiliserData,
    year,
    transactionalManager
  ) {
    try {
      let pBalance = 0;
      let kBalance = 0;
      let saveAndUpdatePKBalance;

      if (crop.CropTypeID == CropTypeMapper.OTHER || crop.CropInfo1 == null) {
        if (pkBalanceData) {
          pBalance =
            (fertiliserData == null ? 0 : fertiliserData.p205) -
            (0 - pkBalanceData == null ? 0 : pkBalanceData.PBalance);
          kBalance =
            (fertiliserData == null ? 0 : fertiliserData.k20) -
            (0 - pkBalanceData == null ? 0 : pkBalanceData.KBalance);
        } else {
          pBalance = fertiliserData == null ? 0 : fertiliserData.p205;
          kBalance = fertiliserData == null ? 0 : fertiliserData.k20;
        }
      } else {
        for (const recommendation of nutrientRecommendationsData.calculations) {
          switch (recommendation.nutrientId) {
            case 1:
              pBalance =
                (fertiliserData == null ? 0 : fertiliserData.p205) -
                recommendation.cropNeed;
              break;
            case 2:
              kBalance =
                (fertiliserData == null ? 0 : fertiliserData.k20) -
                recommendation.cropNeed;
              break;
          }
        }
      }
      //geting current pKBalance
      // let pkBalance = await this.getPKBalanceData(
      //   crop?.Year,
      //   fieldId,
      //   pKBalanceAllData
      // );

      let pkBalance = await transactionalManager.findOne(PKBalanceEntity, {
        where: {
          FieldID: fieldId,
          Year: crop.Year,
        },
      });
      if (pkBalance) {
        const updateData = {
          Year: year,
          FieldID: fieldId,
          PBalance: pBalance,
          KBalance: kBalance,
        };
        saveAndUpdatePKBalance = {
          ...pkBalance,
          ...updateData,
          ModifiedOn: new Date(),
          ModifiedByID: userId,
        };
      } else {
        saveAndUpdatePKBalance = {
          Year: year,
          FieldID: fieldId,
          PBalance: pBalance,
          KBalance: kBalance,
          CreatedOn: new Date(),
          CreatedByID: userId,
        };
      }

      return { saveAndUpdatePKBalance };
    } catch (error) {
      console.error("Error while saving pkBalance data", error);
      throw error;
    }
  }

  async saveMultipleRecommendation(
    Recommendations,
    savedCrop,
    cropSaveData,
    transactionalManager,
    nutrientRecommendationsData,
    userId
  ) {
    const RecommendationComments = [];

    // Separate advice notes by sequenceId for crop (sequenceId = croporder)
    const cropNotes = nutrientRecommendationsData.adviceNotes?.filter(
      (note) => note.sequenceId === savedCrop.CropOrder
    );

    // Helper function to group notes by nutrientId and concatenate them
    const groupNotesByNutrientId = (notes) => {
      return notes.reduce((acc, adviceNote) => {
        const nutrientId = adviceNote.nutrientId;
        if (!acc[nutrientId]) {
          acc[nutrientId] = [];
        }
        acc[nutrientId].push(adviceNote.note); // Group notes by nutrientId
        return acc;
      }, {});
    };

    const cropNotesByNutrientId = groupNotesByNutrientId(cropNotes);
    //const secondCropNotesByNutrientId = groupNotesByNutrientId(secondCropNotes);

    // Track nutrient IDs that are being processed
    const nutrientIdsInData = [];

    // Function to handle saving comments (with updates or creations)
    const saveComments = async (notesByNutrientId, savedCrop) => {
      const existingComments = await transactionalManager.find(
        RecommendationCommentEntity,
        { where: { RecommendationID: savedCrop.ID } }
      );

      for (const nutrientId in notesByNutrientId) {
        const concatenatedNote = notesByNutrientId[nutrientId].join(" <br/>"); // Concatenate notes for the same nutrientId

        // Add nutrientId to the processed list
        nutrientIdsInData.push(parseInt(nutrientId));

        // Check if the comment already exists for this nutrientId in the database
        const existingComment = existingComments.find(
          (comment) => comment.Nutrient === parseInt(nutrientId)
        );

        if (existingComment) {
          // Update existing comment if found
          existingComment.Comment = concatenatedNote;
          existingComment.ModifiedOn = new Date();
          existingComment.ModifiedByID = userId;

          const updatedComment = await transactionalManager.save(
            RecommendationCommentEntity,
            existingComment
          );
          RecommendationComments.push(updatedComment);
        } else {
          // Create a new comment if not found
          const newComment = this.recommendationCommentRepository.create({
            Nutrient: parseInt(nutrientId),
            Comment: concatenatedNote,
            RecommendationID: savedCrop.ID, // Use the correct recommendation ID from the passed crop data
            CreatedOn: new Date(),
            CreatedByID: userId,
          });

          const savedComment = await transactionalManager.save(
            RecommendationCommentEntity,
            newComment
          );
          RecommendationComments.push(savedComment);
        }
      }

      // Remove comments from the database if the nutrientId is not in the new data
      const commentsToDelete = existingComments.filter(
        (comment) => !nutrientIdsInData.includes(comment.Nutrient)
      );

      if (commentsToDelete.length > 0) {
        await transactionalManager.remove(
          RecommendationCommentEntity,
          commentsToDelete
        );
      }
      return RecommendationComments;
    };

    // Handle notes for the crop
    await saveComments(cropNotesByNutrientId, cropSaveData);

    // Push the first crop recommendation and its comments to the final result array
    Recommendations.push({
      Recommendation: cropSaveData, // First crop recommendation
      RecommendationComments,
    });

    return Recommendations;
  }
  async copyPlan(body, userId, request) {
    const { farmID, harvestYear, copyYear, isOrganic, isFertiliser } = body;
    let savedCrop;
    let Recommendations = [];
    let savedRecommendationComment = [];

    return await AppDataSource.transaction(async (transactionalManager) => {
      // Step 1: Get all fields for the farmID
      const fields = await transactionalManager.find(FieldEntity, {
        where: { FarmID: farmID },
      });

      const fieldIDs = fields.map((field) => field.ID);

      if (fieldIDs.length === 0) {
        return []; // No fields found
      }

      // Step 2: Fetch crops with FieldID IN (...) and Year = copyYear
      const crops = await transactionalManager.find(CropEntity, {
        where: {
          FieldID: In(fieldIDs),
          Year: copyYear,
        },
      });

      // Step 3: Loop through each crop
      for (const crop of crops) {
        // Check if any soil analysis record has P or K index
        const soilAnalysis = await transactionalManager.find(
          SoilAnalysisEntity,
          {
            where: { FieldID: crop.FieldID },
          }
        );

        const isSoilAnalysisHavePAndK = soilAnalysis.some(
          (item) =>
            item.PhosphorusIndex !== null || item.PotassiumIndex !== null
        );
        const pkBalanceData = await transactionalManager.findOne(
          PKBalanceEntity,
          {
            where: {
              FieldID: crop.FieldID,
              Year: harvestYear,
            },
          }
        );

        // Find any crop plan with the same field and year > copyYear
        const cropPlanOfNextYear = await transactionalManager.findOne(
          CropEntity,
          {
            where: {
              FieldID: crop.FieldID,
              Year: MoreThan(harvestYear),
            },
          }
        );
        const farm = await transactionalManager.findOne(FarmEntity, {
          where: { ID: farmID },
        });

        const rb209CountryData = await transactionalManager.findOne(
          CountryEntity,
          {
            where: {
              ID: farm.CountryID,
            },
          }
        );
        // Reuse existing field data
        const field = fields.find((f) => f.ID === crop.FieldID);
        const {
          latestSoilAnalysis,
          errors: soilAnalysisErrors,
          soilAnalysisRecords,
        } = await this.handleSoilAnalysisValidation(
          crop.FieldID,
          field.Name,
          harvestYear,
          rb209CountryData.RB209CountryID,
          transactionalManager
        );
        const snsAnalysisData = await transactionalManager.findOne(
          SnsAnalysesEntity,
          {
            where: { CropID: crop.ID }, // or pass `id` if used directly
          }
        );
        const managementPeriods = await transactionalManager.find(
          ManagementPeriodEntity,
          {
            where: { CropID: crop.ID },
          }
        );
        if (crop.CropTypeID === CropTypeMapper.OTHER) {
          await this.savedDefault(
            crop,
            userId,
            transactionalManager,
            managementPeriods,
            harvestYear,
            isOrganic,
            isFertiliser
          );
          if (isSoilAnalysisHavePAndK) {
            if (cropPlanOfNextYear.length == 0) {
              try {
                const newPKBalance = {
                  ...pkBalanceData,
                  FieldID: crop.FieldID,
                  ID: null, // Make it a new insert
                  Year: harvestYear, // New year
                  CreatedByID: userId,
                };

                const savedPKBalance = await transactionalManager.save(
                  PKBalanceEntity,
                  newPKBalance
                );
              } catch (error) {
                console.error(
                  `Error while saving PKBalance Data FieldId: ${crop.FieldID} And Year:${harvestYear}:`,
                  error
                );
              }
            } else {
              //call UpdateRecommendation function
              this.UpdateRecommendation.updateRecommendationsForField(
                crop.FieldID,
                crop.Year,
                request,
                userId
              )
                .then((res) => {
                  if (res === undefined) {
                    console.log(
                      "updateRecommendationAndOrganicManure returned undefined"
                    );
                  } else {
                    console.log(
                      "updateRecommendationAndOrganicManure result:",
                      res
                    );
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
          return {
            message: "Default crop saved and exiting early",
            Recommendations,
          };
        }
        let newOrganicManure = null;
        let mannerOutput = null;
        if (isOrganic) {
          mannerOutput =
            await this.CalculateMannerOutput.calculateMannerOutputForOrganicManure(
              crop,
              newOrganicManure,
              farm,
              field,
              transactionalManager,
              request
            );
        }

        const nutrientRecommendationnReqBody =
          await this.buildNutrientRecommendationReqBody(
            field,
            farm,
            soilAnalysisRecords,
            snsAnalysisData,
            crop,
            rb209CountryData.RB209CountryID,
            request,
            transactionalManager,
            harvestYear,
            mannerOutput
          );

        const nutrientRecommendationsData =
          await this.rB209RecommendationService.postData(
            "Recommendation/Recommendations",
            nutrientRecommendationnReqBody
          );

        if (
          !nutrientRecommendationsData ||
          !nutrientRecommendationsData.calculations == null ||
          !nutrientRecommendationsData.adviceNotes == null ||
          nutrientRecommendationsData.data?.error
        ) {
          throw boom.badData(`${nutrientRecommendationsData.data.error}`);
        } else if (nutrientRecommendationsData.data?.Invalid) {
          throw boom.badRequest(
            `${nutrientRecommendationsData.data?.Invalid[0]}`
          );
        } else if (nutrientRecommendationsData.data?.missing) {
          throw boom.badRequest(
            `${nutrientRecommendationsData.data?.missing[0]}`
          );
        }
        const managementPeriodsOfNewCrop = [];
        const organicManures = [];
        const fertiliserManures = [];
        const oldToNewManagementPeriodMap = {};
        const originalSowingDate = new Date(crop.SowingDate);
        const updatedSowingDate = new Date(originalSowingDate);
        updatedSowingDate.setFullYear(harvestYear);
        // 1. Save the new crop
        savedCrop = await transactionalManager.save(
          CropEntity,
          this.cropRepository.create({
            ...crop,
            ID: null, // ensure it's treated as new
            Year: harvestYear,
            SowingDate:updatedSowingDate,
            CreatedByID: userId,
            CreatedOn: new Date(),
          })
        );

        // 3. Copy and save management periods
        for (const oldPeriod of managementPeriods) {
          const newPeriod = {
            ...oldPeriod,
            ID: null,
            CropID: savedCrop.ID,
            CreatedByID: userId,
            CreatedOn: new Date(),
          };

          const savedPeriod = await transactionalManager.save(
            ManagementPeriodEntity,
            newPeriod
          );
          oldToNewManagementPeriodMap[oldPeriod.ID] = savedPeriod.ID;
          managementPeriodsOfNewCrop.push(savedPeriod);
        }

        // 4. If isOrganic, copy organic manure
        if (isOrganic) {
          for (const oldPeriod of managementPeriods) {
            const manures = await transactionalManager.find(
              OrganicManureEntity,
              {
                where: { ManagementPeriodID: oldPeriod.ID },
              }
            );

            for (const manure of manures) {

              let updatedApplicationDate = null;
              if (manure.ApplicationDate) {
                const originalDate = new Date(manure.ApplicationDate);
                updatedApplicationDate = new Date(originalDate);
                updatedApplicationDate.setFullYear(harvestYear);
              }
              const newManure = {
                ...manure,
                ID: null,
                ManagementPeriodID: oldToNewManagementPeriodMap[oldPeriod.ID],
                ApplicationDate: updatedApplicationDate,
                CreatedByID: userId,
                CreatedOn: new Date(),
              };

              const savedManure = await transactionalManager.save(
                OrganicManureEntity,
                newManure
              );
              organicManures.push(savedManure);
            }

            // let saveAndUpdatePKBalance = await this.UpdatePKBalance(
            //   field.ID,
            //   crop,
            //   nutrientRecommendationsData,
            //   pkBalanceData,
            //   userId,
            //   secondCropManagementData,
            //   fertiliserData,
            //   year,
            //   transactionalManager
            // );

            // if (saveAndUpdatePKBalance) {
            //   await transactionalManager.save(
            //     PKBalanceEntity,
            //     saveAndUpdatePKBalance.saveAndUpdatePKBalance
            //   );
            // }
          }
        }

       

        for (const oldPeriod of managementPeriods) {
          const oldRecommendations = await transactionalManager.find(
            RecommendationEntity,
            {
              where: { ManagementPeriodID: oldPeriod.ID },
            }
          );

          // for (const rec of oldRecommendations) {
          //   const newRec = {
          //     ...rec,
          //     ID: null,
          //     ManagementPeriodID: oldToNewManagementPeriodMap[oldPeriod.ID],
          //     CreatedByID: userId,
          //     CreatedOn: new Date(),
          //   };

          //   const savedRec = await transactionalManager.save(
          //     RecommendationEntity,
          //     newRec
          //   );
          //   Recommendations.push(savedRec);
          // }
        }
        const updatedRecommendation = await this.buildCropRecommendationData(
          savedCrop,
          latestSoilAnalysis,
          nutrientRecommendationsData,
          transactionalManager,
          userId,
          mannerOutput,
          managementPeriodsOfNewCrop
        );
        Recommendations.push({
          Recommendation: updatedRecommendation,
        });
        if (savedCrop.CropTypeID != CropTypeMapper.GRASS) {
          savedRecommendationComment = await this.saveMultipleRecommendation(
            Recommendations,
            savedCrop,
            updatedRecommendation[0],
            transactionalManager,
            nutrientRecommendationsData,
            userId
          );
      
        }

        // 5. If isFertiliser, copy fertiliser manures
        if (isFertiliser) {
          for (const oldPeriod of managementPeriods) {
            const fertilisers = await transactionalManager.find(
              FertiliserManuresEntity,
              {
                where: { ManagementPeriodID: oldPeriod.ID },
              }
            );

            for (const fert of fertilisers) {
              let updatedApplicationDate = null;
              if (fert.ApplicationDate) {
                const originalDate = new Date(fert.ApplicationDate);
                updatedApplicationDate = new Date(originalDate);
                updatedApplicationDate.setFullYear(harvestYear);
              }
              const newFert = {
                ...fert,
                ID: null,
                ManagementPeriodID: oldToNewManagementPeriodMap[oldPeriod.ID],
                ApplicationDate: updatedApplicationDate,
                CreatedByID: userId,
                CreatedOn:new Date()
              };

              const savedFert = await transactionalManager.save(
                FertiliserManuresEntity,
                newFert
              );
              fertiliserManures.push(savedFert);
            }
          }
        }
      

        if (cropPlanOfNextYear) {
          this.UpdateRecommendation.updateRecommendationsForField(
            crop.FieldID,
            cropPlanOfNextYear.Year,
            request,
            userId
          )
            .then((res) => {
              if (res === undefined) {
                console.log(
                  "updateRecommendationAndOrganicManure returned undefined"
                );
              } else {
                console.log(
                  "updateRecommendationAndOrganicManure result:",
                  res
                );
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

      // You can return crops or any processed result
      return { Recommendations };
    });
  }
}

module.exports = { CropService };
