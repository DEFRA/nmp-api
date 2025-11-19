const { AppDataSource } = require("../db/data-source");
const { CropEntity } = require("../db/entity/crop.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const {
  SoilTypeSoilTextureEntity,
} = require("../db/entity/soil-type-soil-texture.entity");
const { BaseService } = require("../base/base.service");
const RB209SoilService = require("../vendors/rb209/soil/soil.service");
const boom = require("@hapi/boom");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const {
  PreviousGrassesEntity,
} = require("../db/entity/previous-grasses-entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const {
  RecommendationCommentEntity,
} = require("../db/entity/recommendation-comment.entity");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const { Between, MoreThan } = require("typeorm");
const RB209ArableService = require("../vendors/rb209/arable/arable.service");
const MannerManureTypesService = require("../vendors/manner/manure-types/manure-types.service");
const MannerApplicationMethodService = require("../vendors/manner/application-method/application-method.service");
const {
  IncorporationMethodService,
} = require("../incorporation-method/incorporation-method.service");
const MannerIncorporationMethodService = require("../vendors/manner/incorporation-method/incorporation-method.service");
const MannerIncorporationDelayService = require("../vendors/manner/incorporation-delay/incorporation-delay.service");
const {
  GrassManagementOptionsEntity,
} = require("../db/entity/grassManagementOptionsEntity");

const RB209GrassService = require("../vendors/rb209/grass/grass.service");
const RB209GrasslandService = require("../vendors/rb209/grassland/grassland.service");
const { UpdateRecommendationChanges } = require("../shared/updateRecommendationsChanges");
const { UpdateRecommendation } = require("../shared/updateRecommendation.service");
const { PreviousCroppingEntity } = require("../db/entity/previous-cropping.entity");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { PreviousCroppingMapper } = require("../constants/action-mapper");

class FieldService extends BaseService {
  constructor() {
    super(FieldEntity);
    this.repository = AppDataSource.getRepository(FieldEntity);
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.soilAnalysisRepository =
      AppDataSource.getRepository(SoilAnalysisEntity);
    this.soilTypeSoilTextureRepository = AppDataSource.getRepository(
      SoilTypeSoilTextureEntity
    );
    this.managementPeriodRepository = AppDataSource.getRepository(
      ManagementPeriodEntity
    );
    this.rB209SoilService = new RB209SoilService();
    this.snsAnalysisRepository = AppDataSource.getRepository(SnsAnalysesEntity);
    this.recommendationRepository =
      AppDataSource.getRepository(RecommendationEntity);
    this.pkBalanceRepository = AppDataSource.getRepository(PKBalanceEntity);
    this.previousGrassesRepository = AppDataSource.getRepository(
      PreviousGrassesEntity
    );
    this.previousCroppingRepository = AppDataSource.getRepository(
      PreviousCroppingEntity
    );
    this.organicManureRepository =
      AppDataSource.getRepository(OrganicManureEntity);
    this.recommendationCommentsRepository = AppDataSource.getRepository(
      RecommendationCommentEntity
    );
    this.fertiliserManureRepository = AppDataSource.getRepository(
      FertiliserManuresEntity
    );
    this.farmRepository = AppDataSource.getRepository(FarmEntity);
    this.rB209ArableService = new RB209ArableService();
    this.MannerManureTypesService = new MannerManureTypesService();
    this.MannerApplicationMethodService = new MannerApplicationMethodService();
    this.MannerIncorporationMethodService =
      new MannerIncorporationMethodService();
    this.MannerIncorporationDelayService =
      new MannerIncorporationDelayService();
    this.grassManagementOptionsRepository = AppDataSource.getRepository(
      GrassManagementOptionsEntity
    );
    this.rB209GrassService = new RB209GrassService();
    this.rB209GrasslandService = new RB209GrasslandService();
    this.UpdateRecommendationChanges = new UpdateRecommendationChanges();
    this.UpdateRecommendation = new UpdateRecommendation();
  }
  async getFieldCropAndSoilDetails(fieldId, year, confirm) {
    const crop = await this.cropRepository.findOneBy({
      FieldID: fieldId,
      Year: year,
      Confirm: confirm,
    });

    const soilTypeId = (await this.repository.findOneBy({ ID: fieldId }))
      ?.SoilTypeID;
    const soil = await this.rB209SoilService.getData(
      `/Soil/SoilType/${soilTypeId}`
    );

    return {
      FieldType: crop?.FieldType,
      SoilTypeID: soilTypeId,
      SoilTypeName: soil?.soilType,
      SowingDate: crop?.SowingDate,
    };
  }

  async checkFieldExists(farmId, name) {
    return await this.recordExists({ FarmID: farmId, Name: name });
  }

