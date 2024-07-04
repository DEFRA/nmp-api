import { Test, TestingModule } from '@nestjs/testing';
import { ClimateController } from './climate.controller';
import { ClimateService } from './climate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import ClimateDatabaseEntity from '@db/entity/climate-data.entity';
import { EntityManager } from 'typeorm';
import { ormConfig } from '../../test/ormConfig';
import { truncateAllTables } from '../../test/utils';
import { ClimateDatabaseData } from '../../test/mocked-data/climateDatabase';

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
        '01-01-2024',
        '31-12-2024',
      );

      // Calculate expected total rainfall
      const expectedTotalRainfall =
        ClimateDatabaseData.MeanTotalRainFallJan +
        ClimateDatabaseData.MeanTotalRainFallFeb +
        ClimateDatabaseData.MeanTotalRainFallMar +
        ClimateDatabaseData.MeanTotalRainFallApr +
        ClimateDatabaseData.MeanTotalRainFallMay +
        ClimateDatabaseData.MeanTotalRainFallJun +
        ClimateDatabaseData.MeanTotalRainFallJul +
        ClimateDatabaseData.MeanTotalRainFallAug +
        ClimateDatabaseData.MeanTotalRainFallSep +
        ClimateDatabaseData.MeanTotalRainFallOct +
        ClimateDatabaseData.MeanTotalRainFallNov +
        ClimateDatabaseData.MeanTotalRainFallDec;

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
        '01-11-2024',
        '28-02-2025',
      );

      // Calculate expected total rainfall for Nov + Dec 2024 + Jan + Feb 2025
      const expectedTotalRainfall =
        ClimateDatabaseData.MeanTotalRainFallNov +
        ClimateDatabaseData.MeanTotalRainFallDec +
        ClimateDatabaseData.MeanTotalRainFallJan +
        ClimateDatabaseData.MeanTotalRainFallFeb;

      // Assert the result with rounding
      expect(result.totalRainfall).toBeCloseTo(expectedTotalRainfall, 2);
    });

    it('should throw an error if start date is greater than end date within the same year', async () => {
      try {
        await controller.getTotalRainfallByPostcodeAndDate(
          'AL1',
          '31-12-2024',
          '01-01-2024',
        );
      } catch (error) {
        expect(error.status).toBe(404);
      }
    });

    it('should throw an error if start year is greater than end year', async () => {
      try {
        await controller.getTotalRainfallByPostcodeAndDate(
          'AL1',
          '01-01-2025',
          '01-01-2024',
        );
      } catch (error) {
        expect(error.status).toBe(404);
      }
    });
    
  });
});
