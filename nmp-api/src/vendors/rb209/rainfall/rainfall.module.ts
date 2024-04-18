import { Module } from '@nestjs/common';
import { RB209RainfallService } from './rainfall.service';
import { RB209RainfallController } from './rainfall.controller';

@Module({
  controllers: [RB209RainfallController],
  providers: [RB209RainfallService],
})
export class RB209RainfallModule {}
