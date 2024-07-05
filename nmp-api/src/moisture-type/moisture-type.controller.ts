import { Controller, Get, Param } from '@nestjs/common';
import { MoistureTypeService } from './moisture-type.service';
import { ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller('moisture-types')
@ApiTags('Moisture Types')
@ApiSecurity('Bearer')
export class MoistureTypeController {
  constructor(private moistureTypeService: MoistureTypeService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of Moisture Types' })
  async getSoilMoistureTypes() {
    const { records } = await this.moistureTypeService.getAll();

    return { MoistureTypes: records };
  }

  @Get('default/:date')
  @ApiParam({
    name: 'date',
    description: 'Application date (format: YYYY-MM-DD)',
  })
  @ApiOperation({
    summary: 'Get default Moisture Type based on Application Date',
  })
  async getDefaultSoilMoistureType(@Param('date') applicationDate: string) {
    const records =
      await this.moistureTypeService.getDefaultSoilMoistureType(
        applicationDate,
      );

    return { MoistureType: records };
  }
}
