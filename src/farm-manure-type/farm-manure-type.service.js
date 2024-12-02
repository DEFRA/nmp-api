const { AppDataSource } = require("../db/data-source");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  FarmManureTypeEntity,
} = require("../db/entity/farm-manure-type.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { BaseService } = require("../base/base.service");
const { ManureTypeEntity } = require("../db/entity/manure-type.entity");
const { CalculateNutrientOfftakeDto } = require("../vendors/rb209/recommendation/dto/recommendation.dto");
const MannerCalculateNutrientsService = require("../vendors/manner/calculate-nutrients/calculate-nutrients.service");
const RB209ArableService = require("../vendors/rb209/arable/arable.service");
const { RB209RecommendationService } = require("../vendors/rb209/recommendation/recommendation.service");
const { RecommendationCommentEntity } = require("../db/entity/recommendation-comment.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const { CropTypeLinkingEntity } = require("../db/entity/crop-type-linking.entity");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const RB209FieldService = require("../vendors/rb209/field/field.service");
const MannerManureTypesService = require("../vendors/manner/manure-types/manure-types.service");
const { LessThanOrEqual, Between, Not, In } = require("typeorm");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");

class FarmManureTypeService extends BaseService {
  constructor() {
    super(FarmManureTypeEntity);
    this.repository = AppDataSource.getRepository(FarmManureTypeEntity);
    
  }

  

  async getFarmManureTypebyFarmId(farmdId) {
    const farmManureTypeData = (
      await this.repository.find({
        where: { FarmID: farmdId },
      })
    );
    
    console.log("FarmManure",farmManureTypeData)
    return farmManureTypeData;
  }
  
}
module.exports = { FarmManureTypeService };
