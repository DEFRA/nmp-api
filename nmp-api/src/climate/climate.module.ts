import { Module } from '@nestjs/common';
import { ClimateController } from './climate.controller';
import { ClimateService } from './climate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import ClimateDatabaseEntity from '@db/entity/climate-date.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClimateDatabaseEntity])],
  controllers: [ClimateController],
  providers: [ClimateService],
  exports: [TypeOrmModule],
})
export class ClimateModule {}
