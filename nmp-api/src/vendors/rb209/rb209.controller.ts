import { Controller, Get } from '@nestjs/common';
import { RB209Service } from './rb209.service';

@Controller('vendors/rb209')
export class RB209Controller {
  constructor(private readonly service: RB209Service) {}

  @Get('/')
  async health() {
    return await this.service.check();
  }

  @Get('/get')
  async getAll() {
    return await this.service.get();
  }
}
