import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiSecurity, ApiOperation, ApiParam } from '@nestjs/swagger';
import { InorganicManureDurationService } from './inorganic-manure-duration.service';

@ApiTags('Inorganic Manure Durations')
@ApiSecurity('Bearer')
@Controller('inorganic-manure-durations')
export class InorganicManureDurationController {
  constructor(
    private inorganicManureDurationService: InorganicManureDurationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get list of Inorganic Manure Durations' })
  async getInorganicManureDurations() {
    const records =
      await this.inorganicManureDurationService.getInorganicManureDurations();

    return { InorganicManureDurations: records };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Inorganic Manure Duration by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Inorganic Manure Duration ID',
  })
  async getInorganicManureDurationById(@Param('id', ParseIntPipe) id: number) {
    const { records } = await this.inorganicManureDurationService.getById(id);
    if (!records) {
      throw new NotFoundException(
        `Inorganic Manure Duration with ID ${id} not found`,
      );
    }
    return { InorganicManureDuration: records };
  }
}
