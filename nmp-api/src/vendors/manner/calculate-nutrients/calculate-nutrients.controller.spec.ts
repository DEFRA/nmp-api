import { Test, TestingModule } from '@nestjs/testing';
import { CalculateNutrientsController } from './calculate-nutrients.controller';

describe('CalculateNutrientsController', () => {
  let controller: CalculateNutrientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalculateNutrientsController],
    }).compile();

    controller = module.get<CalculateNutrientsController>(CalculateNutrientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
