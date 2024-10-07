import FarmEntity from '@db/entity/farm.entity';
import UserEntity from '@db/entity/user.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import EnvironmentService from '@shared/environment.service';
import * as dotven from 'dotenv';
import 'dotenv/config';
import FieldEntity from '@db/entity/field.entity';
import OrganisationEntity from '@db/entity/organisation.entity';
import CropEntity from '@db/entity/crop.entity';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import { RecommendationEntity } from '@db/entity/recommendation.entity';
import { RecommendationCommentEntity } from '@db/entity/recommendation-comment.entity';
import ClimateDatabaseEntity from '@db/entity/climate-data.entity';
import { ApplicationMethodsIncorpMethodEntity } from '@db/entity/application-method-incorp-method.entity';
import { ApplicationMethodEntity } from '@db/entity/application-method.entity';
import { CountryEntity } from '@db/entity/country.entity';
import { IncorpMethodsIncorpDelayEntity } from '@db/entity/incorp-method-incorp-delay.entity';
import { IncorporationDelayEntity } from '@db/entity/incorporation-delay.entity';
import { IncorporationMethodEntity } from '@db/entity/incorporation-method.entity';
import { ManureGroupEntity } from '@db/entity/manure-group.entity';
import { ManureTypeEntity } from '@db/entity/manure-type.entity';
import { MoistureTypeEntity } from '@db/entity/moisture-type.entity';
import { OrganicManureEntity } from '@db/entity/organic-manure.entity';
import { RainTypeEntity } from '@db/entity/rain-type.entity';
import { WindspeedEntity } from '@db/entity/wind-speed.entity';
import FarmManureTypeEntity from '@db/entity/farm-manure-type.entity';
import { SoilTypeSoilTextureEntity } from '@db/entity/soil-type-soil-texture.entity';
import { TopSoilEntity } from '@db/entity/top-soil.entity';
import { SubSoilEntity } from '@db/entity/sub-soil.entity';
import { MannerCropTypeEntity } from '@db/entity/manner-crop-type.entity';
import { CropTypeLinkingEntity } from '@db/entity/crop-type-linking.entity';
import { ManureTypeCategoryEntity } from '@db/entity/manure-type-category.entity';
import { InOrganicManureDurationEntity } from '@db/entity/inorganic-manure-duration.entity';
import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';
import SnsAnalysesEntity from '@db/entity/sns-analysis.entity';

dotven.config();

let OrmConnectionSetup: TypeOrmModuleOptions = {};
if (process.env.NODE_ENV === 'production') {
  OrmConnectionSetup = {
    type: 'mssql',
    host: EnvironmentService.DATABASE_HOST(),
    port: EnvironmentService.DATABASE_PORT(),
    database: EnvironmentService.DATABASE_NAME(),
    options: {
      encrypt: true,
    },
    extra: {
      authentication: {
        type: EnvironmentService.AZURE_AD_CONNECTION_TYPE(),
      },
    },
    entities: [
      FarmEntity,
      UserEntity,
      FieldEntity,
      CropEntity,
      SoilAnalysisEntity,
      ManagementPeriodEntity,
      RecommendationEntity,
      RecommendationCommentEntity,
      OrganisationEntity,
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
      RainTypeEntity,
      WindspeedEntity,
      FarmManureTypeEntity,
      TopSoilEntity,
      SubSoilEntity,
      SoilTypeSoilTextureEntity,
      CropTypeLinkingEntity,
      MannerCropTypeEntity,
      ManureTypeCategoryEntity,
      InOrganicManureDurationEntity,
      FertiliserManuresEntity,
      SnsAnalysesEntity
    ],
  };
} else if (process.env.NODE_ENV === 'hosting') {
  OrmConnectionSetup = {
    type: 'mssql',
    host: EnvironmentService.DATABASE_HOST(),
    port: EnvironmentService.DATABASE_PORT(),
    database: EnvironmentService.DATABASE_NAME(),
    username: EnvironmentService.DATABASE_USER(),
    password: EnvironmentService.DATABASE_PASSWORD(),
    synchronize: false,
    logging: false,
    extra: {
      type: EnvironmentService.AZURE_AD_CONNECTION_TYPE(),
    },
    entities: [__dirname + '../db/entity/**/*.entity{.ts,.js}'],
  };
} else {
  OrmConnectionSetup = {
    type: 'mssql',
    host: EnvironmentService.DATABASE_HOST(),
    port: EnvironmentService.DATABASE_PORT(),
    database: EnvironmentService.DATABASE_NAME(),
    username: EnvironmentService.DATABASE_USER(),
    password: EnvironmentService.DATABASE_PASSWORD(),
    options: {
      trustServerCertificate: true,
    },
    entities: [
      FarmEntity,
      UserEntity,
      FieldEntity,
      CropEntity,
      SoilAnalysisEntity,
      ManagementPeriodEntity,
      RecommendationEntity,
      RecommendationCommentEntity,
      OrganisationEntity,
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
      RainTypeEntity,
      WindspeedEntity,
      FarmManureTypeEntity,
      TopSoilEntity,
      SubSoilEntity,
      SoilTypeSoilTextureEntity,
      CropTypeLinkingEntity,
      MannerCropTypeEntity,
      ManureTypeCategoryEntity,
      InOrganicManureDurationEntity,
      FertiliserManuresEntity,
      SnsAnalysesEntity
    ],
    synchronize: false,
    logging: true,
  };
}

export default OrmConnectionSetup;
