import { Module } from '@nestjs/common';
import {  MannerIncorporationDelayController } from './incorporation-delay.controller';
import {  MannerIncorporationDelayService } from './incorporation-delay.service';

@Module({
  controllers: [MannerIncorporationDelayController],
  providers: [MannerIncorporationDelayService]
})
export class MannerIncorporationDelayModule {}
