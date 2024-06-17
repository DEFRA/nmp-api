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

  @Get('/:applicableFor')
  @ApiOperation({ summary: 'Get Application Methods' })
  async getApplicationMethods(@Param('applicableFor') applicableFor: string) {
    const records =
      await this.applicationMethodService.getApplicationMethods(applicableFor);
    return { ApplicationMethods: records };
  }
}
