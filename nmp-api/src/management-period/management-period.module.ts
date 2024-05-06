import ManagementPeriodEntity from '@db/entity/management-period.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagementPeriodController } from './management-period.controller';
import { ManagementPeriodService } from './management-period.service';

@Module({
  imports: [TypeOrmModule.forFeature([ManagementPeriodEntity])],
  controllers: [ManagementPeriodController],
  providers: [ManagementPeriodService],
  exports: [TypeOrmModule],
})
export class ManagementPeriodModule {}
