const {
  AppDataSource,
  CropEntity,
  FarmManureTypeEntity,
  ManagementPeriodEntity,
  OrganicManureEntity,
  BaseService,
  ManureTypeEntity,
  MannerCalculateNutrientsService,
  RB209ArableService,
  RB209RecommendationService,
  RecommendationCommentEntity,
  FieldEntity,
  FarmEntity,
  CropTypeLinkingEntity,
  SoilAnalysisEntity,
  RecommendationEntity,
  RB209FieldService,
  MannerManureTypesService,
  SnsAnalysesEntity,
  PKBalanceEntity,
  FertiliserManuresEntity,
  CountryEntity,
  RB209SoilService,
  GrassGrowthService,
  ExcessRainfallsEntity,
  CalculateMannerOutputService,
  CalculateGrassHistoryAndPreviousGrass,
  CalculateTotalAvailableNForNextYear,
  CalculateNextDefoliationService,
  CalculatePKBalanceOther,
  CreateOrUpdateWarningMessage,
  CalculatePreviousCropService,
  ProcessFutureManuresForWarnings,
  GenerateRecommendations,
  UpdatingFutureRecommendations,
} = require("./organic-manure-dependencies");
const {
  organicManureQueryMethods,
} = require("./organic-manure-query.service");
const {
  organicManureCreateMethods,
} = require("./organic-manure-create.service");
const {
  organicManureCheckMethods,
} = require("./organic-manure-check.service");
const {
  organicManureMutationMethods,
} = require("./organic-manure-mutation.service");
const {
  organicManureReportMethods,
} = require("./organic-manure-report.service");

class OrganicManureService extends BaseService {
  constructor() {
    super(OrganicManureEntity);
    this.repository = AppDataSource.getRepository(OrganicManureEntity);
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.managementPeriodRepository = AppDataSource.getRepository(
      ManagementPeriodEntity,
    );
    this.farmManureTypeRepository =
      AppDataSource.getRepository(FarmManureTypeEntity);
    this.manureTypeRepository = AppDataSource.getRepository(ManureTypeEntity);
    this.MannerCalculateNutrientsService =
      new MannerCalculateNutrientsService();
    this.rB209ArableService = new RB209ArableService();
    this.rB209RecommendationService = new RB209RecommendationService();
    this.RB209SoilService = new RB209SoilService();
    this.CalculateMannerOutput = new CalculateMannerOutputService();
    this.calculateGrassId = new CalculateGrassHistoryAndPreviousGrass();
    this.CalculateTotalAvailableNForPreviousYear =
      new CalculateTotalAvailableNForNextYear();
    this.CalculateNextDefoliationService =
      new CalculateNextDefoliationService();
    this.recommendationCommentRepository = AppDataSource.getRepository(
      RecommendationCommentEntity,
    );
    this.fieldRepository = AppDataSource.getRepository(FieldEntity);
    this.farmRepository = AppDataSource.getRepository(FarmEntity);
    this.CropTypeLinkingRepository = AppDataSource.getRepository(
      CropTypeLinkingEntity,
    );
    this.soilAnalysisRepository =
      AppDataSource.getRepository(SoilAnalysisEntity);
    this.RecommendationRepository =
      AppDataSource.getRepository(RecommendationEntity);
    this.RB209FieldService = new RB209FieldService();
    this.MannerManureTypesService = new MannerManureTypesService();
    this.snsAnalysisRepository = AppDataSource.getRepository(SnsAnalysesEntity);
    this.pkBalanceRepository = AppDataSource.getRepository(PKBalanceEntity);
    this.fertiliserRepository = AppDataSource.getRepository(
      FertiliserManuresEntity,
    );
    this.countryRepository = AppDataSource.getRepository(CountryEntity);
    this.grassGrowthClass = new GrassGrowthService();
    this.excessRainfallRepository = AppDataSource.getRepository(
      ExcessRainfallsEntity,
    );
    this.CalculatePKBalanceOther = new CalculatePKBalanceOther();
    this.CreateOrUpdateWarningMessage = new CreateOrUpdateWarningMessage();
    this.CalculatePreviousCropService = new CalculatePreviousCropService();
    this.ProcessFutureManuresForWarnings =
      new ProcessFutureManuresForWarnings();
    this.generateRecommendations = new GenerateRecommendations();
    this.updatingFutureRecommendations = new UpdatingFutureRecommendations();
  }

