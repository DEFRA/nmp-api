const { AppDataSource } = require("../db/data-source");
const { CropEntity } = require("../db/entity/crop.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const { ManagementPeriodEntity } = require("../db/entity/management-period.entity");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { SoilTypeSoilTextureEntity } = require("../db/entity/soil-type-soil-texture.entity");
const { BaseService } = require("../base/base.service");
const RB209SoilService = require("../vendors/rb209/soil/soil.service");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { PreviousGrassesEntity } = require("../db/entity/previous-grasses-entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { RecommendationCommentEntity } = require("../db/entity/recommendation-comment.entity");
const { FertiliserManuresEntity } = require("../db/entity/fertiliser-manures.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const RB209ArableService = require("../vendors/rb209/arable/arable.service");
const MannerManureTypesService = require("../vendors/manner/manure-types/manure-types.service");
const MannerApplicationMethodService = require("../vendors/manner/application-method/application-method.service");
const MannerIncorporationMethodService = require("../vendors/manner/incorporation-method/incorporation-method.service");
const MannerIncorporationDelayService = require("../vendors/manner/incorporation-delay/incorporation-delay.service");
const { GrassManagementOptionsEntity } = require("../db/entity/grassManagementOptionsEntity");
const RB209GrassService = require("../vendors/rb209/grass/grass.service");
const RB209GrasslandService = require("../vendors/rb209/grassland/grassland.service");
const { PreviousCroppingEntity } = require("../db/entity/previous-cropping.entity");
const { FarmService } = require("../farm/farm.service");
const { ProcessFutureManuresForWarnings } = require("../shared/process-future-warning-calculations-service");
const { UpdatingFutureRecommendations } = require("../shared/updating-future-recommendations-service");
const { GenerateRecommendations } = require("../shared/generate-recomendations-service");
const { PscIndexEntity } = require("../db/entity/psc-index.entity");
const { CurrentAndFuture } = require("../shared/generate-current-and-future-recommendations-service");
const { fieldQueryMethods } = require("./field-query.service");
const { fieldCreateMethods } = require("./field-create.service");
const { fieldUpdateMethods } = require("./field-update.service");
const { fieldRelatedMethods } = require("./field-related.service");
const { fieldSoilRecommendationMethods } = require("./field-soil-recommendation.service");

class FieldService extends BaseService {
constructor() {
  super(FieldEntity);
  this.repository = AppDataSource.getRepository(FieldEntity);
  this.cropRepository = AppDataSource.getRepository(CropEntity);
  this.soilAnalysisRepository =
    AppDataSource.getRepository(SoilAnalysisEntity);
  this.soilTypeSoilTextureRepository = AppDataSource.getRepository(
    SoilTypeSoilTextureEntity,
  );
  this.managementPeriodRepository = AppDataSource.getRepository(
    ManagementPeriodEntity,
  );
  this.rB209SoilService = new RB209SoilService();
  this.snsAnalysisRepository = AppDataSource.getRepository(SnsAnalysesEntity);
  this.recommendationRepository =
    AppDataSource.getRepository(RecommendationEntity);
  this.pkBalanceRepository = AppDataSource.getRepository(PKBalanceEntity);
  this.previousGrassesRepository = AppDataSource.getRepository(
    PreviousGrassesEntity,
  );
  this.previousCroppingRepository = AppDataSource.getRepository(
    PreviousCroppingEntity,
  );
  this.organicManureRepository =
    AppDataSource.getRepository(OrganicManureEntity);
  this.recommendationCommentsRepository = AppDataSource.getRepository(
    RecommendationCommentEntity,
  );
  this.fertiliserManureRepository = AppDataSource.getRepository(
    FertiliserManuresEntity,
  );
  this.farmRepository = AppDataSource.getRepository(FarmEntity);
  this.rB209ArableService = new RB209ArableService();
  this.MannerManureTypesService = new MannerManureTypesService();
  this.MannerApplicationMethodService = new MannerApplicationMethodService();
  this.MannerIncorporationMethodService =
    new MannerIncorporationMethodService();
  this.MannerIncorporationDelayService =
    new MannerIncorporationDelayService();
  this.grassManagementOptionsRepository = AppDataSource.getRepository(
    GrassManagementOptionsEntity,
  );
  this.rB209GrassService = new RB209GrassService();
  this.rB209GrasslandService = new RB209GrasslandService();
  this.generateRecommendations = new GenerateRecommendations();
  this.updatingFutureRecommendations = new UpdatingFutureRecommendations();
  this.FarmService = new FarmService();
  this.ProcessFutureManuresForWarnings =
    new ProcessFutureManuresForWarnings();
  this.pscIndexRepository = AppDataSource.getRepository(PscIndexEntity);
  this.currentAndFuture = new CurrentAndFuture();
}

  async getFieldCropAndSoilDetails(...args) {
    return fieldQueryMethods.getFieldCropAndSoilDetails.call(this, ...args);
  }

  async checkFieldExists(...args) {
    return fieldQueryMethods.checkFieldExists.call(this, ...args);
  }

  async fieldCountByName(...args) {
    return fieldQueryMethods.fieldCountByName.call(this, ...args);
  }

  async getSoilTextureBySoilTypeId(...args) {
    return fieldQueryMethods.getSoilTextureBySoilTypeId.call(this, ...args);
  }

  async getFieldSoilAnalysisAndSnsAnalysisDetails(...args) {
    return fieldQueryMethods.getFieldSoilAnalysisAndSnsAnalysisDetails.call(this, ...args);
  }

  async getCropTypeName(...args) {
    return fieldQueryMethods.getCropTypeName.call(this, ...args);
  }

  async getCropInfo1Name(...args) {
    return fieldQueryMethods.getCropInfo1Name.call(this, ...args);
  }

  async getCropInfo2Name(...args) {
    return fieldQueryMethods.getCropInfo2Name.call(this, ...args);
  }

  async getManureTypeName(...args) {
    return fieldQueryMethods.getManureTypeName.call(this, ...args);
  }

  async fetchAllApplicationReferenceData(...args) {
    return fieldQueryMethods.fetchAllApplicationReferenceData.call(this, ...args);
  }

  async getApplicationMethodName(...args) {
    return fieldQueryMethods.getApplicationMethodName.call(this, ...args);
  }

  async getIncorporationMethodName(...args) {
    return fieldQueryMethods.getIncorporationMethodName.call(this, ...args);
  }

  async getIncorporationDelayName(...args) {
    return fieldQueryMethods.getIncorporationDelayName.call(this, ...args);
  }

  async getPreviousCropDataByFieldID(...args) {
    return fieldQueryMethods.getPreviousCropDataByFieldID.call(this, ...args);
  }

  async handleSoilAnalysisValidation(...args) {
    return fieldQueryMethods.handleSoilAnalysisValidation.call(this, ...args);
  }

  async findSwardTypeManagment(...args) {
    return fieldQueryMethods.findSwardTypeManagment.call(this, ...args);
  }

  async findDefoliationSequenceDescription(...args) {
    return fieldQueryMethods.findDefoliationSequenceDescription.call(this, ...args);
  }

  async findSwardType(...args) {
    return fieldQueryMethods.findSwardType.call(this, ...args);
  }

  async findGrassSeason(...args) {
    return fieldQueryMethods.findGrassSeason.call(this, ...args);
  }

  async saveRecommendationCrops(...args) {
    return fieldCreateMethods.saveRecommendationCrops.call(this, ...args);
  }

  async createFieldWithSoilAnalysisAndCrops(...args) {
    return fieldCreateMethods.createFieldWithSoilAnalysisAndCrops.call(this, ...args);
  }

  async handlePreviousCroppingAction(...args) {
    return fieldCreateMethods.handlePreviousCroppingAction.call(this, ...args);
  }

  async processPreviousCroppings(...args) {
    return fieldCreateMethods.processPreviousCroppings.call(this, ...args);
  }

  async updateField(...args) {
    return fieldUpdateMethods.updateField.call(this, ...args);
  }

  async getOriginalField(...args) {
    return fieldUpdateMethods.getOriginalField.call(this, ...args);
  }

  async hasSensitiveFieldChanged(...args) {
    return fieldUpdateMethods.hasSensitiveFieldChanged.call(this, ...args);
  }

  async handleSensitiveFieldChange(...args) {
    return fieldUpdateMethods.handleSensitiveFieldChange.call(this, ...args);
  }

  async getUpdatedField(...args) {
    return fieldUpdateMethods.getUpdatedField.call(this, ...args);
  }

  async updateFieldEntity(...args) {
    return fieldUpdateMethods.updateFieldEntity.call(this, ...args);
  }

  async updateOnlyField(...args) {
    return fieldUpdateMethods.updateOnlyField.call(this, ...args);
  }

  async deleteFieldAndRelatedEntities(...args) {
    return fieldUpdateMethods.deleteFieldAndRelatedEntities.call(this, ...args);
  }

  async getFieldRelatedData(...args) {
    return fieldRelatedMethods.getFieldRelatedData.call(this, ...args);
  }

  async processSoilRecommendations(...args) {
    return fieldSoilRecommendationMethods.processSoilRecommendations.call(this, ...args);
  }

  async findCropDataByID(...args) {
    return fieldSoilRecommendationMethods.findCropDataByID.call(this, ...args);
  }

  async findCropDataByFieldIDAndYearToSoilAnalysisYear(...args) {
    return fieldSoilRecommendationMethods.findCropDataByFieldIDAndYearToSoilAnalysisYear.call(this, ...args);
  }

  async findAndSumFertiliserManuresByManagementPeriodID(...args) {
    return fieldSoilRecommendationMethods.findAndSumFertiliserManuresByManagementPeriodID.call(this, ...args);
  }

  async getApplyLimeInCaseOfMultipleCrops(...args) {
    return fieldSoilRecommendationMethods.getApplyLimeInCaseOfMultipleCrops.call(this, ...args);
  }

  async findManagementPeriodByCropID(...args) {
    return fieldSoilRecommendationMethods.findManagementPeriodByCropID.call(this, ...args);
  }
}

module.exports = { FieldService };
