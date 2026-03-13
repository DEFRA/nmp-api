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

  if (questionId != null) {
    const cropTypeQuestions = await this.cropInfoQuestionsRepository.findOneBy({
      ID: questionId
    });

    return cropTypeQuestions?.CropInfoQuestion;
  }
  return null;

  }
}

module.exports = { CropTypeLinkingsService };