  async getTotalNitrogenByManagementPeriod(...args) {
    return organicManureQueryMethods.getTotalNitrogenByManagementPeriod.call(this, ...args);
  }

  async getTotalNitrogenByCropID(...args) {
    return organicManureQueryMethods.getTotalNitrogenByCropID.call(this, ...args);
  }

  async formatDateRange(...args) {
    return organicManureQueryMethods.formatDateRange.call(this, ...args);
  }

  async getTotalNitrogen(...args) {
    return organicManureQueryMethods.getTotalNitrogen.call(this, ...args);
  }

  async getTotalNitrogenIfIsGreenFoodCompost(...args) {
    return organicManureQueryMethods.getTotalNitrogenIfIsGreenFoodCompost.call(this, ...args);
  }

  async getManureTypeIdsbyFieldAndYear(...args) {
    return organicManureQueryMethods.getManureTypeIdsbyFieldAndYear.call(this, ...args);
  }

  async getManureTypeIdsByManagementPeriod(...args) {
    return organicManureQueryMethods.getManureTypeIdsByManagementPeriod.call(this, ...args);
  }

  async getFirstCropData(...args) {
    return organicManureQueryMethods.getFirstCropData.call(this, ...args);
  }

  async getManagementPeriodId(...args) {
    return organicManureQueryMethods.getManagementPeriodId.call(this, ...args);
  }

  async getPKBalanceData(...args) {
    return organicManureQueryMethods.getPKBalanceData.call(this, ...args);
  }

  async checkIfManagementPeriodExistsInOrganicManure(...args) {
    return organicManureQueryMethods.checkIfManagementPeriodExistsInOrganicManure.call(this, ...args);
  }

  async saveOrganicManureForOtherCropType(...args) {
    return organicManureQueryMethods.saveOrganicManureForOtherCropType.call(this, ...args);
  }

  async createOrganicManuresWithFarmManureType(...args) {
    return organicManureCreateMethods.createOrganicManuresWithFarmManureType.call(this, ...args);
  }

  async checkManureExists(...args) {
    return organicManureCheckMethods.checkManureExists.call(this, ...args);
  }

  async checkLivestockManureExists(...args) {
    return organicManureCheckMethods.checkLivestockManureExists.call(this, ...args);
  }

  async getP205AndK20fromfertiliser(...args) {
    return organicManureCheckMethods.getP205AndK20fromfertiliser.call(this, ...args);
  }

  async deleteOrganicManure(...args) {
    return organicManureMutationMethods.deleteOrganicManure.call(this, ...args);
  }

  async updateOrganicManure(...args) {
    return organicManureMutationMethods.updateOrganicManure.call(this, ...args);
  }

  async getOrganicManureByFarmIdAndYear(...args) {
    return organicManureReportMethods.getOrganicManureByFarmIdAndYear.call(this, ...args);
  }

  async getTotalAvailableNitrogenByManagementPeriodID(...args) {
    return organicManureReportMethods.getTotalAvailableNitrogenByManagementPeriodID.call(this, ...args);
  }

  async getClosedPeriodByID(...args) {
    return organicManureReportMethods.getClosedPeriodByID.call(this, ...args);
  }

  async getTotalApplicationRate(...args) {
    return organicManureReportMethods.getTotalApplicationRate.call(this, ...args);
  }

  async checkGreenCompostExists(...args) {
    return organicManureReportMethods.checkGreenCompostExists.call(this, ...args);
  }
}

module.exports = { OrganicManureService };
