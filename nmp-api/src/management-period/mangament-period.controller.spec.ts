import { Test, TestingModule } from '@nestjs/testing';
import { ManagementPeriodController } from './management-period.controller';
import { ManagementPeriodService } from './management-period.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import { EntityManager } from 'typeorm';
import CropEntity from '@db/entity/crop.entity';
import {
  createCropReqBody,
  createFarmReqBody2,
  createFieldReqBody,
  createManagementPeriodReqBody,
  createOrganisationReqBody2,
  userData,
} from '../../test/mocked-data';
import FarmEntity from '@db/entity/farm.entity';
import FieldEntity from '@db/entity/field.entity';
import OrganisationEntity from '@db/entity/organisation.entity';
import { truncateAllTables } from '../../test/utils';
import UserEntity from '@db/entity/user.entity';

describe('ManagementPeriodController', () => {
  let controller: ManagementPeriodController;
  let entityManager: EntityManager;
  let managementPeriodRepository: any;
  let cropRepository: any;
  let farmRepository: any;
  let fieldRepository: any;
  let organisationRepository: any;
  let createdCrop: any;
  let userRepository: any;
  let user: UserEntity;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([ManagementPeriodEntity]),
      ],
      controllers: [ManagementPeriodController],
      providers: [ManagementPeriodService],
    }).compile();

    controller = module.get<ManagementPeriodController>(
      ManagementPeriodController,
    );
    entityManager = module.get<EntityManager>(EntityManager);
    managementPeriodRepository = entityManager.getRepository(
      ManagementPeriodEntity,
    );
    cropRepository = entityManager.getRepository(CropEntity);
    farmRepository = entityManager.getRepository(FarmEntity);
    fieldRepository = entityManager.getRepository(FieldEntity);
    organisationRepository = entityManager.getRepository(OrganisationEntity);
    userRepository = entityManager.getRepository(UserEntity);
    await truncateAllTables(entityManager);
  });

  describe('Get Management PeriodId By Id', () => {
    it('should return management period by id', async () => {
      await truncateAllTables(entityManager);
      const organisation = await organisationRepository.save(
        createOrganisationReqBody2,
      );
      user = await userRepository.save(userData);
      createFarmReqBody2.OrganisationID = organisation.ID;
      createFarmReqBody2.CreatedByID = user.ID;
      const createdFarm = await farmRepository.save(createFarmReqBody2);
      createFieldReqBody.FarmID = createdFarm.ID;
      createFieldReqBody.CreatedByID = user.ID;
      const createdField = await fieldRepository.save(createFieldReqBody);
      createCropReqBody.FieldID = createdField.ID;
      createCropReqBody.CreatedByID = user.ID;
      createdCrop = await cropRepository.save(createCropReqBody);
      createManagementPeriodReqBody.CropID = createdCrop.ID;
      createManagementPeriodReqBody.CreatedByID = user.ID;
      const managementPeriod = await managementPeriodRepository.save(
        createManagementPeriodReqBody,
      );

      const result = await controller.getManagementPeriodIdById(
        managementPeriod.ID,
      );
      expect(result.ManagementPeriod).toBeTruthy();
    });
  });

  describe('Get Management Period By CropId', () => {
    it('should return management periods by crop id with short summary as false', async () => {
      const result = await controller.getManagementPeriodByCropId(
        createdCrop.ID,
        false,
      );
      expect(result.ManagementPeriods[0]).toHaveProperty('ID');
    });

    it('should return management periods by crop id with short summary as true', async () => {
      const result = await controller.getManagementPeriodByCropId(
        createdCrop.ID,
        true,
      );

      expect(result.ManagementPeriods[0]).toHaveProperty('ID');
      expect(result.ManagementPeriods[0]).toHaveProperty('CropID');
      expect(result.ManagementPeriods[0].Yield).toBeUndefined();
    });
  });
});
