const { AppDataSource } = require("../db/data-source");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { BaseService } = require("../base/base.service");
const RB209ArableService = require("../vendors/rb209/arable/arable.service");
const RB209GrassService = require("../vendors/rb209/grass/grass.service");
const { FarmEntity } = require("../db/entity/farm.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const MannerManureTypesService = require("../vendors/manner/manure-types/manure-types.service");
const { FieldEntity } = require("../db/entity/field.entity");
const RB209SoilService = require("../vendors/rb209/soil/soil.service");
const { GrassGrowthService } = require("../grass-growth-plan/grass-growth-plan.service");
const { CalculateGrassHistoryAndPreviousGrass } = require("../shared/calculate-previous-grass-id.service");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const { CalculateMannerOutputService } = require("../shared/calculate-manner-output-service");
const { RecommendationCommentEntity } = require("../db/entity/recommendation-comment.entity");
const { RB209RecommendationService } = require("../vendors/rb209/recommendation/recommendation.service");
const { CalculateCropsSnsAnalysisService } = require("../shared/calculate-crops-sns-analysis-service");
const PlanService = require("../plan/plan.service");
const { ProcessFutureManuresForWarnings } = require("../shared/process-future-warning-calculations-service");
const { GenerateRecommendations } = require("../shared/generate-recomendations-service");
const { UpdatingFutureRecommendations } = require("../shared/updating-future-recommendations-service");
const { CountryEntity } = require("../db/entity/country.entity");
const { CurrentAndFuture } = require("../shared/generate-current-and-future-recommendations-service");
const { cropQueryMethods } = require("./crop-query.service");
const { cropMutationMethods } = require("./crop-mutation.service");
const { cropCopyPlanMethods } = require("./crop-copy-plan.service");

class CropService extends BaseService {
  constructor() {
    super(CropEntity);
    this.repository = AppDataSource.getRepository(CropEntity);
    this.managementPeriodRepository = AppDataSource.getRepository(ManagementPeriodEntity);
    this.rB209ArableService = new RB209ArableService();
    this.rB209GrassService = new RB209GrassService();
    this.RB209SoilService = new RB209SoilService();
    this.grassGrowthClass = new GrassGrowthService();
    this.calculateGrassId = new CalculateGrassHistoryAndPreviousGrass();
    this.CalculateMannerOutput = new CalculateMannerOutputService();
    this.rB209RecommendationService = new RB209RecommendationService();
    this.farmRepository = AppDataSource.getRepository(FarmEntity);
    this.organicManureRepository = AppDataSource.getRepository(OrganicManureEntity);
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.recommendationRepository = AppDataSource.getRepository(RecommendationEntity);
    this.fertiliserRepository = AppDataSource.getRepository(FertiliserManuresEntity);
    this.MannerManureTypesService = new MannerManureTypesService();
    this.recommendationCommentRepository = AppDataSource.getRepository(RecommendationCommentEntity);
    this.CalculateCropsSnsAnalysis = new CalculateCropsSnsAnalysisService();
    this.planService = new PlanService();
    this.ProcessFutureManuresForWarnings = new ProcessFutureManuresForWarnings();
    this.generateRecommendations = new GenerateRecommendations();
    this.updatingFutureRecommendations = new UpdatingFutureRecommendations();
    this.currentAndFuture = new CurrentAndFuture();
    this.countryRepository = AppDataSource.getRepository(CountryEntity);
    this.fieldRepository = AppDataSource.getRepository(FieldEntity);
    this.COUNTRY_BOTH = 3;
  }

  async createCropWithManagementPeriods(...args) {
    return cropQueryMethods.createCropWithManagementPeriods.call(this, ...args);
  }

  async getCrops(...args) {
    return cropQueryMethods.getCrops.call(this, ...args);
  }

  async getCropTypeDataByFieldAndYear(...args) {
    return cropQueryMethods.getCropTypeDataByFieldAndYear.call(this, ...args);
  }

  async filterBySingleSequenceId(...args) {
    return cropQueryMethods.filterBySingleSequenceId.call(this, ...args);
  }

  async fetchRb209CountryId(...args) {
    return cropQueryMethods.fetchRb209CountryId.call(this, ...args);
  }

  async mapCropTypeIdWithTheirNames(...args) {
    return cropQueryMethods.mapCropTypeIdWithTheirNames.call(this, ...args);
  }

  async getManureTypeById(...args) {
    return cropQueryMethods.getManureTypeById.call(this, ...args);
  }

  async getOrganicAndInorganicDetails(...args) {
    return cropQueryMethods.getOrganicAndInorganicDetails.call(this, ...args);
  }

  async getLatestModifiedDate(...args) {
    return cropQueryMethods.getLatestModifiedDate.call(this, ...args);
  }

  async maxDate(...args) {
    return cropQueryMethods.maxDate.call(this, ...args);
  }

  async getPlanByFieldIdAndYear(...args) {
    return cropQueryMethods.getPlanByFieldIdAndYear.call(this, ...args);
  }

  async getOrganicInorganicManuresByCropId(...args) {
    return cropQueryMethods.getOrganicInorganicManuresByCropId.call(this, ...args);
  }

  async validateAndHandleSecondCrop(...args) {
    return cropMutationMethods.validateAndHandleSecondCrop.call(this, ...args);
  }

  async updateCropByFieldYearAndConfirm(...args) {
    return cropMutationMethods.updateCropByFieldYearAndConfirm.call(this, ...args);
  }

  async deleteCrop(...args) {
    return cropMutationMethods.deleteCrop.call(this, ...args);
  }

  async deleteCropById(...args) {
    return cropMutationMethods.deleteCropById.call(this, ...args);
  }

  async cropGroupNameExists(...args) {
    return cropMutationMethods.cropGroupNameExists.call(this, ...args);
  }

  async existingGroupNameCount(...args) {
    return cropMutationMethods.existingGroupNameCount.call(this, ...args);
  }

  async updateCropGroupName(...args) {
    return cropMutationMethods.updateCropGroupName.call(this, ...args);
  }

  async syncManagementPeriodsBySequence(...args) {
    return cropMutationMethods.syncManagementPeriodsBySequence.call(this, ...args);
  }

  async updateCropData(...args) {
    return cropMutationMethods.updateCropData.call(this, ...args);
  }

  async updateCrop(...args) {
    return cropMutationMethods.updateCrop.call(this, ...args);
  }

  async mergeCrop(...args) {
    return cropMutationMethods.mergeCrop.call(this, ...args);
  }

  async savedDefault(...args) {
    return cropCopyPlanMethods.savedDefault.call(this, ...args);
  }

  async copyPlanOhercrop(...args) {
    return cropCopyPlanMethods.copyPlanOhercrop.call(this, ...args);
  }

  async getFields(...args) {
    return cropCopyPlanMethods.getFields.call(this, ...args);
  }

  async getCropsByFieldIdAndYear(...args) {
    return cropCopyPlanMethods.getCropsByFieldIdAndYear.call(this, ...args);
  }

  hasSoilPK(...args) {
    return cropCopyPlanMethods.hasSoilPK.call(this, ...args);
  }

  isOtherCrop(...args) {
    return cropCopyPlanMethods.isOtherCrop.call(this, ...args);
  }

  initResults(...args) {
    return cropCopyPlanMethods.initResults.call(this, ...args);
  }

  async createNewCrop(...args) {
    return cropCopyPlanMethods.createNewCrop.call(this, ...args);
  }

  async handleOtherCrop(...args) {
    return cropCopyPlanMethods.handleOtherCrop.call(this, ...args);
  }

  async processCrop(...args) {
    return cropCopyPlanMethods.processCrop.call(this, ...args);
  }

  async copyPKBalance(...args) {
    return cropCopyPlanMethods.copyPKBalance.call(this, ...args);
  }

  async loadCropDependencies(...args) {
    return cropCopyPlanMethods.loadCropDependencies.call(this, ...args);
  }

  async copyManagementPeriods(...args) {
    return cropCopyPlanMethods.copyManagementPeriods.call(this, ...args);
  }

  async copyFertiliser(...args) {
    return cropCopyPlanMethods.copyFertiliser.call(this, ...args);
  }

  async copyOrganic(...args) {
    return cropCopyPlanMethods.copyOrganic.call(this, ...args);
  }

  async generateAndStoreRecommendations(...args) {
    return cropCopyPlanMethods.generateAndStoreRecommendations.call(this, ...args);
  }

  triggerFutureUpdate(...args) {
    return cropCopyPlanMethods.triggerFutureUpdate.call(this, ...args);
  }

  async copyPlan(...args) {
    return cropCopyPlanMethods.copyPlan.call(this, ...args);
  }
}

module.exports = { CropService };
