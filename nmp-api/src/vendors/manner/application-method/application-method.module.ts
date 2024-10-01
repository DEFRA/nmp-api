import { Module } from '@nestjs/common';
import {  MannerApplicationMethodController } from './application-method.controller';
import {  MannerApplicationMethodService } from './application-method.service';

@Module({
  controllers: [MannerApplicationMethodController],
  providers: [MannerApplicationMethodService]
})
export class MannerApplicationMethodModule {}
