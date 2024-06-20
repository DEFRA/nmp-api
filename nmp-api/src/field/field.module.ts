import FieldEntity from '@db/entity/field.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldController } from './field.controller';
import { FieldService } from './field.service';
import CropEntity from '@db/entity/crop.entity';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { CropService } from '@src/crop/crop.service';
import { SoilAnalysisService } from '@src/soil-analysis/soil-analysis.service';
import { ManagementPeriodService } from '@src/management-period/management-period.service';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import { RB209SoilService } from '@src/vendors/rb209/soil/soil.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FieldEntity,
      CropEntity,
      SoilAnalysisEntity,
      ManagementPeriodEntity,
    ]),
  ],
  controllers: [FieldController],
  providers: [
    FieldService,
    CropService,
    SoilAnalysisService,
    ManagementPeriodService,
    RB209SoilService,
  ],
  exports: [TypeOrmModule],
})
export class FieldModule {}
