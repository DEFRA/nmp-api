import { Module } from '@nestjs/common';
import {MannerAutumnCropNitorgenUptakeController } from './autumn-crop-nitorgen-uptake.controller';
import { MannerAutumnCropNitorgenUptakeService } from './autumn-crop-nitorgen-uptake.service';

@Module({
  controllers: [MannerAutumnCropNitorgenUptakeController],
  providers: [MannerAutumnCropNitorgenUptakeService],
})
export class MannerAutumnCropNitorgenUptakeModule {}
