import { Module } from '@nestjs/common';
import {  MannerWindspeedController } from './windspeed.controller';
import {  MannerWindspeedService } from './windspeed.service';

@Module({
  controllers: [MannerWindspeedController],
  providers: [MannerWindspeedService]
})
export class MannerWindspeedModule {}
