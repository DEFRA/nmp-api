const { AppDataSource } = require("../db/data-source");
const { CropTypeLinkingEntity } = require("../db/entity/crop-type-linking.entity");
const { BaseService } = require("../base/base.service");
const { CropInfoQuestionsEntity } = require("../db/entity/crop-info-questions.entity");

class CropTypeLinkingsService extends BaseService {
  constructor() {
    super(CropTypeLinkingEntity);
    this.repository = AppDataSource.getRepository(CropTypeLinkingEntity);
    this.cropInfoQuestionsRepository = AppDataSource.getRepository(CropInfoQuestionsEntity);
  }

  async getCropTypeLinkingByCropTypeID(cropTypeID) {
    const cropType = await this.repository.findOneBy({
      CropTypeID: cropTypeID,
    });
    return cropType;
  }
  async getCropInfoQuestionsByCropTypeID(cropTypeID,countryID) {
    const cropType = await this.repository.findOneBy({
      CropTypeID: cropTypeID,
    });  
    
 let questionId = null;

if (countryID === 1) {
  questionId = cropType.CropInfoOneQuestionID;
} else if (countryID === 2) {
  questionId = cropType.CropInfoOneScotlandQuestionID;
}
else {
    // no matching country
}

  if (questionId != null) {
    const cropTypeQuestions = await this.cropInfoQuestionsRepository.findOneBy({
      ID: questionId
    });

    return cropTypeQuestions?.CropInfoQuestion;
  }
  return null;

  }

  async getScotlandNmaxByCropTypeID(cropTypeID, soilTypeId, residueGroup) {
  try {
    const query = `
      SELECT 
        ResidueGroup1,
        ResidueGroup2,
        ResidueGroup3,
        ResidueGroup4,
        ResidueGroup5,
        ResidueGroup6
      FROM ScotlandNMaxValues
      WHERE CropTypeID = @0
        AND SoilTypeID = @1
    `;

    const result = await AppDataSource.query(query, [
      cropTypeID,   // @0
      soilTypeId    // @1
    ]);

    const row = result?.[0];
    if (!row) return null;

    const residueMap = {
      1: row.ResidueGroup1,
      2: row.ResidueGroup2,
      3: row.ResidueGroup3,
      4: row.ResidueGroup4,
      5: row.ResidueGroup5,
      6: row.ResidueGroup6
    };

    return residueMap[residueGroup] ?? null;

  } catch (error) {
    console.error("Error fetching Scotland Nmax:", error);
    return null;
  }
}

}

module.exports = { CropTypeLinkingsService };
