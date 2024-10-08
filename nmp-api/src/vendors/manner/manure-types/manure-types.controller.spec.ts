import { Test, TestingModule } from '@nestjs/testing';
import { ManureTypesController } from './manure-types.controller';

describe('ManureTypesController', () => {
  let controller: ManureTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManureTypesController],
    }).compile();

    controller = module.get<ManureTypesController>(ManureTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
