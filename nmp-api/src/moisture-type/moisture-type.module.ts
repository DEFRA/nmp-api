import { Module } from '@nestjs/common';
import { MoistureTypeController } from './moisture-type.controller';
import { MoistureTypeService } from './moisture-type.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoistureTypeEntity } from '@db/entity/moisture-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MoistureTypeEntity])],
  controllers: [MoistureTypeController],
  providers: [MoistureTypeService],
  exports: [TypeOrmModule],
})
export class MoistureTypeModule {}
