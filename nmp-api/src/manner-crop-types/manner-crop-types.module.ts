import { Module } from '@nestjs/common';
import { MannerCropTypesService } from './manner-crop-types.service';
import { MannerCropTypesController } from './manner-crop-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MannerCropTypeEntity } from '@db/entity/manner-crop-type.entity';
import { CropTypeLinkingEntity } from '@db/entity/crop-type-linking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MannerCropTypeEntity, CropTypeLinkingEntity]),
  ],
  providers: [MannerCropTypesService],
  controllers: [MannerCropTypesController],
})
export class MannerCropTypesModule {}
