import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { ManureTypeService } from './manure-type.service';
import { StaticStrings } from '@shared/static.string';

@Controller('manure-types')
@ApiTags('Manure Types')
@ApiSecurity('Bearer')
export class ManureTypeController {
  constructor(private readonly manureTypeService: ManureTypeService) {}

  @Get('/:manureGroupId')
  @ApiOperation({ summary: 'Get manure types by manureGroupId and countryId' })
  async getManureTypes(
    @Param('manureGroupId', ParseIntPipe) manureGroupId: number,
    @Query('countryId', new ParseIntPipe({ optional: false }))
    countryId: number,
  ) {
    if (!manureGroupId || !countryId) {
      throw new HttpException(
        StaticStrings.ERR_MISSING_PARAMETERS,
        HttpStatus.BAD_REQUEST,
      );
    }
    const data = await this.manureTypeService.getManureTypes(
      manureGroupId,
      countryId,
    );
    return data;
  }
}
