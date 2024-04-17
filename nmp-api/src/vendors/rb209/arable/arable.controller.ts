import { Controller, Get, Param, Req } from '@nestjs/common';
import { RB209ArableService } from './arable.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('RB209 Arable')
@Controller('vendors/rb209/Arable')
export class RB209ArableController {
  constructor(private readonly service: RB209ArableService) {}

  @Get('/CropGroups')
  @ApiOperation({ summary: 'The full list of available Crop Groups' })
  async getCropGroups(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropGroup/:cropGroupId')
  @ApiOperation({
    summary: 'Individual Crop Group - filtered by Crop Group Id',
  })
  async getGropGroupsBycropGroupId(
    @Param('cropGroupId') cropGroupId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropTypes')
  @ApiOperation({ summary: 'The full list of available Crop Types' })
  async getCropTypes(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropTypes/:cropGroupId')
  @ApiOperation({
    summary:
      'A filtered list of available Crop Types - filtered by Crop Group Id',
  })
  async getCropTypesByCropGroupId(
    @Param('cropGroupId') cropGroupId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropType/:cropTypeId')
  @ApiOperation({ summary: 'Individual Crop Type - filtered by Crop Type Id' })
  async getCropTypeByCropTypeId(
    @Param('cropTypeId') cropTypeId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropInfo1s')
  @ApiOperation({ summary: 'The full list of available Crop Info 1s' })
  async getCropInfo1s(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropInfo1s/:cropTypeId')
  @ApiOperation({
    summary:
      'A filtered list of available Crop Info 1s - filtered by Crop Type Id',
  })
  async getCropInfo1sByCropTypeId(
    @Param('cropTypeId') cropTypeId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropInfo1/:cropTypeId/:cropInfo1Id')
  @ApiOperation({
    summary:
      'Individual Crop Info 1 - filtered by Crop Type Id and Crop Info 1 Id',
  })
  async getCropInfo1ByCropTypeIdAndCropInfo1Id(
    @Param('cropTypeId') cropTypeId: string,
    @Param('cropInfo1Id') cropInfo1Id: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropInfo2s')
  @ApiOperation({
    summary:
      'The full list of available Crop Info 2s (only required for Arable Cereals crops)',
  })
  async getCropInfo2s(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropInfo2/:cropInfo2Id')
  @ApiOperation({
    summary:
      'Individual Crop Info 2 - filtered by Crop Info 2 Id (only required for Arable Cereals crops)',
  })
  async getCropInfo2CropInfo2Id(
    @Param('cropInfo2Id') cropInfo2Id: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/PotatoGroups')
  @ApiOperation({
    summary:
      'The full list of available Potato Groups (only required for Arable Potato crops)',
  })
  async getPotatoGroups(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/PotatoGroup/:potatoGroupId')
  @ApiOperation({
    summary:
      'Individual Potato Group - filtered by Potato Group Id (only required for Arable Potato crops)',
  })
  async getPotatoGroupByPotatoGroupId(
    @Param('potatoGroupId') potatoGroupId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/PotatoVarieties')
  @ApiOperation({
    summary:
      'The full list of available Potato Varieties (only required for Arable Potato crops)',
  })
  async getPotatoVarieties(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/PotatoVarieties/:potatoGroupId')
  @ApiOperation({
    summary:
      'A filtered list of available Potato Varieties - filtered by Potato Group Id (only required for Arable Potato crops)',
  })
  async getPotatoVarietiesByPotatoGroupId(
    @Param('potatoGroupId') potatoGroupId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/PotatoVariety/:potatoVarietyId')
  @ApiOperation({
    summary:
      'Individual Potato Variety - filtered by Potato Variety Id (only required for Arable Potato crops)',
  })
  async getPotatoVarietyByPotatoVarietyId(
    @Param('potatoVarietyId') potatoVarietyId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }
}
