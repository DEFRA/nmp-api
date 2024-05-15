import { Test, TestingModule } from '@nestjs/testing';
import { RB209PreviousCroppingController } from './previousCropping.controller';
import { RB209PreviousCroppingService } from './previousCropping.service';
import { CacheModule } from '@nestjs/cache-manager';

describe('RB209PreviousCroppingController', () => {
  let controller: RB209PreviousCroppingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [RB209PreviousCroppingController],
      providers: [RB209PreviousCroppingService],
    }).compile();

    controller = module.get<RB209PreviousCroppingController>(
      RB209PreviousCroppingController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Get Previous Grasses', () => {
    it('should return a list of previous grasses', async () => {
      const request = {
        url: 'vendors/rb209/PreviousCropping/PreviousGrasses',
      } as Request;

      const result = await controller.getPreviousGrasses(request);
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Get Previous Grass By Previous GrassId', () => {
    it('should return a specific previous grass by ID', async () => {
      const previousGrassId = '35';
      const request = {
        url: `vendors/rb209/PreviousCropping/PreviousGrass/${previousGrassId}`,
      } as Request;

      const result = await controller.getPreviousGrassByPreviousGrassId(
        previousGrassId,
        request,
      );

      expect(result).toBeTruthy();
    });

    it('should return null if previous grass by ID not found', async () => {
      const previousGrassId = '100';
      const request = {
        url: `vendors/rb209/PreviousCropping/PreviousGrass/${previousGrassId}`,
      } as Request;

      const result = await controller.getPreviousGrassByPreviousGrassId(
        previousGrassId,
        request,
      );

      expect(result.previousGrassItem).toBeFalsy();
    });
  });
});
