import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import CropEntity from '@db/entity/crop.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import FarmEntity from '@db/entity/farm.entity';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import FieldEntity from '@db/entity/field.entity';
import { ManagementPeriodService } from '@src/management-period/management-period.service';
import { FarmService } from '@src/farm/farm.service';
import { SoilAnalysisService } from '@src/soil-analysis/soil-analysis.service';
import { RecommendationEntity } from '@db/entity/recommendation.entity';
import { CropService } from '@src/crop/crop.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecommendationEntity,
      CropEntity,
      ManagementPeriodEntity,
      FieldEntity,
      FarmEntity,
      SoilAnalysisEntity,
    ]),
  ],
  controllers: [RecommendationController],
  providers: [
    RecommendationService,
    CropService,
    ManagementPeriodService,
    FarmService,
    FarmService,
    SoilAnalysisService,
  ],
  exports: [TypeOrmModule],
})
export class RecommendationModule {}
