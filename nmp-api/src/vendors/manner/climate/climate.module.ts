import { Module } from '@nestjs/common';
import { MannerClimateController } from './climate.controller';
import { MannerClimateService } from './climate.service';

@Module({
  controllers: [MannerClimateController],
  providers: [MannerClimateService],
})
export class MannerClimateModule {}
