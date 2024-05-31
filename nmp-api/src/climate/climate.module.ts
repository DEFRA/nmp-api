import { Module } from '@nestjs/common';
import { ClimateController } from './climate.controller';
import { ClimateService } from './climate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import ClimateDataEntity from '@db/entity/climate-date.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClimateDataEntity])],
  controllers: [ClimateController],
  providers: [ClimateService],
  exports: [TypeOrmModule],
})
export class ClimateModule {}
