import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import FieldEntity from '@db/entity/field.entity';
import CropEntity from '@db/entity/crop.entity';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import { FieldService } from './field.service';
import { CropService } from '@src/crop/crop.service';
import { SoilAnalysisService } from '@src/soil-analysis/soil-analysis.service';
import { ManagementPeriodService } from '@src/management-period/management-period.service';
import { FieldController } from './field.controller';
import {
  createFarmReqBody2,
  createFieldWithSoilAnalysisAndCropsReqBody,
} from '../../test/mocked-data';
import { ormConfig } from '../../test/ormConfig';
import FarmEntity from '@db/entity/farm.entity';
import { truncateAllTables } from '../../test/utils';
import { EntityManager } from 'typeorm';
import OrganisationEntity from '@db/entity/organisation.entity';
import { RB209SoilService } from '@src/vendors/rb209/soil/soil.service';

describe('FieldController', () => {
  let controller: FieldController;
  let entityManager: EntityManager;
  let createdField: FieldEntity;
  let createdFarm: FarmEntity;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([
          FieldEntity,
          CropEntity,
          SoilAnalysisEntity,
          ManagementPeriodEntity,
        ]),
      ],
      controllers: [FieldController],
      providers: [
        FieldService,
        CropService,
        SoilAnalysisService,
        ManagementPeriodService,
        RB209SoilService,
      ],
    }).compile();

    controller = app.get<FieldController>(FieldController);
    entityManager = app.get<EntityManager>(EntityManager);
    await truncateAllTables(entityManager);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create Field With SoilAnalysis And Crops', () => {
    it('should create a field along with soil analyses and crops', async () => {
      await truncateAllTables(entityManager);
      const farmRepository = entityManager.getRepository(FarmEntity);
      const organisationRepository =
        entityManager.getRepository(OrganisationEntity);
      const organisation = await organisationRepository.save({
        ID: '323b76cd-2d89-4331-854c-656c72a65b79',
        Name: 'My organisation4',
      });
      createFarmReqBody2.OrganisationID = organisation.ID;
      const farm = await farmRepository.save(createFarmReqBody2);

      const result = await controller.createFieldWithSoilAnalysisAndCrops(
        farm.ID,
        createFieldWithSoilAnalysisAndCropsReqBody,
        {
          userId: 1,
        } as any,
      );
      createdField = result.Field;
      createdFarm = farm;
      expect(result.Field).toHaveProperty('ID');
      expect(result.SoilAnalysis).toHaveProperty('ID');
      expect(result.Crops.length).toBeGreaterThan(0);
    });
  });

  describe('Get Field details by Field Id', () => {
    it('should return field details by fieldId', async () => {
      const fieldId = createdField.ID;
      const { Field } = await controller.getFieldById(fieldId);
      expect(Field.ID).toEqual(createdField.ID);
      expect(Field.FarmID).toEqual(createdFarm.ID);
      expect(Field.SoilTypeID).toEqual(0);
      expect(Field.NVZProgrammeID).toEqual(0);
      expect(Field.Name).toEqual('field 9');
      expect(Field.LPIDNumber).toEqual(null);
      expect(Field.NationalGridReference).toEqual(null);
      expect(Field.OtherReference).toEqual(null);
      expect(Field.TotalArea).toEqual(500);
      expect(Field.CroppedArea).toEqual(null);
      expect(Field.ManureNonSpreadingArea).toEqual(null);
      expect(Field.SoilReleasingClay).toEqual(false);
      expect(Field.IsWithinNVZ).toEqual(false);
      expect(Field.IsAbove300SeaLevel).toEqual(false);
      expect(Field.IsActive).toEqual(true);
    });

    it('should return Field value as NULL if field with specified fieldId is not found', async () => {
      const fieldId = 2;
      const result = await controller.getFieldById(fieldId);
      expect(result.Field).toBeNull();
    });
  });

  describe('getFieldCropAndSoilDetails', () => {
    it('should return field details', async () => {
      const fieldId = 1;
      const year = 2024;
      const confirm = false;

      const result = await controller.getFieldCropAndSoilDetails(
        fieldId,
        year,
        confirm,
      );

      expect(result).toEqual({
        FieldDetails: {
          FieldType: 1,
          SoilTypeID: 2,
          SoilTypeName: 'Medium',
          SowingDate: '2023-01-08T18:30:00.000Z',
        },
      });
    });
  });

  describe('Get Fields by Farm Id', () => {
    it('should return all fields for farmId when shortSummary is false', async () => {
      const farmId = createdFarm.ID;
      const { Fields } = await controller.getFieldsByFarmId(farmId, false);
      expect(Fields[0].ID).toEqual(createdField.ID);
      expect(Fields[0].FarmID).toEqual(createdField.FarmID);
      expect(Fields[0].SoilTypeID).toEqual(createdField.SoilTypeID);
      expect(Fields[0].NVZProgrammeID).toEqual(createdField.NVZProgrammeID);
      expect(Fields[0].Name).toEqual(createdField.Name);
      expect(Fields[0].LPIDNumber).toEqual(createdField.LPIDNumber);
      expect(Fields[0].NationalGridReference).toEqual(
        createdField.NationalGridReference,
      );
      expect(Fields[0].OtherReference).toEqual(createdField.OtherReference);
      expect(Fields[0].TotalArea).toEqual(createdField.TotalArea);
      expect(Fields[0].CroppedArea).toEqual(createdField.CroppedArea);
      expect(Fields[0].ManureNonSpreadingArea).toEqual(
        createdField.ManureNonSpreadingArea,
      );
      expect(Fields[0].SoilReleasingClay).toEqual(
        createdField.SoilReleasingClay,
      );
      expect(Fields[0].IsWithinNVZ).toEqual(createdField.IsWithinNVZ);
      expect(Fields[0].IsAbove300SeaLevel).toEqual(
        createdField.IsAbove300SeaLevel,
      );
      expect(Fields[0].IsActive).toEqual(createdField.IsActive);
    });

    it('should return only select fields for farmId when shortSummary is true', async () => {
      const farmId = createdFarm.ID;
      const { Fields } = await controller.getFieldsByFarmId(farmId, true);
      expect(Fields[0].ID).toEqual(createdField.ID);
      expect(Fields[0].FarmID).toEqual(createdField.FarmID);
      expect(Fields[0].Name).toEqual(createdField.Name);
    });

    it('should return empty array if no fields found for farmId', async () => {
      const farmId = 1;
      const result = await controller.getFieldsByFarmId(farmId, false);
      expect(result).toEqual({ Fields: [] });
    });
  });

  describe('Get fields count by Farm Id', () => {
    it('should return count of fields for farmId', async () => {
      const farmId = createdFarm.ID;
      const result = await controller.getFarmFieldsCount(farmId);

      expect(result.count).toEqual(1);
    });

    it('should return zero count if no fields found for farmId', async () => {
      const farmId = 12;
      const result = await controller.getFarmFieldsCount(farmId);
      expect(result.count).toEqual(0);
    });
  });

  describe('check field exists using Farm Name and Farm Id', () => {
    it('should return true if field exists', async () => {
      const name = 'field 9';
      const farmId = createdFarm.ID;

      const result = await controller.checkFarmFieldExists(farmId, name);
      expect(result.exists).toEqual(true);
    });

    it('should return false if field does not exist for given farmId and farm name', async () => {
      const name = 'Field 10';
      const farmId = 1;

      const result = await controller.checkFarmFieldExists(farmId, name);
      expect(result.exists).toEqual(false);
    });
  });
});
