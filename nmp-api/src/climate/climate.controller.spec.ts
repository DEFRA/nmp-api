// src/climate/climate.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ClimateController } from './climate.controller';
import { ClimateService } from './climate.service';

describe('ClimateController', () => {
  let controller: ClimateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClimateController],
      providers: [
        {
          provide: ClimateService,
          useValue: {
            getRainfallAverageByPostcode: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ClimateController>(ClimateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRainfallAverageByPostcode', () => {
    it('should return rainfall average for a valid postcode', async () => {
      const mockPostcode = '12345';
      const mockRainfallAverage = { rainfallAverage: 100 };

      jest
        .spyOn(controller, 'getRainfallAverageByPostcode')
        .mockResolvedValue(mockRainfallAverage);

      const result =
        await controller.getRainfallAverageByPostcode(mockPostcode);
      expect(result).toEqual(mockRainfallAverage);
    });

    it('should throw an error for invalid postcode', async () => {
      const mockPostcode = '54321';

      jest
        .spyOn(controller, 'getRainfallAverageByPostcode')
        .mockRejectedValue(new Error('Climate data not found'));

      await expect(
        controller.getRainfallAverageByPostcode(mockPostcode),
      ).rejects.toThrowError('Climate data not found');
    });
  });
});
