import { Controller, Get, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { MannerApplicationMethodService } from './application-method.service';
import { ApiOperation, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';


@ApiTags('Manner application-methods')
@Controller('vendors/manner/application-methods')
@ApiSecurity('Bearer')
export class MannerApplicationMethodController {
  constructor(private readonly service: MannerApplicationMethodService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve all application methods or filter by criteria',
  })
  @ApiQuery({
    name: 'isLiquid',
    description: 'Whether to filter by liquid application methods (true/false)',
    required: false,
  })
  @ApiQuery({
    name: 'fieldType',
    description: 'The type of field to filter by (1 = arable, 2 = grass)',
    required: false,
  })
  async getClimateDataByPostCode(
    @Query('isLiquid') isLiquid: boolean,
    @Query('fieldType', new ParseIntPipe({ optional: true })) fieldType: Number,
    @Req() req: Request,
  ) {
    const endpoint = req.url.split('/manner')[1];
    return await this.service.getData(endpoint);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve application method by ID',
  })
  async getApplicationMethodById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const url = req.url.split('/manner')[1];
    return await this.service.getData(url);
  }
}
