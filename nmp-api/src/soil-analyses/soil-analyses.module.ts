import SoilAnalysesEntity from '@db/entity/soil-analyses.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoilAnalysesController } from './soil-analyses.controller';
import { SoilAnalysesService } from './soil-analyses.service';

@Module({
  imports: [TypeOrmModule.forFeature([SoilAnalysesEntity])],
  controllers: [SoilAnalysesController],
  providers: [SoilAnalysesService],
  exports: [TypeOrmModule],
})
export class SoilAnalysesModule {}
