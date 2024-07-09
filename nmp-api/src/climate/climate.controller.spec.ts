import { Test, TestingModule } from '@nestjs/testing';
import { ClimateController } from './climate.controller';
import { ClimateService } from './climate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import ClimateDatabaseEntity from '@db/entity/climate-data.entity';
import { EntityManager } from 'typeorm';
import { ormConfig } from '../../test/ormConfig';
import { truncateAllTables } from '../../test/utils';
import { ClimateDatabaseData } from '../../test/mocked-data/climateDatabase';
import { BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';

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

      // Verify the result
      expect(result.totalRainfall).toBeCloseTo(Math.round(expectedTotalRainfall));
    });
    
  it('should throw NotFoundException for an invalid postcode', async () => {
    await expect(
      controller.getTotalRainfallByPostcodeAndDate(
        'INVALID',
        '2024-01-01T00:00:00.000Z',
        '2024-12-31T23:59:59.999Z',
      ),
    ).rejects.toThrow(NotFoundException);
  });
  
  
  it('should throw BadRequestException for invalid startDate format', async () => {
    await expect(
      controller.getTotalRainfallByPostcodeAndDate(
        'AL1',
        'invalid-date',
        '2024-12-31T23:59:59.999Z',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for invalid endDate format', async () => {
    await expect(
      controller.getTotalRainfallByPostcodeAndDate(
        'AL1',
        '2024-01-01T00:00:00.000Z',
        'invalid-date',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when startDate is greater than endDate', async () => {
    await expect(
      controller.getTotalRainfallByPostcodeAndDate(
        'AL1',
        '2024-12-31T23:59:59.999Z',
        '2024-01-01T00:00:00.000Z',
      ),
    ).rejects.toThrow(NotFoundException);
  });

  });

  describe('getRainfallAverageByPostcode', () => {
    it('should return rainfall average for given postcode', async () => {
      // Insert a sample climate data using mocked data
      const sampleClimateData = climateRepository.create(ClimateDatabaseData);
      await climateRepository.save(sampleClimateData);

      // Call the controller method
      const result = await controller.getRainfallAverageByPostcode('AL1');

      // Calculate expected average rainfall
      const rainfallMeanSum =
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
      const expectedRainfallAverage = Math.round(rainfallMeanSum);

      // Verify the result
      expect(result.rainfallAverage).toBe(expectedRainfallAverage);
    });
  });
  describe('getAllDataByPostcode', () => {
    it('should return all climate data for given postcode', async () => {
      // Insert a sample climate data using mocked data
      const sampleClimateData = climateRepository.create(ClimateDatabaseData);
      await climateRepository.save(sampleClimateData);

      // Call the controller method
      const result = await controller.getAllDataByPostcode('AL1');

      // Verify the result
      expect(result.records).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ PostCode: 'AL1' }),
        ]),
      );
    });

    it('should reject for an invalid postcode', async () => {
      await expect(
        controller.getAllDataByPostcode('INVALID'),
      ).rejects
    });
  });

});
