import { Module } from '@nestjs/common';
import { RainTypeController } from './rain-type.controller';
import { RainTypeService } from './rain-type.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RainTypeEntity } from '@db/entity/rain-type.entity';
import { MannerRainTypesService } from '@src/vendors/manner/rain-types/rain-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([RainTypeEntity])],
  controllers: [RainTypeController],
  providers: [RainTypeService, MannerRainTypesService],
  exports: [TypeOrmModule],
})
export class RainTypeModule {}
