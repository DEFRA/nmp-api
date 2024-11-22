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
const { CleanPlugin } = require("webpack");

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
    console.log("managementPeriodIDkkkk", managementPeriodID);
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
        if (SoilAnalysis.Phosphorus != null || SoilAnalysis.Potassium != null) {
     
     
          if (body.PKBalance) {
            let pkBalanceBody = body.PKBalance;
            console.log("pkBalanceBody", pkBalanceBody);
            let { CreatedByID, CreatedOn, ...createdData } = body.PKBalance;

            // PKBalance = await this.pkBalanceRepository.save({
            //   ...createdData,
            //   FieldID: Field.ID,
            //   CreatedByID: userId,
            // });

            PKBalance = await transactionalManager.save(
              PKBalanceEntity,
              this.pkBalanceRepository.create({
                ...createdData,
                FieldID: Field.ID,
                CreatedByID: userId,
              })
            );
            // let pkBalanceEntry = await this.pkBalanceRepository.find({
            //   where: { Year: SoilAnalysis.Date.Year, FieldID: Field.ID },
            // });
            // console.log("abcd", pkBalanceEntry);
            // PKBalance = await this.pkbalanceRepository.save({
            // ...body?.PKBalance,
            //FieldID: Field.ID,
            //CreatedByID: userId,
            //});
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
}

module.exports = { FieldService };
