import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoilAnalysisController } from './soil-analysis.controller';
import { SoilAnalysisService } from './soil-analysis.service';

@Module({
  imports: [TypeOrmModule.forFeature([SoilAnalysisEntity])],
  controllers: [SoilAnalysisController],
  providers: [SoilAnalysisService],
  exports: [TypeOrmModule],
})
export class SoilAnalysisModule {}
