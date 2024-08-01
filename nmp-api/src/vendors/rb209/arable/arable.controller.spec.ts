import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';

import { RB209ArableController } from './arable.controller';
import { RB209ArableService } from './arable.service';

describe('RB209ArableController', () => {
  let controller: RB209ArableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [RB209ArableController],
      providers: [RB209ArableService],
    }).compile();

    controller = module.get<RB209ArableController>(RB209ArableController);
  });

  const getRequest = (url: string): Request =>
    ({
      url,
    }) as Request;

  describe('Get Crop Groups', () => {
    it('should return the full list of available Crop Groups', async () => {
      const req = getRequest('/vendors/rb209/Arable/CropGroups');
      const result = await controller.getCropGroups(req);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Get Grop Groups By cropGroupId', () => {
    it('should return individual Crop Group filtered by cropGroupId', async () => {
      const cropGroupId = '10';
      const req = getRequest(`/vendors/rb209/Arable/CropGroup/${cropGroupId}`);
      const result = await controller.getGropGroupsBycropGroupId(
        cropGroupId,
        req,
      );
      expect(result.cropGroupName).toBeTruthy();
    });

    it('should return null when individual Crop Group filtered by cropGroupId not found', async () => {
      const cropGroupId = '100';
      const req = getRequest(`/vendors/rb209/Arable/CropGroup/${cropGroupId}`);
      const result = await controller.getGropGroupsBycropGroupId(
        cropGroupId,
        req,
      );
      expect(result.cropGroup).toBeFalsy();
    });
  });

  describe('Get Crop Types', () => {
    it('should return the full list of available Crop Types', async () => {
      const req = getRequest('/vendors/rb209/Arable/CropTypes');
      const result = await controller.getCropTypes(req);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Get Crop Types By CropGroupId', () => {
    it('should return a filtered list of available Crop Types by cropGroupId', async () => {
      const cropGroupId = '5';
      const req = getRequest(`/vendors/rb209/Arable/CropTypes/${cropGroupId}`);
      const result = await controller.getCropTypesByCropGroupId(
        cropGroupId,
        req,
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return null when list of available Crop Types by cropGroupId not found', async () => {
      const cropGroupId = '100';
      const req = getRequest(`/vendors/rb209/Arable/CropTypes/${cropGroupId}`);
      const result = await controller.getCropTypesByCropGroupId(
        cropGroupId,
        req,
      );
      expect(result.cropTypes).toBeFalsy();
    });
  });

  describe('Get Crop Type By CropTypeId', () => {
    it('should return individual Crop Type filtered by CropTypeId', async () => {
      const cropTypeId = '20';
      const req = getRequest(`/vendors/rb209/Arable/CropType/${cropTypeId}`);
      const result = await controller.getCropTypeByCropTypeId(cropTypeId, req);
      expect(result.cropTypeName).toBeTruthy();
    });

    it('should return null individual Crop Type filtered by CropTypeId not found', async () => {
      const cropTypeId = '20';
      const req = getRequest(`/vendors/rb209/Arable/CropType/${cropTypeId}`);
      const result = await controller.getCropTypeByCropTypeId(cropTypeId, req);
      expect(result.cropType).toBeFalsy();
    });
  });

  describe('Get Crop Info1s', () => {
    it('should return the full list of available Crop Info 1s', async () => {
      const req = getRequest('/vendors/rb209/Arable/CropInfo1s');
      const result = await controller.getCropInfo1s(req);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Get CropInfo1s By CropTypeId', () => {
    it('should return a filtered list of available Crop Info 1s by CropTypeId', async () => {
      const cropTypeId = '69';
      const req = getRequest(`/vendors/rb209/Arable/CropInfo1s/${cropTypeId}`);
      const result = await controller.getCropInfo1sByCropTypeId(
        cropTypeId,
        req,
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return null when list of available Crop Info 1s by CropTypeId not found', async () => {
      const cropTypeId = '69';
      const req = getRequest(`/vendors/rb209/Arable/CropInfo1s/${cropTypeId}`);
      const result = await controller.getCropInfo1sByCropTypeId(
        cropTypeId,
        req,
      );
      expect(result.cropInfo1).toBeFalsy();
    });
  });

  describe('Get CropInfo1 By CropTypeId And CropInfo1Id', () => {
    it('should return individual Crop Info 1 filtered by CropTypeId and CropInfo1Id', async () => {
      const cropTypeId = '69';
      const cropInfo1Id = '0';
      const req = getRequest(
        `/vendors/rb209/Arable/CropInfo1/${cropTypeId}/${cropInfo1Id}`,
      );
      const result = await controller.getCropInfo1ByCropTypeIdAndCropInfo1Id(
        cropTypeId,
        cropInfo1Id,
        req,
      );
      expect(result.cropInfo1Name).toBeTruthy();
    });

    it('should return null individual Crop Info 1 filtered by CropTypeId and CropInfo1Id not found', async () => {
      const cropTypeId = '69';
      const cropInfo1Id = '0';
      const req = getRequest(
        `/vendors/rb209/Arable/CropInfo1/${cropTypeId}/${cropInfo1Id}`,
      );
      const result = await controller.getCropInfo1ByCropTypeIdAndCropInfo1Id(
        cropTypeId,
        cropInfo1Id,
        req,
      );
      expect(result.cropInfo1Item).toBeFalsy();
    });
  });

  describe('Get CropInfo2s', () => {
    it('should return the full list of available Crop Info 2s', async () => {
      const req = getRequest('/vendors/rb209/Arable/CropInfo2s');
      const result = await controller.getCropInfo2s(req);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Get CropInfo2 by CropInfo2Id', () => {
    it('should return individual Crop Info 2 filtered by CropInfo2Id', async () => {
      const cropInfo2Id = '1';
      const req = getRequest(`/vendors/rb209/Arable/CropInfo2/${cropInfo2Id}`);
      const result = await controller.getCropInfo2CropInfo2Id(cropInfo2Id, req);
      expect(result.cropInfo2Name).toBeTruthy();
    });

    it('should return null when Crop Info 2 filtered by CropInfo2Id not found', async () => {
      const cropInfo2Id = '3';
      const req = getRequest(`/vendors/rb209/Arable/CropInfo2/${cropInfo2Id}`);
      const result = await controller.getCropInfo2CropInfo2Id(cropInfo2Id, req);
      expect(result.cropInfo2Item).toBeFalsy();
    });
  });

  describe('Get Potato Groups', () => {
    it('should return the full list of available Potato Groups', async () => {
      const req = getRequest('/vendors/rb209/Arable/PotatoGroups');
      const result = await controller.getPotatoGroups(req);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Get Potato Group By PotatoGroupId', () => {
    it('should return individual Potato Group filtered by PotatoGroupId', async () => {
      const potatoGroupId = '1';
      const req = getRequest(
        `/vendors/rb209/Arable/PotatoGroup/${potatoGroupId}`,
      );
      const result = await controller.getPotatoGroupByPotatoGroupId(
        potatoGroupId,
        req,
      );
      expect(result.potatoGroup).toBeTruthy();
    });

    it('should return null when Potato Group filtered by PotatoGroupId not found', async () => {
      const potatoGroupId = '5';
      const req = getRequest(
        `/vendors/rb209/Arable/PotatoGroup/${potatoGroupId}`,
      );
      const result = await controller.getPotatoGroupByPotatoGroupId(
        potatoGroupId,
        req,
      );
      expect(result.potatoGroupItem).toBeFalsy();
    });
  });

  describe('Get Potato Varieties', () => {
    it('should return the full list of available Potato Varieties', async () => {
      const req = getRequest('/vendors/rb209/Arable/PotatoVarieties');
      const result = await controller.getPotatoVarieties(req);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Get Potato Varieties By PotatoGroupId', () => {
    it('should return a filtered list of available Potato Varieties by PotatoGroupId', async () => {
      const potatoGroupId = '1';
      const req = getRequest(
        `/vendors/rb209/Arable/PotatoVarieties/${potatoGroupId}`,
      );
      const result = await controller.getPotatoVarietiesByPotatoGroupId(
        potatoGroupId,
        req,
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return null when list of available Potato Varieties by PotatoGroupId not found', async () => {
      const potatoGroupId = '5';
      const req = getRequest(
        `/vendors/rb209/Arable/PotatoVarieties/${potatoGroupId}`,
      );
      const result = await controller.getPotatoVarietiesByPotatoGroupId(
        potatoGroupId,
        req,
      );
      expect(result.list).toBeFalsy();
    });
  });

  describe('Get Potato Variety By PotatoVarietyId', () => {
    it('should return individual Potato Variety filtered by PotatoVarietyId', async () => {
      const potatoVarietyId = '1';
      const req = getRequest(
        `/vendors/rb209/Arable/PotatoVariety/${potatoVarietyId}`,
      );
      const result = await controller.getPotatoVarietyByPotatoVarietyId(
        potatoVarietyId,
        req,
      );
      expect(result.potatoVariety).toBeTruthy();
    });

    it('should return null when Potato Variety filtered by PotatoVarietyId not found', async () => {
      const potatoVarietyId = '85';
      const req = getRequest(
        `/vendors/rb209/Arable/PotatoVariety/${potatoVarietyId}`,
      );
      const result = await controller.getPotatoVarietyByPotatoVarietyId(
        potatoVarietyId,
        req,
      );
      expect(result.potatoVarietyItem).toBeFalsy();
    });
  });
});
