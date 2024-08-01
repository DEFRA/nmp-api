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
  applicationMethodData,
  countryData,
  createCropWithManagementPeriodReqBody,
  createFarmReqBody,
  createFieldReqBody,
  createOrganisationReqBody3,
  createPlanReqBody,
  createSoilAnalysisReqBody2,
  incorporationDelayData,
  incorporationMethodData,
  manureTypeData,
  organicManureReqBody2,
  userData,
} from '../../test/mocked-data';
import { EntityManager } from 'typeorm';
import OrganisationEntity from '@db/entity/organisation.entity';
import { truncateAllTables } from '../../test/utils';
import UserEntity from '@db/entity/user.entity';
import { OrganicManureEntity } from '@db/entity/organic-manure.entity';
import { ManureTypeEntity } from '@db/entity/manure-type.entity';
import { ApplicationMethodEntity } from '@db/entity/application-method.entity';
import { IncorporationMethodEntity } from '@db/entity/incorporation-method.entity';
import { IncorporationDelayEntity } from '@db/entity/incorporation-delay.entity';
import { CountryEntity } from '@db/entity/country.entity';
import { ManureGroupEntity } from '@db/entity/manure-group.entity';

describe('CropController', () => {
  let controller: CropController;
  let entityManager: EntityManager;
  let farmRepository: any;
  let fieldRepository: any;
  let createdField: any;
  let createdFarm: any;
  let organisationRepository: any;
  let soilAnalysisRepository: any;
  let userRepository: any;
  let user: UserEntity;
  let managementPeriodRepository: any;
  let organicManureRepository: any;
  let manureTypeRepository: any;
  let applicationMethodRepository: any;
  let incorporationMethodRepository: any;
  let incorporationDelayRepository: any;
  let countryRepository: any;
  let manureGroupRepository: any;

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
    userRepository = entityManager.getRepository(UserEntity);
    managementPeriodRepository = entityManager.getRepository(
      ManagementPeriodEntity,
    );
    userRepository = entityManager.getRepository(UserEntity);
    organicManureRepository = entityManager.getRepository(OrganicManureEntity);
    manureTypeRepository = entityManager.getRepository(ManureTypeEntity);
    applicationMethodRepository = entityManager.getRepository(
      ApplicationMethodEntity,
    );
    incorporationMethodRepository = entityManager.getRepository(
      IncorporationMethodEntity,
    );
    incorporationDelayRepository = entityManager.getRepository(
      IncorporationDelayEntity,
    );
    countryRepository = entityManager.getRepository(CountryEntity);
    manureGroupRepository = entityManager.getRepository(ManureGroupEntity);
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
      user = await userRepository.save(userData);
      createFarmReqBody.OrganisationID = organisation.ID;
      createFarmReqBody.CreatedByID = user.ID;
      createdFarm = await farmRepository.save(createFarmReqBody);
      createFieldReqBody.FarmID = createdFarm.ID;
      createFieldReqBody.CreatedByID = user.ID;
      createdField = await fieldRepository.save(createFieldReqBody);
      createPlanReqBody.Crops[0].Crop.FieldID = createdField.ID;
      createSoilAnalysisReqBody2.FieldID = createdField.ID;
      await soilAnalysisRepository.save(createSoilAnalysisReqBody2);
      const result =
        await controller.createNutrientsRecommendationForFieldByFieldId(
          createPlanReqBody,
          {
            userId: user.ID,
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
          userId: user.ID,
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
      const country = await countryRepository.save(countryData);
      const manureGroup = await manureGroupRepository.save({
        Name: 'Livestock manure',
      });
      manureTypeData.CountryID = country.ID;
      manureTypeData.ManureGroupID = manureGroup.ID;
      const manureType = await manureTypeRepository.save(manureTypeData);
      const applicationMethod = await applicationMethodRepository.save(
        applicationMethodData,
      );
      const incorporationMethod = await incorporationMethodRepository.save(
        incorporationMethodData,
      );
      const incorporationDelay = await incorporationDelayRepository.save(
        incorporationDelayData,
      );
      const managementPeriods = await managementPeriodRepository.find();
      organicManureReqBody2.ManagementPeriodID = managementPeriods[0].ID;
      organicManureReqBody2.ManureTypeID = manureType.ID;
      organicManureReqBody2.ApplicationMethodID = applicationMethod.ID;
      organicManureReqBody2.IncorporationMethodID = incorporationMethod.ID;
      organicManureReqBody2.IncorporationDelayID = incorporationDelay.ID;
      await organicManureRepository.save(organicManureReqBody2);
      const harvestYear = 2024;
      const result = await controller.getCropsPlansByHarvestYear(
        harvestYear,
        createdFarm.ID,
      );
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].TotalOrganicManures).toBe(1);
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

  describe('Get Crops Plans Fields By Harvest Year And CropTypeId', () => {
    it('should return crops plans field by harvest year and cropTypeID', async () => {
      const harvestYear = 2024;
      const cropTypeId = 110;
      const farmId = createdFarm.ID;

      const result =
        await controller.getCropsPlansFieldsByHarvestYearAndCropTypeId(
          harvestYear,
          cropTypeId,
          farmId,
        );
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('ID');
      expect(result[0]).toHaveProperty('Name');
    });

    it('should throw bad req error error if required parameters are missing', async () => {
      const harvestYear = null;
      const cropTypeId = null;
      const farmId = null;

      try {
        await controller.getCropsPlansFieldsByHarvestYearAndCropTypeId(
          harvestYear,
          cropTypeId,
          farmId,
        );
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('Get Crops Plans CropTypes By HarvestYear', () => {
    it('should return crops plans CropTypes by harvest year', async () => {
      const harvestYear = 2024;
      const farmId = createdFarm.ID;

      const result = await controller.getCropsPlansCropTypesByHarvestYear(
        harvestYear,
        farmId,
      );
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('CropTypeID');
      expect(result[0]).toHaveProperty('CropTypeName');
    });

    it('should throw bad request error if required parameters are missing', async () => {
      const harvestYear = null;
      const farmId = null;

      try {
        await controller.getCropsPlansCropTypesByHarvestYear(
          harvestYear,
          farmId,
        );
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('Get Crops Plans Management PeriodIds By HarvestYear', () => {
    it('should return management periods ids when valid parameters fieldIds, harvestYear and cropTypeId are provided', async () => {
      const fieldIds = createdField.ID;
      const harvestYear = 2024;
      const cropTypeId = 110;

      const result =
        await controller.getCropsPlansManagementPeriodIdsByHarvestYear(
          harvestYear,
          cropTypeId,
          fieldIds,
        );
      expect(result.ManagementPeriods.length).toBeGreaterThan(0);
      expect(result.ManagementPeriods[0]).toHaveProperty('ID');
    });

    it('should throw BadRequest exception when harvestYear or fieldIds is missing', async () => {
      const harvestYear = null;
      const fieldIds = '14';
      const cropTypeId = null;

      try {
        await controller.getCropsPlansManagementPeriodIdsByHarvestYear(
          harvestYear,
          cropTypeId,
          fieldIds,
        );
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
