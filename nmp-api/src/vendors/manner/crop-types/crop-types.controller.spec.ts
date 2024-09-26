import { Test, TestingModule } from '@nestjs/testing';
import { CropTypesController } from './crop-types.controller';

describe('CropTypesController', () => {
  let controller: CropTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CropTypesController],
    }).compile();

    controller = module.get<CropTypesController>(CropTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
