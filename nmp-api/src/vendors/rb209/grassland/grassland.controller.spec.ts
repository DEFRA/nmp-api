import { Test, TestingModule } from '@nestjs/testing';

import { RB209GrasslandController } from './grassland.controller';
import { RB209GrasslandService } from './grassland.service';
import { CacheModule } from '@nestjs/cache-manager';

describe('RB209GrasslandController', () => {
  let controller: RB209GrasslandController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [RB209GrasslandController],
      providers: [RB209GrasslandService],
    }).compile();

    controller = module.get<RB209GrasslandController>(RB209GrasslandController);
  });

  const getRequest = (url: string): Request =>
    ({
      url,
    }) as Request;

  describe('Get Grassland Seasons By CountryId', () => {
    it('should return grassland seasons by countryId', async () => {
      const countryId = '3';
      const req = getRequest(`/rb209/Grassland/GrasslandSeasons/${countryId}`);
      const result = await controller.getGrasslandSeasonsByCountryId(
        countryId,
        req,
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return null when grassland seasons by countryId not found', async () => {
      const countryId = '1';
      const req = getRequest(`/rb209/Grassland/GrasslandSeasons/${countryId}`);
      const result = await controller.getGrasslandSeasonsByCountryId(
        countryId,
        req,
      );
      expect(result.list).toBeNull();
    });
  });

  describe('Get Grassland Season By SeasonId', () => {
    it('should return grassland season by seasonId', async () => {
      const seasonId = '1';
      const req = getRequest(`/rb209/Grassland/GrasslandSeason/${seasonId}`);
      const result = await controller.getGrasslandSeasonBySeasonId(
        seasonId,
        req,
      );
      expect(result.seasonName).toBe('Autumn');
    });

    it('should return null when grassland season by seasonId not found', async () => {
      const seasonId = '3';
      const req = getRequest(`/rb209/Grassland/GrasslandSeason/${seasonId}`);
      const result = await controller.getGrasslandSeasonBySeasonId(
        seasonId,
        req,
      );
      expect(result.item).toBe(null);
    });
  });

  describe('Get Grassland FieldTypes By CountryId', () => {
    it('should return grassland field types by countryId', async () => {
      const countryId = '3';
      const req = getRequest(
        `/rb209/Grassland/GrasslandFieldTypes/${countryId}`,
      );
      const result = await controller.getGrasslandFieldTypesByCountryId(
        countryId,
        req,
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return null when grassland field types by countryId not found', async () => {
      const countryId = '1';
      const req = getRequest(
        `/rb209/Grassland/GrasslandFieldTypes/${countryId}`,
      );
      const result = await controller.getGrasslandFieldTypesByCountryId(
        countryId,
        req,
      );
      expect(result.list).toBeNull();
    });
  });

  describe('Get Grassland FieldType By FieldTypeId', () => {
    it('should return grassland field type by fieldTypeId', async () => {
      const fieldTypeId = '1';
      const req = getRequest(
        `/rb209/Grassland/GrasslandFieldType/${fieldTypeId}`,
      );
      const result = await controller.getGrasslandFieldTypeByFieldTypeId(
        fieldTypeId,
        req,
      );
      expect(result.grasslandFieldTypeName).toBe('Grazing');
    });

    it('should return null when grassland field type by fieldTypeId not found', async () => {
      const fieldTypeId = '8';
      const req = getRequest(
        `/rb209/Grassland/GrasslandFieldType/${fieldTypeId}`,
      );
      const result = await controller.getGrasslandFieldTypeByFieldTypeId(
        fieldTypeId,
        req,
      );
      expect(result.item).toBeNull();
    });
  });

  describe('Get GrassGrowthClasses By CountryId', () => {
    it('should return grass growth classes by countryId', async () => {
      const countryId = '3';
      const req = getRequest(
        `/rb209/Grassland/GrassGrowthClasses/${countryId}`,
      );
      const result = await controller.getGrassGrowthClassesByCountryId(
        countryId,
        req,
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return null when grass growth classes by countryId not found', async () => {
      const countryId = '1';
      const req = getRequest(
        `/rb209/Grassland/GrassGrowthClasses/${countryId}`,
      );
      const result = await controller.getGrassGrowthClassesByCountryId(
        countryId,
        req,
      );
      expect(result.list).toBeNull();
    });
  });

  describe('Get GrassGrowthClass By GrassGrowthClassId', () => {
    it('should return grass growth class by GrassGrowthClassId', async () => {
      const grassGrowthClassId = '1';
      const req = getRequest(
        `/rb209/Grassland/GrassGrowthClass/${grassGrowthClassId}`,
      );
      const result = await controller.getGrassGrowthClassByGrassGrowthClassId(
        grassGrowthClassId,
        req,
      );
      expect(result.grassGrowthClassName).toBe('Very poor');
    });

    it('should return null when grass growth class by GrassGrowthClassId not found', async () => {
      const grassGrowthClassId = '6';
      const req = getRequest(
        `/rb209/Grassland/GrassGrowthClass/${grassGrowthClassId}`,
      );
      const result = await controller.getGrassGrowthClassByGrassGrowthClassId(
        grassGrowthClassId,
        req,
      );
      expect(result.item).toBeNull();
    });
  });

  describe('Get Grass Growth Class By SoilTypeId And Rainfall And Altitude And Chalk', () => {
    it('should calculate the grass growth class by soilTypeId, rainfall, altitude, and chalk', async () => {
      const soilTypeId = '1';
      const rainfall = '100';
      const altitude = '200';
      const chalk = 'true';
      const req = getRequest(
        `/rb209/Grassland/GrassGrowthClass/${soilTypeId}/${rainfall}/${altitude}/${chalk}`,
      );
      const result =
        await controller.getGrassGrowthClassBySoilTypeIdAndRainfallAndAltitudeAndChalk(
          soilTypeId,
          rainfall,
          altitude,
          chalk,
          req,
        );
      expect(result.grassGrowthClassName).toBe('Poor');
    });

    it('should return null calculate the grass growth class by soilTypeId, rainfall, altitude, and chalk not found', async () => {
      const soilTypeId = '100';
      const rainfall = '100';
      const altitude = '200';
      const chalk = 'true';
      const req = getRequest(
        `/rb209/Grassland/GrassGrowthClass/${soilTypeId}/${rainfall}/${altitude}/${chalk}`,
      );
      const result =
        await controller.getGrassGrowthClassBySoilTypeIdAndRainfallAndAltitudeAndChalk(
          soilTypeId,
          rainfall,
          altitude,
          chalk,
          req,
        );
      expect(result.item).toBeNull();
    });
  });

  describe('Get CropMaterials By CountryId', () => {
    it('should return crop materials by countryId', async () => {
      const countryId = '1';
      const req = getRequest(`/rb209/Grassland/CropMaterials/${countryId}`);
      const result = await controller.getCropMaterialsByCountryId(
        countryId,
        req,
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return null when crop materials by countryId not found', async () => {
      const countryId = 'abc';
      const req = getRequest(`/rb209/Grassland/CropMaterials/${countryId}`);
      const result = await controller.getCropMaterialsByCountryId(
        countryId,
        req,
      );
      expect(result).toBe('');
    });
  });

  describe('Get CropMaterial By CropMaterialId', () => {
    it('should return crop material by cropMaterialId', async () => {
      const cropMaterialId = '1';
      const req = getRequest(`/rb209/Grassland/CropMaterial/${cropMaterialId}`);
      const result = await controller.getCropMaterialByCropMaterialId(
        cropMaterialId,
        req,
      );
      expect(result.cropMaterialName).toBe('Fresh grass (15-20% DM)');
    });

    it('should return null when crop material by cropMaterialId not found', async () => {
      const cropMaterialId = '6';
      const req = getRequest(`/rb209/Grassland/CropMaterial/${cropMaterialId}`);
      const result = await controller.getCropMaterialByCropMaterialId(
        cropMaterialId,
        req,
      );
      expect(result.item).toBeNull();
    });
  });

  describe('Get Yield Type By YieldTypeId', () => {
    it('should return yield type by yieldTypeId', async () => {
      const yieldTypeId = '1';
      const req = getRequest(`/rb209/Grassland/YieldType/${yieldTypeId}`);
      const result = await controller.getYieldTypeByYieldTypeId(
        yieldTypeId,
        req,
      );
      expect(result.yieldTypeName).toBe('Dry Matter');
    });

    it('should return null when yield type by yieldTypeId not found', async () => {
      const yieldTypeId = '10';
      const req = getRequest(`/rb209/Grassland/YieldType/${yieldTypeId}`);
      const result = await controller.getYieldTypeByYieldTypeId(
        yieldTypeId,
        req,
      );
      expect(result.item).toBeNull();
    });
  });

  describe('Get YieldTypes By CountryId', () => {
    it('should return yield types by countryId', async () => {
      const countryId = '3';
      const req = getRequest(`/rb209/Grassland/YieldTypes/${countryId}`);
      const result = await controller.getYieldTypesByCountryId(countryId, req);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return null when yield types by countryId not found', async () => {
      const countryId = '10';
      const req = getRequest(`/rb209/Grassland/YieldTypes/${countryId}`);
      const result = await controller.getYieldTypesByCountryId(countryId, req);
      expect(result.list).toBeNull();
    });
  });

  describe('Get Soil Nitrogen Supplies By CountryId', () => {
    it('should return soil nitrogen supplies by countryId', async () => {
      const countryId = '3';
      const req = getRequest(
        `/rb209/Grassland/SoilNitrogenSupplies/${countryId}`,
      );
      const result = await controller.getSoilNitrogenSuppliesByCountryId(
        countryId,
        req,
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return null soil nitrogen supplies by countryId not found', async () => {
      const countryId = '1';
      const req = getRequest(
        `/rb209/Grassland/SoilNitrogenSupplies/${countryId}`,
      );
      const result = await controller.getSoilNitrogenSuppliesByCountryId(
        countryId,
        req,
      );
      expect(result.list).toBeNull();
    });
  });

  describe('Get Soil Nitrogen Supply Item By SoilNitrogenSupplyId', () => {
    it('should return soil nitrogen supply item by SoilNitrogenSupplyId', async () => {
      const soilNitrogenSupplyId = '1';
      const req = getRequest(
        `/rb209/Grassland/SoilNitrogenSupplyItem/${soilNitrogenSupplyId}`,
      );
      const result =
        await controller.getSoilNitrogenSupplyItemBySoilNitrogenSupplyId(
          soilNitrogenSupplyId,
          req,
        );
      expect(result.soilNitrogenSupplyName).toBe('Low');
    });

    it('should return null when soil nitrogen supply item by SoilNitrogenSupplyId not found', async () => {
      const soilNitrogenSupplyId = '100';
      const req = getRequest(
        `/rb209/Grassland/SoilNitrogenSupplyItem/${soilNitrogenSupplyId}`,
      );
      const result =
        await controller.getSoilNitrogenSupplyItemBySoilNitrogenSupplyId(
          soilNitrogenSupplyId,
          req,
        );
      expect(result.item).toBeNull();
    });
  });

  describe('Get Grass Histories By CountryId', () => {
    it('should return grass histories by CountryId', async () => {
      const countryId = '3';
      const req = getRequest(`/rb209/Grassland/GrassHistories/${countryId}`);
      const result = await controller.getGrassHistoriesByCountryId(
        countryId,
        req,
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return null when grass histories by CountryId not found', async () => {
      const countryId = '1';
      const req = getRequest(`/rb209/Grassland/GrassHistories/${countryId}`);
      const result = await controller.getGrassHistoriesByCountryId(
        countryId,
        req,
      );
      expect(result.list).toBeNull();
    });
  });

  describe('Get Grass History By GrassHistoryId', () => {
    it('should return grass history by GrassHistoryId', async () => {
      const grassHistoryId = '1';
      const req = getRequest(`/rb209/Grassland/GrassHistory/${grassHistoryId}`);
      const result = await controller.getGrassHistoryByGrassHistoryId(
        grassHistoryId,
        req,
      );
      expect(result.grassHistoryName).toBeTruthy();
    });

    it('should return null when grass history by GrassHistoryId not found', async () => {
      const grassHistoryId = '1';
      const req = getRequest(`/rb209/Grassland/GrassHistory/${grassHistoryId}`);
      const result = await controller.getGrassHistoryByGrassHistoryId(
        grassHistoryId,
        req,
      );
      expect(result.item).toBeFalsy();
    });
  });

  describe('Get Sequence Items By CountryId', () => {
    it('should return sequence items by CountryId', async () => {
      const countryId = '3';
      const req = getRequest(`/rb209/Grassland/SequenceItems/${countryId}`);
      const result = await controller.getSequenceItemsByCountryId(
        countryId,
        req,
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return null when sequence items by CountryId not found', async () => {
      const countryId = '1';
      const req = getRequest(`/rb209/Grassland/SequenceItems/${countryId}`);
      const result = await controller.getSequenceItemsByCountryId(
        countryId,
        req,
      );
      expect(result.list).toBeNull();
    });
  });

  describe('Get Sequence Item By SequenceItemId', () => {
    it('should return sequence item by SequenceItemId', async () => {
      const sequenceItemId = 'E';
      const req = getRequest(`/rb209/Grassland/SequenceItem/${sequenceItemId}`);
      const result = await controller.getSequenceItemBySequenceItemId(
        sequenceItemId,
        req,
      );
      expect(result.sequenceItemName).toBeTruthy();
    });

    it('should return null when sequence item by SequenceItemId not found', async () => {
      const sequenceItemId = 'A';
      const req = getRequest(`/rb209/Grassland/SequenceItem/${sequenceItemId}`);
      const result = await controller.getSequenceItemBySequenceItemId(
        sequenceItemId,
        req,
      );
      expect(result.item).toBeFalsy();
    });
  });

  describe('Get Grass Sequences By SeasonId And FieldTypeId And CountryId', () => {
    it('should return grass sequences by SeasonId, FieldTypeId, and CountryId', async () => {
      const seasonId = '1';
      const fieldTypeId = '1';
      const countryId = '1';
      const req = getRequest(
        `/rb209/Grassland/GrassSequences/${seasonId}/${fieldTypeId}/${countryId}`,
      );
      const result =
        await controller.getGrassSequencesBySeasonIdAndFieldTypeIdAndCountryId(
          seasonId,
          fieldTypeId,
          countryId,
          req,
        );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return null when grass sequences by SeasonId, FieldTypeId, and CountryId not found', async () => {
      const seasonId = '1';
      const fieldTypeId = '1';
      const countryId = '3';
      const req = getRequest(
        `/rb209/Grassland/GrassSequences/${seasonId}/${fieldTypeId}/${countryId}`,
      );
      const result =
        await controller.getGrassSequencesBySeasonIdAndFieldTypeIdAndCountryId(
          seasonId,
          fieldTypeId,
          countryId,
          req,
        );
      expect(result.list).toBeNull();
    });
  });

  describe('Get Grass Sequence Item By GrassSequenceId', () => {
    it('should return grass sequence item by GrassSequenceId', async () => {
      const grassSequenceId = '1';
      const req = getRequest(
        `/rb209/Grassland/GrassSequenceItem/${grassSequenceId}`,
      );
      const result = await controller.getGrassSequenceItemByGrassSequenceId(
        grassSequenceId,
        req,
      );
      expect(result.grassSequenceName).toBeTruthy();
    });

    it('should return null grass sequence item by GrassSequenceId not found', async () => {
      const grassSequenceId = '100';
      const req = getRequest(
        `/rb209/Grassland/GrassSequenceItem/${grassSequenceId}`,
      );
      const result = await controller.getGrassSequenceItemByGrassSequenceId(
        grassSequenceId,
        req,
      );
      expect(result.item).toBeFalsy();
    });
  });

  describe('Get Soil Nitrogen Supply By GrassHistoryId', () => {
    it('should return soil nitrogen supply by GrassHistoryId', async () => {
      const grassHistoryId = '1';
      const req = getRequest(
        `/rb209/Grassland/SoilNitrogenSupply/${grassHistoryId}`,
      );
      const result = await controller.getSoilNitrogenSupplyByGrassHistoryId(
        grassHistoryId,
        req,
      );
      expect(result.soilNitrogenSupplyName).toBeTruthy();
    });

    it('should return null when soil nitrogen supply by GrassHistoryId not found', async () => {
      const grassHistoryId = '10';
      const req = getRequest(
        `/rb209/Grassland/SoilNitrogenSupply/${grassHistoryId}`,
      );
      const result = await controller.getSoilNitrogenSupplyByGrassHistoryId(
        grassHistoryId,
        req,
      );
      expect(result.item).toBeFalsy();
    });
  });

  describe('Get Grassland FieldType Item By FieldTypeId', () => {
    it('should return grassland field type item by FieldTypeId', async () => {
      const fieldTypeId = '1';
      const req = getRequest(
        `/rb209/Grassland/GrasslandFieldTypeItem/${fieldTypeId}`,
      );
      const result = await controller.getGrasslandFieldTypeItemByFieldTypeId(
        fieldTypeId,
        req,
      );
      expect(result.grasslandFieldTypeName).toBeTruthy();
    });

    it('should return null grassland field type item by FieldTypeId not found', async () => {
      const fieldTypeId = '10';
      const req = getRequest(
        `/rb209/Grassland/GrasslandFieldTypeItem/${fieldTypeId}`,
      );
      const result = await controller.getGrasslandFieldTypeItemByFieldTypeId(
        fieldTypeId,
        req,
      );
      expect(result.item).toBeFalsy();
    });
  });
});
