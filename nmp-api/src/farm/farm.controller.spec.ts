import { Test, TestingModule } from '@nestjs/testing';
import { FarmController } from './farm.controller';
import { FarmService } from './farm.service';
import { UserFarmService } from '@src/user-farm/user-farm.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import FarmEntity from '@db/entity/farm.entity';
import UserFarmEntity from '@db/entity/user-farm.entity';
import { mockedFarms } from 'test/mocked-data/farm';

describe('FarmController', () => {
  let controller: FarmController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([FarmEntity, UserFarmEntity])],
      controllers: [FarmController],
      providers: [FarmService, UserFarmService],
    }).compile();

    controller = app.get<FarmController>(FarmController);
  });

  describe('get farms by user id', () => {
    it('should return farms short summary', async () => {
      const { Farms } = await controller.getFarmsByUserId(1, false);
      expect(Farms.length).toEqual(2);
      for (const idx in Farms) {
        expect(Farms[idx].ID).toEqual(mockedFarms[idx].ID);
        expect(Farms[idx].Name).toEqual(mockedFarms[idx].Name);
        expect(Farms[idx].Address1).toEqual(mockedFarms[idx].Address1);
        expect(Farms[idx].Address2).toEqual(mockedFarms[idx].Address2);
        expect(Farms[idx].Address3).toEqual(mockedFarms[idx].Address3);
        expect(Farms[idx].Address4).toEqual(mockedFarms[idx].Address4);
        expect(Farms[idx].Postcode).toEqual(mockedFarms[idx].Postcode);
        expect(Farms[idx].CPH).toEqual(mockedFarms[idx].CPH);
        expect(Farms[idx].FarmerName).toEqual(mockedFarms[idx].FarmerName);
        expect(Farms[idx].BusinessName).toEqual(mockedFarms[idx].BusinessName);
        expect(Farms[idx].SBI).toEqual(mockedFarms[idx].SBI);
        expect(Farms[idx].STD).toEqual(mockedFarms[idx].STD);
        expect(Farms[idx].Telephone).toEqual(mockedFarms[idx].Telephone);
        expect(Farms[idx].Mobile).toEqual(mockedFarms[idx].Mobile);
        expect(Farms[idx].Email).toEqual(mockedFarms[idx].Email);
        expect(Farms[idx].Rainfall).toEqual(mockedFarms[idx].Rainfall);
        expect(Farms[idx].TotalFarmArea).toEqual(
          mockedFarms[idx].TotalFarmArea,
        );
        expect(Farms[idx].AverageAltitude).toEqual(
          mockedFarms[idx].AverageAltitude,
        );
        expect(Farms[idx].RegisteredOrganicProducer).toEqual(
          mockedFarms[idx].RegisteredOrganicProducer,
        );
        expect(Farms[idx].MetricUnits).toEqual(mockedFarms[idx].MetricUnits);
        expect(Farms[idx].EnglishRules).toEqual(mockedFarms[idx].EnglishRules);
        expect(Farms[idx].NVZFields).toEqual(mockedFarms[idx].NVZFields);
        expect(Farms[idx].FieldsAbove300SeaLevel).toEqual(
          mockedFarms[idx].FieldsAbove300SeaLevel,
        );
      }
    });
    it('should return farms list details', async () => {
      const { Farms } = await controller.getFarmsByUserId(1, true);
      expect(Farms.length).toEqual(3);
      expect(Farms[0].ID).toEqual(1);
      expect(Farms[0].Name).toEqual('FarmName1');
      expect(Farms[1].ID).toEqual(30);
      expect(Farms[1].Name).toEqual('FarmName10');
    });

    it('should return empty list for user with no farms', async () => {
      const { Farms } = await controller.getFarmsByUserId(3, true);
      expect(Farms.length).toEqual(0);
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
      const farmId = 1;
      const { Farm } = await controller.getFarmById(farmId);
      expect(Farm.ID).toEqual(1);
      expect(Farm.Name).toEqual('FarmName1');
      expect(Farm.Address1).toEqual('Cambridge University Farm');
      expect(Farm.Address2).toEqual('Park Farm');
      expect(Farm.Address3).toEqual(null);
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
      expect(Farm.CreatedOn).toEqual(null);
      expect(Farm.CreatedByID).toEqual(null);
      expect(Farm.ModifiedOn).toEqual(null);
      expect(Farm.ModifiedByID).toEqual(null);
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
});
