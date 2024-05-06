import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import CropEntity from '@db/entity/crop.entity';
import { CropService } from '@src/crop/crop.service';
import { CropController } from './crop.controller';
import ManagementPeriodEntity from '@db/entity/management-period.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CropEntity, ManagementPeriodEntity])],
  controllers: [CropController],
  providers: [CropService],
  exports: [TypeOrmModule],
})
export class CropModule {}
