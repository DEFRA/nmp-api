import { Controller, Get, Req } from '@nestjs/common';
import { RB209SoilService } from './soil.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('RB209 Soil')
@Controller('vendors/rb209/Soil')
export class RB209SoilController {
  constructor(private readonly service: RB209SoilService) {}

  @Get('/SoilTypes')
  async getSoilTypes(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }
}
