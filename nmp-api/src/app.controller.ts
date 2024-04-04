import { Controller, Get, HttpException, UseGuards } from '@nestjs/common';
import { generateToken } from '@shared/azureTokenGenerationService';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  health() {
    try {
      return this.appService.health();
    } catch (e) {
      throw new HttpException(e?.message, e.errorNum);
    }
  }

  @Get('/token')
  token() {
    try {
      return generateToken();
    } catch (e) {
      throw new HttpException(e?.message, e.errorNum);
    }
  }
}
