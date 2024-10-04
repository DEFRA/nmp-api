import { Test, TestingModule } from '@nestjs/testing';
import { AutumnCropNitorgenUptakeController } from './autumn-crop-nitorgen-uptake.controller';

describe('AutumnCropNitorgenUptakeController', () => {
  let controller: AutumnCropNitorgenUptakeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutumnCropNitorgenUptakeController],
    }).compile();

    controller = module.get<AutumnCropNitorgenUptakeController>(AutumnCropNitorgenUptakeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
