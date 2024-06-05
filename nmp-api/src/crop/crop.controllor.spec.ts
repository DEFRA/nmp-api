import { Test, TestingModule } from '@nestjs/testing';

import { HttpStatus } from '@nestjs/common';
import { CropController } from './crop.controller';
import { CropService } from './crop.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import { RecommendationEntity } from '@db/entity/recommendation.entity';
import CropEntity from '@db/entity/crop.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import FieldEntity from '@db/entity/field.entity';
import FarmEntity from '@db/entity/farm.entity';
import { RecommendationCommentEntity } from '@db/entity/recommendation-comment.entity';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { FarmService } from '@src/farm/farm.service';
import { ManagementPeriodService } from '@src/management-period/management-period.service';
import { SoilAnalysisService } from '@src/soil-analysis/soil-analysis.service';
import { RB209ArableService } from '@src/vendors/rb209/arable/arable.service';
import { RB209RecommendationService } from '@src/vendors/rb209/recommendation/recommendation.service';
import { PlanService } from '@src/plan/plan.service';
import { CacheModule } from '@nestjs/cache-manager';
import {
  createCropWithManagementPeriodReqBody,
  createFarmReqBody2,
  createFieldReqBody,
  createOrganisationReqBody3,
  createPlanReqBody,
  createSoilAnalysisReqBody2,
} from '../../test/mocked-data';
import { EntityManager } from 'typeorm';
import OrganisationEntity from '@db/entity/organisation.entity';
import { truncateAllTables } from '../../test/utils';

describe('CropController', () => {
  let controller: CropController;
  let entityManager: EntityManager;
  let farmRepository: any;
  let fieldRepository: any;
  let createdField: any;
  let createdFarm: any;
  let organisationRepository: any;
  let soilAnalysisRepository: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([
          RecommendationEntity,
          CropEntity,
          ManagementPeriodEntity,
          FieldEntity,
          FarmEntity,
          SoilAnalysisEntity,
          RecommendationCommentEntity,
        ]),
        CacheModule.register(),
        // RB209ArableModule,
        //RB209FieldModule,
        // RB209RecommendationModule,
      ],
      controllers: [CropController],
      providers: [
        PlanService,
        CropService,
        ManagementPeriodService,
        FarmService,
        SoilAnalysisService,
        RB209ArableService,
        RB209RecommendationService,
      ],
      exports: [TypeOrmModule],
    }).compile();

    controller = module.get<CropController>(CropController);
    entityManager = module.get<EntityManager>(EntityManager);
    farmRepository = entityManager.getRepository(FarmEntity);
    fieldRepository = entityManager.getRepository(FieldEntity);
    organisationRepository = entityManager.getRepository(OrganisationEntity);
    soilAnalysisRepository = entityManager.getRepository(SoilAnalysisEntity);
    await truncateAllTables(entityManager);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create Nutrients Recommendation For Field By FieldId', () => {
    it('should create crop plan', async () => {
      await truncateAllTables(entityManager);
      const organisation = await organisationRepository.save(
        createOrganisationReqBody3,
      );
      createFarmReqBody2.OrganisationID = organisation.ID;
      createdFarm = await farmRepository.save(createFarmReqBody2);
      createFieldReqBody.FarmID = createdFarm.ID;
      createdField = await fieldRepository.save(createFieldReqBody);
      createPlanReqBody.Crops[0].Crop.FieldID = createdField.ID;
      createSoilAnalysisReqBody2.FieldID = createdField.ID;
      await soilAnalysisRepository.save(createSoilAnalysisReqBody2);
      const result =
        await controller.createNutrientsRecommendationForFieldByFieldId(
          createPlanReqBody,
          {
            userId: 1,
          } as any,
        );
      expect(result.Recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Create Crop', () => {
    it('should create a crop with management periods', async () => {
      const result = await controller.createCrop(
        createdField.ID,
        createCropWithManagementPeriodReqBody,
        {
          userId: 1,
        } as any,
      );
      expect(result.Crop).toHaveProperty('ID');
      expect(result.ManagementPeriods.length).toBeGreaterThan(0);
    });
  });

  describe('Get Crops By FieldId', () => {
    it('should return crops by field ID', async () => {
      const result = await controller.getCropsByFieldId(createdField.ID);
      expect(result.Crops.records).toBeDefined();
    });
  });

  describe('Get Crops Plans By FarmId', () => {
    it('should return crop plans by farm ID', async () => {
      const type = 1;
      const result = await controller.getCropsPlansByFarmId(
        createdFarm.ID,
        type,
      );
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Get Crops Plans By HarvestYear', () => {
    it('should return crop plans by harvest year', async () => {
      const harvestYear = 2024;
      const result = await controller.getCropsPlansByHarvestYear(
        harvestYear,
        createdFarm.ID,
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should throw BadRequest if harvestYear or farmId is missing', async () => {
      const harvestYear = null;
      const farmId = null;

      try {
        await controller.getCropsPlansByHarvestYear(harvestYear, farmId);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
