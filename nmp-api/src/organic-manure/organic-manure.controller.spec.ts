import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import { EntityManager } from 'typeorm';
import { truncateAllTables } from '../../test/utils';
import {
  createCropReqBody,
  createFarmReqBody2,
  createFieldReqBody,
  createManagementPeriodReqBody,
  createOrganisationReqBody2,
} from '../../test/mocked-data';
import { organicManureReqBody } from '../../test/mocked-data/organic-manure';
import { OrganicManureController } from './organic-manure.controller';
import { OrganicManureService } from './organic-manure.service';
import { OrganicManureEntity } from '@db/entity/organic-manure.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import { ApplicationMethodEntity } from '@db/entity/application-method.entity';
import { ManureTypeEntity } from '@db/entity/manure-type.entity';
import { IncorporationMethodEntity } from '@db/entity/incorporation-method.entity';
import { IncorporationDelayEntity } from '@db/entity/incorporation-delay.entity';
import { WindspeedEntity } from '@db/entity/wind-speed.entity';
import { MoistureTypeEntity } from '@db/entity/moisture-type.entity';
import { RainTypeEntity } from '@db/entity/rain-type.entity';
import CropEntity from '@db/entity/crop.entity';
import FarmEntity from '@db/entity/farm.entity';
import FieldEntity from '@db/entity/field.entity';
import OrganisationEntity from '@db/entity/organisation.entity';
import FarmManureTypeEntity from '@db/entity/farm-manure-type.entity';

