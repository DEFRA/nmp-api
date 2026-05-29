const { AppDataSource } = require("../db/data-source");
const { CropEntity } = require("../db/entity/crop.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const {
  PreviousCroppingEntity,
} = require("../db/entity/previous-cropping.entity");
const boom = require("@hapi/boom");

const fieldUpdateMethods = {
  async updateField(payload, userId, fieldId, request) {
    return AppDataSource.transaction(async (transactionalManager) => {
      const { Field: updatedFieldData, PreviousCroppings } = payload;
      const { ID, CreatedByID, CreatedOn, EncryptedFieldId, ...dataToUpdate } =
        updatedFieldData;
      const originalField = await this.getOriginalField(
        transactionalManager,
        fieldId
      );
      const isSensitiveChange = await this.hasSensitiveFieldChanged(
        payload.Field,
        originalField
      );
      console.log(`isSensitiveChange: ${isSensitiveChange}`);
      if (isSensitiveChange) {
        await this.handleSensitiveFieldChange(
          transactionalManager,
          fieldId,
          request,
          userId
        );
      }

      const updatedOrInsertedPrevCroppings =
        await this.processPreviousCroppings(
          transactionalManager,
          PreviousCroppings,
          fieldId,
          request,
          userId,
        );

      const updateResult = await transactionalManager.update(
        FieldEntity,
        fieldId,
        {
          ...dataToUpdate,
          ModifiedByID: userId,
          ModifiedOn: new Date(),
        },
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
        PreviousCroppings: updatedOrInsertedPrevCroppings,
      };
    });
  },

  async getOriginalField(transactionalManager, fieldId) {
    const field = await transactionalManager.findOne(FieldEntity, {
      where: { ID: fieldId },
    });

    if (!field) {
      console.log(`Field with ID ${fieldId} not found`);
    }

    return field;
  },

  async hasSensitiveFieldChanged(payload, originalField) {
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

    return sensitiveFields.some((field) => {
      if (payload[field] === 0) {
        payload[field] = null;
      }

      if (originalField[field] === 0) {
        originalField[field] = null;
      }
      if (payload[field] === null && originalField[field] === null) {
        console.log(`true`);
      }

      return (
        payload[field] !== undefined && payload[field] !== originalField[field]
      );
    });
  },

  async handleSensitiveFieldChange(
    transactionalManager,
    fieldId,
    request,
    userId,
  ) {
    const crops = await transactionalManager.find(CropEntity, {
      where: { FieldID: fieldId },
    });
    if (!crops.length) {
      return;
    }
    const oldestCrop = crops.reduce(
      (oldest, current) => (current.Year < oldest.Year ? current : oldest),
      crops[0],
    );
    await this.currentAndFuture.regenerateCurrentAndFutureRecommendations(
      oldestCrop,
      transactionalManager,
      request,
      userId,
    );
    this.ProcessFutureManuresForWarnings.processWarningsByField(
      fieldId,
      userId,
    );
  },

  async getUpdatedField(transactionalManager, fieldId) {
    return transactionalManager.findOne(FieldEntity, {
      where: { ID: fieldId },
    });
  },

  async updateFieldEntity(transactionalManager, fieldId, dataToUpdate, userId) {
    await transactionalManager.update(FieldEntity, fieldId, {
      ...dataToUpdate,
      ModifiedByID: userId,
      ModifiedOn: new Date(),
    });
  },

  async updateOnlyField(payload, userId, request) {
    return AppDataSource.transaction(async (transactionalManager) => {
      const { ID, CreatedByID, CreatedOn, EncryptedFieldId, ...dataToUpdate } =
        payload;

      const originalField = await this.getOriginalField(
        transactionalManager,
        ID,
      );

      const isSensitiveChange = await this.hasSensitiveFieldChanged(
        payload,
        originalField
      );

      if (isSensitiveChange) {
        await this.handleSensitiveFieldChange(
          transactionalManager,
          ID,
          request,
          userId,
        );
      }

      await this.updateFieldEntity(
        transactionalManager,
        ID,
        dataToUpdate,
        userId,
      );

      return {
        Field: await this.getUpdatedField(transactionalManager, ID),
      };
    });
  },

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
  },
};

module.exports = { fieldUpdateMethods };
