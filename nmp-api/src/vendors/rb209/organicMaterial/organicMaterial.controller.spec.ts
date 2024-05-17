import { Test, TestingModule } from '@nestjs/testing';

import { RB209OrganicMaterialController } from './organicMaterial.controller';
import { RB209OrganicMaterialService } from './oraganicMaterial.service';
import { CacheModule } from '@nestjs/cache-manager';

describe('RB209OrganicMaterialController', () => {
  let controller: RB209OrganicMaterialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [RB209OrganicMaterialController],
      providers: [RB209OrganicMaterialService],
    }).compile();

    controller = module.get<RB209OrganicMaterialController>(
      RB209OrganicMaterialController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Get Organic Material Categories', () => {
    it('should return organic material categories', async () => {
      const request = {
        url: `vendors/rb209/OrganicMaterial/OrganicMaterialCategories`,
      } as Request;
      const result = await controller.getOrganicMaterialCategories(request);

      expect(result.length).toBeGreaterThan(0);
      expect(result).toBeTruthy();
    });
  });

  describe('Get Organic Material Category Item By OrganicMaterialCategoryId', () => {
    it('should return organic material category item by organicMaterialCategoryId', async () => {
      const organicMaterialCategoryId = '1';
      const request = {
        url: `vendors/rb209/OrganicMaterial/OrganicMaterialCategoryItem/${organicMaterialCategoryId}`,
      } as Request;

      const result =
        await controller.getOrganicMaterialCategoryItemByOrganicMaterialCategoryId(
          organicMaterialCategoryId,
          request,
        );

      expect(result).toBeTruthy();
    });

    it('should return null when organicMaterialCategoryId is invalid', async () => {
      const organicMaterialCategoryId = '11';
      const request = {
        url: `vendors/rb209/OrganicMaterial/OrganicMaterialCategoryItem/${organicMaterialCategoryId}`,
      } as Request;

      const result =
        await controller.getOrganicMaterialCategoryItemByOrganicMaterialCategoryId(
          organicMaterialCategoryId,
          request,
        );

      expect(result.organicMaterialCategory).toBeNull();
    });
  });

  describe('Get Organic Material Types', () => {
    it('should return organic material types', async () => {
      const request = {
        url: `vendors/rb209/OrganicMaterial/OrganicMaterialTypes`,
      } as Request;

      const result = await controller.getOrganicMaterialTypes(request);

      expect(result.length).toBeGreaterThan(0);
      expect(result).toBeTruthy();
    });
  });

  describe('Get Organic Material Types By DryMatterSplit', () => {
    it('should return organic material types by dryMatterSplit as true', async () => {
      const dryMatterSplit = true;
      const request = {
        url: `/vendors/rb209/OrganicMaterial/OrganicMaterialTypes/${dryMatterSplit}`,
      } as Request;

      const result = await controller.getOrganicMaterialTypesByDryMatterSplit(
        dryMatterSplit,
        request,
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result).toBeTruthy();
    });

    it('should return organic material types by dryMatterSplit as false', async () => {
      const dryMatterSplit = false;
      const request = {
        url: `/vendors/rb209/OrganicMaterial/OrganicMaterialTypes/${dryMatterSplit}`,
      } as Request;

      const result = await controller.getOrganicMaterialTypesByDryMatterSplit(
        dryMatterSplit,
        request,
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result).toBeTruthy();
    });
  });

  describe('Get Organic Material Types By OrganicMaterialCategoryId', () => {
    it('should return organic material types by organicMaterialCategoryId', async () => {
      const organicMaterialCategoryId = '1';
      const request = {
        url: `/vendors/rb209/OrganicMaterial/OrganicMaterialTypes/${organicMaterialCategoryId}`,
      } as Request;

      const result =
        await controller.getOrganicMaterialTypesByOrganicMaterialCategoryId(
          organicMaterialCategoryId,
          request,
        );

      expect(result).toBeTruthy();
    });

    it('should return null when organic material types by organicMaterialCategoryId not found', async () => {
      const organicMaterialCategoryId = '50';
      const request = {
        url: `/vendors/rb209/OrganicMaterial/OrganicMaterialTypes/${organicMaterialCategoryId}`,
      } as Request;

      const result =
        await controller.getOrganicMaterialTypesByOrganicMaterialCategoryId(
          organicMaterialCategoryId,
          request,
        );

      expect(result.organicMaterials).toBeNull();
    });
  });

  describe('Get Organic Material Types By OrganicMaterialCategoryId And DryMatterSplit', () => {
    it('should return organic material types by organicMaterialCategoryId and dryMatterSplit', async () => {
      const organicMaterialCategoryId = '1';
      const dryMatterSplit = true;
      const request = {
        url: `/vendors/rb209/OrganicMaterial/OrganicMaterialTypes/${organicMaterialCategoryId}/${dryMatterSplit}`,
      } as Request;

      const result =
        await controller.getOrganicMaterialTypesByOrganicMaterialCategoryIdAndDryMatterSplit(
          organicMaterialCategoryId,
          dryMatterSplit,
          request,
        );

      expect(result.length).toBeGreaterThan(0);
      expect(result).toBeTruthy();
    });

    it('should return organic material types by organicMaterialCategoryId and dryMatterSplit', async () => {
      const organicMaterialCategoryId = '1';
      const dryMatterSplit = false;
      const request = {
        url: `/vendors/rb209/OrganicMaterial/OrganicMaterialTypes/${organicMaterialCategoryId}/${dryMatterSplit}`,
      } as Request;

      const result =
        await controller.getOrganicMaterialTypesByOrganicMaterialCategoryIdAndDryMatterSplit(
          organicMaterialCategoryId,
          dryMatterSplit,
          request,
        );

      expect(result.length).toBeGreaterThan(0);
      expect(result).toBeTruthy();
    });

    it('should return null organic material types by organicMaterialCategoryId and dryMatterSplit not found', async () => {
      const organicMaterialCategoryId = '50';
      const dryMatterSplit = true;
      const request = {
        url: `/vendors/rb209/OrganicMaterial/OrganicMaterialTypes/${organicMaterialCategoryId}/${dryMatterSplit}`,
      } as Request;

      const result =
        await controller.getOrganicMaterialTypesByOrganicMaterialCategoryIdAndDryMatterSplit(
          organicMaterialCategoryId,
          dryMatterSplit,
          request,
        );

      expect(result.organicMaterials).toBeNull();
    });
  });

  describe('Get Organic Material Type Item By OrganicMaterialTypeId', () => {
    it('should return organic material type item by organicMaterialTypeId', async () => {
      const organicMaterialTypeId = '1';
      const request = {
        url: `/vendors/rb209/OrganicMaterial/OrganicMaterialTypeItem/${organicMaterialTypeId}`,
      } as Request;

      const result =
        await controller.getOrganicMaterialTypeItemByOrganicMaterialTypeId(
          organicMaterialTypeId,
          request,
        );

      expect(result).toBeTruthy();
    });

    it('should return null organic material type item by organicMaterialTypeId not found', async () => {
      const organicMaterialTypeId = '50';
      const request = {
        url: `/vendors/rb209/OrganicMaterial/OrganicMaterialTypeItem/${organicMaterialTypeId}`,
      } as Request;

      const result =
        await controller.getOrganicMaterialTypeItemByOrganicMaterialTypeId(
          organicMaterialTypeId,
          request,
        );

      expect(result.organicMaterialTypeItem).toBeNull();
    });
  });

  describe('Get Organic Material Type Item By OrganicMaterialTypeIdAndDryMatterSplit', () => {
    it('should return organic material type item by organicMaterialTypeId and dryMatterSplit as true', async () => {
      const organicMaterialTypeId = '1';
      const dryMatterSplit = true;
      const request = {
        url: `/vendors/rb209/OrganicMaterial/OrganicMaterialTypeItem/${organicMaterialTypeId}/${dryMatterSplit}`,
      } as Request;

      const result =
        await controller.getOrganicMaterialTypeItemByOrganicMaterialTypeIdAndDryMatterSplit(
          organicMaterialTypeId,
          dryMatterSplit,
          request,
        );

      expect(result.organicMaterialTypeName).toBeTruthy();
    });

    it('should return organic material type item by organicMaterialTypeId and dryMatterSplit as false', async () => {
      const organicMaterialTypeId = '50';
      const dryMatterSplit = false;
      const request = {
        url: `/vendors/rb209/OrganicMaterial/OrganicMaterialTypeItem/${organicMaterialTypeId}/${dryMatterSplit}`,
      } as Request;

      const result =
        await controller.getOrganicMaterialTypeItemByOrganicMaterialTypeIdAndDryMatterSplit(
          organicMaterialTypeId,
          dryMatterSplit,
          request,
        );

      expect(result.organicMaterialTypeName).toBeTruthy();
    });

    it('should return null when organic material type item by organicMaterialTypeId and dryMatterSplit not found', async () => {
      const organicMaterialTypeId = '50';
      const dryMatterSplit = true;
      const request = {
        url: `/vendors/rb209/OrganicMaterial/OrganicMaterialTypeItem/${organicMaterialTypeId}/${dryMatterSplit}`,
      } as Request;

      const result =
        await controller.getOrganicMaterialTypeItemByOrganicMaterialTypeIdAndDryMatterSplit(
          organicMaterialTypeId,
          dryMatterSplit,
          request,
        );

      expect(result.organicMaterialTypeItem).toBeFalsy();
    });
  });

  describe('Get Incorporation Methods', () => {
    it('should return incorporation methods', async () => {
      const request = {
        url: `/vendors/rb209/OrganicMaterial/IncorporationMethods`,
      } as Request;

      const result = await controller.getIncorporationMethods(request);

      expect(result.length).toBeGreaterThan(0);
      expect(result).toBeTruthy();
    });
  });

  describe('Get Incorporation Methods By OrganicMaterialTypeId', () => {
    it('should return incorporation methods by organicMaterialTypeId', async () => {
      const organicMaterialTypeId = '1';
      const request = {
        url: `/vendors/rb209/OrganicMaterial/IncorporationMethods/${organicMaterialTypeId}`,
      } as Request;

      const result =
        await controller.getIncorporationMethodsByOrganicMaterialTypeId(
          organicMaterialTypeId,
          request,
        );
      expect(result.length).toBeGreaterThan(0);
      expect(result).toBeTruthy();
    });

    it('should return null when incorporation methods by organicMaterialTypeId not found', async () => {
      const organicMaterialTypeId = '100';
      const request = {
        url: `/vendors/rb209/OrganicMaterial/IncorporationMethods/${organicMaterialTypeId}`,
      } as Request;

      const result =
        await controller.getIncorporationMethodsByOrganicMaterialTypeId(
          organicMaterialTypeId,
          request,
        );

      expect(result.list).toBeNull();
    });
  });

  describe('Get Incorporation Method By IncorporationMethodId', () => {
    it('should return incorporation method by incorporationMethodId', async () => {
      const incorporationMethodId = '1';
      const request = {
        url: `/vendors/rb209/OrganicMaterial/IncorporationMethod/${incorporationMethodId}`,
      } as Request;

      const result =
        await controller.getIncorporationMethodByIncorporationMethodId(
          incorporationMethodId,
          request,
        );

      expect(result.incorporationMethodName).toBeTruthy();
    });

    it('should return null when incorporation method by incorporationMethodId not foud', async () => {
      const incorporationMethodId = '10';
      const request = {
        url: `/vendors/rb209/OrganicMaterial/IncorporationMethod/${incorporationMethodId}`,
      } as Request;

      const result =
        await controller.getIncorporationMethodByIncorporationMethodId(
          incorporationMethodId,
          request,
        );

      expect(result.item).toBeFalsy();
    });
  });
});
