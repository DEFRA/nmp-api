import FarmEntity from '@db/entity/farm.entity';
import UserEntity from '@db/entity/user.entity';
import RoleEntity from '@db/entity/role.entity';
import UserFarmEntity from '@db/entity/user-farm.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import EnvironmentService from '@shared/environment.service';
import * as dotven from 'dotenv';
import 'dotenv/config';
import FieldEntity from '@db/entity/field.entity';
import CropEntity from '@db/entity/crop.entity';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import { RecommendationEntity } from '@db/entity/recommendation.entity';
import { RecommendationCommentEntity } from '@db/entity/recommendation-comment.entity';

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
      RoleEntity,
      UserFarmEntity,
      FieldEntity,
      CropEntity,
      SoilAnalysisEntity,
      ManagementPeriodEntity,
      RecommendationEntity,
      RecommendationCommentEntity,
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
      RoleEntity,
      UserFarmEntity,
      FieldEntity,
      CropEntity,
      SoilAnalysisEntity,
      ManagementPeriodEntity,
      RecommendationEntity,
      RecommendationCommentEntity,
    ],
    synchronize: false,
    logging: true,
  };
}

export default OrmConnectionSetup;
