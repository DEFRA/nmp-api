import { Module } from '@nestjs/common';
import { ManureTypeController } from './manure-type.controller';
import { ManureTypeService } from './manure-type.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManureTypeEntity } from '@db/entity/manure-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ManureTypeEntity])],
  controllers: [ManureTypeController],
  providers: [ManureTypeService],
  exports: [TypeOrmModule],
})
export class ManureTypeModule {}
