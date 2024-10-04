import { Module } from '@nestjs/common';
import { MannerRainTypesService } from './rain-types.service';
import { MannerRainTypesController } from './rain-types.controller';

@Module({
  providers: [MannerRainTypesService],
  controllers: [MannerRainTypesController],
})
export class MannerRainTypesModule {}
