import { Module } from '@nestjs/common';
import { RB209AdviceNoteService } from './adviceNote.service';
import { RB209AdviceNoteController } from './adviceNote.controller';

@Module({
  controllers: [RB209AdviceNoteController],
  providers: [RB209AdviceNoteService],
})
export class RB209AdviceNoteModule {}
