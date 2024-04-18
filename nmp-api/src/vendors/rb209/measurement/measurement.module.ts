import { Module } from '@nestjs/common';
import { RB209MeasurementService } from './measurement.service';
import { RB209MeasurementController } from './measurement.controller';

@Module({
  controllers: [RB209MeasurementController],
  providers: [RB209MeasurementService],
})
export class RB209MeasurementModule {}
