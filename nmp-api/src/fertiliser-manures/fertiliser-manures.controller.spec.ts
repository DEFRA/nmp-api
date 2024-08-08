import { Test, TestingModule } from '@nestjs/testing';
import { FertiliserManuresController } from './fertiliser-manures.controller';
import { FertiliserManuresService } from './fertiliser-manures.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import UserEntity from '@db/entity/user.entity';
import CropEntity from '@db/entity/crop.entity';
import FieldEntity from '@db/entity/field.entity';
import FarmEntity from '@db/entity/farm.entity';
import OrganisationEntity from '@db/entity/organisation.entity';
import { ormConfig } from '../../test/ormConfig';
import {
  createCropReqBody,
  createFarmReqBody2,
  createFieldReqBody,
  createManagementPeriodReqBody,
  createOrganisationReqBody2,
  userData,
} from '../../test/mocked-data';
import { createFertiliserManureReqBody } from '../../test/mocked-data/fertiliserManure';
import { truncateAllTables } from '../../test/utils';
import { RecommendationEntity } from '@db/entity/recommendation.entity';

describe('FertiliserManuresController', () => {
  let controller: FertiliserManuresController;
  let managementPeriodRepository: Repository<ManagementPeriodEntity>;
  let userRepository: Repository<UserEntity>;
  let cropRepository: Repository<CropEntity>;
  let fieldRepository: Repository<FieldEntity>;
  let farmRepository: Repository<FarmEntity>;
  let organisationRepository: Repository<OrganisationEntity>;
  let recommendationRepository: Repository<RecommendationEntity>;
  let user: UserEntity;
  let entityManager: EntityManager;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([
          FertiliserManuresEntity,
          RecommendationEntity,
        ]),
      ],
      controllers: [FertiliserManuresController],
      providers: [FertiliserManuresService],
    }).compile();

    entityManager = module.get<EntityManager>(EntityManager);
    controller = module.get<FertiliserManuresController>(
      FertiliserManuresController,
    );

    cropRepository = entityManager.getRepository(CropEntity);
    farmRepository = entityManager.getRepository(FarmEntity);
    fieldRepository = entityManager.getRepository(FieldEntity);
    organisationRepository = entityManager.getRepository(OrganisationEntity);
    userRepository = entityManager.getRepository(UserEntity);
    managementPeriodRepository = entityManager.getRepository(
      ManagementPeriodEntity,
    );
    recommendationRepository =
      entityManager.getRepository(RecommendationEntity);

    await truncateAllTables(entityManager);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create Fertiliser Manure', () => {
    it('should create a fertiliser manure and update the recommendation successfully', async () => {
      await truncateAllTables(entityManager);
      user = await userRepository.save(userData);
      const organisation = await organisationRepository.save(
        createOrganisationReqBody2,
      );

      createFarmReqBody2.OrganisationID = organisation.ID;
      createFarmReqBody2.CreatedByID = user.ID;
      const createdFarm = await farmRepository.save(createFarmReqBody2);

      createFieldReqBody.FarmID = createdFarm.ID;
      createFieldReqBody.CreatedByID = user.ID;
      const createdField = await fieldRepository.save(createFieldReqBody);

      createCropReqBody.FieldID = createdField.ID;
      createCropReqBody.CreatedByID = user.ID;
      const createdCrop = await cropRepository.save(createCropReqBody);

      createManagementPeriodReqBody.CropID = createdCrop.ID;
      createManagementPeriodReqBody.CreatedByID = user.ID;
      const createdManagementPeriod = await managementPeriodRepository.save(
        createManagementPeriodReqBody,
      );
      createFertiliserManureReqBody.ManagementPeriodID =
        createdManagementPeriod.ID;

      // Initially, create an empty recommendation
      await recommendationRepository.save({
        ManagementPeriodID: createdManagementPeriod.ID,
        FertilizerN: 0,
        FertilizerP2O5: 0,
        FertilizerK2O: 0,
        FertilizerMgO: 0,
        FertilizerSO3: 0,
        FertilizerNa2O: 0,
        FertilizerLime: 0,
      });

      const result = await controller.createFertiliserManure(
        { FertiliserManure: [createFertiliserManureReqBody] },
        {
          userId: user.ID,
        } as any,
      );

      // Ensure result is an array and validate the first element
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const createdFertiliserManure = result[0];
      expect(createdFertiliserManure).toHaveProperty('ID');
      expect(createdFertiliserManure.ManagementPeriodID).toEqual(
        createdManagementPeriod.ID,
      );

      // Check if the recommendation was updated correctly
      const updatedRecommendation = await recommendationRepository.findOneBy({
        ManagementPeriodID: createdManagementPeriod.ID,
      });

      expect(updatedRecommendation).toBeDefined();
      expect(updatedRecommendation.FertilizerN).toBe(
        createFertiliserManureReqBody.N,
      );
      expect(updatedRecommendation.FertilizerP2O5).toBe(
        createFertiliserManureReqBody.P2O5,
      );
      expect(updatedRecommendation.FertilizerK2O).toBe(
        createFertiliserManureReqBody.K2O,
      );
      expect(updatedRecommendation.FertilizerMgO).toBe(
        createFertiliserManureReqBody.MgO,
      );
      expect(updatedRecommendation.FertilizerSO3).toBe(
        createFertiliserManureReqBody.SO3,
      );
      expect(updatedRecommendation.FertilizerNa2O).toBe(
        createFertiliserManureReqBody.Na2O,
      );
      expect(updatedRecommendation.FertilizerLime).toBe(
        createFertiliserManureReqBody.Lime,
      );
    });
  });

  afterAll(async () => {
    await truncateAllTables(entityManager);
  });
});
