import { Controller, Get, Param, Req } from '@nestjs/common';
import { RB209GrasslandService } from './grassland.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('RB209 Grassland')
@Controller('vendors/rb209/Grassland')
export class RB209GrasslandController {
  constructor(private readonly service: RB209GrasslandService) {}

  @Get('/GrasslandSeasons/:countryId')
  @ApiOperation({
    summary: 'This endpoint is used to return grassland seasons',
  })
  async getGrasslandSeasonsByCountryId(
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/GrasslandSeason/:seasonId')
  @ApiOperation({
    summary: 'This endpoint is used to return grassland season',
  })
  async getGrasslandSeasonBySeasonId(
    @Param('seasonId') seasonId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/GrasslandFieldTypes/:countryId')
  @ApiOperation({
    summary:
      'Full list of available Grassland Field Types for Grassland fields',
  })
  async getGrasslandFieldTypesByCountryId(
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/GrasslandFieldType/:fieldTypeId')
  @ApiOperation({
    summary: 'Available Grassland Field Type name for Grassland field type ID',
  })
  async getGrasslandFieldTypeByFieldTypeId(
    @Param('fieldTypeId') fieldTypeId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/GrassGrowthClasses/:countryId')
  @ApiOperation({
    summary:
      'Full list of available Grass Growth Classes (GGC) for Grassland fields',
  })
  async getGrassGrowthClassesByCountryId(
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/GrassGrowthClass/:grassGrowthClassId')
  @ApiOperation({
    summary:
      'Individual Grass Growth Class (GGC) Text filtered from the supplied corresponding Grass Growth Class ID',
  })
  async getGrassGrowthClassByGrassGrowthClassId(
    @Param('grassGrowthClassId') grassGrowthClassId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/GrassGrowthClass/:soilTypeId/:rainfall/:altitude/:chalk')
  @ApiOperation({
    summary: 'Calculate the Grass Growth Class (GGC) for a Grassland Field',
  })
  async getGrassGrowthClassBySoilTypeIdAndRainfallAndAltitudeAndChalk(
    @Param('soilTypeId') soilTypeId: string,
    @Param('rainfall') rainfall: string,
    @Param('altitude') altitude: string,
    @Param('chalk') chalk: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropMaterials/:countryId')
  @ApiOperation({
    summary: 'Full list of available Crop Materials for Grassland fields',
  })
  async getCropMaterialsByCountryId(
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropMaterial/:cropMaterialId')
  @ApiOperation({
    summary:
      'Individual Crop Material Text filtered from the supplied corresponding Crop Material ID',
  })
  async getCropMaterialByCropMaterialId(
    @Param('cropMaterialId') cropMaterialId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/YieldType/:yieldTypeId')
  @ApiOperation({
    summary:
      'Individual Yield Type Text filtered from the supplied corresponding Yield Type ID',
  })
  async getYieldTypeByYieldTypeId(
    @Param('yieldTypeId') yieldTypeId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/YieldTypes/:countryId')
  @ApiOperation({
    summary: 'Full list of available Yield Types for Grassland fields',
  })
  async getYieldTypesByCountryId(
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/SoilNitrogenSupplies/:countryId')
  @ApiOperation({
    summary:
      'Full list of available Soil Nitrogen Supply (SNS) Statuses for Grassland fields based on Country ID',
  })
  async getSoilNitrogenSuppliesByCountryId(
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/SoilNitrogenSupplyItem/:soilNitrogenSupplyId')
  @ApiOperation({
    summary:
      'Individual Soil Nitrogen Supply (SNS) Text filtered from the supplied corresponding Soil Nitrogen Supply ID',
  })
  async getSoilNitrogenSupplyItemBySoilNitrogenSupplyId(
    @Param('soilNitrogenSupplyId') soilNitrogenSupplyId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/GrassHistories/:countryId')
  @ApiOperation({
    summary: 'Grass History list of Grassland Fields',
  })
  async getGrassHistoriesByCountryId(
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/GrassHistory/:grassHistoryId')
  @ApiOperation({
    summary: 'Grass History of Grass History ID provided',
  })
  async getGrassHistoryByGrassHistoryId(
    @Param('grassHistoryId') grassHistoryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/SequenceItems/:countryId')
  @ApiOperation({
    summary: 'Full list of available Sequence Items for Grassland fields',
  })
  async getSequenceItemsByCountryId(
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/SequenceItem/:sequenceItemId')
  @ApiOperation({
    summary:
      'Individual Sequence Item Text filtered from the supplied corresponding Sequence Item ID',
  })
  async getSequenceItemBySequenceItemId(
    @Param('sequenceItemId') sequenceItemId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/GrassSequences/:seasonId/:fieldTypeId/:countryId')
  @ApiOperation({
    summary: 'Full list of available Grass Sequences for Grassland fields',
  })
  async getGrassSequencesBySeasonIdAndFieldTypeIdAndCountryId(
    @Param('seasonId') seasonId: string,
    @Param('fieldTypeId') fieldTypeId: string,
    @Param('countryId') countryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/GrassSequenceItem/:grassSequenceId')
  @ApiOperation({
    summary:
      'Individual Grass Sequence Text filtered from the supplied corresponding Grass Sequence ID',
  })
  async getGrassSequenceItemByGrassSequenceId(
    @Param('grassSequenceId') grassSequenceId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/SoilNitrogenSupply/:grassHistoryId')
  @ApiOperation({
    summary:
      'Calculate the Soil Nitrogen Supply (SNS) Status for a Grassland Field',
  })
  async getSoilNitrogenSupplyByGrassHistoryId(
    @Param('grassHistoryId') grassHistoryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/GrasslandFieldTypeItem/:fieldTypeId')
  @ApiOperation({
    summary: 'Grassland Field Type of Grassland Field Type ID provided',
  })
  async getGrasslandFieldTypeItemByFieldTypeId(
    @Param('fieldTypeId') fieldTypeId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }
}
