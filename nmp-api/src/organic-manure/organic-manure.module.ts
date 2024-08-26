import { Module } from '@nestjs/common';
import { OrganicManureController } from './organic-manure.controller';
import { OrganicManureService } from './organic-manure.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganicManureEntity } from '@db/entity/organic-manure.entity';
import FarmManureTypeEntity from '@db/entity/farm-manure-type.entity';
import CropEntity from '@db/entity/crop.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganicManureEntity,
      FarmManureTypeEntity,
      CropEntity,
      ManagementPeriodEntity,
    ]),
  ],
  controllers: [OrganicManureController],
  providers: [OrganicManureService],
  exports: [TypeOrmModule],
})
export class OrganicManureModule {}
