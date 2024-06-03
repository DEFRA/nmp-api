import { Controller, Get, Param, Req } from '@nestjs/common';
import { RB209SoilService } from './soil.service';
import { ApiSecurity, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('RB209 Soil')
@Controller('vendors/rb209/Soil')
@ApiSecurity('Bearer')
export class RB209SoilController {
  constructor(private readonly service: RB209SoilService) {}

  @Get('/SoilTypes')
  @ApiOperation({ summary: 'The full list of available Soil Types' })
  async getSoilTypes(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/SoilType/:soilTypeId')
  @ApiOperation({ summary: 'Individual Soil Type - filtered by Soil Type Id' })
  async getSoilTypeBySoilTypeId(
    @Param('soilTypeId') soilTypeId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/Methodologies/:nutrientId/:countryId')
  @ApiOperation({
    summary:
      'A filtered list of available Soil Methodologies - filtered by Nutrient Id and Country Id',
  })
  async getMethodologiesByNutrientIdAndCountryId(
    @Param('nutrientId') nutrientId: string,
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/Methodology/:nutrientId/:methodologyId')
  @ApiOperation({
    summary:
      'Individual Soil Methodology - filtered by Nutrient Id and Methodology Id',
  })
  async getMethodologyByNutrientIdAndMethodologyId(
    @Param('nutrientId') nutrientId: string,
    @Param('methodologyId') methodologyId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/NutrientIndices/:nutrientId/:methodologyId/:countryId')
  @ApiOperation({
    summary:
      'A filtered list of available Nutrient Indexes - filtered by Nutrient Id, Methodology Id and Country Id',
  })
  async getNutrientIndicesByNutrientIdAndMethodologyIdAndCountryId(
    @Param('nutrientId') nutrientId: string,
    @Param('methodologyId') methodologyId: string,
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/NutrientIndex/:nutrientId/:nutrientValue/:methodologyId')
  @ApiOperation({
    summary:
      'Individual Nutrient Index Item - filtered by Nutrient Id, Nutrient Value and Methodology Id',
  })
  async getNutrientIndexByNutrientIdAndNutrientValueAndMethodologyId(
    @Param('nutrientId') nutrientId: string,
    @Param('nutrientValue') nutrientValue: string,
    @Param('methodologyId') methodologyId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/NutrientIndex/:nutrientId/:indexId')
  @ApiOperation({
    summary:
      'Individual Nutrient Index Item - filtered by Nutrient Id and Index Id',
  })
  async getNutrientIndexByNutrientIdAndIndexId(
    @Param('nutrientId') nutrientId: string,
    @Param('indexId') indexId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get(
    '/NutrientIndexIdFromValue/:nutrientId/:methodologyId/:nutrientValue/:countryId',
  )
  @ApiOperation({
    summary:
      'Individual Nutrient Index Id - filtered by Nutrient Id, Methodology Id and Nutrient Value',
  })
  async getNutrientIndexIdFromValueByNutrientIdAndMethodologyIdAndNutrientValue(
    @Param('nutrientId') nutrientId: string,
    @Param('methodologyId') methodologyId: string,
    @Param('nutrientValue') nutrientValue: string,
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/NvzActionProgram/:countryId')
  @ApiOperation({ summary: 'The full list of NVZ Action program' })
  async getNvzActionProgramByCountryId(
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/SoilPsc/:cropGroupId/:pIndexId')
  @ApiOperation({
    summary: 'Get the list of all available PSC for selected crop group',
  })
  async getSoilPscByCropGroupIdAndPIndexId(
    @Param('cropGroupId') cropGroupId: string,
    @Param('pIndexId') pIndexId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/NutrientTargetIndex/:cropGroupId/:nutrientId/:countryId')
  @ApiOperation({ summary: 'Get the nutrient target index' })
  async getNutrientTargetIndexByCropGroupIdAndNutrientIdAndCountryId(
    @Param('cropGroupId') cropGroupId: string,
    @Param('nutrientId') nutrientId: string,
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/SoilPhRecommendation/:soilTypeId/:countryId')
  @ApiOperation({ summary: 'Get list of soil ph Recommendation level' })
  async getSoilPhRecommendationBySoilTypeIdAndCountryId(
    @Param('soilTypeId') soilTypeId: string,
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }
}
