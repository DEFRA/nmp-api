import { Test, TestingModule } from '@nestjs/testing';
import { RainfallPostApplicationController } from './rainfall-post-application.controller';

describe('RainfallPostApplicationController', () => {
  let controller: RainfallPostApplicationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RainfallPostApplicationController],
    }).compile();

    controller = module.get<RainfallPostApplicationController>(RainfallPostApplicationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
