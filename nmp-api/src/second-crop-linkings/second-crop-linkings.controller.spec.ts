import { Test, TestingModule } from '@nestjs/testing';
import { SecondCropLinkingsController } from './second-crop-linkings.controller';

describe('SecondCropLinkingsController', () => {
  let controller: SecondCropLinkingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecondCropLinkingsController],
    }).compile();

    controller = module.get<SecondCropLinkingsController>(SecondCropLinkingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
