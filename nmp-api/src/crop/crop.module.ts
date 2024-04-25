import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import CropEntity from '@db/entity/crop.entity';
import { CropService } from '@src/crop/crop.service';
import { CropController } from './crop.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CropEntity])],
  controllers: [CropController],
  providers: [CropService],
  exports: [TypeOrmModule],
})
export class CropModule {}
