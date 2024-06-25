import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApplicationMethodService } from './application-method.service';
import { ApiTags, ApiSecurity, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Application Methods')
@Controller('application-method')
@ApiSecurity('Bearer')
export class ApplicationMethodController {
  constructor(
    private readonly applicationMethodService: ApplicationMethodService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get Application Methods' })
  @ApiQuery({
    name: 'fieldType',
    description: '1 for Arable & Horticulture, 2 for Grassland',
  })
  async getApplicationMethods(
    @Query('fieldType', new ParseIntPipe({ optional: false }))
    fieldType: number,
    @Query('applicableFor') applicableFor: string,
  ) {
    const records = await this.applicationMethodService.getApplicationMethods(
      fieldType,
      applicableFor,
    );
    return { ApplicationMethods: records };
  }
}
