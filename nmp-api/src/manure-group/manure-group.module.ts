import { Module } from '@nestjs/common';
import { ManureGroupController } from './manure-group.controller';
import { ManureGroupService } from './manure-group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManureGroupEntity } from '@db/entity/manure-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ManureGroupEntity])],
  controllers: [ManureGroupController],
  providers: [ManureGroupService],
  exports: [TypeOrmModule],
})
export class ManureGroupModule {}
