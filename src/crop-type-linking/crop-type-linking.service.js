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
  async getCropInfoQuestionsByCropTypeID(cropTypeID) {
    const cropType = await this.repository.findOneBy({
      CropTypeID: cropTypeID,
    });
   const cropTypeQuestions = await this.cropInfoQuestionsRepository.findOneBy({
     ID: cropType.CropInfoOneQuestionID
   });
   return cropTypeQuestions.CropInfoQuestion;
  }
}

module.exports = { CropTypeLinkingsService };
