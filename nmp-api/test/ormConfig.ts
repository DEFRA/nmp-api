import ClimateDataEntity from '@db/entity/climate-date.entity';
import CropEntity from '@db/entity/crop.entity';
import FarmEntity from '@db/entity/farm.entity';
import FieldEntity from '@db/entity/field.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import OrganisationEntity from '@db/entity/organisation.entity';
import { RecommendationCommentEntity } from '@db/entity/recommendation-comment.entity';
import { RecommendationEntity } from '@db/entity/recommendation.entity';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import UserEntity from '@db/entity/user.entity';
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
    ClimateDataEntity,
  ],
  options: {
    trustServerCertificate: true,
  },
};
