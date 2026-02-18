const { AppDataSource } = require("../db/data-source");
const { CropEntity } = require("../db/entity/crop.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const { UpdatingFutureRecommendations } = require("./updating-future-recommendations-service");



class ProcessFieldsService {
  constructor() {
    this.fieldRespository = AppDataSource.getRepository(FieldEntity);
    this.cropRespository = AppDataSource.getRepository(CropEntity);
    this.updatingFutureRecommendations = new UpdatingFutureRecommendations();  
  }

  async processFieldsForRecommendation(
    farmId,
    request,
    userId
  ) {
        // 1️⃣ Fetch all fields for the farm
        const fields = await this.fieldRespository.find({
          where: { FarmID: farmId },
        });
    
        if (!fields.length)
          { 
          return;
          }
    
        const fieldIds = fields.map((f) => f.ID);
    
        // 2️⃣ Fetch oldest crop year per field in ONE query
        const oldestCrops = await this.cropRespository
          .createQueryBuilder("crop")
          .select("crop.FieldID", "FieldID")
          .addSelect("MIN(crop.Year)", "OldestYear")
          .where("crop.FieldID IN (:...fieldIds)", { fieldIds })
          .groupBy("crop.FieldID")
          .getRawMany();
    
        // 3️⃣ Build lookup map → { fieldId: oldestYear }

        const oldestYearByFieldId = {};
        for (const row of oldestCrops) {
          oldestYearByFieldId[row.FieldID] = Number(row.OldestYear);
        }
    
        // 4️⃣ Loop through fields and call recommendation update
        for (const field of fields) {
          const fieldId = field.ID;
          const oldestYear = oldestYearByFieldId[fieldId] ?? null;
          if (oldestYear){
            this.updatingFutureRecommendations.updateRecommendationsForField(
              fieldId,
              oldestYear,
              request,
              userId
            );
          }
        }


  }
}

module.exports = { ProcessFieldsService };