describe('OrganicManureController', () => {
  let controller: OrganicManureController;
  let entityManager: EntityManager;
  let managementPeriodRepository: any;
  let manureTypeRepository: any;
  let applicationMethodRepository: any;
  let incorporationMethodRepository: any;
  let incorporationDelayRepository: any;
  let windSpeedRepository: any;
  let moistureRepository: any;
  let rainTypeRepository: any;
  let cropRepository: any;
  let farmRepository: any;
  let fieldRepository: any;
  let organisationRepository: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([OrganicManureEntity, FarmManureTypeEntity]),
      ],
      controllers: [OrganicManureController],
      providers: [OrganicManureService],
    }).compile();

    entityManager = module.get<EntityManager>(EntityManager);
    controller = module.get<OrganicManureController>(OrganicManureController);
    managementPeriodRepository = entityManager.getRepository(
      ManagementPeriodEntity,
    );
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
    windSpeedRepository = entityManager.getRepository(WindspeedEntity);
    moistureRepository = entityManager.getRepository(MoistureTypeEntity);
    rainTypeRepository = entityManager.getRepository(RainTypeEntity);
    cropRepository = entityManager.getRepository(CropEntity);
    farmRepository = entityManager.getRepository(FarmEntity);
    fieldRepository = entityManager.getRepository(FieldEntity);
    organisationRepository = entityManager.getRepository(OrganisationEntity);
    await truncateAllTables(entityManager);
  });

  describe('Create Organic Manure When Save default for farm is false', () => {
    it('should create organic manure', async () => {
      await truncateAllTables(entityManager);
      const organisation = await organisationRepository.save(
        createOrganisationReqBody2,
      );
      createFarmReqBody2.OrganisationID = organisation.ID;
      const createdFarm = await farmRepository.save(createFarmReqBody2);
      createFieldReqBody.FarmID = createdFarm.ID;
      const createdField = await fieldRepository.save(createFieldReqBody);
      createCropReqBody.FieldID = createdField.ID;
      const createdCrop = await cropRepository.save(createCropReqBody);
      createManagementPeriodReqBody.CropID = createdCrop.ID;
      const managementPeriod = await managementPeriodRepository.save(
        createManagementPeriodReqBody,
      );
      const req: any = {
        userId: 1,
      };
      const manureType = await manureTypeRepository.find({});

      const applicationMethod = await applicationMethodRepository.find({});
      const incorporationMethod = await incorporationMethodRepository.find({});
      const incorporationDelay = await incorporationDelayRepository.find({});
      const windSpeed = await windSpeedRepository.find({});
      const moisture = await moistureRepository.find({});
      const rainType = await rainTypeRepository.find({});
      organicManureReqBody.OrganicManures[0].OrganicManure.ManagementPeriodID =
        managementPeriod.ID;
      organicManureReqBody.OrganicManures[0].OrganicManure.ManureTypeID =
        manureType[0].ID;
      organicManureReqBody.OrganicManures[0].OrganicManure.ApplicationMethodID =
        applicationMethod[0].ID;
      organicManureReqBody.OrganicManures[0].OrganicManure.IncorporationMethodID =
        incorporationMethod[0].ID;
      organicManureReqBody.OrganicManures[0].OrganicManure.IncorporationDelayID =
        incorporationDelay[0].ID;
      organicManureReqBody.OrganicManures[0].OrganicManure.WindspeedID =
        windSpeed[0].ID;
      organicManureReqBody.OrganicManures[0].OrganicManure.RainfallWithinSixHoursID =
        rainType[0].ID;
      organicManureReqBody.OrganicManures[0].OrganicManure.MoistureID =
        moisture[0].ID;
      const result = await controller.createOrganicManures(
        organicManureReqBody,
        req,
      );
      expect(result.OrganicManures.length).toBeGreaterThan(0);
      expect(result.FarmManureType).toBeUndefined();
    });
  });

  describe('Create Organic Manure When Save default for farm is true', () => {
    it('should create organic manure with save/update farm manure type', async () => {
      await truncateAllTables(entityManager);
      const organisation = await organisationRepository.save(
        createOrganisationReqBody2,
      );
      createFarmReqBody2.OrganisationID = organisation.ID;
      const createdFarm = await farmRepository.save(createFarmReqBody2);
      createFieldReqBody.FarmID = createdFarm.ID;
      const createdField = await fieldRepository.save(createFieldReqBody);
      createCropReqBody.FieldID = createdField.ID;
      const createdCrop = await cropRepository.save(createCropReqBody);
      createManagementPeriodReqBody.CropID = createdCrop.ID;
      const managementPeriod = await managementPeriodRepository.save(
        createManagementPeriodReqBody,
      );
      const req: any = {
        userId: 1,
      };
      const manureType = await manureTypeRepository.find({});
      const farm = await farmRepository.find({});

      const applicationMethod = await applicationMethodRepository.find({});
      const incorporationMethod = await incorporationMethodRepository.find({});
      const incorporationDelay = await incorporationDelayRepository.find({});
      const windSpeed = await windSpeedRepository.find({});
      const moisture = await moistureRepository.find({});
      const rainType = await rainTypeRepository.find({});

      organicManureReqBody.OrganicManures[0].OrganicManure.ManagementPeriodID =
        managementPeriod.ID;
      organicManureReqBody.OrganicManures[0].OrganicManure.ManureTypeID =
        manureType[0].ID;
      organicManureReqBody.OrganicManures[0].OrganicManure.ApplicationMethodID =
        applicationMethod[0].ID;
      organicManureReqBody.OrganicManures[0].OrganicManure.IncorporationMethodID =
        incorporationMethod[0].ID;
      organicManureReqBody.OrganicManures[0].OrganicManure.IncorporationDelayID =
        incorporationDelay[0].ID;
      organicManureReqBody.OrganicManures[0].OrganicManure.WindspeedID =
        windSpeed[0].ID;
      organicManureReqBody.OrganicManures[0].OrganicManure.RainfallWithinSixHoursID =
        rainType[0].ID;
      organicManureReqBody.OrganicManures[0].OrganicManure.MoistureID =
        moisture[0].ID;

      organicManureReqBody.OrganicManures[0].FarmID = farm[0].ID;
      organicManureReqBody.OrganicManures[0].OrganicManure.ManureTypeID =
        manureType[0].ID;
      organicManureReqBody.OrganicManures[0].FieldTypeID = 1;
      organicManureReqBody.OrganicManures[0].SaveDefaultForFarm = true;
      const result = await controller.createOrganicManures(
        organicManureReqBody,
        req,
      );
      expect(result.OrganicManures.length).toBeGreaterThan(0);
      expect(result.FarmManureType).toHaveProperty('ID');
    });
  });
});
