import { Module } from '@nestjs/common';
import { MoistureTypeController } from './moisture-type.controller';
import { MoistureTypeService } from './moisture-type.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoistureTypeEntity } from '@db/entity/moisture-type.entity';
import { MannerMoistureTypesService } from '@src/vendors/manner/moisture-types/moisture-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([MoistureTypeEntity])],
  controllers: [MoistureTypeController],
  providers: [MoistureTypeService, MannerMoistureTypesService],
  exports: [TypeOrmModule],
})
export class MoistureTypeModule {}
