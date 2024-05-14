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
import { mockedFields } from 'test/mocked-data';

describe('FieldController', () => {
  let controller: FieldController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
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
      ],
    }).compile();

    controller = app.get<FieldController>(FieldController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Get Field details by Field Id', () => {
    it('should return field details by fieldId', async () => {
      const fieldId = 14;
      const { Field } = await controller.getFieldById(fieldId);
      expect(Field.ID).toEqual(14);
      expect(Field.FarmID).toEqual(9);
      expect(Field.SoilTypeID).toEqual(null);
      expect(Field.NVZProgrammeID).toEqual(null);
      expect(Field.Name).toEqual('field 5');
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

  describe('Get Fields by Farm Id', () => {
    it('should return all fields for farmId when shortSummary is false', async () => {
      const farmId = 5;
      const { Fields } = await controller.getFieldsByFarmId(farmId, false);
      for (const idx in Fields) {
        expect(Fields[idx].ID).toEqual(mockedFields[idx].ID);
        expect(Fields[idx].FarmID).toEqual(mockedFields[idx].FarmID);
        expect(Fields[idx].SoilTypeID).toEqual(mockedFields[idx].SoilTypeID);
        expect(Fields[idx].NVZProgrammeID).toEqual(
          mockedFields[idx].NVZProgrammeID,
        );
        expect(Fields[idx].Name).toEqual(mockedFields[idx].Name);
        expect(Fields[idx].LPIDNumber).toEqual(mockedFields[idx].LPIDNumber);
        expect(Fields[idx].NationalGridReference).toEqual(
          mockedFields[idx].NationalGridReference,
        );
        expect(Fields[idx].OtherReference).toEqual(
          mockedFields[idx].OtherReference,
        );
        expect(Fields[idx].TotalArea).toEqual(mockedFields[idx].TotalArea);
        expect(Fields[idx].CroppedArea).toEqual(mockedFields[idx].CroppedArea);
        expect(Fields[idx].ManureNonSpreadingArea).toEqual(
          mockedFields[idx].ManureNonSpreadingArea,
        );
        expect(Fields[idx].SoilReleasingClay).toEqual(
          mockedFields[idx].SoilReleasingClay,
        );
        expect(Fields[idx].IsWithinNVZ).toEqual(mockedFields[idx].IsWithinNVZ);
        expect(Fields[idx].IsAbove300SeaLevel).toEqual(
          mockedFields[idx].IsAbove300SeaLevel,
        );
        expect(Fields[idx].IsActive).toEqual(mockedFields[idx].IsActive);
      }
    });

    it('should return only select fields for farmId when shortSummary is true', async () => {
      const farmId = 5;
      const { Fields } = await controller.getFieldsByFarmId(farmId, true);
      expect(Fields[0].ID).toEqual(20);
      expect(Fields[0].FarmID).toEqual(5);
      expect(Fields[0].Name).toEqual('Field 9');
      expect(Fields[1].ID).toEqual(19);
      expect(Fields[1].FarmID).toEqual(5);
      expect(Fields[1].Name).toEqual('field 10');
      expect(Fields[2].ID).toEqual(17);
      expect(Fields[2].FarmID).toEqual(5);
      expect(Fields[2].Name).toEqual('field 5');
    });

    it('should return empty array if no fields found for farmId', async () => {
      const farmId = 1;
      const result = await controller.getFieldsByFarmId(farmId, false);
      expect(result).toEqual({ Fields: [] });
    });
  });

  describe('Get fields count by Farm Id', () => {
    it('should return count of fields for farmId', async () => {
      const farmId = 4;
      const result = await controller.getFarmFieldsCount(farmId);

      expect(result.count).toEqual(2);
    });

    it('should return zero count if no fields found for farmId', async () => {
      const farmId = 12;
      const result = await controller.getFarmFieldsCount(farmId);
      expect(result.count).toEqual(0);
    });
  });

  describe('check field exists using Farm Name and Farm Id', () => {
    it('should return true if field exists', async () => {
      const name = 'field 5';
      const farmId = 9;

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
