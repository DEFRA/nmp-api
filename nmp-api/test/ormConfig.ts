import { ApplicationMethodsIncorpMethodEntity } from '@db/entity/application-method-incorp-method.entity';
import { ApplicationMethodEntity } from '@db/entity/application-method.entity';
import ClimateDatabaseEntity from '@db/entity/climate-data.entity';
import { CountryEntity } from '@db/entity/country.entity';
import { CropTypeLinkingEntity } from '@db/entity/crop-type-linking.entity';
import CropEntity from '@db/entity/crop.entity';
import FarmManureTypeEntity from '@db/entity/farm-manure-type.entity';
import FarmEntity from '@db/entity/farm.entity';
import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';
import FieldEntity from '@db/entity/field.entity';
import { IncorpMethodsIncorpDelayEntity } from '@db/entity/incorp-method-incorp-delay.entity';
import { IncorporationDelayEntity } from '@db/entity/incorporation-delay.entity';
import { IncorporationMethodEntity } from '@db/entity/incorporation-method.entity';
import { InOrganicManureDurationEntity } from '@db/entity/inorganic-manure-duration.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import { MannerCropTypeEntity } from '@db/entity/manner-crop-type.entity';
import { ManureGroupEntity } from '@db/entity/manure-group.entity';
import { ManureTypeCategoryEntity } from '@db/entity/manure-type-category.entity';
import { ManureTypeEntity } from '@db/entity/manure-type.entity';
import { MoistureTypeEntity } from '@db/entity/moisture-type.entity';
import { OrganicManureEntity } from '@db/entity/organic-manure.entity';
import OrganisationEntity from '@db/entity/organisation.entity';
import { RainTypeEntity } from '@db/entity/rain-type.entity';
import { RecommendationCommentEntity } from '@db/entity/recommendation-comment.entity';
import { RecommendationEntity } from '@db/entity/recommendation.entity';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { SoilTypeSoilTextureEntity } from '@db/entity/soil-type-soil-texture.entity';
import { SubSoilEntity } from '@db/entity/sub-soil.entity';
import { TopSoilEntity } from '@db/entity/top-soil.entity';
import UserEntity from '@db/entity/user.entity';
import { WindspeedEntity } from '@db/entity/wind-speed.entity';
import EnvironmentService from '@shared/environment.service';

export const ormConfig: any = {
  type: 'mssql',
  host: EnvironmentService.DATABASE_HOST(),
  port: EnvironmentService.DATABASE_PORT(),
  database: EnvironmentService.DATABASE_NAME(),
  username: EnvironmentService.DATABASE_USER(),
  password: EnvironmentService.DATABASE_PASSWORD(),
  entities: [
    FarmEntity,
    UserEntity,
    FieldEntity,
    CropEntity,
    OrganisationEntity,
    SoilAnalysisEntity,
    ManagementPeriodEntity,
    RecommendationEntity,
    RecommendationCommentEntity,
    ClimateDatabaseEntity,
    ApplicationMethodsIncorpMethodEntity,
    ApplicationMethodEntity,
    CountryEntity,
    IncorpMethodsIncorpDelayEntity,
    IncorporationDelayEntity,
    IncorporationMethodEntity,
    ManureGroupEntity,
    ManureTypeEntity,
    MoistureTypeEntity,
    OrganicManureEntity,
    FarmManureTypeEntity,
    RainTypeEntity,
    WindspeedEntity,
    TopSoilEntity,
    SubSoilEntity,
    SoilTypeSoilTextureEntity,
    CropTypeLinkingEntity,
    MannerCropTypeEntity,
    ManureTypeCategoryEntity,
    InOrganicManureDurationEntity,
    FertiliserManuresEntity,
  ],
  options: {
    trustServerCertificate: true,
  },
};
