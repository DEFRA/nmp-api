const { AppDataSource } = require("../db/data-source");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const {
  RecommendationCommentEntity,
} = require("../db/entity/recommendation-comment.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { BaseService } = require("../base/base.service");
const MannerManureTypesService = require("../vendors/manner/manure-types/manure-types.service");
const MannerApplicationMethodService = require("../vendors/manner/application-method/application-method.service");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const RB209GrassService = require("../vendors/rb209/grass/grass.service");
const RB209GrasslandService = require("../vendors/rb209/grassland/grassland.service");
const { recommendationSoilMethods } = require("./recommendation-soil.service");
const { recommendationDetailMethods } = require("./recommendation-detail.service");

class RecommendationService extends BaseService {
constructor() {
  super(RecommendationEntity);
  this.repository = AppDataSource.getRepository(RecommendationEntity);
  this.recommendationCommentRepository = AppDataSource.getRepository(
    RecommendationCommentEntity
  );
  this.organicManureRepository =
    AppDataSource.getRepository(OrganicManureEntity);
  this.MannerManureTypesService = new MannerManureTypesService();
  this.MannerApplicationMethodService = new MannerApplicationMethodService();
  this.FertiliserManuresRepository = AppDataSource.getRepository(
    FertiliserManuresEntity
  );
  this.PKbalanceRepository = AppDataSource.getRepository(PKBalanceEntity);
  this.soilAnalysisRepository =
    AppDataSource.getRepository(SoilAnalysisEntity);
  this.cropRepository = AppDataSource.getRepository(CropEntity);
  this.managementPeriodRepository = AppDataSource.getRepository(
    ManagementPeriodEntity
  );
  this.fertiliserManuresRepository = AppDataSource.getRepository(
    FertiliserManuresEntity
  );    
  this.rB209GrassService = new RB209GrassService();
  this.rB209GrasslandService = new RB209GrasslandService();
}

  async findManagementPeriodByID(...args) {
    return recommendationSoilMethods.findManagementPeriodByID.call(this, ...args);
  }

  async findManagementPeriodByCropID(...args) {
    return recommendationSoilMethods.findManagementPeriodByCropID.call(this, ...args);
  }

  async findCropDataByID(...args) {
    return recommendationSoilMethods.findCropDataByID.call(this, ...args);
  }

  async findCropDataByFieldIDAndYearToSoilAnalysisYear(...args) {
    return recommendationSoilMethods.findCropDataByFieldIDAndYearToSoilAnalysisYear.call(this, ...args);
  }

  async findAndSumFertiliserManuresByManagementPeriodID(...args) {
    return recommendationSoilMethods.findAndSumFertiliserManuresByManagementPeriodID.call(this, ...args);
  }

  async getApplyLimeInCaseOfMultipleCrops(...args) {
    return recommendationSoilMethods.getApplyLimeInCaseOfMultipleCrops.call(this, ...args);
  }

  async calculateFirstCropPreviousLime(...args) {
    return recommendationSoilMethods.calculateFirstCropPreviousLime.call(this, ...args);
  }

  async calculateSecondCropPreviousLime(...args) {
    return recommendationSoilMethods.calculateSecondCropPreviousLime.call(this, ...args);
  }

  async calculatePreviousAppliedLime(...args) {
    return recommendationSoilMethods.calculatePreviousAppliedLime.call(this, ...args);
  }

  getPreviousAppliedLimeRecommendation(...args) {
    return recommendationSoilMethods.getPreviousAppliedLimeRecommendation.call(this, ...args);
  }

  async processSoilRecommendations(...args) {
    return recommendationSoilMethods.processSoilRecommendations.call(this, ...args);
  }

  mapRecommendationField(...args) {
    return recommendationDetailMethods.mapRecommendationField.call(this, ...args);
  }

  async mapRecommendationRow(...args) {
    return recommendationDetailMethods.mapRecommendationRow.call(this, ...args);
  }

  async getPreviousYearPKBalance(...args) {
    return recommendationDetailMethods.getPreviousYearPKBalance.call(this, ...args);
  }

  async findDefoliationSequenceDescription(...args) {
    return recommendationDetailMethods.findDefoliationSequenceDescription.call(this, ...args);
  }

  async findSwardType(...args) {
    return recommendationDetailMethods.findSwardType.call(this, ...args);
  }

  async findGrassSeason(...args) {
    return recommendationDetailMethods.findGrassSeason.call(this, ...args);
  }

  async addGrassCropNames(...args) {
    return recommendationDetailMethods.addGrassCropNames.call(this, ...args);
  }

  async groupRecommendationsByCrop(...args) {
    return recommendationDetailMethods.groupRecommendationsByCrop.call(this, ...args);
  }

  async getOrganicManuresWithDetails(...args) {
    return recommendationDetailMethods.getOrganicManuresWithDetails.call(this, ...args);
  }

  async addOrganicManureReferenceDetails(...args) {
    return recommendationDetailMethods.addOrganicManureReferenceDetails.call(this, ...args);
  }

  async getFertiliserManuresForManagementPeriod(...args) {
    return recommendationDetailMethods.getFertiliserManuresForManagementPeriod.call(this, ...args);
  }

  async addRecommendationDetails(...args) {
    return recommendationDetailMethods.addRecommendationDetails.call(this, ...args);
  }

  async addDetailsToGroupedRecommendations(...args) {
    return recommendationDetailMethods.addDetailsToGroupedRecommendations.call(this, ...args);
  }

  async getNutrientsRecommendationsForField(...args) {
    return recommendationDetailMethods.getNutrientsRecommendationsForField.call(this, ...args);
  }

  async findSwardTypeManagment(...args) {
    return recommendationDetailMethods.findSwardTypeManagment.call(this, ...args);
  }

  async getByManagementPeriodId(...args) {
    return recommendationDetailMethods.getByManagementPeriodId.call(this, ...args);
  }
}

module.exports = { RecommendationService };
