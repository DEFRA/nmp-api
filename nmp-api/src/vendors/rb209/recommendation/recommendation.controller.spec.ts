import { Test, TestingModule } from '@nestjs/testing';

import { RB209RecommendationController } from './recommendation.controller';
import { RB209RecommendationService } from './recommendation.service';
import { CacheModule } from '@nestjs/cache-manager';

describe('RB209RecommendationController', () => {
  let controller: RB209RecommendationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [RB209RecommendationController],
      providers: [RB209RecommendationService],
    }).compile();

    controller = module.get<RB209RecommendationController>(
      RB209RecommendationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('calculate Nutrient Deficiency', () => {
    it('should return null if nutrient deficiency result not exists', async () => {
      const params = {
        cropTypeId: '1',
        leafSamplingPosition: '1',
        nutrientId: '2',
        nutrientContent: '10',
      };
      const request = {
        url: `vendors/rb209/Recommendation/CalculateNutrientDeficiency/${params.cropTypeId}/${params.leafSamplingPosition}/${params.nutrientId}/${params.nutrientContent}`,
      } as Request;

      const result = await controller.calculateNutrientDeficiency(
        params.cropTypeId,
        params.leafSamplingPosition,
        params.nutrientId,
        params.nutrientContent,
        request,
      );
      expect(result.value).toBeFalsy();
    });
  });
});
