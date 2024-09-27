import { Controller, Get, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { MannerIncorporationMethodService } from './incorporation-method.service';
import { ApiOperation, ApiParam, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IntegerType } from 'typeorm';


@ApiTags('Manner incorporation-methods')
@Controller('incorporation-methods')
@ApiSecurity('Bearer')
export class MannerIncorporationMethodController {
  constructor(private readonly service: MannerIncorporationMethodService) {}

  @Get('/by-app-method/:appId')
  @ApiOperation({
    summary: 'Get list of Incorporation Methods by Application Id',
  })
  async getIncorporationMethodByAppId(
    @Param('appId') appId: number,
    @Req() req: Request,
  ) {
    const endpoint = req.url;
    return await this.service.getData(endpoint);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve incorporation method by ID',
  })
  async getIncorporationMethodById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const url = req.url;
    return await this.service.getData(url);
  }
}
