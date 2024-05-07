import { Module } from '@nestjs/common';
import FarmEntity from '@db/entity/farm.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmController } from './farm.controller';
import { FarmService } from './farm.service';
import { UserFarmsService } from '@src/user-farms/user-farms.service';
import UserFarmEntity from '@db/entity/user-farm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FarmEntity, UserFarmEntity])],
  controllers: [FarmController],
  providers: [FarmService, UserFarmsService],
  exports: [TypeOrmModule],
})
export class FarmModule {}
