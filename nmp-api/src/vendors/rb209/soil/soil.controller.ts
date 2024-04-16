import { Controller, Get } from '@nestjs/common';
import { RB209SoilService } from './soil.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('RB209')
@Controller('vendors/rb209/Soil')
export class RB209SoilController {
  constructor(private readonly service: RB209SoilService) {}

  @Get('/SoilTypes')
  async getSoilTypes() {
    return await this.service.getSoilTypes();
  }
}
