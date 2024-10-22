import { Test, TestingModule } from '@nestjs/testing';
import { ClimateController } from './climate.controller';

describe('ClimateController', () => {
  let controller: ClimateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClimateController],
    }).compile();

    controller = module.get<ClimateController>(ClimateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
