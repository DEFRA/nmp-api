import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { RecommendationEntity } from '@db/entity/recommendation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecommendationEntity])],
  controllers: [RecommendationController],
  providers: [RecommendationService],
  exports: [TypeOrmModule],
})
export class RecommendationModule {}
