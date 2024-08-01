import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApplicationMethodService } from './application-method.service';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

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

  @Get(':id')
  @ApiOperation({ summary: 'Get Application Method by ID' })
  @ApiParam({ name: 'id', type: Number })
  async getApplicationMethodById(@Param('id', ParseIntPipe) id: number) {
    const { records } = await this.applicationMethodService.getById(id);
    if (!records) {
      throw new NotFoundException(`Application Method with ID ${id} not found`);
    }
    return { ApplicationMethod: records };
  }
}
