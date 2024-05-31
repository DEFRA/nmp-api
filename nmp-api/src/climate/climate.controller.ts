import { Controller, Get, Param } from '@nestjs/common';
import { ClimateService } from './climate.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Climates')
@Controller('climates')
@ApiBearerAuth('token')
export class ClimateController {
  constructor(private climateService: ClimateService) {}

  @Get('/rainfall-average/:postCode')
  @ApiOperation({ summary: 'Get rainfall average by post code' })
  async getRainfallAverageByPostcode(@Param('postCode') postCode: string) {
    return await this.climateService.getRainfallAverageByPostcode(postCode);
  }
}
