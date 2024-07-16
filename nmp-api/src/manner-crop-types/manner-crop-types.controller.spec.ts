import { Test, TestingModule } from '@nestjs/testing';
import { MannerCropTypesController } from './manner-crop-types.controller';

describe('MannerCropTypesController', () => {
  let controller: MannerCropTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MannerCropTypesController],
    }).compile();

    controller = module.get<MannerCropTypesController>(MannerCropTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
