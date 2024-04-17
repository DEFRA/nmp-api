import { Controller, Get, Param, Req } from '@nestjs/common';
import { RB209ArableService } from './arable.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('RB209 Arable')
@Controller('vendors/rb209/Arable')
export class RB209ArableController {
  constructor(private readonly service: RB209ArableService) {}

  @Get('/CropGroups')
  async getCropGroups(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropGroup/:cropGroupId')
  async getCropGroupById(
    @Param('cropGroupId') cropGroupId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropTypes')
  async getCropTypes(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropTypes/:cropGroupId')
  async getCropTypesByCropGroupId(
    @Param('cropGroupId') cropGroupId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropType/:cropTypeId')
  async getCropTypeByCropTypeId(
    @Param('cropTypeId') cropTypeId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropInfo1s')
  async getCropInfo1s(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropInfo1s/:cropTypeId')
  async getCropInfo1sByCropTypeId(
    @Param('cropTypeId') cropTypeId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropInfo1/:cropTypeId/:cropInfo1Id')
  async getCropInfo1ByCropTypeIdAndCropInfoId(
    @Param('cropTypeId') cropTypeId: string,
    @Param('cropInfo1Id') cropInfo1Id: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropInfo2s')
  async getCropInfo2s(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/CropInfo2/:cropInfo2Id')
  async getCropInfo2ByCropInfo2Id(
    @Param('cropInfo2Id') cropInfo2Id: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/PotatoGroups')
  async getPotatoGroups(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/PotatoGroup/:potatoGroupId')
  async getPotatoGroupsByPotatoGroupId(
    @Param('potatoGroupId') potatoGroupId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/PotatoVarieties')
  async getPotatoVarieties(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/PotatoVarieties/:potatoGroupId')
  async getPotatoVarietiesByPotatoGroupId(
    @Param('potatoGroupId') potatoGroupId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/PotatoVariety/:potatoVarietyId')
  async getPotatoVarietyByPotatoVarietyId(
    @Param('potatoVarietyId') potatoVarietyId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }
}
