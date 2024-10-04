import { Test, TestingModule } from '@nestjs/testing';
import { TopSoilController } from './top-soil.controller';

describe('TopSoilController', () => {
  let controller: TopSoilController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopSoilController],
    }).compile();

    controller = module.get<TopSoilController>(TopSoilController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
