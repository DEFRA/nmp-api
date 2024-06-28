import { Controller, Get } from '@nestjs/common';
import { MoistureTypeService } from './moisture-type.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller('moisture-types')
@ApiTags('Moisture Types')
@ApiSecurity('Bearer')
export class MoistureTypeController {
  constructor(private moistureTypeService: MoistureTypeService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of Moisture Types' })
  async getSoilMoistureTypes() {
    const records = (await this.moistureTypeService.getAll()).records;

    return { MoistureTypes: records };
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default Moisture Type' })
  async getDefaultSoilMoistureType() {
    const records = (await this.moistureTypeService.getById(1)).records;

    return { MoistureType: records };
  }
}
