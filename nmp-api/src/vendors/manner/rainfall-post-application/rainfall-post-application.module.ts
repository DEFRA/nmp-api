import { Module } from '@nestjs/common';
import { MannerRainfallPostApplicationService } from './rainfall-post-application.service';
import { RainfallPostApplicationController } from './rainfall-post-application.controller';

@Module({
  providers: [MannerRainfallPostApplicationService],
  controllers: [RainfallPostApplicationController]
})
export class MannerRainfallPostApplicationModule {}
