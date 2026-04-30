// Import all entities here

const { FarmEntity } = require("../entity/farm.entity");
const { FieldEntity } = require("../entity/field.entity");
const { UserEntity } = require("../entity/user.entity");
const { OrganisationEntity } = require("../entity/organisation.entity");
const { MoistureTypeEntity } = require("../entity/moisture-type.entity");
const { ManureTypeEntity } = require("../entity/manure-type.entity");
const { CropEntity } = require("../entity/crop.entity");
const {
  ManagementPeriodEntity,
} = require("../entity/management-period.entity");
const { RainTypeEntity } = require("../entity/rain-type.entity");
const {
  IncorporationMethodEntity,
} = require("../entity/incorporation-method.entity");
const { ManureGroupEntity } = require("../entity/manure-group.entity");
const {
  IncorporationDelayEntity,
} = require("../entity/incorporation-delay.entity");

const { SoilAnalysisEntity } = require("../entity/soil-analysis.entity");
const { MannerCropTypeEntity } = require("../entity/manner-crop-type.entity");
const { CropTypeLinkingEntity } = require("../entity/crop-type-linking.entity");
const {
  ApplicationMethodEntity,
} = require("../entity/application-method.entity");
const {
  SoilTypeSoilTextureEntity,
} = require("../entity/soil-type-soil-texture.entity");
const { RecommendationEntity } = require("../entity/recommendation.entity");
const {
  RecommendationCommentEntity,
} = require("../entity/recommendation-comment.entity");
const { OrganicManureEntity } = require("../entity/organic-manure.entity");
const { FarmManureTypeEntity } = require("../entity/farm-manure-type.entity");
const {
  FertiliserManuresEntity,
} = require("../entity/fertiliser-manures.entity");
const {
  InOrganicManureDurationEntity,
} = require("../entity/inorganic-manure-duration.entity");
const { CountryEntity } = require("../entity/country.entity");
const {
  ManureTypeCategoryEntity,
} = require("../entity/manure-type-category.entity");
const {
  SecondCropLinkingEntity,
} = require("../entity/second-crop-linking.entity");
const { PKBalanceEntity } = require("../entity/pk-balance.entity");
const {
  SoilNitrogenSupplyItemsEntity,
} = require("../entity/soil-nitrogen-supply-items.entity");
const {
  CropInfoQuestionsEntity,
} = require("../entity/crop-info-questions.entity");
const { ExcessRainfallsEntity } = require("../entity/excess-rainfalls.entity");

const {
  CropGroupCategoriesEntity,
} = require("../entity/crop-group-categories.entity");

const { StoreCapacitiesEntity } = require("../entity/store-capacities.entity");
const { MaterialStatesEntity } = require("../entity/material-states.entity");
const {
  SolidManureTypesEntity,
} = require("../entity/solid-manure-types.entity");
const {
  PreviousCroppingEntity,
} = require("../entity/previous-cropping.entity");
const { WarningCodeEntity } = require("../entity/warning-code.entity");

