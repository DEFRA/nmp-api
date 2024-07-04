import { Test, TestingModule } from '@nestjs/testing';
import { FarmController } from './farm.controller';
import { FarmService } from './farm.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import FarmEntity from '@db/entity/farm.entity';
import {
  createFarmReqBody,
  createFarmReqBody4,
  createOrganisationReqBody3,
  userData,
} from '../../test/mocked-data';
import { EntityManager } from 'typeorm';
import { truncateAllTables } from '../../test/utils';
import { HttpStatus } from '@nestjs/common';
import { ormConfig } from '../../test/ormConfig';
import OrganisationEntity from '@db/entity/organisation.entity';
import UserEntity from '@db/entity/user.entity';

describe('FarmController', () => {
  let app: TestingModule;
  let controller: FarmController;
  let entityManager: EntityManager;
  let createdFarm: FarmEntity;
  let organisationRepository: any;
  let userRepository: any;
  let user: UserEntity;
  let organisation: OrganisationEntity;
  let farmRepository: any;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([FarmEntity]),
      ],
      controllers: [FarmController],
      providers: [FarmService],
      exports: [TypeOrmModule],
    }).compile();

    controller = app.get<FarmController>(FarmController);
    entityManager = app.get<EntityManager>(EntityManager);
    organisationRepository = entityManager.getRepository(OrganisationEntity);
    userRepository = entityManager.getRepository(UserEntity);
    farmRepository = entityManager.getRepository(FarmEntity);
    await truncateAllTables(entityManager);
  });

  describe('Create Farm', () => {
    it('should create a farm', async () => {
      await truncateAllTables(entityManager);
      user = await userRepository.save(userData);
      organisation = await organisationRepository.save(
        createOrganisationReqBody3,
      );
      createFarmReqBody.OrganisationID = organisation.ID;
      const result = await controller.createFarm(createFarmReqBody, {
        userId: user.ID,
      } as any);
      createdFarm = result.Farm;
      expect(createdFarm).toHaveProperty('ID');
    });

    it('should throw bad request exception, bcoz farm alread exists with given postcode and name', async () => {
      const req: any = {
        userId: user.ID,
      };
      try {
        await controller.createFarm(createFarmReqBody, req);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('Check farm exists using Name and Postcode', () => {
    it('should return true if farm exists', async () => {
      const farmName = 'FarmName1';
      const postcode = 'CB23 8YW';

      const result = await controller.checkFarmExists(farmName, postcode);
      expect(result.exists).toEqual(true);
    });

    it('should return false if farm does not exist', async () => {
      const farmName = 'NonexistentFarm';
      const postcode = 'CB23 8YW';
      const result = await controller.checkFarmExists(farmName, postcode);
      expect(result.exists).toEqual(false);
    });
  });

  describe('Get Farm details by Farm Id', () => {
    it('should return farm details by farmId', async () => {
      const farmId = createdFarm.ID;
      const { Farm } = await controller.getFarmById(farmId);
      expect(Farm.ID).toEqual(createdFarm.ID);
      expect(Farm.Name).toEqual('FarmName1');
      expect(Farm.Address1).toEqual('Cambridge University Farm');
      expect(Farm.Address2).toEqual('Park Farm');
      expect(Farm.Address3).toEqual(null);
      expect(Farm.OrganisationID).toEqual(organisation.ID.toUpperCase()),
        expect(Farm.Address4).toEqual(null);
      expect(Farm.Postcode).toEqual('CB23 8YW');
      expect(Farm.CPH).toEqual(null);
      expect(Farm.FarmerName).toEqual(null);
      expect(Farm.BusinessName).toEqual(null);
      expect(Farm.SBI).toEqual(null);
      expect(Farm.STD).toEqual('01223');
      expect(Farm.Telephone).toEqual(null);
      expect(Farm.Mobile).toEqual(null);
      expect(Farm.Email).toEqual(null);
      expect(Farm.Rainfall).toEqual(554);
      expect(Farm.TotalFarmArea).toEqual(0);
      expect(Farm.AverageAltitude).toEqual(0);
      expect(Farm.RegisteredOrganicProducer).toEqual(false);
      expect(Farm.MetricUnits).toEqual(true);
      expect(Farm.EnglishRules).toEqual(true);
      expect(Farm.NVZFields).toEqual(0);
      expect(Farm.FieldsAbove300SeaLevel).toEqual(0);
    });

    it('should return 404 error if farm with specified farmId is not found', async () => {
      const farmId = 999;
      const result = await controller.getFarmById(farmId);
      expect(result.Farm).toBeNull();
    });

    it('should return 500 error if farmId format is invalid', async () => {
      const farmId = null;
      try {
        await controller.getFarmById(farmId);
      } catch (error) {
        expect(error.status).toBeFalsy();
      }
    });
  });

  describe('Get Farms By OrganisationId', () => {
    it('should return farms by OrganisationId, when short summary is true', async () => {
      const organisationId = organisation.ID;

      const result: any = await controller.getFarmsByOrganisationId(
        organisationId,
        false,
      );
      expect(result.Farms.length).toBeGreaterThan(0);
    });

    it('should return farms by organisation id with short summary true', async () => {
      const organisationId = organisation.ID;

      const result: any = await controller.getFarmsByOrganisationId(
        organisationId,
        true,
      );
      expect(result.Farms.length).toBeGreaterThan(0);
    });
  });

  describe('Update Farm', () => {
    it('should throw an error if farm is with the updated data already exists ', async () => {
      createFarmReqBody4.OrganisationID = organisation.ID;
      const newFam = await farmRepository.save(createFarmReqBody4);
      const farmId = newFam.ID;
      const updatedFarmData: any = {
        Name: 'FarmName1',
        Postcode: 'CB23 8YW',
      };

      try {
        await controller.updateFarm(updatedFarmData, farmId, {
          userId: user.ID,
        } as any);
      } catch (error) {
        expect(error.status).toBe(400);
      }
    });
    it('should update a farm successfully', async () => {
      const farmId = createdFarm.ID;
      createFarmReqBody.Address1 = 'Updated Cambridge University Farm';
      createFarmReqBody.Address2 = 'Updated Park Farm Address';
      createFarmReqBody.Name = 'Updated Farm Name';

      const result = await controller.updateFarm(createFarmReqBody, farmId, {
        userId: user.ID,
      } as any);

      expect(result.Farm.ModifiedByID).toBeDefined();
      expect(result.Farm.ModifiedOn).toBeDefined();
      expect(result.Farm.Name).toEqual('Updated Farm Name');
    });

    it('should throw an error if farm is not found', async () => {
      const farmId = 0;
      const updatedFarmData: any = {
        Name: 'Updated Farm Name',
        Postcode: '12345',
      };

      try {
        await controller.updateFarm(updatedFarmData, farmId, {
          userId: user.ID,
        } as any);
      } catch (error) {
        expect(error.status).toBe(404);
      }
    });
  });
});
