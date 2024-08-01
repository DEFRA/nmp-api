import { Controller, Get, Param, Req } from '@nestjs/common';
import { RB209FieldService } from './field.service';
import { ApiSecurity, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('RB209 Field')
@Controller('vendors/rb209/Field')
@ApiSecurity('Bearer')
export class RB209FieldController {
  constructor(private readonly service: RB209FieldService) {}

  @Get('/Countries')
  @ApiOperation({ summary: 'The full list of available Countries' })
  async getCountries(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/Country/:countryId')
  @ApiOperation({
    summary:
      'Individual Country Text filtered from the supplied corresponding Country Id',
  })
  async getCountryByCountryId(
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/FieldTypes/:countryId')
  @ApiOperation({ summary: 'The full list of available Field Types' })
  async getFieldTypesByCountryId(
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/FieldType/:fieldTypeId')
  @ApiOperation({
    summary:
      'Individual Field Type Text filtered from the supplied corresponding Field Type Id',
  })
  async getFieldTypeByFieldTypeId(
    @Param('fieldTypeId') fieldTypeId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/Nutrients')
  @ApiOperation({ summary: 'The full list of available Nutrients' })
  async getNutrients(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/Nutrient/:nutrientId')
  @ApiOperation({
    summary:
      'Individual Nutrient Text filtered from the supplied corresponding Nutrient Id',
  })
  async getNutrientByNutrientId(
    @Param('nutrientId') nutrientId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/SiteClasses/:countryId')
  @ApiOperation({ summary: 'Site Class list' })
  async getSiteClassesByCountryId(
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/SiteClass/:siteClassId')
  @ApiOperation({ summary: 'Site Class of Site Class Id provided' })
  async getSiteClassBySiteClassId(
    @Param('siteClassId') siteClassId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/SiteClassItem/:soilTypeId/:altitude/:postcode/:countryId')
  @ApiOperation({ summary: 'Site Class of field' })
  async getSiteClassItemBySoilTypeIdAndAltitudeAndPostcodeAndCountryId(
    @Param('soilTypeId') soilTypeId: string,
    @Param('altitude') altitude: string,
    @Param('postcode') postcode: string,
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get(
    '/SecondCropType_List/:cropGroupId1/:cropTypeId1/:cropGroupId2/:countryId',
  )
  @ApiOperation({
    summary:
      'Some Crops (both Arable and Grassland) allow a second Crop to be sown in the same Crop Year: The filtered list of available Second Crop Types after the first Crop',
  })
  async getSecondCropType_ListByCropGroupId1AndCropTypeId1AndCropGroupId2AndCountryId(
    @Param('cropGroupId1') cropGroupId1: string,
    @Param('cropTypeId1') cropTypeId1: string,
    @Param('cropGroupId2') cropGroupId2: string,
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }
}
