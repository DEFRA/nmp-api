import FieldEntity from '@db/entity/field.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldController } from './field.controller';
import { FieldService } from './field.service';
import CropEntity from '@db/entity/crop.entity';
import SoilAnalysesEntity from '@db/entity/soil-analyses.entity';
import { CropService } from '@src/crop/crop.service';
import { SoilAnalysesService } from '@src/soil-analyses/soil-analyses.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldEntity, CropEntity, SoilAnalysesEntity]),
  ],
  controllers: [FieldController],
  providers: [FieldService, CropService, SoilAnalysesService],
  exports: [TypeOrmModule],
})
export class FieldModule {}
