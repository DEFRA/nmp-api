const { AppDataSource } = require("../db/data-source");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { BaseService } = require("../base/base.service");
const RB209ArableService = require("../vendors/rb209/arable/arable.service");
const boom = require("@hapi/boom");
const { StaticStrings } = require("../shared/static.string");

class CropService extends BaseService {
  constructor() {
    super(CropEntity);
    this.repository = AppDataSource.getRepository(CropEntity);
    this.managementPeriodRepository = AppDataSource.getRepository(
      ManagementPeriodEntity
    );
    this.rB209ArableService = new RB209ArableService();
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

    if (!cropTypeId) {
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
}

module.exports = { CropService };