const { FarmsNVZEntity } = require("../entity/farms-nvz.entity");
const {
  PreviousGrassIdMappingEntity,
} = require("./previous-grass-Id-mapping.entity");
const { StorageTypesEntity } = require("./storage-types.Entity");
const { WindspeedEntity } = require("./wind-speed.entity");
const {
  ApplicationMethodsIncorpMethodEntity,
} = require("./application-method-incorp-method.entity");
const {
  IncorpMethodsIncorpDelayEntity,
} = require("./incorp-method-incorp-delay.entity");
const { SnsAnalysesEntity } = require("./sns-analysis.entity");
const {
  GrassManagementOptionsEntity,
} = require("./grassManagementOptionsEntity");
const { GrassTypicalCutsEntity } = require("./grassTypicalCutsEntity");
const { PreviousGrassesEntity } = require("./previous-grasses-entity");
const { WarningsEntity } = require("./warning.entity");
const { WarningMessagesEntity } = require("./warning-message.entity");
const { SoilGroupCategoriesEntity } = require("./soil-group-categories-entity");
const { LivestockGroupEntity } = require("./livestock-group-entity");
const { LivestockTypeEntity } = require("./livestock-type-entity");
const {
  NutrientsLoadingFarmDetailsEntity,
} = require("./nutrients-loading-farm-details-entity");
const {
  NutrientsLoadingLiveStocksEntity,
} = require("./nutrients-loading-live-stocks-entity");
const {
  NutrientsLoadingManuresEntity,
} = require("./nutrients-loading-manures-entity");
const { BankSlopeAnglesEntity } = require("./bank-slope-angles-entity");
const {
  GrassHistoryIdMappingEntity,
} = require("./grass-history-id-mapping-entity");
const {
  ExcessWinterRainfallOptionsEntity,
} = require("./excess-winter-rainfall-options");
const {
  InprogressCalculationsEntity,
} = require("./inprogress-calculations-entity");
const { SNSCategoriesEntity } = require("./snsCategories.entity");
const { UserExtensionsEntity } = require("./user-extension.entity");
const { PscIndexEntity } = require("./psc-index.entity");
const { SoilAnalysesMethodsEntity } = require("./soil-analyses-methods.entity");
const { ScotlandNMaxValuesEntity } = require("./scotland-nmax-values.entity");
const { FarmAverageYieldsEntity } = require("./farm-average-yield-entity");

// Export as a single array

const entities = [
  FarmEntity,
  FieldEntity,
  UserEntity,
  OrganisationEntity,
  MoistureTypeEntity,
  ManureTypeEntity,
  CropEntity,
  ManagementPeriodEntity,
  RainTypeEntity,
  IncorporationMethodEntity,
  ManureGroupEntity,
  IncorporationDelayEntity,
  WindspeedEntity,
  SoilAnalysisEntity,
  MannerCropTypeEntity,
  CropTypeLinkingEntity,
  ApplicationMethodEntity,
  ApplicationMethodsIncorpMethodEntity,
  IncorpMethodsIncorpDelayEntity,
  SoilTypeSoilTextureEntity,
  RecommendationEntity,
  RecommendationCommentEntity,
  OrganicManureEntity,
  FarmManureTypeEntity,
  FertiliserManuresEntity,
  InOrganicManureDurationEntity,
  CountryEntity,
  ManureTypeCategoryEntity,
  SnsAnalysesEntity,
  SecondCropLinkingEntity,
  PKBalanceEntity,
  GrassManagementOptionsEntity,
  GrassTypicalCutsEntity,
  SoilNitrogenSupplyItemsEntity,
  PreviousGrassesEntity,
  SNSCategoriesEntity,
  InprogressCalculationsEntity,
  CropInfoQuestionsEntity,
  ExcessRainfallsEntity,
  ExcessWinterRainfallOptionsEntity,
  UserExtensionsEntity,
  PreviousGrassIdMappingEntity,
  GrassHistoryIdMappingEntity,
  CropGroupCategoriesEntity,
  SoilGroupCategoriesEntity,
  LivestockGroupEntity,
  LivestockTypeEntity,
  NutrientsLoadingFarmDetailsEntity,
  NutrientsLoadingLiveStocksEntity,
  NutrientsLoadingManuresEntity,
  StorageTypesEntity,
  StoreCapacitiesEntity,
  MaterialStatesEntity,
  SolidManureTypesEntity,
  BankSlopeAnglesEntity,
  WarningMessagesEntity,
  PreviousCroppingEntity,
  WarningCodeEntity,
  WarningsEntity,
  FarmsNVZEntity,
  PscIndexEntity,
  SoilAnalysesMethodsEntity,
  ScotlandNMaxValuesEntity,
  FarmAverageYieldsEntity
];

module.exports = { entities };
