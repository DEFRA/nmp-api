import { Test, TestingModule } from '@nestjs/testing';
import { ClimateController } from './climate.controller';
import { ClimateService } from './climate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import ClimateDatabaseEntity from '@db/entity/climate-data.entity';
import { EntityManager } from 'typeorm';
import { ormConfig } from '../../test/ormConfig';
import { truncateAllTables } from '../../test/utils';
import { ClimateDatabaseData } from '../../test/mocked-data/ClimateDatabase';

describe('ClimateController', () => {
  let controller: ClimateController;
  let service: ClimateService;
  let entityManager: EntityManager;
  let climateRepository: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([ClimateDatabaseEntity]),
      ],
      controllers: [ClimateController],
      providers: [ClimateService],
    }).compile();

    controller = module.get<ClimateController>(ClimateController);
    service = module.get<ClimateService>(ClimateService);
    entityManager = module.get<EntityManager>(EntityManager);
    climateRepository = entityManager.getRepository(ClimateDatabaseEntity);
    await truncateAllTables(entityManager);
  });

  afterEach(async () => {
    await truncateAllTables(entityManager);
  });

  describe('getTotalRainfallByPostcodeAndDate', () => {
    it('should return total rainfall for given postcode and date range', async () => {
      // Insert a sample climate data using mocked data
      const sampleClimateData = climateRepository.create(ClimateDatabaseData);
      await climateRepository.save(sampleClimateData);

      // Call the controller method
      const result = await controller.getTotalRainfallByPostcodeAndDate(
        'AL1',
        '2024-01-01',
        '2024-12-31',
      );

      // Calculate expected total rainfall
      const expectedTotalRainfall = Object.keys(ClimateDatabaseData)
        .filter((key) => key.startsWith('MeanTotalRainFall'))
        .reduce((sum, key) => sum + ClimateDatabaseData[key], 0);

      // Assert the result with rounding
      expect(result.totalRainfall).toBeCloseTo(expectedTotalRainfall, 2);
    });

    it('should return total rainfall for date range spanning over two years', async () => {
      // Insert a sample climate data using mocked data
      const sampleClimateData = climateRepository.create(ClimateDatabaseData);
      await climateRepository.save(sampleClimateData);

      // Call the controller method
      const result = await controller.getTotalRainfallByPostcodeAndDate(
        'AL1',
        '2024-11-01',
        '2025-02-28',
      );

      // Calculate expected total rainfall for Nov + Dec + Jan + Feb
      const expectedTotalRainfall =
        ClimateDatabaseData.MeanTotalRainFallNov +
        ClimateDatabaseData.MeanTotalRainFallDec +
        ClimateDatabaseData.MeanTotalRainFallJan +
        ClimateDatabaseData.MeanTotalRainFallFeb;

      // Assert the result with rounding
      expect(result.totalRainfall).toBeCloseTo(expectedTotalRainfall, 2);
    });

    it('should return an error if the postcode is not found', async () => {
      try {
        await controller.getTotalRainfallByPostcodeAndDate(
          'INVALID_POSTCODE',
          '2024-01-01',
          '2024-12-31',
        );
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe('Postcode not found');
      }
    });
  });
});
