import { Module } from '@nestjs/common';
import { MannerTopSoilController } from './top-soil.controller';
import { MannerTopSoilService } from './top-soil.service';

@Module({
  controllers: [MannerTopSoilController],
  providers: [MannerTopSoilService],
})
export class MannerTopSoilModule {}
