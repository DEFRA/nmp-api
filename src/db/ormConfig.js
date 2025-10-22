const EnvironmentService = require("../shared/environment.service");
const { FarmEntity } = require("./entity/farm.entity.js");
const { FieldEntity } = require("./entity/field.entity.js");
const { UserEntity } = require("./entity/user.entity.js");
const { OrganisationEntity } = require("./entity/organisation.entity.js");
const { MoistureTypeEntity } = require("./entity/moisture-type.entity.js");
const { ClimateDatabaseEntity } = require("./entity/climate.entity.js");
const { ManureTypeEntity } = require("./entity/manure-type.entity.js");
const { CropEntity } = require("./entity/crop.entity.js");
const {
  ManagementPeriodEntity,
} = require("./entity/management-period.entity.js");
const { RainTypeEntity } = require("./entity/rain-type.entity.js");
const {
  IncorporationMethodEntity,
} = require("./entity/incorporation-method.entity.js");
const { ManureGroupEntity } = require("./entity/manure-group.entity.js");
const {
  IncorporationDelayEntity,
} = require("./entity/incorporation-delay.entity.js");
const { WindspeedEntity } = require("./entity/wind-speed.entity.js");
const { SoilAnalysisEntity } = require("./entity/soil-analysis.entity.js");
const { MannerCropTypeEntity } = require("./entity/manner-crop-type.entity.js");
const {
  CropTypeLinkingEntity,
} = require("./entity/crop-type-linking.entity.js");
const {
  ApplicationMethodEntity,
} = require("./entity/application-method.entity.js");
const {
  ApplicationMethodsIncorpMethodEntity,
} = require("./entity/application-method-incorp-method.entity.js");
const {
  IncorpMethodsIncorpDelayEntity,
} = require("./entity/incorp-method-incorp-delay.entity.js");
const {
  SoilTypeSoilTextureEntity,
} = require("./entity/soil-type-soil-texture.entity.js");
const { SubSoilEntity } = require("./entity/sub-soil.entity.js");
const { TopSoilEntity } = require("./entity/top-soil.entity.js");
const { RecommendationEntity } = require("./entity/recommendation.entity.js");
const {
  RecommendationCommentEntity,
} = require("./entity/recommendation-comment.entity.js");
const { OrganicManureEntity } = require("./entity/organic-manure.entity.js");
const { FarmManureTypeEntity } = require("./entity/farm-manure-type.entity.js");
const {
  FertiliserManuresEntity,
} = require("./entity/fertiliser-manures.entity.js");
const {
  InOrganicManureDurationEntity,
} = require("./entity/inorganic-manure-duration.entity.js");
const { CountryEntity } = require("./entity/country.entity.js");
const {
  ManureTypeCategoryEntity,
} = require("./entity/manure-type-category.entity.js");

const dotven = require("dotenv");
const { SnsAnalysesEntity } = require("./entity/sns-analysis.entity.js");
const {
  SecondCropLinkingEntity,
} = require("./entity/second-crop-linking.entity.js");
const { PKBalanceEntity } = require("./entity/pk-balance.entity.js");
const { GrassManagementOptionsEntity } = require("./entity/grassManagementOptionsEntity.js");
const { GrassTypicalCutsEntity } = require("./entity/grassTypicalCutsEntity.js");
const { SoilNitrogenSupplyItemsEntity } = require("./entity/soil-nitrogen-supply-items.entity.js");
const { PreviousGrassesEntity } = require("./entity/previous-grasses-entity.js");
const { SNSCategoriesEntity } = require("./entity/snsCategories.entity.js");
const { InprogressCalculationsEntity } = require("./entity/inprogress-calculations-entity.js");
const { CropInfoQuestionsEntity } = require("./entity/crop-info-questions.entity.js");
const { ExcessRainfallsEntity } = require("./entity/excess-rainfalls.entity.js");
const { ExcessWinterRainfallOptionsEntity } = require("./entity/excess-winter-rainfall-options.js");
const { UserExtensionsEntity } = require("./entity/user-extension.entity.js");
const { PreviousGrassIdMappingEntity } = require("./entity/previous-grass-Id-mapping.entity.js");
const { GrassHistoryIdMappingEntity } = require("./entity/grass-history-id-mapping-entity.js");
const { CropGroupCategoriesEntity } = require("./entity/crop-group-categories.entity.js");
const { SoilGroupCategoriesEntity } = require("./entity/soil-group-categories-entity.js");
const { LivestockGroupEntity } = require("./entity/livestock-group-entity.js");
const { LivestockTypeEntity } = require("./entity/livestock-type-entity.js");
const { NutrientsLoadingFarmDetailsEntity } = require("./entity/nutrients-loading-farm-details-entity.js");
const { NutrientsLoadingLiveStocksEntity } = require("./entity/nutrients-loading-live-stocks-entity.js");
const { NutrientsLoadingManuresEntity } = require("./entity/nutrients-loading-manures-entity.js");
const { StorageTypesEntity } = require("./entity/storage-types.Entity.js");
const { StoreCapacitiesEntity } = require("./entity/store-capacities.entity.js");
const { MaterialStatesEntity } = require("./entity/material-states.entity.js");
const { SolidManureTypesEntity } = require("./entity/solid-manure-types.entity.js");
const { BankSlopeAnglesEntity } = require("./entity/bank-slope-angles-entity.js");
const { WarningMessagesEntity } = require("./entity/warning-message.entity.js");
const { PreviousCroppingEntity } = require("./entity/previous-cropping.entity.js");



dotven.config();

const isProduction = EnvironmentService.NODE_ENV() === "production";

const baseConfig = {
  type: "mssql",
  host: EnvironmentService.DATABASE_HOST(),
  port: EnvironmentService.DATABASE_PORT(),
  database: EnvironmentService.DATABASE_NAME(),
  entities: [
    FarmEntity,
    FieldEntity,
    UserEntity,
    OrganisationEntity,
    MoistureTypeEntity,
    ClimateDatabaseEntity,
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
    SubSoilEntity,
    TopSoilEntity,
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
    FarmManureTypeEntity,
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
    PreviousCroppingEntity
  ],
};

let ormConfig;

if (isProduction) {
  ormConfig = {
    ...baseConfig,
    options: {
      encrypt: true,
    },
    extra: {
      authentication: {
        type: EnvironmentService.AZURE_AD_CONNECTION_TYPE(),
      },
    },
  };
} else {
  ormConfig = {
    ...baseConfig,
    username: EnvironmentService.DATABASE_USER(),
    password: EnvironmentService.DATABASE_PASSWORD(),
    options: {
      trustServerCertificate: true,
    },
    synchronize: false,
    logging: true,
  };
}

module.exports = ormConfig;
