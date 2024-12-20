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
const { PreviousGrassesEntity } = require("../db/entity/previous-grasses-entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { RecommendationCommentEntity } = require("../db/entity/recommendation-comment.entity");
const { FertiliserManuresEntity } = require("../db/entity/fertiliser-manures.entity");
const { FarmEntity } = require("../db/entity/farm.entity");


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
              CreatedOn: new Date()
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

  async getFieldRelatedData(fieldIds, year) {
    // Fetch all fields by the list of FieldIDs
    const fields = await this.repository.findByIds(fieldIds);

    // Create a map to store fields grouped by farm
    const farmFieldMap = {};

    await Promise.all(
      fields.map(async (field) => {
        // Fetch the farm associated with the field
        const farm = await this.farmRepository.findOne({
          where: { ID: field.FarmID },
        });

        // Fetch crops, previousGrasses, snsAnalysis, soilAnalysis, and pkBalance for the current field
        const crops = await this.cropRepository.find({
          where: { FieldID: field.ID, Year: year },
        });
        const previousGrasses = await this.previousGrassesRepository.find({
          where: { FieldID: field.ID },
        });
        const snsAnalysis = await this.snsAnalysisRepository.find({
          where: { FieldID: field.ID },
        });
        const soilAnalysis = await this.soilAnalysisRepository.find({
          where: { FieldID: field.ID, Year: year },
        });

        // Find the latest date between ModifiedOn or CreatedOn for SoilAnalysis
        const lastModifiedDate = soilAnalysis.reduce((latest, entry) => {
          const comparisonDate = entry.ModifiedOn || entry.CreatedOn; // Use ModifiedOn or fallback to CreatedOn
          return new Date(comparisonDate) > new Date(latest)
            ? comparisonDate
            : latest;
        }, soilAnalysis[0]?.ModifiedOn || soilAnalysis[0]?.CreatedOn || null);

        // Create soilAnalysisAndSNSanalysis object by combining data from both sources
        const soilAnalysisAndSNSanalysis = soilAnalysis.map((soil) => {
          const matchingSns = snsAnalysis.find(
            (sns) => sns.FieldID === soil.FieldID && sns.Year === year
          );
          return {
            PH: soil.PH, // From SoilAnalysis.PH
            Phosphorus: soil.Phosphorus, // From SoilAnalysis.Phosphorus
            Potassium: soil.Potassium, // From SoilAnalysis.Potassium
            Magnesium: soil.Magnesium, // From SoilAnalysis.Magnesium
            SNS: matchingSns
              ? matchingSns.SoilNitrogenSupplyValue
              : "Not Entered", // From SnsAnalysis
            SNSIndex: matchingSns
              ? matchingSns.SoilNitrogenSupplyIndex
              : "Not Entered", // From SnsAnalysis
            SNSMethod: "Not Entered", // As per your requirement (no method provided)
          };
        });

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
                const recommendations =
                  await this.recommendationRepository.find({
                    where: { ManagementPeriodID: managementPeriod.ID },
                  });
                const fertiliserManures =
                  await this.fertiliserManureRepository.find({
                    where: { ManagementPeriodID: managementPeriod.ID },
                  });

                // Fetch comments for each recommendation
                const recommendationsWithComments = await Promise.all(
                  recommendations.map(async (recommendation) => {
                    const recommendationComments =
                      await this.recommendationCommentsRepository.find({
                        where: { RecommendationID: recommendation.ID },
                      });
                    return {
                      ...recommendation,
                      RecommendationComments: recommendationComments,
                    };
                  })
                );

                return {
                  ...managementPeriod,
                  OrganicManures: organicManures,
                  Recommendations: recommendationsWithComments,
                  FertiliserManures: fertiliserManures,
                };
              })
            );

            return {
              ...crop,
              ManagementPeriods: managementWithSubData,
            };
          })
        );

        // Build the full field object with all associated sub-objects
        const fieldData = {
          ...field,
          Crops: cropsWithManagement,
          PreviousGrasses: previousGrasses,
          soilAnalysis: {
            LastModify: lastModifiedDate, // Latest ModifiedOn date from SoilAnalysis
            soilAnalysisAndSNSanalysis: soilAnalysisAndSNSanalysis, // Combined data from both Soil and SNS analysis
          },
          PKBalance: pkBalance,
        };

        // Group fields by farm
        if (!farmFieldMap[farm.ID]) {
          farmFieldMap[farm.ID] = {
            Farm: farm,
            Fields: [],
          };
        }
        farmFieldMap[farm.ID].Fields.push(fieldData);
      })
    );

    // Convert the farmFieldMap object into an array of farms with their associated fields
    const farmData = Object.values(farmFieldMap);

    // Return the enriched farm data with fields and their associated data
    return farmData;
  }
}

module.exports = { FieldService };
