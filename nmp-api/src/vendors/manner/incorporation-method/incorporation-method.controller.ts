import { Controller, Get, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { MannerIncorporationMethodService } from './incorporation-method.service';
import { ApiOperation, ApiParam, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IntegerType } from 'typeorm';


@ApiTags('Manner incorporation-methods')
@Controller('vendors/manner/incorporation-methods')
@ApiSecurity('Bearer')
export class MannerIncorporationMethodController {
  constructor(private readonly service: MannerIncorporationMethodService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve all incorporation methods',
  })
  async getAllIncorporationMethod(@Req() req: Request) {
    const endpoint = req.url.split('/manner')[1];
    return await this.service.getData(endpoint);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve incorporation method by Id',
  })
  async getIncorporationMethodById(
    @Param('id') appId: number,
    @Req() req: Request,
  ) {
    const endpoint = req.url.split('/manner')[1];
    return await this.service.getData(endpoint);
  }

  @Get('/by-app-method/:methodId')
  @ApiOperation({
    summary: 'Retrieve incorporation method by ID',
  })
  async getIncorporationMethodByMethodId(
    @Param('methodId', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const url = req.url.split('/manner')[1];
    return await this.service.getData(url);
  }

  @Get('/by-app-method-and-applicable-for/:methodId')
  @ApiOperation({
    summary: 'Retrieve incorporation method by applications method ID',
  })
  @ApiQuery({
    name: 'applicableFor',
    required: true,
    type: String,
    description: "Filter by ApplicableFor ('G' for Grass, 'A' for Arable and Horticulture, 'B' for Both, 'NULL' for N/A)",
  })
  async getIncorporationMethodByAppMethodAndApplicableFor(
    @Param('methodId', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const url = req.url.split('/manner')[1];
    return await this.service.getData(url);
  }
}