  async getSoilTextureBySoilTypeId(soilTypeId) {
    const soilTexture = await this.soilTypeSoilTextureRepository.findOneBy({
      SoilTypeID: soilTypeId,
    });
    if (soilTypeId == null || !soilTexture) {
      return {
        TopSoilID: null,
        SubSoilID: null,
      };
    }

    return {
      TopSoilID: soilTexture.TopSoilID,
      SubSoilID: soilTexture.SubSoilID,
    };
  }
  async saveRecommendationCrops(
    transactionalManager,
    managementPeriodID,
    userId
  ) {
    // Initialize variables for recommendations for both Crop Orders
    let cropData = {
      CropN: null,
      NBalance: null,
      ManureN: null,
      FertilizerN: null,
      CropP2O5: null,
      PBalance: null,
      ManureP2O5: null,
      FertilizerP2O5: null,
      CropK2O: null,
      KBalance: null,
      ManureK2O: null,
      FertilizerK2O: null,
      CropMgO: null,
      MgBalance: null,
      ManureMgO: null,
      FertilizerMgO: null,
      CropSO3: null,
      SBalance: null,
      ManureSO3: null,
      FertilizerSO3: null,
      CropNa2O: null,
      NaBalance: null,
      ManureNa2O: null,
      FertilizerNa2O: null,
      CropLime: null,
      LimeBalance: null,
      ManureLime: null,
      FertilizerLime: null,
      PH: null,
      SNSIndex: null,
      PIndex: null,
      KIndex: null,
      MgIndex: null,
      SIndex: null,
    };

    await transactionalManager.save(
      RecommendationEntity,
      this.recommendationRepository.create({
        ...cropData,
        ManagementPeriodID: managementPeriodID,
        Comments: null,
        CreatedOn: new Date(),
        CreatedByID: userId,
      })
    );
  }
  async createFieldWithSoilAnalysisAndCrops(farmId, body, userId) {
    const exists = await this.checkFieldExists(farmId, body.Field.Name);
    if (exists) {
      throw boom.conflict("Field already exists with this Farm Id and Name");
    }

    // const { TopSoilID, SubSoilID } = await this.getSoilTextureBySoilTypeId(
    //   body.Field.SoilTypeID
    // );

    return await AppDataSource.transaction(async (transactionalManager) => {
      const field = this.repository.create({
        ...body.Field,
        FarmID: farmId,
        CreatedByID: userId,
        CreatedOn: new Date(),
      });
      const Field = await transactionalManager.save(FieldEntity, field);

      let SoilAnalysis = null;
      if (body.SoilAnalysis) {
        SoilAnalysis = await transactionalManager.save(
          SoilAnalysisEntity,
          this.soilAnalysisRepository.create({
            ...body?.SoilAnalysis,
            FieldID: Field.ID,
            CreatedByID: userId,
            CreatedOn: new Date(),
          })
        );
      }
      let PKBalance = null;
      if (body.SoilAnalysis != null) {
        if (
          SoilAnalysis.Potassium != null ||
          SoilAnalysis.Phosphorus != null ||
          SoilAnalysis.PotassiumIndex != null ||
          SoilAnalysis.PhosphorusIndex != null
        ) {
          if (body.PKBalance) {
            let pkBalanceBody = body.PKBalance;
            let { CreatedByID, CreatedOn, ...createdData } = body.PKBalance;
            PKBalance = await transactionalManager.save(
              PKBalanceEntity,
              this.pkBalanceRepository.create({
                ...createdData,
                FieldID: Field.ID,
                CreatedByID: userId,
                CreatedOn: new Date(),
              })
            );
          }
        }
      }
      // let SnsAnalysis = null;
      // if (body.SnsAnalysis) {
      //   SnsAnalysis = await transactionalManager.save(
      //     SnsAnalysesEntity,
      //     this.snsAnalysisRepository.create({
      //       ...body?.SnsAnalysis,
      //       FieldID: Field.ID,
      //       CreatedByID: userId,
      //       CreatedOn: new Date(),
      //     })
      //   );
      // }
      // Save PreviousCrops
      let Previouscrops = [];
      if (body.PreviousCroppings && body.PreviousCroppings.length > 0) {
        for (const cropsData of body.PreviousCroppings) {
          const {Action , ...createPrevCrops} = cropsData
          const savedCrops = await transactionalManager.save(
            PreviousCroppingEntity,
            this.previousCroppingRepository.create({
              ...createPrevCrops,
              ...(cropsData.ID == 0 ? { ID: null } : {}),
              FieldID: Field.ID,
              CreatedByID: userId,
              CreatedOn: new Date(),
            })
          );

          Previouscrops.push(savedCrops);
        }
      }
      const Crops = [];
      if (body.crops) {
        for (const cropData of body.Crops) {
          const savedCrop = await transactionalManager.save(
            CropEntity,
            this.cropRepository.create({
              ...cropData.Crop,
              FieldID: Field.ID,
              CreatedByID: userId,
              CreatedOn: new Date(),
            })
          );
          const ManagementPeriods = [];
          let savedManagementPeriod;
          for (const managementPeriod of cropData.ManagementPeriods) {
            savedManagementPeriod = await transactionalManager.save(
              ManagementPeriodEntity,
              this.managementPeriodRepository.create({
                ...managementPeriod,
                CropID: savedCrop.ID,
                CreatedByID: userId,
                CreatedOn: new Date(),
              })
            );
            ManagementPeriods.push(savedManagementPeriod);
          }
          await this.saveRecommendationCrops(
            transactionalManager,
            savedManagementPeriod.ID,
            userId
          );

          Crops.push({ Crop: savedCrop, ManagementPeriods });
        }
      }

      return {
        Field,
        SoilAnalysis,
        // SnsAnalysis,
        Previouscrops,
        PKBalance,
      };
    });
  }
  async updateField(payload, userId, fieldId, request) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      const { Field: updatedFieldData, PreviousCroppings } = payload;
      const { ID, CreatedByID, CreatedOn, EncryptedFieldId, ...dataToUpdate } =
        updatedFieldData;

        console.log("datatoupdate", payload);
        console.log("updatedFieldData", updatedFieldData);

      // 1. Get original field inside transaction
      const originalField = await transactionalManager.findOne(FieldEntity, {
        where: { ID: fieldId },
      });

      if (!originalField) {
        console.log(`Field with ID ${fieldId} not found`);
      }

      // 2. Check if sensitive fields are changing
      const sensitiveFields = [
        "TotalArea",
        "CroppedArea",
        "ManureNonSpreadingArea",
        "IsWithinNVZ",
        "IsAbove300SeaLevel",
        "SoilTypeID",
        "SoilReleasingClay",
        "SoilOverChalk",
        "NVZProgrammeID",
      ];

      let isSensitiveChange = false;
      for (const field of sensitiveFields) {
        if( updatedFieldData[field] == 0 ){
          updatedFieldData[field] = null
        }
        if ( originalField[field] == 0){
          originalField[field] = null
        }
      
        if (
          updatedFieldData[field] != undefined &&
          updatedFieldData[field] != originalField[field]
        ) {
          isSensitiveChange = true;
          break;
        }
      }

