import { Test, TestingModule } from '@nestjs/testing';
import { RB209RainfallController } from './rainfall.controller';
import { RB209RainfallService } from './rainfall.service';
import { CacheModule } from '@nestjs/cache-manager';

describe('RB209RainfallController', () => {
  let controller: RB209RainfallController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [RB209RainfallController],
      providers: [RB209RainfallService],
    }).compile();

    controller = module.get<RB209RainfallController>(RB209RainfallController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Average Rainfall of field', () => {
    it('should return average rainfall data', async () => {
      const postcode = 'AB12';
      const request = {
        url: `/vendors/rb209/RainFall/RainfallAverage/${postcode}`,
      } as Request;

      const result = await controller.getAverageRainfallByPostcode(
        postcode,
        request,
      );

      expect(result).toBeTruthy();
    });

    it('should return null if average rainfall data does not exists', async () => {
      const postcode = 'CB12';
      const request = {
        url: `/vendors/rb209/RainFall/RainfallAverage/${postcode}`,
      } as Request;

      const result = await controller.getAverageRainfallByPostcode(
        postcode,
        request,
      );

      expect(result.item).toBeFalsy();
    });
  });
});
