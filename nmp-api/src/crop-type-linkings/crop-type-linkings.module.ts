import { Module } from '@nestjs/common';
import { CropTypeLinkingsController } from './crop-type-linkings.controller';
import { CropTypeLinkingsService } from './crop-type-linkings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CropTypeLinkingEntity } from '@db/entity/crop-type-linking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CropTypeLinkingEntity])],
  controllers: [CropTypeLinkingsController],
  providers: [CropTypeLinkingsService],
  exports: [TypeOrmModule],
})
export class CropTypeLinkingsModule {}
