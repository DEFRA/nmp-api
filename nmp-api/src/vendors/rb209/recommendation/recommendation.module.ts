import { Module } from '@nestjs/common';
import { RB209RecommendationService } from './recommendation.service';
import { RB209RecommendationController } from './recommendation.controller';

@Module({
  controllers: [RB209RecommendationController],
  providers: [RB209RecommendationService],
})
export class RB209RecommendationModule {}
