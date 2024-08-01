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
  userData,
} from '../../test/mocked-data';
import FarmEntity from '@db/entity/farm.entity';
import FieldEntity from '@db/entity/field.entity';
import OrganisationEntity from '@db/entity/organisation.entity';
import UserEntity from '@db/entity/user.entity';

describe('SoilAnalysisController', () => {
  let controller: SoilAnalysisController;
  let entityManager: EntityManager;
  let createdField: any;
  let soilAnalysisRepository: any;
  let farmRepository: any;
  let fieldRepository: any;
  let organisationRepository: any;
  let userRepository: any;
  let user: UserEntity;
  let createdSoilAnalysis: any;

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
    userRepository = entityManager.getRepository(UserEntity);
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
      user = await userRepository.save(userData);
      createFarmReqBody2.OrganisationID = organisation.ID;
      createFarmReqBody2.CreatedByID = user.ID;
      const createdFarm = await farmRepository.save(createFarmReqBody2);
      createFieldReqBody.FarmID = createdFarm.ID;
      createFieldReqBody.CreatedByID = user.ID;
      createdField = await fieldRepository.save(createFieldReqBody);
      createSoilAnalysisReqBody.FieldID = createdField.ID;
      createSoilAnalysisReqBody.CreatedByID = user.ID;
      createdSoilAnalysis = await soilAnalysisRepository.save(
        createSoilAnalysisReqBody,
      );
      const result = await controller.getSoilAnalysisById(
        createdSoilAnalysis.ID,
      );
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

  describe('Create SoilAnalysis', () => {
    it('should create a soil analysis', async () => {
      createSoilAnalysisReqBody.FieldID = createdField.ID;
      createSoilAnalysisReqBody.CreatedByID = user.ID;
      const result = await controller.createSoilAnalysis(
        createSoilAnalysisReqBody,
        {
          userId: user.ID,
        } as any,
      );
      const createdSoilAnalysis = result.SoilAnalysis;
      expect(createdSoilAnalysis).toHaveProperty('ID');
    });
  });

  describe('Update SoilAnalysis', () => {
    it('should update a soilAnalysis successfully', async () => {
      const soilAnalysisId = createdSoilAnalysis.ID;

      const updatedSoilAnalysisData: any = {
        Year: 2024,
      };

      const result = await controller.updateSoilAnalysis(
        updatedSoilAnalysisData,
        soilAnalysisId,
        {
          userId: user.ID,
        } as any,
      );

      expect(result.SoilAnalysis.ModifiedByID).toBeDefined();
      expect(result.SoilAnalysis.ModifiedOn).toBeDefined();
      expect(result.SoilAnalysis.Year).toEqual(2024);
    });

    it('should throw an error if soil-analysis is not found', async () => {
      const soilAnalysisId = 0;
      const updatedSoilAnalysisData: any = {
        Year: 2024,
      };

      try {
        await controller.updateSoilAnalysis(
          updatedSoilAnalysisData,
          soilAnalysisId,
          {
            userId: user.ID,
          } as any,
        );
      } catch (error) {
        expect(error.status).toBe(404);
      }
    });
  });
});
