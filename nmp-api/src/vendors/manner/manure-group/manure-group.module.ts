import { Module } from '@nestjs/common';
import { MannerManureGroupService } from './manure-group.service';
import { MannerManureGroupController } from './manure-group.controller';

@Module({
  providers: [MannerManureGroupService],
  controllers: [MannerManureGroupController]
})
export class MannerManureGroupModule {}
