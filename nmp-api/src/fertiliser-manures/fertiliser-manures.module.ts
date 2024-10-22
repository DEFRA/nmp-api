import { Module } from '@nestjs/common';
import { FertiliserManuresController } from './fertiliser-manures.controller';
import { FertiliserManuresService } from './fertiliser-manures.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';
import { RecommendationEntity } from '@db/entity/recommendation.entity';
import { OrganicManureEntity } from '@db/entity/organic-manure.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FertiliserManuresEntity,
      RecommendationEntity,
      OrganicManureEntity,
    ]),
  ],
  controllers: [FertiliserManuresController],
  providers: [FertiliserManuresService],
  exports: [TypeOrmModule],
})
export class FertiliserManuresModule {}
