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
      ManureN: null,
      FertilizerN: null,
      CropP2O5: null,
      ManureP2O5: null,
      FertilizerP2O5: null,
      CropK2O: null,
      ManureK2O: null,
      FertilizerK2O: null,
      CropMgO: null,
      ManureMgO: null,
      FertilizerMgO: null,
      CropSO3: null,
      ManureSO3: null,
      FertilizerSO3: null,
      CropNa2O: null,
      ManureNa2O: null,
      FertilizerNa2O: null,
      CropLime: null,
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

    const { TopSoilID, SubSoilID } = await this.getSoilTextureBySoilTypeId(
      body.Field.SoilTypeID
    );

    return await AppDataSource.transaction(async (transactionalManager) => {
      const field = this.repository.create({
        ...body.Field,
        TopSoilID,
        SubSoilID,
        FarmID: farmId,
        CreatedByID: userId,
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
              })
            );
          }
        }
      }
      let SnsAnalysis = null;
      if (body.SnsAnalysis) {
        SnsAnalysis = await transactionalManager.save(
          SnsAnalysesEntity,
          this.snsAnalysisRepository.create({
            ...body?.SnsAnalysis,
            FieldID: Field.ID,
            CreatedByID: userId,
          })
        );
      }
      // Save PreviousGrasses
      let PreviousGrasses = [];
      if (body.PreviousGrasses && body.PreviousGrasses.length > 0) {
        for (const grassData of body.PreviousGrasses) {
          const savedGrass = await transactionalManager.save(
            PreviousGrassesEntity,
            this.previousGrassesRepository.create({
              ...grassData,
              ...(grassData.ID == 0 ? { ID: null } : {}),
              FieldID: Field.ID,
              CreatedByID: userId,
              CreatedOn: new Date(),
            })
          );
          PreviousGrasses.push(savedGrass);
        }
      }
      const Crops = [];
      for (const cropData of body.Crops) {
        const savedCrop = await transactionalManager.save(
          CropEntity,
          this.cropRepository.create({
            ...cropData.Crop,
            FieldID: Field.ID,
            CreatedByID: userId,
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

      return {
        Field,
        SoilAnalysis,
        SnsAnalysis,
        Crops,
        PKBalance,
      };
    });
  }
  async updateField(updatedFieldData, userId, fieldId) {
    const { ID, CreatedByID, CreatedOn, EncryptedFieldId, ...dataToUpdate } =
      updatedFieldData;

    const { TopSoilID, SubSoilID } = await this.getSoilTextureBySoilTypeId(
      updatedFieldData.SoilTypeID
    );

    const result = await this.repository.update(fieldId, {
      ...dataToUpdate,
      TopSoilID,
      SubSoilID,
      ModifiedByID: userId,
      ModifiedOn: new Date(),
    });

    if (result.affected === 0) {
      throw boom.notFound(`Field with ID ${fieldId} not found`);
    }

    const updatedField = await this.repository.findOne({
      where: { ID: fieldId },
    });
    return updatedField;
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

    const soilAnalysisData = await this.soilAnalysisRepository.findOneBy({
      FieldID: fieldId,
    });
    const snsAnalysisData = await this.snsAnalysisRepository.findOneBy({
      FieldID: fieldId,
    });
    const cropData = await this.cropRepository.findOneBy({
      FieldID: fieldId,
      CropInfo1: null,
      Yield: null,
    });
    const previousGrassesData = await this.previousGrassesRepository.find({
      where: { FieldID: fieldId },
    });
    return {
      Field: fieldData,
      SoilAnalysis: soilAnalysisData,
      SnsAnalyses: snsAnalysisData,
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
    const previousGrasses = await this.previousGrassesRepository.findOne({
      where: { FieldID: fieldID },
    });

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

        const previousCropData = await this.cropRepository.findOne({
          where: { FieldID: field.ID, CropInfo1: null },
          select: ["CropTypeID"],
        });

        const previousCropTypename = await this.getCropTypeName(
          previousCropData.CropTypeID,
          cropTypeAllData
        );

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
              console.log(
                "grassManagementOption",
                grassManagementOption
              );
            grassManagementOptionName = grassManagementOption
              ? grassManagementOption.Name
              : null;

             
          }

        }
        const snsAnalysis = await this.snsAnalysisRepository.find({
          where: { FieldID: field.ID },
        });
        // Fetch the latest SoilAnalysis entry for the current field
        const latestSoilAnalysis = await this.soilAnalysisRepository.findOne({
          where: { FieldID: field.ID},
          order: { ModifiedOn: "DESC" }, // Sort by ModifiedOn descending
          take: 1, // Retrieve only the latest entry
        });

        // If no SoilAnalysis is found, you can handle it accordingly (e.g., set default values)
        const soilAnalysisAndSNSanalysis = latestSoilAnalysis
          ? {
              PH: latestSoilAnalysis.PH,
              Phosphorus: latestSoilAnalysis.Phosphorus,
              Potassium: latestSoilAnalysis.Potassium,
              Magnesium: latestSoilAnalysis.Magnesium,
              SNS:
                snsAnalysis.length > 0
                  ? snsAnalysis[0].SoilNitrogenSupplyValue
                  : "Not Entered",
              SNSIndex:
                snsAnalysis.length > 0
                  ? snsAnalysis[0].SoilNitrogenSupplyIndex
                  : "Not Entered",
              SNSMethod: "Not Entered",
            }
          :null;

        const pkBalance = await this.pkBalanceRepository.findOne({
          where: { FieldID: field.ID, Year: year },
        });

        // Enrich crops with management periods and their sub-objects
        const cropsWithManagement = await Promise.all(
          crops.map(async (crop) => {
            const managementPeriods =
              await this.managementPeriodRepository.find({
                where: { CropID: crop.ID },
              });

            const managementWithSubData = await Promise.all(
              managementPeriods.map(async (managementPeriod) => {
                const organicManures = await this.organicManureRepository.find({
                  where: { ManagementPeriodID: managementPeriod.ID },
                });

                // Add manure-related names to each OrganicManure object
                const organicManuresWithNames = await Promise.all(
                  organicManures.map(async (manure) => {
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

                    return {
                      ...manure,
                      ManureTypeName: manureTypeName,
                      ApplicationMethodName: applicationMethodName,
                      IncorporationMethodName: incorporationMethodName,
                      IncorporationDelayName: incorporationDelayName,
                    };
                  })
                );
                const recommendation =
                  await this.recommendationRepository.findOne({
                    where: { ManagementPeriodID: managementPeriod.ID },
                  });

                // Fetch comments for the single recommendation
                const recommendationComments = recommendation
                  ? await this.recommendationCommentsRepository.find({
                      where: { RecommendationID: recommendation.ID },
                    })
                  : [];

                const fertiliserManures =
                  await this.fertiliserManureRepository.find({
                    where: { ManagementPeriodID: managementPeriod.ID },
                  });

                return {
                  ...managementPeriod,
                  OrganicManures: organicManuresWithNames,
                  Recommendation: recommendation
                    ? {
                        ...recommendation,
                        RecommendationComments: recommendationComments,
                      }
                    : null,
                  FertiliserManures: fertiliserManures,
                };
              })
            );
            const cropTypeName = await this.getCropTypeName(
              crop.CropTypeID,
              cropTypeAllData
            );
            let cropInfo1Name;
            if (crop.CropInfo1!=null) {   
              cropInfo1Name = await this.getCropInfo1Name(
                crop.CropTypeID,
                crop.CropInfo1
              );
            } else {
              cropInfo1Name = "";
            }

            let cropInfo2Name;
            if (crop.CropInfo2) {
              cropInfo2Name = await this.getCropInfo2Name(crop.CropInfo2);
            } else {
              cropInfo2Name = "";
            }

            return {
              ...crop,
              CropTypeName: cropTypeName,
              CropInfo1Name: cropInfo1Name,
              CropInfo2Name: cropInfo2Name,
              ManagementPeriods: managementWithSubData,
            };
          })
        );
        // Fetch SoilTypeName by passing field.SoilTypeID
        const soil = await this.rB209SoilService.getData(
          `/Soil/SoilType/${field.SoilTypeID}`
        );
        const soilTypeName = soil?.soilType;
        // Get SulphurDeficient from soilAnalysis
        const sulphurDeficient = latestSoilAnalysis?.SulphurDeficient;
        // Create soilDetails object
        const soilDetails = {
          SoilTypeName: soilTypeName,
          PotashReleasingClay: field.SoilReleasingClay,
          SulphurDeficient: sulphurDeficient,
          StartingP: (pkBalance && pkBalance.PBalance != null) ? pkBalance.PBalance : null,
          Startingk: (pkBalance && pkBalance.KBalance != null) ? pkBalance.KBalance : null,
        };

        // Build the full field object with all associated sub-objects
        const fieldData = {
          ...field,
          Management: grassManagementOptionName,
          PreviousCropID: previousCropData.CropTypeID,
          PreviousCrop: previousCropTypename,
          Crops: cropsWithManagement,
          // PreviousGrasses: previousGrasses,
          SoilAnalysis: {
            LastModify:
              latestSoilAnalysis?.ModifiedOn || latestSoilAnalysis?.CreatedOn, // Latest ModifiedOn date from SoilAnalysis
            SoilAnalysisAndSNSanalysis: soilAnalysisAndSNSanalysis, // Combined data from both Soil and SNS analysis
          },
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
}

module.exports = { FieldService };
