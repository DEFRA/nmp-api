import { Controller, Get, Param, Req } from '@nestjs/common';
import { RB209OrganicMaterialService } from './oraganicMaterial.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('RB209 OrganicMaterial')
@Controller('vendors/rb209/OrganicMaterial')
export class RB209OrganicMaterialController {
  constructor(private readonly service: RB209OrganicMaterialService) {}

  @Get('/OrganicMaterialCategories')
  @ApiOperation({
    summary: 'This endpoint is used to return Organic Material Categories',
  })
  async getOrganicMaterialCategories(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/OrganicMaterialCategoryItem/:organicMaterialCategoryId')
  @ApiOperation({
    summary: 'This endpoint is used to return Organic Material Category Item',
  })
  async getOrganicMaterialCategoryItemByOrganicMaterialCategoryId(
    @Param('organicMaterialCategoryId') organicMaterialCategoryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/OrganicMaterialTypes')
  @ApiOperation({
    summary: 'This endpoint used to return Organic Material Types',
  })
  async getOrganicMaterialTypes(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/OrganicMaterialTypes/:dryMatterSplit')
  @ApiOperation({
    summary:
      'This endpoint used to return Organic Material Types based on filter',
  })
  async getOrganicMaterialTypesByDryMatterSplit(
    @Param('dryMatterSplit') dryMatterSplit: boolean,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/OrganicMaterialTypes/:organicMaterialCategoryId')
  @ApiOperation({
    summary:
      'This endpoint used to return Organic Material Types for provided organicMaterialCategoryId',
  })
  async getOrganicMaterialTypesByOrganicMaterialCategoryId(
    @Param('organicMaterialCategoryId') organicMaterialCategoryId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/OrganicMaterialTypes/:organicMaterialCategoryId/:dryMatterSplit')
  @ApiOperation({
    summary:
      'This endpoint used to return Organic Material Types for provided organicMaterialCategoryId and dryMatterSplit',
  })
  async getOrganicMaterialTypesByOrganicMaterialCategoryIdAndDryMatterSplit(
    @Param('organicMaterialCategoryId') organicMaterialCategoryId: string,
    @Param('dryMatterSplit') dryMatterSplit: boolean,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/OrganicMaterialTypeItem/:organicMaterialTypeId')
  @ApiOperation({
    summary:
      'This endpoint is used to return Organic Material Type of Organic Material Type ID provided',
  })
  async getOrganicMaterialTypeItemByOrganicMaterialTypeId(
    @Param('organicMaterialTypeId') organicMaterialTypeId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/OrganicMaterialTypeItem/:organicMaterialTypeId/:dryMatterSplit')
  @ApiOperation({
    summary:
      'This endpoint is used to return organic material type item for provided organicMaterialTypeId and dryMatterSplit',
  })
  async getOrganicMaterialTypeItemByOrganicMaterialTypeIdAndDryMatterSplit(
    @Param('organicMaterialTypeId') organicMaterialTypeId: string,
    @Param('dryMatterSplit') dryMatterSplit: boolean,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/IncorporationMethods')
  @ApiOperation({
    summary: 'Organic Material Incorporation Method list',
  })
  async getIncorporationMethods(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/IncorporationMethods/:organicMaterialTypeId')
  @ApiOperation({
    summary:
      'Organic Material Incorporation Method list based on OrganicMaterialTypeId',
  })
  async getIncorporationMethodsByOrganicMaterialTypeId(
    @Param('organicMaterialTypeId') organicMaterialTypeId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/IncorporationMethod/:incorporationMethodId')
  @ApiOperation({
    summary:
      'Organic Material Incorporation Method Item based on Incorporation Method ID',
  })
  async getIncorporationMethodByIncorporationMethodId(
    @Param('incorporationMethodId') incorporationMethodId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }
}
