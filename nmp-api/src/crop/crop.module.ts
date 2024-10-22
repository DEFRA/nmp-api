import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import CropEntity from '@db/entity/crop.entity';
import { CropService } from '@src/crop/crop.service';
import { CropController } from './crop.controller';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import { RecommendationEntity } from '@db/entity/recommendation.entity';
import FieldEntity from '@db/entity/field.entity';
import FarmEntity from '@db/entity/farm.entity';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { RecommendationCommentEntity } from '@db/entity/recommendation-comment.entity';
import { RB209ArableModule } from '@src/vendors/rb209/arable/arable.module';
import { RB209FieldModule } from '@src/vendors/rb209/field/field.module';
import { RB209RecommendationModule } from '@src/vendors/rb209/recommendation/recommendation.module';
import { PlanService } from '@src/plan/plan.service';
import { ManagementPeriodService } from '@src/management-period/management-period.service';
import { FarmService } from '@src/farm/farm.service';
import { SoilAnalysisService } from '@src/soil-analysis/soil-analysis.service';
import { RB209ArableService } from '@src/vendors/rb209/arable/arable.service';
import { RB209RecommendationService } from '@src/vendors/rb209/recommendation/recommendation.service';
import SnsAnalysesEntity from '@db/entity/sns-analysis.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecommendationEntity,
      CropEntity,
      ManagementPeriodEntity,
      FieldEntity,
      FarmEntity,
      SoilAnalysisEntity,
      RecommendationCommentEntity,
      SnsAnalysesEntity

    ]),
    RB209ArableModule,
    RB209FieldModule,
    RB209RecommendationModule,
  ],
  controllers: [CropController],
  providers: [
    PlanService,
    CropService,
    ManagementPeriodService,
    FarmService,
    SoilAnalysisService,
    RB209ArableService,
    RB209RecommendationService,
  ],
  exports: [TypeOrmModule],
})
export class CropModule {}
