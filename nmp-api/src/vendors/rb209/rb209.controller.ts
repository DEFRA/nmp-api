import { Controller, Get } from '@nestjs/common';
import { RB209Service } from './rb209.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('RB209')
@Controller('vendors/rb209')
export class RB209Controller {
  constructor(private readonly service: RB209Service) {}

  @Get('/')
  async health() {
    return await this.service.check();
  }

  @Get('/Soil/SoilTypes')
  async getSoilTypes() {
    return await this.service.getSoilTypes();
  }
}
