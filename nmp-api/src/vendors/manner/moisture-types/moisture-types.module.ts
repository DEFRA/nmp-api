import { Module } from '@nestjs/common';
import { MannerMoistureTypesService } from './moisture-types.service';
import { MannerMoistureTypesController } from './moisture-types.controller';

@Module({
  providers: [MannerMoistureTypesService],
  controllers: [MannerMoistureTypesController]
})
export class MannerMoistureTypesModule {}
