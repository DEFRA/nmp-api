import { Controller, Get,Param, Query } from '@nestjs/common';
import { ClimateService } from './climate.service';
import {
  ApiSecurity,
  ApiOperation,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Climates')
@Controller('climates')
@ApiSecurity('Bearer')
export class ClimateController {
  constructor(private climateService: ClimateService) {}

  @Get('/rainfall-average/:postcode')
  @ApiParam({
    name: 'postcode',
    description: 'First half of Postcode, e.g., AB12',
  })
  @ApiOperation({ summary: 'Get rainfall average by post code' })
  async getRainfallAverageByPostcode(@Param('postcode') postcode: string) {
    return await this.climateService.getRainfallAverageByPostcode(postcode);
  }

  @Get('/total-rainfall')
  @ApiQuery({
    name: 'postcode',
    description: 'First Half of Postcode, e.g., AB12',
  })
  @ApiOperation({ summary: 'Get total rainfall by postcode and date range' })
  async getTotalRainfallByPostcodeAndDate(
    @Query('postcode') postcode: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.climateService.getTotalRainfallByPostcodeAndDate(
      postcode,
      startDate,
      endDate,
    );
  }

  @Get('/all-data/:postcode')
  @ApiParam({
    name: 'postcode',
    description: 'First half of Postcode, e.g., AB12',
  })
  @ApiOperation({ summary: 'Get all climate data by postcode' })
  async getAllDataByPostcode(@Param('postcode') postcode: string) {
    return await this.climateService.getBy('PostCode', postcode);
  }
}
