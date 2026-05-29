const { AppDataSource } = require("../db/data-source");
const { MoreThan } = require("typeorm");
const { CropEntity } = require("../db/entity/crop.entity");
const { FarmManureTypeEntity } = require("../db/entity/farm-manure-type.entity");
const { ManagementPeriodEntity } = require("../db/entity/management-period.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { BaseService } = require("../base/base.service");
const { ManureTypeEntity } = require("../db/entity/manure-type.entity");
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
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { FertiliserManuresEntity } = require("../db/entity/fertiliser-manures.entity");
const { SoilTypeSoilTextureEntity } = require("../db/entity/soil-type-soil-texture.entity");
const { CountryEntity } = require("../db/entity/country.entity");
const RB209SoilService = require("../vendors/rb209/soil/soil.service");
const { GrassGrowthService } = require("../grass-growth-plan/grass-growth-plan.service");
const { ExcessRainfallsEntity } = require("../db/entity/excess-rainfalls.entity");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { CalculateMannerOutputService } = require("../shared/calculate-manner-output-service");
const { CalculateGrassHistoryAndPreviousGrass } = require("../shared/calculate-previous-grass-id.service");
const { CalculateTotalAvailableNForNextYear } = require("../shared/calculate-next-year-available-n");
const { CalculateNextDefoliationService } = require("../shared/calculate-next-defoliation-totalN");
const { CalculatePKBalanceOther } = require("../shared/calculate-pk-balance-other");
const { WarningMessagesEntity } = require("../db/entity/warning-message.entity");
const { CreateOrUpdateWarningMessage } = require("../shared/create-update-warning-messages.service");
const { WarningCodesMapper } = require("../constants/warning-codes-mapper");
const { CalculatePreviousCropService } = require("../shared/previous-year-crop-service");
const { ManureTypeMapper } = require("../constants/manure-type-mapper");
const { normalizeDateWithTime } = require("../shared/dataValidate");
const { JOINS } = require("../constants/joins-mapper");
const { ProcessFutureManuresForWarnings } = require("../shared/process-future-warning-calculations-service");
const { GenerateRecommendations } = require("../shared/generate-recomendations-service");
const { UpdatingFutureRecommendations } = require("../shared/updating-future-recommendations-service");
const MANAGEMENT_PERIOD_TO_CROP_JOIN = "M.CropID = C.ID";
const CROP_TO_FIELD_CONDITION = "C.FieldID = :fieldId";
const API_ENDPOINTS = {
  MANURE_TYPES: "/manure-types",
};

module.exports = {
  AppDataSource,
  MoreThan,
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
  SoilTypeSoilTextureEntity,
  CountryEntity,
  RB209SoilService,
  GrassGrowthService,
  ExcessRainfallsEntity,
  CropTypeMapper,
  CalculateMannerOutputService,
  CalculateGrassHistoryAndPreviousGrass,
  CalculateTotalAvailableNForNextYear,
  CalculateNextDefoliationService,
  CalculatePKBalanceOther,
  WarningMessagesEntity,
  CreateOrUpdateWarningMessage,
  WarningCodesMapper,
  CalculatePreviousCropService,
  ManureTypeMapper,
  normalizeDateWithTime,
  JOINS,
  ProcessFutureManuresForWarnings,
  GenerateRecommendations,
  UpdatingFutureRecommendations,
  MANAGEMENT_PERIOD_TO_CROP_JOIN,
  CROP_TO_FIELD_CONDITION,
  API_ENDPOINTS,
};
