import { Module } from '@nestjs/common';
import FarmEntity from '@db/entity/farm.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmController } from './farm.controller';
import { FarmService } from './farm.service';
//import { UserFarmService } from '@src/user-farm/user-farm.service';
//import UserFarmEntity from '@db/entity/user-farm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FarmEntity])],
  controllers: [FarmController],
  providers: [FarmService],
  exports: [TypeOrmModule],
})
export class FarmModule {}
