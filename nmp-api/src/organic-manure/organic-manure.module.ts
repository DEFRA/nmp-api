import { Module } from '@nestjs/common';
import { OrganicManureController } from './organic-manure.controller';
import { OrganicManureService } from './organic-manure.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganicManureEntity } from '@db/entity/organic-manure.entity';
import FarmManureTypeEntity from '@db/entity/farm-manure-type.entity';
import CropEntity from '@db/entity/crop.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import { ManureTypeEntity } from '@db/entity/manure-type.entity';
import { MannerCalculateNutrientsService } from '@src/vendors/manner/calculate-nutrients/calculate-nutrients.service';
import FieldEntity from '@db/entity/field.entity';
import FarmEntity from '@db/entity/farm.entity';
import { CropTypeLinkingEntity } from '@db/entity/crop-type-linking.entity';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { RB209ArableService } from '@src/vendors/rb209/arable/arable.service';
import { RB209RecommendationService } from '@src/vendors/rb209/recommendation/recommendation.service';
import { RecommendationEntity } from '@db/entity/recommendation.entity';
import { RB209FieldService } from '@src/vendors/rb209/field/field.service';
import { RecommendationCommentEntity } from '@db/entity/recommendation-comment.entity';
import { MannerManureTypesService } from '@src/vendors/manner/manure-types/manure-types.service';
import SnsAnalysesEntity from '@db/entity/sns-analysis.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganicManureEntity,
      FarmManureTypeEntity,
      CropEntity,
      ManagementPeriodEntity,
      ManureTypeEntity,
      FieldEntity,
      FarmEntity,
      CropTypeLinkingEntity,
      SoilAnalysisEntity,
      RecommendationEntity,
      RecommendationCommentEntity,
      SnsAnalysesEntity
    ]),
  ],
  controllers: [OrganicManureController],
  providers: [
    OrganicManureService,
    MannerCalculateNutrientsService,
    RB209ArableService,
    RB209RecommendationService,
    RB209FieldService,
    MannerManureTypesService,
  ],
  exports: [TypeOrmModule],
})
export class OrganicManureModule {}
