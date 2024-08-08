import { Module } from '@nestjs/common';
import { FertiliserManuresController } from './fertiliser-manures.controller';
import { FertiliserManuresService } from './fertiliser-manures.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';
import { RecommendationEntity } from '@db/entity/recommendation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FertiliserManuresEntity,RecommendationEntity])],
  controllers: [FertiliserManuresController],
  providers: [FertiliserManuresService],
  exports: [TypeOrmModule],
})
export class FertiliserManuresModule {}
