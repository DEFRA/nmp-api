import { Controller, Get, Param } from '@nestjs/common';
import { IncorporationMethodService } from './incorporation-method.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Incorporation Methods')
@Controller('incorporation-methods')
@ApiSecurity('Bearer')
export class IncorporationMethodController {
  constructor(
    private readonly incorporationMethodService: IncorporationMethodService,
  ) {}

  @Get(':appId')
  @ApiOperation({
    summary: 'Get list of Incorporation Methods by Application Id',
  })
  async getIncorporationMethods(@Param('appId') appId: number) {
    const data =
      await this.incorporationMethodService.getIncorporationMethodsByAppId(
        appId,
      );
    return { IncorporationMethods: data };
  }
}
