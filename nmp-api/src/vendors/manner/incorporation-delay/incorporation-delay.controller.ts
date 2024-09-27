import { Controller, Get, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { MannerIncorporationDelayService } from './incorporation-delay.service';
import { ApiOperation, ApiParam, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IntegerType } from 'typeorm';


@ApiTags('Manner incorporation-delays')
@Controller('incorporation-delays')
@ApiSecurity('Bearer')
export class MannerIncorporationDelayController {
  constructor(private readonly service: MannerIncorporationDelayService) {}

  @Get('/by-incorp-method/:methodId')
  @ApiOperation({
    summary: 'Get list of Incorporation Delay by Incorporation Id',
  })
  async getIncorporationDelayByIncorporationId(
    @Param('methodId') appId: number,
    @Req() req: Request,
  ) {
    const endpoint = req.url;
    return await this.service.getData(endpoint);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve incorporation Delay by ID',
  })
  async getIncorporationDelayById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const url = req.url;
    return await this.service.getData(url);
  }
}
