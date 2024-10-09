import { Controller, Get, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { MannerManureTypesService } from './manure-types.service';
import { ApiOperation, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Manner manure-types')
@Controller('vendors/manner/manure-types')
@ApiSecurity('Bearer')
export class MannerManureTypesController {
  constructor(private readonly service: MannerManureTypesService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve all manure types or filter by criteria',
  })
  @ApiQuery({
    name: 'manureGroupId',
    required: false,
    type: Number,
    description: 'ID of the manure group to filter by',
  })
  @ApiQuery({
    name: 'manureTypeCategoryId',
    required: false,
    type: Number,
    description: 'ID of the manure type category to filter by',
  })
  @ApiQuery({
    name: 'countryId',
    required: false,
    type: Number,
    description: 'ID of the country to filter by',
  })
  @ApiQuery({
    name: 'highReadilyAvailableNitrogen',
    required: false,
    type: Boolean,
    description:
      'Filter by whether the nitrogen content is highly readily available (true/false)',
  })
  @ApiQuery({
    name: 'sLiquid',
    required: false,
    type: Boolean,
    description: 'Filter by whether the manure type is liquid (true/false)',
  })
  async getAllManureTypes(
    @Req() req: Request,
    @Query('manureGroupId', new ParseIntPipe({ optional: true }))
    manureGroupId?: number,
    @Query('manureTypeCategoryId', new ParseIntPipe({ optional: true }))
    manureTypeCategoryId?: number,
    @Query('countryId', new ParseIntPipe({ optional: true }))
    countryId?: number,
    @Query('highReadilyAvailableNitrogen')
    highReadilyAvailableNitrogen?: boolean,
    @Query('sLiquid') sLiquid?: boolean,
  ) {
    const url = req.url.split('/manner')[1];

    // Call the service method and pass the query parameters and the ID
    return await this.service.getData(url);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve manure types by ID',
  })
  async getManureTypesById(@Param('id') appId: number, @Req() req: Request) {
    const endpoint = req.url.split('/manner')[1];
    return await this.service.getData(endpoint);
  }
}
