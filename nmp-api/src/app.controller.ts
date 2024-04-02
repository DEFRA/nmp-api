import { Controller, Get, HttpException } from '@nestjs/common';
import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  health() {
    try {
      return this.appService.health();
    } catch (e) {
      throw new HttpException(e?.message, e.errorNum);
    }
  }
}
