import { Controller, Get, Param } from '@nestjs/common';
import { ApplicationMethodService } from './application-method.service';
import { ApiTags, ApiSecurity, ApiOperation } from '@nestjs/swagger';

@ApiTags('Application Methods')
@Controller('application-method')
@ApiSecurity('Bearer')
export class ApplicationMethodController {
  constructor(
    private readonly applicationMethodService: ApplicationMethodService,
  ) {}

  @Get('/:manureTypeId')
  @ApiOperation({ summary: 'Get Application Methods by manureTypeId' })
  async getApplicationMethodsBasedOnManureTypeId(
    @Param('manureTypeId') manureTypeId: number,
  ) {
    const records =
      await this.applicationMethodService.getApplicationMethodsBasedOnManureTypeId(
        manureTypeId,
      );
    return { ApplicationMethods: records };
  }
}
