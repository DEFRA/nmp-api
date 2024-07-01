import { Controller, Get, NotFoundException, Param, ParseIntPipe, Query } from '@nestjs/common';
import { IncorporationMethodService } from './incorporation-method.service';
import { ApiOperation, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Incorporation Methods')
@Controller('incorporation-methods')
@ApiSecurity('Bearer')
export class IncorporationMethodController {
  constructor(
    private readonly incorporationMethodService: IncorporationMethodService,
  ) {}

  @Get('/:appId')
  @ApiOperation({
    summary: 'Get list of Incorporation Methods by Application Id',
  })
  @ApiQuery({
    name: 'fieldType',
    description: '1 for Arable & Horticulture, 2 for Grassland',
  })
  async getIncorporationMethods(
    @Query('fieldType', new ParseIntPipe({ optional: false }))
    fieldType: number,
    @Query('applicableFor') applicableFor: string,
    @Param('appId') appId: number,
  ) {
    const data = await this.incorporationMethodService.getIncorporationMethods(
      fieldType,
      applicableFor,
      appId,
    );
    return { IncorporationMethods: data };
  }

  @Get('id/:id')
  @ApiOperation({
    summary: 'Get Incorporation Method by ID',
  })
  async getIncorporationMethodById(@Param('id', ParseIntPipe) id: number) {
    try {
      const data =
        await this.incorporationMethodService.getById(id);
      return { IncorporationMethod: data };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error; // Re-throw other errors to let NestJS handle them
    }
  }
}
