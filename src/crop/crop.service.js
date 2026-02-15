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
const { MoreThan, Between, Not } = require("typeorm");
const { In } = require("typeorm");
const {
  UpdateRecommendationChanges,
} = require("../shared/updateRecommendationsChanges");
const {
  SecondCropLinkingEntity,
} = require("../db/entity/second-crop-linking.entity");
const { CountryEntity } = require("../db/entity/country.entity");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const RB209SoilService = require("../vendors/rb209/soil/soil.service");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const {
  GrassGrowthService,
} = require("../grass-growth-plan/grass-growth-plan.service");
const { CropOrderMapper } = require("../constants/crop-order-mapper");
const {
  ExcessRainfallsEntity,
} = require("../db/entity/excess-rainfalls.entity");
const {
  CalculateGrassHistoryAndPreviousGrass,
} = require("../shared/calculate-previous-grass-id.service");
const { FieldTypeMapper } = require("../constants/field-type-mapper");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const {
  CalculateMannerOutputService,
} = require("../shared/calculate-manner-output-service");
const {
  RecommendationCommentEntity,
} = require("../db/entity/recommendation-comment.entity");
const { NutrientMapperNames } = require("../constants/nutrient-mapper-names");
const {
  RB209RecommendationService,
} = require("../vendors/rb209/recommendation/recommendation.service");
const {
  CalculateCropsSnsAnalysisService,
} = require("../shared/calculate-crops-sns-analysis-service");
const {
  CropTypeLinkingEntity,
} = require("../db/entity/crop-type-linking.entity");
const PlanService = require("../plan/plan.service");
const { FieldAboveOrBelowSeaLevelMapper } = require("../constants/field-is-above-sea-level");
const { ProcessFutureManuresForWarnings } = require("../shared/process-future-warning-calculations-service");
const { ARABLE } = require("../constants/rb209-endpoints-mapper");
const { GenerateRecommendations } = require("../shared/generate-recomendations-service");
const { UpdatingFutureRecommendations } = require("../shared/updating-future-recommendations-service");
class CropService extends BaseService {
  constructor() {
    super(CropEntity);
    this.repository = AppDataSource.getRepository(CropEntity);
    this.managementPeriodRepository = AppDataSource.getRepository(
      ManagementPeriodEntity,
    );
    this.rB209ArableService = new RB209ArableService();
    this.rB209GrassService = new RB209GrassService();
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
      FertiliserManuresEntity,
    );
    this.MannerManureTypesService = new MannerManureTypesService();
    this.recommendationCommentRepository = AppDataSource.getRepository(
      RecommendationCommentEntity,
    );
    this.CalculateCropsSnsAnalysis = new CalculateCropsSnsAnalysisService();
    this.planService = new PlanService();
    this.ProcessFutureManuresForWarnings = new ProcessFutureManuresForWarnings();
     this.generateRecommendations = new GenerateRecommendations();
    this.updatingFutureRecommendations = new UpdatingFutureRecommendations();  
  }

  async createCropWithManagementPeriods(
    fieldId,
    cropData,
    managementPeriodData,
    userId,
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
          createdManagementPeriod,
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
    const cropTypesList = await this.rB209ArableService.getData(ARABLE.ALL_ARABLE_CROP_TYPES_ENDPOINT);

    const cropType = cropTypesList.find(
      (cT) => cT.cropTypeId === cropTypeId,
    );

    return {
      cropTypeId: cropType.cropTypeId,
      cropType: cropType.cropType,
    };
  }

  async filterBySingleSequenceId(data, sequenceId) {
    const filteredCalculations = data.calculations.filter(
      (item) => item.sequenceId === sequenceId,
    );

    const filteredAdviceNotes = data.adviceNotes.filter(
      (item) => item.sequenceId === sequenceId,
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
    year,
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
        },
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

        await this.validateAndHandleSecondCrop(
          transactionalManager,
          updatedCrop,
          fieldId,
          year,
        );

        return updatedCrop;
      },
    );

    return result;
  }

  // Other methods...
  async mapCropTypeIdWithTheirNames(plans) {
    try {
      const unorderedMap = {};
      const cropTypesList = await this.rB209ArableService.getData(
        ARABLE.ALL_ARABLE_CROP_TYPES_ENDPOINT,
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

  async getManureTypeById(manureTypesResponse, manureTypeID) {
    const manureType = manureTypesResponse.data.find(
      (mt) => mt.id === manureTypeID,
    );

    if (!manureType) {
      console.log(`ManureType not found for ID ${manureTypeID}`);
    }

    //  Match API response structure
    return {
      data: manureType,
    };
  }

  async getOrganicAndInorganicDetails(farmId, harvestYear, request) {
    const storedProcedure =
      "EXEC dbo.spCrops_GetPlansByHarvestYear @farmId = @0, @harvestYear = @1";
    const plans = await this.executeQuery(storedProcedure, [
      farmId,
      harvestYear,
    ]);
    const cropTypesList = await this.rB209ArableService.getData(
      ARABLE.ALL_ARABLE_CROP_TYPES_ENDPOINT,
    );
    const findCropGroupId = (cropTypeId) => {
      const cropType = cropTypesList.find(
        (crop) => crop.cropTypeId === cropTypeId,
      );
      return cropType ? cropType.cropGroupId : null;
    };

    const findCropGroupName = async (cropGroupId) => {
      try {
        const cropGroupResponse = await this.rB209ArableService.getData(
          `/Arable/CropGroup/${cropGroupId}`,
        );

        return cropGroupResponse.cropGroupName;
      } catch (error) {
        console.error(
          `Error fetching crop group name for ID: ${cropGroupId}`,
          error,
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
          error,
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
          error,
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
          error,
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
          error,
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
      DefoliationSequenceID,
    ) => {
      try {
        let defoliationSequenceDescription = null;
        let defoliationSequence = await this.rB209GrassService.getData(
          `Grass/DefoliationSequence/${DefoliationSequenceID}`,
        );
        defoliationSequenceDescription = defoliationSequence
          ? defoliationSequence.defoliationSequenceDescription
          : null;

        return defoliationSequenceDescription;
      } catch (error) {
        console.error(
          `Error fetching Defoliation Sequence by id ${DefoliationSequenceID}`,
          error,
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
      if (plan.DefoliationSequenceID != null) {
        defoliationSequenceDescription =
          await findDefoliationSequenceDescription(plan.DefoliationSequenceID);
      }
      let lastModifiedDate = await this.getLatestModifiedDate(plan.CropID);

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
        LastModifiedOn: lastModifiedDate,
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

        const allManureData = await this.MannerManureTypesService.getData(
          "/manure-types",
          request,
        );

        // Process each organicManure entry asynchronously
        return Promise.all(
          

          organicManureData.map(async (organicManure) => {
            // Fetch the manure type data from MannerManureTypesService
            let mannerManureTypeData = {};
            try {
              const manureTypeResponse = await this.getManureTypeById(
                allManureData,
                organicManure.ManureTypeID,
              );
 
              mannerManureTypeData = manureTypeResponse.data;
            } catch (error) {
              console.error(
                `Error fetching manure type for ID: ${organicManure.ManureTypeID}`,
                error,
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
          }),
        );
      }),
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
      }),
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

  async deleteCrop(cropId, userId, request, transactionalManager) {
    // If a global transaction manager is provided, use it.
    if (transactionalManager) {
      return await this.deleteCropById(
        cropId,
        userId,
        request,
        transactionalManager,
      );
    }

    // ✅ Otherwise, start a new local transaction.
    return await AppDataSource.transaction(async (localManager) => {
      return await this.deleteCropById(cropId, userId, request, localManager);
    });
  }
  async deleteCropById(CropsID, userId, request, transactionalManager) {
    // await AppDataSource.manager.transaction(async (transactionalManager) => {
    const crop = await transactionalManager.findOne(this.repository.target, {
      where: { ID: CropsID },
    });

    if (!crop) {
      throw new Error("Crop not found");
    }

    // Construct the stored procedure to delete a single crop by its ID
    const storedProcedure = "EXEC dbo.spCrops_DeleteCrops @CropsID = @0";

    // If the crop's CropOrder is 1, check for a second crop (CropOrder = 2) in the same year
    if (crop.CropOrder === 1) {
      const secondCrop = await transactionalManager.findOne(CropEntity, {
        where: {
          Year: crop.Year,
          CropOrder: CropOrderMapper.SECONDCROP,
          FieldID: crop.FieldID,
        },
      });

      if (secondCrop) {
        const storedProcedureSecondCrop =
          "EXEC dbo.spCrops_DeleteCrops @CropsID = @0";
        await transactionalManager.query(storedProcedureSecondCrop, [
          secondCrop.ID,
        ]);
      }
    }

    // Delete the primary crop
    await transactionalManager.query(storedProcedure, [CropsID]);
    const newOrganicManure = null;
    await this.generateRecommendations.generateRecommendations(
      crop.FieldID,
      crop.Year,
      newOrganicManure,
      transactionalManager,
      request,
      userId
    );
    // Find the next available crop
    const nextAvailableCrop = await transactionalManager.findOne(CropEntity, {
      where: {
        FieldID: crop.FieldID,
        Year: MoreThan(crop.Year),
      },
      order: {
        Year: "ASC",
      },
    });

    if (nextAvailableCrop) {
      // Not transactional — it's okay if this fails independently
      this.updatingFutureRecommendations.updateRecommendationsForField(
          crop.FieldID,
          nextAvailableCrop.Year,
          request,
          userId,
        )
        .then((res) => {
          if (res === undefined) {
            console.log(res);
          } else {
            console.log("updateRecommendationAndOrganicManure result:", res);
          }
        })
        .catch((error) => {
          console.error(
            "Error updating recommendation and organic manure:",
            error,
          );
        });
    }
    // });
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
      },
    );

    return result;
  }

  async syncManagementPeriodsBySequence(
    transactionalManager,
    cropID,
    userId,
    incomingPeriods,
  ) {
    const existingPeriods = await transactionalManager.find(
      ManagementPeriodEntity,
      {
        where: { CropID: cropID },
        order: { CreatedOn: "ASC" }, // or ID: 'ASC' if you prefer
      },
    );

    const updatedManagementPeriods = [];
    const existingCount = existingPeriods.length;
    const incomingCount = incomingPeriods.length;
    const minCount = Math.min(existingCount, incomingCount);

    // 1. Update existing by order (exclude ID from incoming)
    for (let i = 0; i < minCount; i++) {
      const incoming = incomingPeriods[i];
      const existing = existingPeriods[i];

      const {
        ID, // intentionally excluded
        CreatedByID, // also exclude to avoid accidental overwrite
        CreatedOn, // also exclude if DB manages this field
        CropID,
        ...dataToUpdate
      } = incoming;

      await transactionalManager.update(ManagementPeriodEntity, existing.ID, {
        ...dataToUpdate,
        ModifiedByID: userId,
        ModifiedOn: new Date(),
      });

      const updated = await transactionalManager.findOne(
        ManagementPeriodEntity,
        {
          where: { ID: existing.ID },
        },
      );

      if (updated) {
        updatedManagementPeriods.push(updated);
      }
    }

    // 2. Insert new ones if incoming > existing
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

    // 3. Delete excess existing periods if existing > incoming
    for (let i = incomingCount; i < existingCount; i++) {
      const periodToDelete = existingPeriods[i];

      // Delete related OrganicManure
      await transactionalManager.delete(OrganicManureEntity, {
        ManagementPeriodID: periodToDelete.ID,
      });

      // Delete related FertiliserManure
      await transactionalManager.delete(FertiliserManuresEntity, {
        ManagementPeriodID: periodToDelete.ID,
      });

      // Delete related Recommendations & Comments
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

      // Finally delete the ManagementPeriod
      await transactionalManager.delete(ManagementPeriodEntity, {
        ID: periodToDelete.ID,
      });
    }

    return updatedManagementPeriods;
  }

  async updateCropData(body, userId, request, transactionalManager) {
    // If a global transaction manager is provided, use it.
    if (transactionalManager) {
      return this.updateCrop(body, userId, request, transactionalManager);
    }

    //  Otherwise, start a new local transaction.
    return await AppDataSource.transaction(async (localManager) => {
      return this.updateCrop(body, userId, request, localManager);
    });
  }

  async updateCrop(body, userId, request, transactionalManager) {
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
        IsDeleted,
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
        },
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
        updatedCrop.Year,
      );

      const updatedManagementPeriods =
        await this.syncManagementPeriodsBySequence(
          transactionalManager,
          crop.ID,
          userId,
          cropEntry.ManagementPeriods,
        );
      const organicManure = null;
      // Recommendation update
      await this.generateRecommendations.generateRecommendations(
        updatedCrop.FieldID,
        updatedCrop.Year,
        organicManure,
        transactionalManager,
        request,
        userId
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
        this.updatingFutureRecommendations.updateRecommendationsForField(
            updatedCrop.FieldID,
            nextAvailableCrop.Year,
            request,
            userId
          )
          .catch((error) => {
            console.error("Error updating next crop's recommendations:", error);
          });
      }
      this.ProcessFutureManuresForWarnings.processWarningsByCrop(
        updatedCrop.ID,
        userId,
      );

      // Final result: pair crop with its periods
      if (updatedCrop) {
        updatedResults.push({
          crop: updatedCrop,
          ManagementPeriods: updatedManagementPeriods,
        });
      }
    }

    return updatedResults;
  }
  
  async savedDefault(
    cropData,
    userId,
    transactionalManager,
    managementPeriods,
    harvestYear,
    isOrganic,
    isFertiliser,
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
        CreatedOn: new Date()
      }),
    );

    // 2. Copy and save all management periods, map old to new
    for (const oldPeriod of managementPeriods) {
      const newPeriod = {
        ...oldPeriod,
        ID: null,
        CropID: savedCrop.ID,
        CreatedByID: userId,
        CreatedOn: new Date()
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
            where: { ManagementPeriodID: oldPeriod.ID }
          },
        );

        for (const manure of organicManures) {
          const newManure = {
            ...manure,
            ID: null,
            ManagementPeriodID: OldToNewManagementPeriodMap[oldPeriod.ID],
            CreatedByID: userId,
            CreatedOn: new Date()
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
          },
        );

        for (const fert of fertilisers) {
          const newFert = {
            ...fert,
            ID: null,
            ManagementPeriodID: OldToNewManagementPeriodMap[oldPeriod.ID],
            CreatedByID: userId,
            CreatedOn: new Date()
          };

          const savedFert = await transactionalManager.save(
            FertiliserManuresEntity,
            newFert,
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

  async copyPlan(body, userId, request) {
    const { farmID, harvestYear, copyYear, isOrganic, isFertiliser } = body;
    let savedCrop,Recommendations = [];
    const managementPeriodsOfNewCrop = [],organicManures = [],fertiliserManures = [];
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
          },
        );

        const isSoilAnalysisHavePAndK = soilAnalysis.some(
          (item) =>
            item.PhosphorusIndex !== null || item.PotassiumIndex !== null,
        );
        const pkBalanceData = await transactionalManager.findOne(
          PKBalanceEntity,
          {
            where: {
              FieldID: crop.FieldID,
              Year: copyYear,
            },
          },
        );

        if (pkBalanceData) {
          const newPkBalance = {
            ...pkBalanceData,
            ID: null, // Ensure it's treated as a new insert
            Year: harvestYear,
            CreatedByID: userId,
            CreatedOn: new Date(),
          };

          await transactionalManager.save(PKBalanceEntity, newPkBalance);
        }

        // Find any crop plan with the same field and year > copyYear
        const cropPlanOfNextYear = await transactionalManager.findOne(
          CropEntity,
          {
            where: {
              FieldID: crop.FieldID,
              Year: MoreThan(harvestYear),
            },
          },
        );
       

        // Reuse existing field data
        const field = fields.find((f) => f.ID === crop.FieldID);
        
        const managementPeriods = await transactionalManager.find(
          ManagementPeriodEntity,
          {
            where: { CropID: crop.ID },
          },
        );

        const newOrganicManure = null;
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
         
          const otherRecommendations= await this.generateRecommendations.generateRecommendations(
            field.ID,
            harvestYear,
            newOrganicManure,
            transactionalManager,
            request,
            userId
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
                  CreatedOn: new Date()
                };

               await transactionalManager.save(
                  PKBalanceEntity,
                  newPKBalance,
                );
              } catch (error) {
                console.error(
                  `Error while saving PKBalance Data FieldId: ${crop.FieldID} And Year:${harvestYear}:`,
                  error,
                );
              }
            } else {
              //call UpdateRecommendation function
              this.updatingFutureRecommendations.updateRecommendationsForField(
                  crop.FieldID,
                  cropPlanOfNextYear.Year,
                  request,
                  userId
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
          }
           Recommendations.push({
             Recommendation: otherRecommendations
           });
         continue;
        }
     
        
      
        const oldToNewManagementPeriodMap = {};
        let originalSowingDate = new Date(crop.SowingDate);
        originalSowingDate = crop.SowingDate ? originalSowingDate : null;
        let updatedSowingDate = new Date(originalSowingDate);
        updatedSowingDate.setFullYear(harvestYear);
        updatedSowingDate = crop.SowingDate ? updatedSowingDate : null;
        // 1. Save the new crop
        savedCrop = await transactionalManager.save(
          CropEntity,
          this.cropRepository.create({
            ...crop,
            ID: null, // ensure it's treated as new
            Year: harvestYear,
            SowingDate: updatedSowingDate,
            CreatedByID: userId,
            CreatedOn: new Date()
          }),
        );

        // 3. Copy and save management periods
        for (const oldPeriod of managementPeriods) {
          const newPeriod = {
            ...oldPeriod,
            ID: null,
            CropID: savedCrop.ID,
            CreatedByID: userId,
            CreatedOn: new Date()
          };

          const savedPeriod = await transactionalManager.save(
            ManagementPeriodEntity,
            newPeriod,
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
              },
            );

            for (const manure of manures) {
              let updatedApplicationDate = null;
              if (manure.ApplicationDate) {
                const originalDate = new Date(manure.ApplicationDate);
                const month = originalDate.getMonth(); // 0 = Jan, 7 = Aug
                const day = originalDate.getDate();
                let yearToSet = harvestYear;
                // If date is from previous harvest year window (1 Aug - 31 Dec)
                if (month >= 7) {
                  yearToSet = harvestYear - 1;
                }

                updatedApplicationDate = new Date(originalDate);
                updatedApplicationDate.setFullYear(yearToSet);
              }
              const newManure = {
                ...manure,
                ID: null,
                ManagementPeriodID: oldToNewManagementPeriodMap[oldPeriod.ID],
                ApplicationDate: updatedApplicationDate,
                CreatedByID: userId,
                CreatedOn: new Date()
              };

              const savedManure = await transactionalManager.save(
                OrganicManureEntity,
                newManure,
              );
              organicManures.push(savedManure);
            }
          }
        }

        for (const oldPeriod of managementPeriods) {
           await transactionalManager.find(
            RecommendationEntity,
            {
              where: { ManagementPeriodID: oldPeriod.ID },
            },
          );

        }
       
        // 5. If isFertiliser, copy fertiliser manures
        if (isFertiliser) {
          for (const oldPeriod of managementPeriods) {
            const fertilisers = await transactionalManager.find(
              FertiliserManuresEntity,
              {
                where: { ManagementPeriodID: oldPeriod.ID },
              },
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
                CreatedOn: new Date()
              };

              const savedFert = await transactionalManager.save(
                FertiliserManuresEntity,
                newFert,
              );
              fertiliserManures.push(savedFert);
            }
          }
        }

      
       const updatedRecommendation = await this.generateRecommendations.generateRecommendations(
          field.ID,
          harvestYear,
          newOrganicManure,
          transactionalManager,
          request,
          userId
        );

         Recommendations.push({
           Recommendation: updatedRecommendation
         });
        

        if (cropPlanOfNextYear) {
          this.updatingFutureRecommendations.updateRecommendationsForField(
              crop.FieldID,
              cropPlanOfNextYear.Year,
              request,
              userId
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
      }

      // You can return crops or any processed result
      return {
        Recommendations: Recommendations,
        ManagementPeriods: managementPeriodsOfNewCrop,
        OrganicManures: organicManures,
        Fertilisers: fertiliserManures
      };
    });
  }

  async getLatestModifiedDate(cropId) {
    return AppDataSource.transaction(async (transactionalManager) => {
      // 1. Crop latest
      const crop = await transactionalManager.findOne(CropEntity, {
        where: { ID: cropId },
        select: ["CreatedOn", "ModifiedOn"],
      });

      let cropLatest = null;
      if (crop) {
        cropLatest = await this.maxDate(crop.CreatedOn, crop.ModifiedOn);
      }

      // 2. Get ManagementPeriod IDs
      const periods = await transactionalManager.find(ManagementPeriodEntity, {
        where: { CropID: cropId },
        select: ["ID"],
      });
      const periodIds = periods.map((p) => p.ID);

      // 3. Organic manure latest
      let organicLatest = null;
      if (periodIds.length) {
        const organics = await transactionalManager.find(OrganicManureEntity, {
          where: { ManagementPeriodID: In(periodIds) },
          select: ["CreatedOn", "ModifiedOn"],
        });

        for (const o of organics) {
          const latest = await this.maxDate(o.CreatedOn, o.ModifiedOn);
          organicLatest = await this.maxDate(organicLatest, latest);
        }
      }

      // 4. Fertiliser latest
      let fertiliserLatest = null;
      if (periodIds.length) {
        const fertilisers = await transactionalManager.find(
          FertiliserManuresEntity,
          {
            where: { ManagementPeriodID: In(periodIds) },
            select: ["CreatedOn", "ModifiedOn"],
          },
        );

        for (const f of fertilisers) {
          const latest = await this.maxDate(f.CreatedOn, f.ModifiedOn);
          fertiliserLatest = await this.maxDate(fertiliserLatest, latest);
        }
      }

      // 5. Recommendation latest (one per ManagementPeriod)
      let recommendationLatest = null;
      if (periodIds.length) {
        const recommendations = await transactionalManager.find(
          RecommendationEntity,
          {
            where: { ManagementPeriodID: In(periodIds) },
            select: ["CreatedOn", "ModifiedOn"],
          },
        );

        for (const r of recommendations) {
          const latest = await this.maxDate(r.CreatedOn, r.ModifiedOn);
          recommendationLatest = await this.maxDate(
            recommendationLatest,
            latest,
          );
        }
      }

      // 6. Final latest among all four
      const finalLatest = await this.maxDate(
        cropLatest,
        await this.maxDate(
          organicLatest,
          await this.maxDate(fertiliserLatest, recommendationLatest),
        ),
      );

      return finalLatest;
    });
  }

  async maxDate(d1, d2) {
    if (!d1) return d2 || null;
    if (!d2) return d1 || null;
    return d1 > d2 ? d1 : d2;
  }

  async MergeCrop(
    userId,
    // year,
    // confirm,
    Crops,
    request,
  ) {
    const cropsWithID = {
      Crops: Crops.Crops.filter((crop) => crop.Crop.ID !== null),
    };
    const cropsWithoutID = Crops.Crops.filter((crop) => crop.Crop.ID === null);

    const cropIds = Crops.Crops.filter(
      (crop) => crop.Crop.ID !== null && crop.Crop.IsDeleted === true,
    ) // Adding condition for IsDeleted and ID not null
      .map((crop) => crop.Crop.ID);
    return await AppDataSource.transaction(async (transactionalManager) => {
      
      if (cropIds.length > 0) {
        for (const cropId of cropIds) {
          await this.deleteCrop(cropId, userId, request, transactionalManager);
        }
      }
      await this.updateCropData(
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
      console.log("createdPlan", createdPlan);
      return createdPlan != null ? true : false;
    });
  }

  async getPlanByFieldIdAndYear(fieldId, year) {
    const cropData = await this.repository.find({
      where: {
        FieldID: fieldId,
        Year: year,
      },
    });

    return cropData;
  }
}

module.exports = { CropService };
