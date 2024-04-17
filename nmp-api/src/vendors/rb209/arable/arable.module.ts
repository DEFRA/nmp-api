import { Module } from '@nestjs/common';
import { RB209ArableService } from './arable.service';
import { RB209ArableController } from './arable.controller';

@Module({
  controllers: [RB209ArableController],
  providers: [RB209ArableService],
})
export class RB209ArableModule {}
