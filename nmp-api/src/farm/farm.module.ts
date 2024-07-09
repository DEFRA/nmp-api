import { Module } from '@nestjs/common';
import FarmEntity from '@db/entity/farm.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmController } from './farm.controller';
import { FarmService } from './farm.service';
import FieldEntity from '@db/entity/field.entity';
import CropEntity from '@db/entity/crop.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import { RecommendationCommentEntity } from '@db/entity/recommendation-comment.entity';
import { RecommendationEntity } from '@db/entity/recommendation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FarmEntity,
      FieldEntity, // Include FieldEntity
      CropEntity, // Include CropEntity
      ManagementPeriodEntity,
      RecommendationEntity,
      RecommendationCommentEntity,
    ]),
  ],
  controllers: [FarmController],
  providers: [FarmService],
  exports: [TypeOrmModule],
})
export class FarmModule {}
