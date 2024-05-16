import { Test, TestingModule } from '@nestjs/testing';
import { RB209MeasurementController } from './measurement.controller';
import { RB209MeasurementService } from './measurement.service';
import { CacheModule } from '@nestjs/cache-manager';

describe('RB209MeasurementController', () => {
  let controller: RB209MeasurementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [RB209MeasurementController],
      providers: [RB209MeasurementService],
    }).compile();

    controller = module.get<RB209MeasurementController>(
      RB209MeasurementController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Get Crops Heights', () => {
    it('should return a list of crop heights', async () => {
      const request = {
        url: 'vendors/rb209/Measurement/CropHeights',
      } as Request;

      const result = await controller.getCropHeights(request);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toBeTruthy();
    });
  });

  describe('Get Green Area Indexes', () => {
    it('should return a list of green area indexes', async () => {
      const request = {
        url: 'vendors/rb209/Measurement/GreenAreaIndexes',
      } as Request;

      const result = await controller.getGreenAreaIndexes(request);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toBeTruthy();
    });
  });

  describe('Get Shoot Numbers', () => {
    it('should return a list of shoot numbers', async () => {
      const request = {
        url: 'vendors/rb209/Measurement/ShootNumbers',
      } as Request;

      const result = await controller.getShootNumbers(request);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toBeTruthy();
    });
  });

  describe('Get Seasons', () => {
    it('should return a list of seasons', async () => {
      const request = {
        url: 'vendors/rb209/Measurement/Seasons',
      } as Request;

      const result = await controller.getSeasons(request);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toBeTruthy();
    });
  });

  describe('Get SmnConversion Method By SmnValue And Soil Layer', () => {
    it('should return SMN conversion method based on smn value and soil layer', async () => {
      const smnValue = '1';
      const soilLayer = '15';
      const request = {
        url: `vendors/rb209/Measurement/SmnConversionMethod/${smnValue}/${soilLayer}`,
      } as Request;

      const result =
        await controller.getSmnConversionMethodBySmnValueAndSoilLayer(
          smnValue,
          soilLayer,
          request,
        );
      expect(result).toBeTruthy();
    });

    it('should return null when nSMN conversion method based on smn value and soil layer not found', async () => {
      const smnValue = '1';
      const soilLayer = '15';
      const request = {
        url: `vendors/rb209/Measurement/SmnConversionMethod/${smnValue}/${soilLayer}`,
      } as Request;

      const result =
        await controller.getSmnConversionMethodBySmnValueAndSoilLayer(
          smnValue,
          soilLayer,
          request,
        );
      expect(result.item).toBeFalsy();
    });
  });
});
