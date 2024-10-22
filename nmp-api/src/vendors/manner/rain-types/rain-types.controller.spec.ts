import { Test, TestingModule } from '@nestjs/testing';
import { RainTypesController } from './rain-types.controller';

describe('RainTypesController', () => {
  let controller: RainTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RainTypesController],
    }).compile();

    controller = module.get<RainTypesController>(RainTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
