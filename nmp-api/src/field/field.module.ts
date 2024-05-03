import FieldEntity from '@db/entity/field.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldController } from './field.controller';
import { FieldService } from './field.service';
import CropEntity from '@db/entity/crop.entity';
import SoilAnalysesEntity from '@db/entity/soil-analyses.entity';
import { CropService } from '@src/crop/crop.service';
import { SoilAnalysesService } from '@src/soil-analyses/soil-analyses.service';
import { ManagementPeriodService } from '@src/management-period/management-period.service';
import ManagementPeriodEntity from '@db/entity/management-period.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldEntity, CropEntity, SoilAnalysesEntity,ManagementPeriodEntity]),
  ],
  controllers: [FieldController],
  providers: [FieldService, CropService, SoilAnalysesService,ManagementPeriodService],
  exports: [TypeOrmModule],
})
export class FieldModule {}
