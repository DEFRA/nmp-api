const { CropEntity } = require("../db/entity/crop.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const { UpdateRecommendation } = require("./updateRecommendation.service");

class ProcessFieldsService {
  constructor() {
    this.UpdateRecommendation = new UpdateRecommendation();

  }

  async processFieldsForRecommendation(
    farmId,
    request,
    userId,
    transactionalManager
  ) {
    // 1. Fetch all fields for the farm
    const fields = await transactionalManager.find(FieldEntity, {
      where: { FarmID: farmId },
    });

    for (const field of fields) {
      const fieldId = field.ID;

      // 2. Find oldest crop.Year for this field
      const oldestCrop = await transactionalManager.findOne(CropEntity, {

        where: { FieldID: fieldId },
        order: { Year: "ASC" }, // oldest year
      });

      const oldestYear = oldestCrop?.Year ?? null;

      // 3. Call your recommendation update function
      this.UpdateRecommendation.updateRecommendationsForField(
        fieldId,
        oldestYear,
        request,
        userId
      );
    }
  }
}

module.exports = { ProcessFieldsService };


