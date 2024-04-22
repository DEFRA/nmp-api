import { Module } from '@nestjs/common';
import { RB209GrasslandService } from './grassland.service';
import { RB209GrasslandController } from './grassland.controller';

@Module({
  controllers: [RB209GrasslandController],
  providers: [RB209GrasslandService],
})
export class RB209GrasslandModule {}
