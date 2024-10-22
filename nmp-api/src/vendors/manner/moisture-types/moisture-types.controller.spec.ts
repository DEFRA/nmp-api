import { Test, TestingModule } from '@nestjs/testing';
import { MoistureTypesController } from './moisture-types.controller';

describe('MoistureTypesController', () => {
  let controller: MoistureTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoistureTypesController],
    }).compile();

    controller = module.get<MoistureTypesController>(MoistureTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
