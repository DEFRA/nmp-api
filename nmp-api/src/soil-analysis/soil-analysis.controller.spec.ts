import { Test, TestingModule } from '@nestjs/testing';
import { SoilAnalysisController } from './soil-analysis.controller';
import { SoilAnalysisService } from './soil-analysis.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { truncateAllTables } from '../../test/utils';
import { EntityManager } from 'typeorm';
import {
  createSoilAnalysisReqBody,
  createFarmReqBody2,
  createFieldReqBody,
  createOrganisationReqBody,
} from '../../test/mocked-data';
import FarmEntity from '@db/entity/farm.entity';
import FieldEntity from '@db/entity/field.entity';
import OrganisationEntity from '@db/entity/organisation.entity';

describe('SoilAnalysisController', () => {
  let controller: SoilAnalysisController;
  let entityManager: EntityManager;
  let createdField: any;
  let soilAnalysisRepository: any;
  let farmRepository: any;
  let fieldRepository: any;
  let organisationRepository: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([SoilAnalysisEntity]),
      ],
      controllers: [SoilAnalysisController],
      providers: [SoilAnalysisService],
    }).compile();

    controller = module.get<SoilAnalysisController>(SoilAnalysisController);
    entityManager = module.get<EntityManager>(EntityManager);
    soilAnalysisRepository = entityManager.getRepository(SoilAnalysisEntity);
    farmRepository = entityManager.getRepository(FarmEntity);
    fieldRepository = entityManager.getRepository(FieldEntity);
    organisationRepository = entityManager.getRepository(OrganisationEntity);
    await truncateAllTables(entityManager);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Get SoilAnalysis By Id', () => {
    it('should return Soil Analysis by Id', async () => {
      await truncateAllTables(entityManager);
      const organisation = await organisationRepository.save(
        createOrganisationReqBody,
      );
      createFarmReqBody2.OrganisationID = organisation.ID;
      const createdFarm = await farmRepository.save(createFarmReqBody2);
      createFieldReqBody.FarmID = createdFarm.ID;
      createdField = await fieldRepository.save(createFieldReqBody);
      createSoilAnalysisReqBody.FieldID = createdField.ID;
      const soilAnalysisData = await soilAnalysisRepository.save(
        createSoilAnalysisReqBody,
      );
      const result = await controller.getSoilAnalysisById(soilAnalysisData.ID);
      expect(result.SoilAnalysis).toHaveProperty('ID');
    });
  });

  describe('Get SoilAnalyses By FieldId', () => {
    it('should return soil analyses by field ID with short summary as false', async () => {
      const result = await controller.getSoilAnalysesByFieldId(
        createdField.ID,
        false,
      );

      expect(result.SoilAnalyses.records).toBeTruthy();
    });

    it('should return soil analyses by field ID with short summary as true', async () => {
      const result = await controller.getSoilAnalysesByFieldId(
        createdField.ID,
        true,
      );
      expect(result.SoilAnalyses.records[0]).toHaveProperty('ID');
      expect(result.SoilAnalyses.records[0]).toHaveProperty('FieldID');
      expect(result.SoilAnalyses.records[0]).toHaveProperty('Date');
    });
  });
});
