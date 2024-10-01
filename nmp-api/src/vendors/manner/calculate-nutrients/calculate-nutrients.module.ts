import { Module } from '@nestjs/common';
import { MannerCalculateNutrientsService } from './calculate-nutrients.service';
import { MannerCalculateNutrientsController } from './calculate-nutrients.controller';

@Module({
  providers: [MannerCalculateNutrientsService],
  controllers: [MannerCalculateNutrientsController]
})
export class MannerCalculateNutrientsModule {}
