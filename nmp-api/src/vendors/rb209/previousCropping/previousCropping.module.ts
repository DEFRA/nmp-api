import { Module } from '@nestjs/common';
import { RB209PreviousCroppingService } from './previousCropping.service';
import { RB209PreviousCroppingController } from './previousCropping.controller';

@Module({
  controllers: [RB209PreviousCroppingController],
  providers: [RB209PreviousCroppingService],
})
export class RB209PreviousCroppingModule {}
