import { Controller, Get, Query } from '@nestjs/common';
import { ClimateService } from './climate.service';
import { ApiSecurity, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Climates')
@Controller('climates')
@ApiSecurity('Bearer')
export class ClimateController {
  constructor(private climateService: ClimateService) {}

  @Get('/total-rainfall')
  @ApiQuery({
    name: 'postcode',
    description: 'Postcode, e.g., AB12',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date, e.g., 2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date, e.g., 2024-12-31',
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
}
