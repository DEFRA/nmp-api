import { Test, TestingModule } from '@nestjs/testing';
import { ClimateController } from './climate.controller';
import { ClimateService } from './climate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import { EntityManager } from 'typeorm';
import { ClimateDatabaseData } from '../../test/mocked-data';
import { truncateAllTables } from '../../test/utils';
import ClimateDatabaseEntity from '@db/entity/climate-data.entity';

describe('ClimateController', () => {
  let controller: ClimateController;
  let entityManager: EntityManager;
  let climateDatabaseRepository: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([ClimateDatabaseEntity]),
      ],
      controllers: [ClimateController],
      providers: [ClimateService],
    }).compile();

    entityManager = module.get<EntityManager>(EntityManager);
    controller = module.get<ClimateController>(ClimateController);
    climateDatabaseRepository = entityManager.getRepository(
      ClimateDatabaseEntity,
    );
    await truncateAllTables(entityManager);
  });

  describe('Get Rainfall Average By Postcode', () => {
    it('should return rainfall average by postcode', async () => {
      await climateDatabaseRepository.save(ClimateDatabaseData);
      const postcode = 'AL1';

      const result = await controller.getRainfallAverageByPostcode(postcode);
      expect(result.rainfallAverage).toBeTruthy();
    });
  });
});
