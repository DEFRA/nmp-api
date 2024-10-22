import { Module } from '@nestjs/common';
import { MannerManureTypesController } from './manure-types.controller';
import { MannerManureTypesService } from './manure-types.service';

@Module({
  controllers: [MannerManureTypesController],
  providers: [MannerManureTypesService]
})
export class MannerManureTypesModule {}
