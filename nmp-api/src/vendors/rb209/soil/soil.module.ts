import { Module } from '@nestjs/common';
import { RB209SoilService } from './soil.service';
import { RB209SoilController } from './soil.controller';

@Module({
  controllers: [RB209SoilController],
  providers: [RB209SoilService],
})
export class RB209SoilModule {}
