import { Controller, Get, Param } from '@nestjs/common';
import { IncorporationMethodService } from './incorporation-method.service';

@Controller('incorporation-methods')
export class IncorporationMethodController {
  constructor(
    private readonly incorporationMethodService: IncorporationMethodService,
  ) {}

  @Get(':appId')
  async getIncorporationMethods(@Param('appId') appId: number) {
    const data =
      await this.incorporationMethodService.getIncorporationMethodsByAppId(
        appId,
      );
    return { IncorporationMethods: data };
  }
}
