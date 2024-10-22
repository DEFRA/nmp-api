import { Module } from '@nestjs/common';
import { MannerApiCropTypesController } from './crop-types.controller';
import { MannerApiCropTypesService } from './crop-types.service';


@Module({
  controllers: [MannerApiCropTypesController],
  providers: [MannerApiCropTypesService],
})
export class MannerApiCropTypesModule {}