      // 3. If sensitive fields changed → check crops
      if (isSensitiveChange) {
        const crops = await transactionalManager.find(CropEntity, {
          where: { FieldID: fieldId },
        });

        const oldestCrop = crops.reduce((oldest, current) =>
          current.Year < oldest.Year ? current : oldest
        );

        console.log("Number of crops:", crops.length);
        console.log("Oldest crop:", oldestCrop);


        

        await this.UpdateRecommendationChanges.updateRecommendationAndOrganicManure(
          fieldId,
          oldestCrop.Year,
          request,
          userId,
          transactionalManager
        );

        const nextAvailableCrop = await transactionalManager.findOne(
          CropEntity,
          {
            where: {
              FieldID: fieldId,
              Year: MoreThan(oldestCrop.Year),
            },
            order: { Year: "ASC" },
          }
        );
        console.log("nextAvailableCrop", nextAvailableCrop);

        if (nextAvailableCrop) {
          this.UpdateRecommendation.updateRecommendationsForField(
            fieldId,
            nextAvailableCrop.Year,
            request,
            userId
          ).catch((error) => {
            console.error("Error updating next crop's recommendations:", error);
          });
        }
      }
       
      //let updatedOrInsertedPrevCroppings = [];
      //  if (Array.isArray(PreviousCroppings) && PreviousCroppings.length > 0) {
      //    let hasPrevCropUpdated = false;
      //    let previousCropping
      //    // Get all existing PreviousCroppings for this field
      //    const existingPrevCroppings = await transactionalManager.find(
      //      PreviousCroppingEntity,
      //      { where: { FieldID: fieldId } }
      //    );

      //    // Map for quick lookup by HarvestYear
      //    const existingMap = new Map(
      //      existingPrevCroppings.map((pc) => [pc.HarvestYear, pc])
      //    );

      //    // Extract HarvestYears from incoming data
      //    const incomingYears = PreviousCroppings.map((p) => p.HarvestYear);
      //    for (const prevCrop of PreviousCroppings) {
      //      // Ensure FieldID is attached
      //      prevCrop.FieldID = fieldId;

      //      // Check if record already exists for FieldID
      //      const existingPrevCrop = await transactionalManager.findOne(
      //        PreviousCroppingEntity,
      //        {
      //          where: { FieldID: fieldId, HarvestYear: prevCrop.HarvestYear },
      //        }
      //      );

      //      const { ID, CreatedOn, CreatedByID,PreviousCroppings,Action, ...prevCropDataToUpdate } =
      //        prevCrop;

      //      if (existingPrevCrop) {
      //        // Update existing
      //      previousCropping =  await transactionalManager.update(
      //          PreviousCroppingEntity,
      //          existingPrevCrop.ID,
      //          {
      //            ...prevCropDataToUpdate,
      //            ModifiedByID: userId,
      //            ModifiedOn: new Date(),
      //          }
      //        );

      //        hasPrevCropUpdated = true;
      //      } else {
      //        // Insert new record if not found
      //     previousCropping = await transactionalManager.insert(PreviousCroppingEntity, {
      //          ...prevCropDataToUpdate,
      //          FieldID: fieldId,
      //          CreatedByID: userId,
      //          CreatedOn: new Date(),
      //        });
      //        hasPrevCropUpdated = true;

      //      }
      //    }

      //    // 4b. Delete old records that are not in incoming list
      //    const toDelete = existingPrevCroppings.filter(
      //      (pc) => !incomingYears.includes(pc.HarvestYear)
      //    );

      //    if (toDelete.length > 0) {
      //      const idsToDelete = toDelete.map((pc) => pc.ID);
      //      await transactionalManager.delete(
      //        PreviousCroppingEntity,
      //        idsToDelete
      //      );
      //        hasPrevCropUpdated = true;
      //    }

      //    if (hasPrevCropUpdated) {
      //      const crops = await transactionalManager.find(CropEntity, {
      //        where: { FieldID: fieldId },
      //      });

      //      if (crops.length > 0) {
      //        const oldestCrop = crops.reduce((oldest, current) =>
      //          current.Year < oldest.Year ? current : oldest
      //        );

      //        this.UpdateRecommendation.updateRecommendationsForField(
      //          fieldId,
      //          oldestCrop.Year,
      //          request,
      //          userId
      //        ).catch((error) => {
      //          console.error(
      //            "Error updating next crop's recommendations:",
      //            error
      //          );
      //        });
      //      }
      //    }
      //       updatedOrInsertedPrevCroppings = await transactionalManager.find(
      //         PreviousCroppingEntity,
      //         { where: { FieldID: fieldId } }
      //       );
      //  }

      let updatedOrInsertedPrevCroppings = [];

      if (Array.isArray(PreviousCroppings) && PreviousCroppings.length > 0) {
        let hasPrevCropUpdated = false;


        for (const prevCrop of PreviousCroppings) {
          prevCrop.FieldID = fieldId;

          const {
            ID,
            CreatedOn,
            CreatedByID,
            PreviousCroppings,
            Action,
            ...prevCropData
          } = prevCrop;

          // 🔍 Get existing record by ID (if ID present)
          let existingPrevCrop = null;
          if (ID) {
            existingPrevCrop = await transactionalManager.findOne(
              PreviousCroppingEntity,
              { where: { ID } }
            );
          }

          // ✅ ACTION HANDLING
          if (Action === PreviousCroppingMapper.INSERT) {
            // ✅ Create
            await transactionalManager.insert(PreviousCroppingEntity, {
              ...prevCropData,
              FieldID: fieldId,
              CreatedByID: userId,
              CreatedOn: new Date(),
            });
            hasPrevCropUpdated = true;
          } else if (Action === PreviousCroppingMapper.UPDATE) {
            // ✅ Update
            if (existingPrevCrop) {
              await transactionalManager.update(
                PreviousCroppingEntity,
                existingPrevCrop.ID,
                {
                  ...prevCropData,
                  ModifiedByID: userId,
                  ModifiedOn: new Date(),
                }
              );
              hasPrevCropUpdated = true;
            }
          } else if (Action === PreviousCroppingMapper.DELETE) {
            // ✅ Delete
            if (existingPrevCrop) {
              await transactionalManager.delete(
                PreviousCroppingEntity,
                existingPrevCrop.ID
              );
              hasPrevCropUpdated = true;
            }
          }
        }

        // ✅ Recalculate Recommendations if any change
        if (hasPrevCropUpdated) {
          const crops = await transactionalManager.find(CropEntity, {
            where: { FieldID: fieldId },
          });

          if (crops.length > 0) {
            const oldestCrop = crops.reduce((oldest, current) =>
              current.Year < oldest.Year ? current : oldest
            );

            this.UpdateRecommendation.updateRecommendationsForField(
              fieldId,
              oldestCrop.Year,
              request,
              userId
            ).catch((error) => {
              console.error(
                "Error updating next crop's recommendations:",
                error
              );
            });
          }
        }

        // ✅ Return latest data
        updatedOrInsertedPrevCroppings = await transactionalManager.find(
          PreviousCroppingEntity,
          { where: { FieldID: fieldId } }
        );
      }

