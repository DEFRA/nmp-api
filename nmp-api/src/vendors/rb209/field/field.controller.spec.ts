import { Test, TestingModule } from '@nestjs/testing';

import { RB209FieldController } from './field.controller';
import { RB209FieldService } from './field.service';
import { CacheModule } from '@nestjs/cache-manager';

describe('RB209FieldController', () => {
  let controller: RB209FieldController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [RB209FieldController],
      providers: [RB209FieldService],
    }).compile();

    controller = module.get<RB209FieldController>(RB209FieldController);
  });

  const getRequest = (url: string): Request =>
    ({
      url,
    }) as Request;

  describe('Get Countries', () => {
    it('should return the full list of available Countries', async () => {
      const req = getRequest('/vendors/rb209/Field/Countries');
      const result = await controller.getCountries(req);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Get Country By CountryId', () => {
    it('should return individual Country Text filtered from the supplied corresponding CountryId', async () => {
      const countryId = '1';
      const req = getRequest(`/vendors/rb209/Field/Country/${countryId}`);
      const result = await controller.getCountryByCountryId(countryId, req);
      expect(result.country).toBeTruthy();
    });

    it('should return null when Country Text filtered from the supplied corresponding CountryId not found', async () => {
      const countryId = '4';
      const req = getRequest(`/vendors/rb209/Field/Country/${countryId}`);
      const result = await controller.getCountryByCountryId(countryId, req);
      expect(result.country).toBeNull();
    });
  });

  describe('Get FieldTypes By CountryId', () => {
    it('should return the full list of available Field Types by Country Id', async () => {
      const countryId = '3';
      const req = getRequest(`/vendors/rb209/Field/FieldTypes/${countryId}`);
      const result = await controller.getFieldTypesByCountryId(countryId, req);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return the full list of available Field Types by Country Id', async () => {
      const countryId = '1';
      const req = getRequest(`/vendors/rb209/Field/FieldTypes/${countryId}`);
      const result = await controller.getFieldTypesByCountryId(countryId, req);
      expect(result.list).toBeNull();
    });
  });

  describe('Get FieldType By FieldTypeId', () => {
    it('should return individual Field Type Text filtered from the supplied corresponding FieldTypeId', async () => {
      const fieldTypeId = '1';
      const req = getRequest(`/vendors/rb209/Field/FieldType/${fieldTypeId}`);
      const result = await controller.getFieldTypeByFieldTypeId(
        fieldTypeId,
        req,
      );
      expect(result.fieldType).toBeTruthy();
    });

    it('should return null when Field Type Text filtered from the supplied corresponding FieldTypeId not found', async () => {
      const fieldTypeId = '3';
      const req = getRequest(`/vendors/rb209/Field/FieldType/${fieldTypeId}`);
      const result = await controller.getFieldTypeByFieldTypeId(
        fieldTypeId,
        req,
      );
      expect(result.fieldType).toBeNull();
    });
  });

  describe('Get Nutrients', () => {
    it('should return the full list of available Nutrients', async () => {
      const req = getRequest('/vendors/rb209/Field/Nutrients');
      const result = await controller.getNutrients(req);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Get Nutrient By NutrientId', () => {
    it('should return Nutrient Text filtered from the supplied corresponding NutrientId', async () => {
      const nutrientId = '1';
      const req = getRequest(`/vendors/rb209/Field/Nutrient/${nutrientId}`);
      const result = await controller.getNutrientByNutrientId(nutrientId, req);
      expect(result.nutrient).toBeTruthy();
    });

    it('should return null when Nutrient Text filtered from the supplied corresponding NutrientId not found', async () => {
      const nutrientId = '8';
      const req = getRequest(`/vendors/rb209/Field/Nutrient/${nutrientId}`);
      const result = await controller.getNutrientByNutrientId(nutrientId, req);
      expect(result.nutrientItem).toBeNull();
    });
  });

  describe('Get Site Classes By CountryId', () => {
    it('should return Site Class list by CountryId', async () => {
      const countryId = '1';
      const req = getRequest(`/vendors/rb209/Field/SiteClasses/${countryId}`);
      const result = await controller.getSiteClassesByCountryId(countryId, req);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return  null when Site Class list by CountryId not found', async () => {
      const countryId = '2';
      const req = getRequest(`/vendors/rb209/Field/SiteClasses/${countryId}`);
      const result = await controller.getSiteClassesByCountryId(countryId, req);
      expect(result.siteClasses).toBeNull();
    });
  });

  describe('Get SiteClass By SiteClassId', () => {
    it('should return Site Class of SiteClassId provided', async () => {
      const siteClassId = '1';
      const req = getRequest(`/vendors/rb209/Field/SiteClass/${siteClassId}`);
      const result = await controller.getSiteClassBySiteClassId(
        siteClassId,
        req,
      );
      expect(result.siteClass).toBeTruthy();
    });

    it('should return null when Site Class of SiteClassId provided not found', async () => {
      const siteClassId = '6';
      const req = getRequest(`/vendors/rb209/Field/SiteClass/${siteClassId}`);
      const result = await controller.getSiteClassBySiteClassId(
        siteClassId,
        req,
      );
      expect(result.siteClassItem).toBeNull();
    });
  });

  describe('Get SiteClassItem By SoilTypeId And Altitude And Postcode And CountryId', () => {
    // TODO:: add happy case for this api
    it('should return null when Site Class of field by SoilTypeId, Altitude, Postcode, and CountryId not found', async () => {
      const soilTypeId = '1';
      const altitude = '100';
      const postcode = 'AB123CD';
      const countryId = '1';
      const req = getRequest(
        `/vendors/rb209/Field/SiteClassItem/${soilTypeId}/${altitude}/${postcode}/${countryId}`,
      );
      const result =
        await controller.getSiteClassItemBySoilTypeIdAndAltitudeAndPostcodeAndCountryId(
          soilTypeId,
          altitude,
          postcode,
          countryId,
          req,
        );
      expect(result.list).toBeFalsy();
    });
  });

  describe('Get SecondCropType_List By CropGroupId1 And CropTypeId1 And CropGroupId2 And CountryId', () => {
    // TODO:: add happy case for this api
    it('should return null when the filtered list of available Second Crop Types after the first Crop not found', async () => {
      const cropGroupId1 = '10';
      const cropTypeId1 = '1';
      const cropGroupId2 = '12';
      const countryId = '2';
      const req = getRequest(
        `/vendors/rb209/Field/SecondCropType_List/${cropGroupId1}/${cropTypeId1}/${cropGroupId2}/${countryId}`,
      );
      const result =
        await controller.getSecondCropType_ListByCropGroupId1AndCropTypeId1AndCropGroupId2AndCountryId(
          cropGroupId1,
          cropTypeId1,
          cropGroupId2,
          countryId,
          req,
        );
      expect(result.list).toBeNull();
    });
  });
});
