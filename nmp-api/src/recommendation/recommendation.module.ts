import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { RecommendationEntity } from '@db/entity/recommendation.entity';
import { RecommendationCommentEntity } from '@db/entity/recommendation-comment.entity';
import { OrganicManureEntity } from '@db/entity/organic-manure.entity';
import { MannerManureTypesService } from '@src/vendors/manner/manure-types/manure-types.service';
import { MannerApplicationMethodService } from '@src/vendors/manner/application-method/application-method.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecommendationEntity,
      RecommendationCommentEntity,
      OrganicManureEntity,
    ]),
  ],
  controllers: [RecommendationController],
  providers: [
    RecommendationService,
    MannerManureTypesService,
    MannerApplicationMethodService
  ],
  exports: [TypeOrmModule],
})
export class RecommendationModule {}
