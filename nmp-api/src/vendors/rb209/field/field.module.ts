import { Module } from '@nestjs/common';
import { RB209FieldService } from './field.service';
import { RB209FieldController } from './field.controller';

@Module({
  controllers: [RB209FieldController],
  providers: [RB209FieldService],
})
export class RB209FieldModule {}
