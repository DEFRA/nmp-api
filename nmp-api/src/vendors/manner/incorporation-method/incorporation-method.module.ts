import { Module } from '@nestjs/common';
import {  MannerIncorporationMethodController } from './incorporation-method.controller';
import {  MannerIncorporationMethodService } from './incorporation-method.service';

@Module({
  controllers: [MannerIncorporationMethodController],
  providers: [MannerIncorporationMethodService]
})
export class MannerIncorporationMethodModule {}
