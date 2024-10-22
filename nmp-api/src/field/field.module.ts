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
import { SoilTypeSoilTextureEntity } from '@db/entity/soil-type-soil-texture.entity';
import { RB209ArableService } from '@src/vendors/rb209/arable/arable.service';
import SnsAnalysesEntity from '@db/entity/sns-analysis.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FieldEntity,
      CropEntity,
      SoilAnalysisEntity,
      ManagementPeriodEntity,
      SoilTypeSoilTextureEntity,
      SnsAnalysesEntity
    ]),
  ],
  controllers: [FieldController],
  providers: [
    FieldService,
    CropService,
    SoilAnalysisService,
    ManagementPeriodService,
    RB209SoilService,
    RB209ArableService,
  ],
  exports: [TypeOrmModule],
})
export class FieldModule {}
