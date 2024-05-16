import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

import { RB209AdviceNoteService } from './adviceNote.service';
import { RB209AdviceNoteController } from './adviceNote.controller';
import { CacheModule } from '@nestjs/cache-manager';

describe('RB209AdviceNoteController', () => {
  let controller: RB209AdviceNoteController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [RB209AdviceNoteController],
      providers: [RB209AdviceNoteService],
    }).compile();

    controller = app.get<RB209AdviceNoteController>(RB209AdviceNoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Get the full list of available Advice Notes', () => {
    it('should return the full list of available Advice Notes', async () => {
      const request = {
        url: '/vendors/rb209/AdviceNote/AdviceNotes',
      } as Request;
      const result = await controller.getAdviceNotes(request);

      expect(result.length).toBeGreaterThan(0);
      expect(result).toBeTruthy();
    });
  });

  describe('Get Advice Notes by adviceNoteCode', () => {
    it('should return the Advice Notes by adviceNoteCode', async () => {
      const adviceNoteCode = 'new15';
      const request = {
        url: `/vendors/rb209/AdviceNote/AdviceNote/${adviceNoteCode}`,
      } as Request;
      const result = await controller.getAdviceNotesByAdviceNoteCode(
        adviceNoteCode,
        request,
      );
      expect(result).toBeTruthy();
    });
    it('should return null whenn Advice Notes by adviceNoteCode not found', async () => {
      const adviceNoteCode = '1234';
      const request = {
        url: `/vendors/rb209/AdviceNote/AdviceNote/${adviceNoteCode}`,
      } as Request;
      const result = await controller.getAdviceNotesByAdviceNoteCode(
        adviceNoteCode,
        request,
      );
      expect(result.item).toBeFalsy();
    });
  });
});
