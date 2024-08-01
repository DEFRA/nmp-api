import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { RecommendationEntity } from '@db/entity/recommendation.entity';
import { RecommendationCommentEntity } from '@db/entity/recommendation-comment.entity';
import { OrganicManureEntity } from '@db/entity/organic-manure.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecommendationEntity,
      RecommendationCommentEntity,
      OrganicManureEntity,
    ]),
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService],
  exports: [TypeOrmModule],
})
export class RecommendationModule {}
