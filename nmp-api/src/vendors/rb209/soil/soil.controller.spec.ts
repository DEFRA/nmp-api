import { Test, TestingModule } from '@nestjs/testing';
import { RB209SoilController } from './soil.controller';
import { RB209SoilService } from './soil.service';
import { CacheModule } from '@nestjs/cache-manager';

describe('RB209SoilController', () => {
  let controller: RB209SoilController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [RB209SoilController],
      providers: [RB209SoilService],
    }).compile();

    controller = module.get<RB209SoilController>(RB209SoilController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Get Soil Types', () => {
    it('should return an array of soil types', async () => {
      const req = { url: '/vendors/rb209/Soil/SoilTypes' } as Request;

      const result = await controller.getSoilTypes(req);
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Get Soil Type By SoilTypeId', () => {
    it('should return a specific soil type by soilTypeId', async () => {
      const soilTypeId = '0';
      const req = {
        url: `/vendors/rb209/Soil/SoilType/${soilTypeId}`,
      } as Request;

      const result = await controller.getSoilTypeBySoilTypeId(soilTypeId, req);
      expect(result.soilType).toEqual('Light sand');
    });

    it('should return null when a specific soil type not found by SoilTypeId', async () => {
      const soilTypeId = '16';
      const req = {
        url: `/vendors/rb209/Soil/SoilType/${soilTypeId}`,
      } as Request;

      const result = await controller.getSoilTypeBySoilTypeId(soilTypeId, req);
      expect(result.soilType).toBeNull();
    });
  });

  describe('Get Methodologies By NutrientId And CountryId', () => {
    it('should return a list of methodologies for a specific nutrientId and countryId', async () => {
      const nutrientId = '0';
      const countryId = '3';
      const req = {
        url: `/vendors/rb209/Soil/Methodologies/${nutrientId}/${countryId}`,
      } as Request;

      const result = await controller.getMethodologiesByNutrientIdAndCountryId(
        nutrientId,
        countryId,
        req,
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return null when a  list of methodologies for a specific nutrientId and countryId not found', async () => {
      const nutrientId = '0';
      const countryId = '1';
      const req = {
        url: `/vendors/rb209/Soil/Methodologies/${nutrientId}/${countryId}`,
      } as Request;

      const result = await controller.getMethodologiesByNutrientIdAndCountryId(
        nutrientId,
        countryId,
        req,
      );
      expect(result.methodologies).toBeNull();
    });
  });

  describe('Get Methodology By NutrientId And MethodologyId', () => {
    it('should return a specific methodology for a given nutrientId and methodologyId', async () => {
      const nutrientId = '0';
      const methodologyId = '4';
      const req = {
        url: `/vendors/rb209/Soil/Methodology/${nutrientId}/${methodologyId}`,
      } as Request;

      const result =
        await controller.getMethodologyByNutrientIdAndMethodologyId(
          nutrientId,
          methodologyId,
          req,
        );
      expect(result.methodology).toBeTruthy();
    });

    it('should return null when a specific methodology for a given nutrientId and methodologyId not found', async () => {
      const nutrientId = '0';
      const methodologyId = '5';
      const req = {
        url: `/vendors/rb209/Soil/Methodology/${nutrientId}/${methodologyId}`,
      } as Request;

      const result =
        await controller.getMethodologyByNutrientIdAndMethodologyId(
          nutrientId,
          methodologyId,
          req,
        );
      expect(result.methodologyItem).toBeNull();
    });
  });

  describe('Get Nutrient Indices By NutrientId And MethodologyId And CountryId', () => {
    it('should return a list of nutrient indices for a specific nutrientId, methodology, and country', async () => {
      const nutrientId = '0';
      const methodologyId = '4';
      const countryId = '1';
      const req = {
        url: `/vendors/rb209/Soil/NutrientIndices/${nutrientId}/${methodologyId}/${countryId}`,
      } as Request;

      const result =
        await controller.getNutrientIndicesByNutrientIdAndMethodologyIdAndCountryId(
          nutrientId,
          methodologyId,
          countryId,
          req,
        );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return null when list of nutrient indices for a specific nutrientId, methodologyId, and countryId not found', async () => {
      const nutrientId = '0';
      const methodologyId = '4';
      const countryId = '2';
      const req = {
        url: `/vendors/rb209/Soil/NutrientIndices/${nutrientId}/${methodologyId}/${countryId}`,
      } as Request;

      const result =
        await controller.getNutrientIndicesByNutrientIdAndMethodologyIdAndCountryId(
          nutrientId,
          methodologyId,
          countryId,
          req,
        );
      expect(result.list).toBeNull();
    });
  });

  describe('Get Nutrient Index By NutrientId And NutrientValue And MethodologyId', () => {
    it('should return a specific nutrient index for a given nutrientId, nutrientValue, and methodologyId', async () => {
      const nutrientId = '0';
      const nutrientValue = '0';
      const methodologyId = '4';
      const req = {
        url: `/vendors/rb209/Soil/NutrientIndex/${nutrientId}/${nutrientValue}/${methodologyId}`,
      } as Request;

      const result =
        await controller.getNutrientIndexByNutrientIdAndNutrientValueAndMethodologyId(
          nutrientId,
          nutrientValue,
          methodologyId,
          req,
        );
      expect(result.index.trim()).toBe('0');
    });

    it('should return null when specific nutrient index for a given nutrientId, nutrientValue, and methodologyId not found', async () => {
      const nutrientId = '0';
      const nutrientValue = '0';
      const methodologyId = '5';
      const req = {
        url: `/vendors/rb209/Soil/NutrientIndex/${nutrientId}/${nutrientValue}/${methodologyId}`,
      } as Request;

      const result =
        await controller.getNutrientIndexByNutrientIdAndNutrientValueAndMethodologyId(
          nutrientId,
          nutrientValue,
          methodologyId,
          req,
        );
      expect(result.nutrientIndex).toBeNull();
    });
  });

  describe('Get Nutrient Index By NutrientId And IndexId', () => {
    it('should return a specific nutrient index for a given nutrientId and indexId', async () => {
      const nutrientId = '0';
      const indexId = '4';
      const req = {
        url: `/vendors/rb209/Soil/NutrientIndex/${nutrientId}/${indexId}`,
      } as Request;
      const result = await controller.getNutrientIndexByNutrientIdAndIndexId(
        nutrientId,
        indexId,
        req,
      );
      expect(result.index.trim()).toBe('4');
    });

    it('should return null when specific nutrient index for a given nutrientId and indexId not found', async () => {
      const nutrientId = '1';
      const indexId = '0';
      const req = {
        url: `/vendors/rb209/Soil/NutrientIndex/${nutrientId}/${indexId}`,
      } as Request;
      const result = await controller.getNutrientIndexByNutrientIdAndIndexId(
        nutrientId,
        indexId,
        req,
      );
      expect(result).toBe('');
    });
  });

  describe('Get Nutrient IndexId From Value By NutrientId And MethodologyId And NutrientValue', () => {
    it('should return a specific nutrient index id for a given NutrientId, MethodologyId, NutrientValue and countryId', async () => {
      const nutrientId = '0';
      const methodologyId = '4';
      const nutrientValue = '0';
      const countryId = '1';
      const req = {
        url: `/vendors/rb209/Soil/NutrientIndexIdFromValue/${nutrientId}/${methodologyId}/${nutrientValue}/${countryId}`,
      } as Request;

      const result =
        await controller.getNutrientIndexIdFromValueByNutrientIdAndMethodologyIdAndNutrientValue(
          nutrientId,
          methodologyId,
          nutrientValue,
          countryId,
          req,
        );
      expect(result).toBeTruthy();
    });

    it('should return null when specific nutrient index id for a given NutrientId, MethodologyId, NutrientValue and countryId not found', async () => {
      const nutrientId = '0';
      const methodologyId = '4';
      const nutrientValue = '0';
      const countryId = '1';
      const req = {
        url: `/vendors/rb209/Soil/NutrientIndexIdFromValue/${nutrientId}/${methodologyId}/${nutrientValue}/${countryId}`,
      } as Request;

      const result =
        await controller.getNutrientIndexIdFromValueByNutrientIdAndMethodologyIdAndNutrientValue(
          nutrientId,
          methodologyId,
          nutrientValue,
          countryId,
          req,
        );
      expect(result.nutrientIndex).toBe(undefined);
    });
  });

  describe('Get Nvz Action Program By CountryId', () => {
    it('should return NVZ action program for a specific country by countryId', async () => {
      const countryId = '1';
      const req = {
        url: `/vendors/rb209/Soil/NvzActionProgram/${countryId}`,
      } as Request;

      const result = await controller.getNvzActionProgramByCountryId(
        countryId,
        req,
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return null when NVZ action program for a specific country by countryId not found', async () => {
      const countryId = '4';
      const req = {
        url: `/vendors/rb209/Soil/NvzActionProgram/${countryId}`,
      } as Request;

      const result = await controller.getNvzActionProgramByCountryId(
        countryId,
        req,
      );
      expect(result.nvzResponse).toBe(null);
    });
  });

  describe('Get Soil Psc By CropGroupId And PIndexId', () => {
    it('should return a list of PSC for a specific cropGroupId and P index', async () => {
      const cropGroupId = '3';
      const pIndexId = '0';
      const req = {
        url: `/vendors/rb209/Soil/SoilPsc/${cropGroupId}/${pIndexId}`,
      } as Request;

      const result = await controller.getSoilPscByCropGroupIdAndPIndexId(
        cropGroupId,
        pIndexId,
        req,
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return null when soil PSC for a specific cropGroupId and PindexId not found', async () => {
      const cropGroupId = '3';
      const pIndexId = '0';
      const req = {
        url: `/vendors/rb209/Soil/SoilPsc/${cropGroupId}/${pIndexId}`,
      } as Request;

      const result = await controller.getSoilPscByCropGroupIdAndPIndexId(
        cropGroupId,
        pIndexId,
        req,
      );
      expect(result.getPscResponses).toBe(undefined);
    });
  });

  describe('Get Nutrient Target Index By CropGroupId And NutrientId And CountryId', () => {
    it('should return the nutrient target index for a specific CropGroupId, NutrientId, and CountryId', async () => {
      const cropGroupId = '3';
      const nutrientId = '1';
      const countryId = '1';
      const req = {
        url: `/vendors/rb209/Soil/NutrientTargetIndex/${cropGroupId}/${nutrientId}/${countryId}`,
      } as Request;

      const result =
        await controller.getNutrientTargetIndexByCropGroupIdAndNutrientIdAndCountryId(
          cropGroupId,
          nutrientId,
          countryId,
          req,
        );
      expect(result.indexId.trim()).toBe('3');
    });

    it('should return null when nutrient target index for a specific CropGroupId, NutrientId, and CountryId not found', async () => {
      const cropGroupId = '3';
      const nutrientId = '1';
      const countryId = '0';
      const req = {
        url: `/vendors/rb209/Soil/NutrientTargetIndex/${cropGroupId}/${nutrientId}/${countryId}`,
      } as Request;

      const result =
        await controller.getNutrientTargetIndexByCropGroupIdAndNutrientIdAndCountryId(
          cropGroupId,
          nutrientId,
          countryId,
          req,
        );
      expect(result.nutrientTargetIndex).toEqual(null);
    });
  });

  describe('Get Soil PhRecommendation By SoilTypeId And CountryId', () => {
    it('should return a list of soil pH recommendations for a specific SoilTypeId and CountryId', async () => {
      const soilTypeId = '0';
      const countryId = '1';
      const req = {
        url: `/vendors/rb209/Soil/SoilPhRecommendation/${soilTypeId}/${countryId}`,
      } as Request;

      const result =
        await controller.getSoilPhRecommendationBySoilTypeIdAndCountryId(
          soilTypeId,
          countryId,
          req,
        );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return null when soil pH recommendations for a specific SoilTypeId and CountryId not found', async () => {
      const soilTypeId = '4';
      const countryId = '4';
      const req = {
        url: `/vendors/rb209/Soil/SoilPhRecommendation/${soilTypeId}/${countryId}`,
      } as Request;

      const result =
        await controller.getSoilPhRecommendationBySoilTypeIdAndCountryId(
          soilTypeId,
          countryId,
          req,
        );
      expect(result.length).toEqual(0);
    });
  });
});
