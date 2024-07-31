import { Test, TestingModule } from '@nestjs/testing';

import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ormConfig } from '../../test/ormConfig';
import { truncateAllTables } from '../../test/utils';
import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';

import { FertiliserManures } from '../../test/mocked-data/fertiliserManures';
import { createManagementPeriodReqBody } from '../../test/mocked-data/management-period';
import { createUserWithOrganisationReqBody } from '../../test/mocked-data/user';
import { createCropReqBody } from '../../test/mocked-data/crop';
import { FertiliserManuresController } from '@src/fertiliser-manures/fertiliser-manures.controller';
import { FertiliserManuresService } from '@src/fertiliser-manures/fertiliser-manures.service';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import UserEntity from '@db/entity/user.entity';
import CropEntity from '@db/entity/crop.entity';

describe('FertiliserManuresController', () => {
  let controller: FertiliserManuresController;
  let service: FertiliserManuresService;
  let entityManager: EntityManager;
  let fertiliserManuresRepository: any;
  let managementPeriodRepository: any;
  let userRepository: any;
  let cropRepository: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([
          FertiliserManuresEntity,
          ManagementPeriodEntity,
          UserEntity,
          CropEntity,
        ]),
      ],
      controllers: [FertiliserManuresController],
      providers: [FertiliserManuresService],
    }).compile();

    controller = module.get<FertiliserManuresController>(
      FertiliserManuresController,
    );
    service = module.get<FertiliserManuresService>(FertiliserManuresService);
    entityManager = module.get<EntityManager>(EntityManager);
    fertiliserManuresRepository = entityManager.getRepository(
      FertiliserManuresEntity,
    );
    managementPeriodRepository = entityManager.getRepository(
      ManagementPeriodEntity,
    );
    userRepository = entityManager.getRepository(UserEntity);
    cropRepository = entityManager.getRepository(CropEntity);

    await truncateAllTables(entityManager);

    // Insert required data into Crops, Users, and ManagementPeriods tables
    await cropRepository.save(createCropReqBody);

    await userRepository.save({
      ID: 1,
      ...createUserWithOrganisationReqBody.User,
    });

    await managementPeriodRepository.save({
      ID: 1,
      CropID: 1, // Reference the valid CropID
      ...createManagementPeriodReqBody,
    });
  });

  afterEach(async () => {
    await truncateAllTables(entityManager);
  });

  describe('createFertiliserManures', () => {
    it('should create a new fertiliser manure entry', async () => {
      // Insert a sample fertiliser manure data using mocked data
      const result = await controller.create(FertiliserManures);

      // Assert the result
      expect(result).toBeDefined();
      expect(result.ManagementPeriodID).toBe(
        FertiliserManures.ManagementPeriodID,
      );
      expect(result.ApplicationDate).toBe(FertiliserManures.ApplicationDate);
      expect(result.ApplicationRate).toBe(FertiliserManures.ApplicationRate);
      expect(result.Confirm).toBe(FertiliserManures.Confirm);
      expect(result.N).toBe(FertiliserManures.N);
      expect(result.P2O5).toBe(FertiliserManures.P2O5);
      expect(result.K2O).toBe(FertiliserManures.K2O);
      expect(result.MgO).toBe(FertiliserManures.MgO);
      expect(result.SO3).toBe(FertiliserManures.SO3);
      expect(result.Na2O).toBe(FertiliserManures.Na2O);
      expect(result.NFertAnalysisPercent).toBe(
        FertiliserManures.NFertAnalysisPercent,
      );
      expect(result.P2O5FertAnalysisPercent).toBe(
        FertiliserManures.P2O5FertAnalysisPercent,
      );
      expect(result.K2OFertAnalysisPercent).toBe(
        FertiliserManures.K2OFertAnalysisPercent,
      );
      expect(result.MgOFertAnalysisPercent).toBe(
        FertiliserManures.MgOFertAnalysisPercent,
      );
      expect(result.SO3FertAnalysisPercent).toBe(
        FertiliserManures.SO3FertAnalysisPercent,
      );
      expect(result.Na2OFertAnalysisPercent).toBe(
        FertiliserManures.Na2OFertAnalysisPercent,
      );
      expect(result.Lime).toBe(FertiliserManures.Lime);
      expect(result.NH4N).toBe(FertiliserManures.NH4N);
      expect(result.NO3N).toBe(FertiliserManures.NO3N);
      expect(result.CreatedOn).toBe(FertiliserManures.CreatedOn);
      expect(result.CreatedByID).toBe(FertiliserManures.CreatedByID);
      expect(result.ModifiedOn).toBe(FertiliserManures.ModifiedOn);
      expect(result.ModifiedByID).toBe(FertiliserManures.ModifiedByID);
    });
  });

  afterAll(async () => {
    await entityManager.connection.close();
  });
});
