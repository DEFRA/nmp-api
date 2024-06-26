// src/climate/climate.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { ClimateService } from './climate.service';
import { ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
@ApiTags('Climates')
@Controller('climates')
@ApiSecurity('Bearer')
export class ClimateController {
  constructor(private climateService: ClimateService) {}

  @Get('/rainfall-average/:postcode')
  @ApiParam({
    name: 'postcode',
    description: 'First half of postcode, eg: AB12',
  })
  @ApiOperation({ summary: 'Get rainfall average by post code' })
  async getRainfallAverageByPostcode(@Param('postcode') postcode: string) {
    return await this.climateService.getRainfallAverageByPostcode(postcode);
  }
}