      const updateResult = await transactionalManager.update(
        FieldEntity,
        fieldId,
        {
          ...dataToUpdate,
          ModifiedByID: userId,
          ModifiedOn: new Date(),
        }
      );

      if (updateResult.affected === 0) {
        throw boom.notFound(`Field with ID ${fieldId} not found`);
      }

      // 5. Fetch updated field inside same transaction
      const updatedField = await transactionalManager.findOne(FieldEntity, {
        where: { ID: fieldId },
      });

      return {
        Field: updatedField,
        PreviousCroppings: updatedOrInsertedPrevCroppings
      };
    });
  }

  async deleteFieldAndRelatedEntities(fieldId) {
    // Check if the field exists
    const fieldToDelete = await this.repository.findOne({
      where: { ID: fieldId },
    });

    // If the field does not exist, throw a not found error
    if (fieldToDelete == null) {
      throw boom.notFound(`Field with ID ${fieldId} not found`);
    }

    try {
      // Call the stored procedure to delete the field and related entities
      const storedProcedure = "EXEC dbo.spFields_DeleteFields @fieldId = @0";
      await AppDataSource.query(storedProcedure, [fieldId]);
    } catch (error) {
      // Log the error and throw an internal server error
      console.error("Error deleting field:", error);
    }
  }

  async getFieldSoilAnalysisAndSnsAnalysisDetails(fieldId) {
    const fieldData = await this.repository.findOneBy({
      ID: fieldId,
    });

    const soilAnalysisData = await this.soilAnalysisRepository.findOne({
      where: { FieldID: fieldId },

      order: { Year: "DESC", Date: "DESC" },
    });
    // const latestSoilAnalysis = await this.soilAnalysisRepository.findOne({
    //   where: { FieldID: field.ID},
    //   order: { ModifiedOn: "DESC" }, // Sort by ModifiedOn descending
    //   take: 1, // Retrieve only the latest entry
    // });
    // const snsAnalysisData = await this.snsAnalysisRepository.findOneBy({
    //   FieldID: fieldId,
    // });
    const cropData = await this.cropRepository.findOne({
      where: {
        FieldID: fieldId,
      },
      order: {
        Year: "ASC",
      },
    });
    let previousGrassesData = [];
    const previousCroppingData = await this.previousCroppingRepository.find({
      where: { FieldID: fieldId },
    });
    if (previousCroppingData.CropTypeID == CropTypeMapper.GRASS) {
      previousGrassesData = previousCroppingData;
    }
    return {
      Field: fieldData,
      SoilAnalysis: soilAnalysisData,
      // SnsAnalyses: snsAnalysisData,
      Crop: cropData,
      PreviousGrasses: previousGrassesData,
    };
  }

  // Helper function to fetch crop type name
  async getCropTypeName(cropTypeID, cropTypeAllData) {
    // Find the crop type in cropTypeAllData by matching cropTypeId
    const cropType = cropTypeAllData.find(
      (item) => item.cropTypeId === cropTypeID
    );

    // Check if the cropType is found
    if (cropType) {
      return cropType.cropType;
    } else {
      throw new Error("Crop type not found");
    }
  }

  // Helper function to fetch crop type name
  async getCropInfo1Name(cropTypeID, cropInfo1Id) {
    const cropType = await this.rB209ArableService.getData(
      `/Arable/CropInfo1/${cropTypeID}/${cropInfo1Id}`
    );
    return cropType.cropInfo1Name;
  }

  // Helper function to fetch crop type name
  async getCropInfo2Name(cropInfo2Id) {
    const cropType = await this.rB209ArableService.getData(
      `/Arable/CropInfo2/${cropInfo2Id}`
    );
    return cropType.cropInfo2Name;
  }

  // Helper function to fetch crop type name
  async ManureTypeName(ManureTypeID, request) {
    const manureTypeData = await this.MannerManureTypesService.getData(
      `/manure-types/${ManureTypeID}`,
      request
    );

    return manureTypeData.data.name;
  }

  // Helper function to fetch crop type name
  async getApplicationMethodName(ApplicationMethodID, request) {
    const applicationMethodData =
      await this.MannerApplicationMethodService.getData(
        `/application-methods/${ApplicationMethodID}`,
        request
      );
    return applicationMethodData.data.name;
  }

  // Helper function to fetch crop type name
  async getIncorporationMethodName(IncorporationMethodID, request) {
    const incorporationMethodData =
      await this.MannerIncorporationMethodService.getData(
        `/incorporation-methods/${IncorporationMethodID}`,
        request
      );
    return incorporationMethodData.data.name;
  }

  // Helper function to fetch crop type name
  async getIncorporationDelayName(IncorporationDelayID, request) {
    const incorporationDelayData =
      await this.MannerIncorporationDelayService.getData(
        `/incorporation-delays/${IncorporationDelayID}`,
        request
      );
    return incorporationDelayData.data.name;
  }

  async getPreviousCropDataByFieldID(fieldID) {
    let previousGrasses = {};
    const previousCroppingData = await this.previousCroppingRepository.findOne({
      where: { FieldID: fieldID },
    });
    if (previousCroppingData.CropTypeID == CropTypeMapper.GRASS) {
      previousGrasses = previousCroppingData;
    }
    return previousGrasses;
  }

  async getFieldRelatedData(fieldIds, year, request) {
    // Fetch all fields by the list of FieldIDs
    const fields = await this.repository.findByIds(fieldIds);
    const cropTypeAllData = await this.rB209ArableService.getData(
      `/Arable/CropTypes`
    );

    // Fetch the farm associated with the first field (assuming all fields belong to the same farm)
    const farm = await this.farmRepository.findOne({
      where: { ID: fields[0].FarmID },
    });

    // Initialize an array to store fields with related data
    const fieldsWithRelatedData = [];

    await Promise.all(
      fields.map(async (field) => {
        // Fetch crops, previousGrasses, snsAnalysis, soilAnalysis, and pkBalance for the current field
        const crops = await this.cropRepository.find({
          where: { FieldID: field.ID, Year: year },
        });
        let previousCropData = await this.cropRepository.findOne({
          where: { FieldID: field.ID, Year: year - 1 },
      select: ["CropTypeID"],
      order: {
        CreatedOn: "DESC"  // Order by createdDate in descending order
      },
      });
      // if no plan in previous year. Fetch from previous crop history
      if(previousCropData==null)
      {
          previousCropData = await this.previousCroppingRepository.findOne({
                where: { FieldID: field.ID, HarvestYear: year-1 },
                select: ["CropTypeID"],
              });
      }
      const previousCropTypeName = previousCropData 
        ? await this.getCropTypeName(previousCropData.CropTypeID,cropTypeAllData)
        : null;


        // const previousGrasses = await this.previousGrassesRepository.find({
        //   where: { FieldID: field.ID },
        // });
        const previousGrasses = await this.getPreviousCropDataByFieldID(
          field.ID
        );
        let grassManagementOptionName = null;
        if (previousGrasses) {
          const grassManagementOptionID =
            previousGrasses.GrassManagementOptionID != null
              ? previousGrasses.GrassManagementOptionID
              : null;

          if (grassManagementOptionID) {
            const grassManagementOption =
              await this.grassManagementOptionsRepository.findOne({
                where: { ID: grassManagementOptionID },
                select: ["Name"],
              });
            console.log("grassManagementOption", grassManagementOption);
            grassManagementOptionName = grassManagementOption
              ? grassManagementOption.Name
              : null;
          }
        }
        // const snsAnalysis = await this.snsAnalysisRepository.find({
        //   where: { FieldID: field.ID },
        // });
        // Fetch the latest SoilAnalysis entry for the current field
        // const latestSoilAnalysis = await this.soilAnalysisRepository.findOne({
        //   where: { FieldID: field.ID },
        //   order: { ModifiedOn: "DESC" }, // Sort by ModifiedOn descending
        //   take: 1, // Retrieve only the latest entry
        // });

        // If no SoilAnalysis is found, you can handle it accordingly (e.g., set default values)
        // const soilAnalysisAndSNSanalysis =
        //   latestSoilAnalysis || snsAnalysis.length > 0
        //     ? {
        //         PH:
        //           latestSoilAnalysis != null
        //             ? latestSoilAnalysis.PH
        //             : "Not Entered",
        //         PhosphorusIndex:
        //           latestSoilAnalysis != null
        //             ? latestSoilAnalysis.PhosphorusIndex
        //             : "Not Entered",
        //         PotassiumIndex:
        //           latestSoilAnalysis != null
        //             ? latestSoilAnalysis.PotassiumIndex
        //             : "Not Entered",
        //         MagnesiumIndex:
        //           latestSoilAnalysis != null
        //             ? latestSoilAnalysis.MagnesiumIndex
        //             : "Not Entered",
        //         SNS:
        //           snsAnalysis.length > 0
        //             ? snsAnalysis[0].SoilNitrogenSupplyValue
        //             : "Not Entered",
        //         SNSIndex:
        //           snsAnalysis.length > 0
        //             ? snsAnalysis[0].SoilNitrogenSupplyIndex
        //             : "Not Entered",
        //         SNSMethod: "Not Entered",
        //       }
        //     : null;

        const pkBalance = await this.pkBalanceRepository.findOne({
          where: { FieldID: field.ID, Year: year },
        });
        const Errors = [];
        // Enrich crops with management periods and their sub-objects

        // const { latestSoilAnalysis, errors: soilAnalysisErrors } =
        //   await this.handleSoilAnalysisValidation(field.ID, year);

        // Errors.push(...soilAnalysisErrors);
        // if (Errors.length > 0) {
        //   throw new Error(JSON.stringify(Errors));
        // }
        const soilAnalysisRecords = await this.soilAnalysisRepository.find({
          where: {
            FieldID: field.ID,
            Year: year,
          },
          order: { Date: "DESC" }, // Order by date, most recent first
        });

        const soilAnalysis = soilAnalysisRecords ? soilAnalysisRecords : null;

        if (crops != null) {
          for (const crop of crops) {
            if (crop.CropTypeID == 140) {
              let swardType = null;
              let defoliationSequenceDescription = null;
              let swardTypeManagment = null;
              if (
                crop.SwardTypeID != null &&
                crop.PotentialCut != null &&
                crop.DefoliationSequenceID != null
              ) {
                defoliationSequenceDescription =
                  await this.findDefoliationSequenceDescription(
                    crop.SwardManagementID,
                    crop.PotentialCut,
                    crop.DefoliationSequenceID,
                    crop.Establishment
                  );
              }
              crop.DefoliationSequenceName =
                defoliationSequenceDescription != null
                  ? defoliationSequenceDescription
                  : null;
              if (crop.SwardTypeID != null) {
                swardType = await this.findSwardType(crop.SwardTypeID);
              }
              crop.SwardTypeName = swardType != null ? swardType : null;
              if (crop.SwardManagementID != null) {
                swardTypeManagment = await this.findSwardTypeManagment(
                  crop.SwardManagementID
                );
              }
              crop.SwardManagementName =
                swardTypeManagment != null ? swardTypeManagment : null;
              crop.EstablishmentName =
                crop.CropTypeID == 140 && crop.Establishment != null
                  ? await this.findGrassSeason(crop.Establishment)
                  : null;
            }
          }
        }

        const cropsWithManagement = [];
        for (const crop of crops) {
          try {
            // Fetch SNS analysis
            const snsAnalysis = await this.snsAnalysisRepository.findOne({
              where: { CropID: crop.ID },
            });
            const SNSAnalysis = snsAnalysis
              ? {
                  SNSValue: snsAnalysis.SoilNitrogenSupplyValue,
                  SNSIndex: snsAnalysis.SoilNitrogenSupplyIndex,
                  SNSMethod: "Not Entered",
                }
              : null;
            // Fetch management periods related to the crop
            const managementPeriods =
              await this.managementPeriodRepository.find({
                where: { CropID: crop.ID },
              });

            // Process management data
            const managementWithSubData = [];
            for (const managementPeriod of managementPeriods) {
              const organicManures = await this.organicManureRepository.find({
                where: { ManagementPeriodID: managementPeriod.ID },
              });

              // Add manure-related names to each OrganicManure object
              const organicManuresWithNames = [];
              for (const manure of organicManures) {
                const manureTypeName = await this.ManureTypeName(
                  manure.ManureTypeID,
                  request
                );
                const applicationMethodName =
                  await this.getApplicationMethodName(
                    manure.ApplicationMethodID,
                    request
                  );
                const incorporationMethodName =
                  await this.getIncorporationMethodName(
                    manure.IncorporationMethodID,
                    request
                  );
                const incorporationDelayName =
                  await this.getIncorporationDelayName(
                    manure.IncorporationDelayID,
                    request
                  );

                organicManuresWithNames.push({
                  ...manure,
                  ManureTypeName: manureTypeName,
                  ApplicationMethodName: applicationMethodName,
                  IncorporationMethodName: incorporationMethodName,
                  IncorporationDelayName: incorporationDelayName,
                });
              }

              // Fetch recommendation based on management period
              const recommendation =
                await this.recommendationRepository.findOne({
                  where: { ManagementPeriodID: managementPeriod.ID },
                });

              // Fetch recommendations using stored procedure
              const storedProcedure =
                "EXEC dbo.spRecommendations_GetRecommendations @fieldId = @0, @harvestYear = @1";
              const recommendations = await this.executeQuery(storedProcedure, [
                field.ID,
                year,
              ]);

              let mergedRecommendation = null;
              if (recommendations != null) {
                const recBasedOnManId = recommendations.filter(
                  (rec) => rec.ManagementPeriod_ID === managementPeriod.ID
                );
                if (recBasedOnManId != null) {
                  for (const r of recBasedOnManId) {
                    const data = {
                      Crop: {},
                      Recommendation: {},
                      ManagementPeriod: {},
                      FertiliserManure: {},
                    };

                    const previousAppliedLime =
                      await this.processSoilRecommendations(year, field.ID, r);
                    data.Recommendation.PreviousAppliedLime =
                      previousAppliedLime || 0;

                    Object.keys(r).forEach((recDataKey) => {
                      if (recDataKey.startsWith("Crop_"))
                        data.Crop[recDataKey.slice(5)] = r[recDataKey];
                      else if (recDataKey.startsWith("Recommendation_"))
                        data.Recommendation[recDataKey.slice(15)] =
                          r[recDataKey];
                      else if (recDataKey.startsWith("ManagementPeriod_"))
                        data.ManagementPeriod[recDataKey.slice(17)] =
                          r[recDataKey];
                      else if (recDataKey.startsWith("FertiliserManure_"))
                        data.FertiliserManure[recDataKey.slice(17)] =
                          r[recDataKey];
                    });

                    mergedRecommendation = {
                      ...data.Recommendation,
                      ...data.FertiliserManure, // Add FertiliserManure properties to Recommendation
                    };
                  }
                }
              }

              // Fetch comments for the recommendation
              const recommendationComments = recommendation
                ? await this.recommendationCommentsRepository.find({
                    where: { RecommendationID: recommendation.ID },
                  })
                : [];

              // Fetch fertiliser manures for the management period
              const fertiliserManures =
                await this.fertiliserManureRepository.find({
                  where: { ManagementPeriodID: managementPeriod.ID },
                });

              managementWithSubData.push({
                ...managementPeriod,
                OrganicManures: organicManuresWithNames,
                Recommendation: recommendation
                  ? {
                      ...(mergedRecommendation != null
                        ? mergedRecommendation
                        : recommendation),
                      RecommendationComments: recommendationComments,
                    }
                  : null,
                FertiliserManures: fertiliserManures,
              });
            }

            // Fetch crop type and other crop-related information
            const cropTypeName = await this.getCropTypeName(
              crop.CropTypeID,
              cropTypeAllData
            );
            const cropInfo1Name = crop.CropInfo1
              ? await this.getCropInfo1Name(crop.CropTypeID, crop.CropInfo1)
              : "";
            const cropInfo2Name = crop.CropInfo2
              ? await this.getCropInfo2Name(crop.CropInfo2)
              : "";

            cropsWithManagement.push({
              ...crop,
              CropTypeName: cropTypeName,
              CropInfo1Name: cropInfo1Name,
              CropInfo2Name: cropInfo2Name,
              ManagementPeriods: managementWithSubData,
              SNSAnalysis: SNSAnalysis,
            });
          } catch (error) {
            console.error("Error processing crop", crop.ID, error);
            cropsWithManagement.push({
              ...crop,
              error: error.message,
            });
          }
        }

        // Fetch SoilTypeName by passing field.SoilTypeID
        const soil = await this.rB209SoilService.getData(
          `/Soil/SoilType/${field.SoilTypeID}`
        );
        const soilTypeName = soil?.soilType;
        // Get SulphurDeficient from soilAnalysis
        const sulphurDeficient =
          soilAnalysis != null ? soilAnalysis?.SulphurDeficient : null;
        // Create soilDetails object
        const soilDetails = {
          SoilTypeName: soilTypeName,
          PotashReleasingClay: field.SoilReleasingClay,
          SulphurDeficient: sulphurDeficient,
          StartingP:
            pkBalance && pkBalance.PBalance != null ? pkBalance.PBalance : null,
          Startingk:
            pkBalance && pkBalance.KBalance != null ? pkBalance.KBalance : null,
        };
        console.log("soilDetails", soilDetails);
        // Build the full field object with all associated sub-objects
        const fieldData = {
          ...field,
          Management: grassManagementOptionName,
          PreviousCropID: previousCropData?previousCropData.CropTypeID:null,
          PreviousCrop: previousCropTypeName,
          Crops: cropsWithManagement,
          // PreviousGrasses: previousGrasses,
          SoilAnalysis: soilAnalysis,
          SoilDetails: soilDetails,
        };

        // Add the field data to the list of fields
        fieldsWithRelatedData.push(fieldData);
      })
    );

    // Add the fields to the farm object
    farm.Fields = fieldsWithRelatedData;

    // Return the enriched farm object with fields nested inside
    return { Farm: farm };
  }

  async processSoilRecommendations(harvestYear, fieldId, Recommendation) {
    try {
      const currentYear = harvestYear;
      const fiveYearsAgo = currentYear - 5;

      // Step 1: Fetch soil recommendations (before fertiliser apply)
      const soilAnalyses = await this.soilAnalysisRepository.find({
        where: {
          FieldID: fieldId,
          Year: Between(fiveYearsAgo, currentYear),
        },
      });

      // Step 2: Check if any year has pH value > 0
      const soilAnalysisWithPH = soilAnalyses.find((rec) => rec.PH > 0);

      // If no pH > 0 is found, return early without doing any further processing
      if (!soilAnalysisWithPH) {
        return null; // Exit if no recommendation with pH > 0 is found
      }

      // Get the soilAnalysisYear from the recommendation with pH > 0
      const soilAnalysisWithPhYear = soilAnalysisWithPH.Year;
      // console.log(
      //   "RecommendationData",
      //   Recommendation.Crop_ID
      // );
      // console.log(
      //   "RecommendationData1",
      //   Recommendation
      // );
      // const managementPeriodData = await this.findManagementPeriodByID(
      //   Recommendation.ManagementPeriodID
      // );
      // Step 3: Proceed with the process only if pH > 0 is found

      const cropData = await this.findCropDataByID(Recommendation.Crop_ID); // check order 1 or 2

      let totalLime1 = 0;
      let totalLime2 = 0;
      let result = 0;
      if (cropData != null) {
        // Step 4: Handle CropOrder 1 (first crop)
        if (cropData.CropOrder === 1) {
          // Step: Fetch multiple firstCropOrderData based on fieldID, year, and soilAnalysisYear
          const firstCropOrderDataList =
            await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
              fieldId,
              cropData.Year - 1,
              soilAnalysisWithPhYear,
              1
            );

          if (firstCropOrderDataList != null) {
            totalLime1 = await this.getApplyLimeInCaseOfMultipleCrops(
              firstCropOrderDataList
            );
          }

          // Now, totalLime1 contains the sum of lime for all crops found in the list
          console.log(`Total Lime from all firstCropOrderData: ${totalLime1}`);
        }

        // Step 5: Handle CropOrder 2 (second crop)
        if (cropData.CropOrder === 2) {
          totalLime1 = 0;
          const CropOrderDataList =
            await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
              fieldId,
              cropData.Year - 1,
              soilAnalysisWithPhYear
            );

          if (CropOrderDataList != null) {
            totalLime1 = await this.getApplyLimeInCaseOfMultipleCrops(
              CropOrderDataList
            );
          }
          let cropOrder = 1;
          const firstCropOrderData =
            await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
              fieldId,
              cropData.Year,
              null,
              cropOrder
            );
          if (firstCropOrderData != null) {
            totalLime1 += await this.getApplyLimeInCaseOfMultipleCrops(
              firstCropOrderData
            );
          }
        }

        // Step 6: Sum total lime values for both crops

        // Step 7: Subtract the total lime from cropN in the recommendation
        const cropNeedValue = Recommendation.Recommendation_CropN;

        if (totalLime1 > 0) {
          result = cropNeedValue - totalLime1;
          console.log("result", result);
        }
      }
      // Return the result of the calculation
      if (result < 0) {
        return 0;
      } else {
        return result;
      }
    } catch (error) {
      console.error("Error in processSoilRecommendations:", error);
      throw error;
    }
  }
  async findCropDataByID(CropID) {
    // Ensure the managementPeriodID is provided
    if (!CropID) {
      console.error("CropID is required");
    }

    // Find the ManagementPeriod by the provided ManagementPeriodID
    const cropData = await this.cropRepository.findOne({
      where: {
        ID: CropID,
      },
    });

    // Check if management period data is found
    if (!cropData) {
      return 0;
    }

    // Return the associated crop data
    return cropData;
  }
  async findCropDataByFieldIDAndYearToSoilAnalysisYear(
    fieldID,
    year,
    soilAnalysisYear = null,
    cropOrder = null
  ) {
    // Ensure both fieldID and year are provided
    if (!fieldID || !year) {
      console.log("FieldID and Year are required");
      return null;
    }

    // Build the query object
    const query = {
      where: {
        FieldID: fieldID, // FieldID is required
        Year: year, // Default Year filter (exact year match)
      },
    };

    // If cropOrder is provided, include it in the query
    if (cropOrder) {
      query.where.CropOrder = cropOrder;
    }

    // If soilAnalysisYear 2024 is provided, adjust the query to include years up to soilAnalysisYear
    //Harvestyear 2024
    if (soilAnalysisYear) {
      if (year > soilAnalysisYear) {
        query.where.Year = Between(soilAnalysisYear, year); // Include years between `year` and `soilAnalysisYear`
      } else if (year == soilAnalysisYear) {
        query.where.Year = Between(year, soilAnalysisYear); // Include years between `year` and `soilAnalysisYear`
      } else if (year < soilAnalysisYear) {
        return null;
      }
    }

    // Determine whether to use `findOne` or `find` based on the provided parameters
    if (!soilAnalysisYear && cropOrder) {
      // If only fieldID, year, and cropOrder are provided, return a single result using findOne
      return await this.cropRepository.findOne(query);
    } else {
      // If soilAnalysisYear is provided, return all crop data between year and soilAnalysisYear
      const cropDataList = await this.cropRepository.find(query);

      return cropDataList.length > 0 ? cropDataList : null;
    }
  }

  async findAndSumFertiliserManuresByManagementPeriodID(managementPeriodID) {
    // Ensure the managementPeriodID is provided
    if (!managementPeriodID) {
      console.log("ManagementPeriodID is required");
    }

    // Fetch all fertiliser manures data for the given ManagementPeriodID
    const fertiliserManures = await this.fertiliserManureRepository.find({
      where: {
        ManagementPeriodID: managementPeriodID,
      },
      select: {
        Lime: true, // Only select the Lime field
      },
    });

    // Check if any fertiliser manures data is found
    if (!fertiliserManures || fertiliserManures.length === 0) {
      console.log(
        `No fertiliser manures data found for ManagementPeriodID ${managementPeriodID}`
      );
      return 0; // Exit if no fertiliser data is found
    }

    // Sum up the Lime values from the list of fertiliser manures data
    const totalLime = fertiliserManures.reduce((total, item) => {
      return total + (item.Lime || 0); // Add Lime value if available, otherwise 0
    }, 0);

    // Return the total sum of Lime
    return totalLime;
  }

  async getApplyLimeInCaseOfMultipleCrops(cropDataList) {
    let totalLime = 0; // Initialize total lime to 0

    // Ensure cropDataList is an array, if it's not, wrap it in an array
    const cropsToProcess = Array.isArray(cropDataList)
      ? cropDataList
      : [cropDataList];

    // Loop through each crop in the cropsToProcess (which is always an array)
    for (const cropData of cropsToProcess) {
      // Fetch the ManagementPeriod data for the current crop
      const previousManagementPeriodData =
        await this.findManagementPeriodByCropID(cropData.ID);

      // Fetch and sum the total lime for the current management period
      const limeForThisManagementPeriod =
        await this.findAndSumFertiliserManuresByManagementPeriodID(
          previousManagementPeriodData.ID
        );

      // Accumulate the lime value
      totalLime += limeForThisManagementPeriod;
    }

    return totalLime; // Return the total lime value
  }

  async findManagementPeriodByCropID(CropID) {
    // Ensure the managementPeriodID is provided
    if (!CropID) {
      console.error("CropID is required");
    }

    // Find the ManagementPeriodData by the provided ManagementPeriodID
    const managementPeriodData = await this.managementPeriodRepository.findOne({
      where: {
        CropID: CropID,
      },
    });

    // Return the ManagementPeriodData or null if not found
    return managementPeriodData || null;
  }
  async handleSoilAnalysisValidation(fieldId, year) {
    const errors = [];
    const fiveYearsAgo = year - 4;

    // Fetch all soil analyses for the last 5 years
    const soilAnalysisRecordsFiveYears = await this.soilAnalysisRepository.find(
      {
        where: {
          FieldID: fieldId,
          Year: Between(fiveYearsAgo, year), // Fetch records within 5 years
        },
        order: { Date: "DESC" }, // Order by date, most recent first
      }
    );

    // Define the fields we want the latest values for
    const fieldsToTrack = [
      "Date",
      "PH",
      "SoilNitrogenSupplyIndex",
      "PhosphorusIndex",
      "PotassiumIndex",
      "MagnesiumIndex",
      "SulphurDeficient",
      "CreatedOn",
      "ModifiedOn",
    ];
    console.log("soilAnalysisRecordsFiveYears", soilAnalysisRecordsFiveYears);
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
    const isEmpty = Object.values(latestSoilAnalysis).every(
      (value) => value === null
    );
    if (isEmpty) {
      return { latestSoilAnalysis: null, errors };
    }

    return { latestSoilAnalysis, errors };
  }

  async findSwardTypeManagment(SwardManagementID) {
    try {
      let swardManagementsName = null;
      let swardManagementsList = await this.rB209GrassService.getData(
        `Grass/SwardManagements`
      );

      if (swardManagementsList.length > 0) {
        const matchingSward = swardManagementsList.find(
          (x) => x.swardManagementId === SwardManagementID
        );
        if (matchingSward != null) {
          swardManagementsName = matchingSward
            ? matchingSward.swardManagement
            : null;
        }
      }
      console.log("swardManagementsName", swardManagementsName);
      return swardManagementsName;
    } catch (error) {
      console.error(`Error fetching sward Management list`, error);
      return "Unknown";
    }
  }

  async findDefoliationSequenceDescription(
    swardManagementId,
    PotentialCut,
    DefoliationSequenceID,
    establishment
  ) {
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
          (x) => x.defoliationSequenceId == DefoliationSequenceID
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
  }
  async findSwardType(SwardTypeID) {
    try {
      let swardTypeName = null;
      let swardTypeList = await this.rB209GrassService.getData(
        `Grass/SwardTypes`
      );

      if (swardTypeList.length > 0) {
        const matchingSward = swardTypeList.find(
          (x) => x.swardTypeId === SwardTypeID
        );
        if (matchingSward != null) {
          swardTypeName = matchingSward ? matchingSward.swardType : null;
        }
      }

      return swardTypeName;
    } catch (error) {
      console.error(`Error fetching sward Type list`, error);
      return "Unknown";
    }
  }

  async findGrassSeason(seasonID) {
    try {
      let season = await this.rB209GrasslandService.getData(
        `Grassland/GrasslandSeason/${seasonID}`
      );
      return season.seasonName;
    } catch (error) {
      console.error(`Error fetching Grassland Season`, error);
      return "Unknown";
    }
  }
}

module.exports = { FieldService };
