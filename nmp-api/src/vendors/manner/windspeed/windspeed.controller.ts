import { Controller, Get, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { MannerWindspeedService } from './windspeed.service';
import { ApiOperation, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';


@ApiTags('Manner windspeeds')
@Controller('vendors/manner/windspeeds')
@ApiSecurity('Bearer')
export class MannerWindspeedController {
  constructor(private readonly service: MannerWindspeedService) {}

  @Get()
  @ApiOperation({ summary: 'Get all windspeeds data' })
  async getAll(@Req() req: Request) {
    const url = req.url.split('/manner')[1];
    return await this.service.getData(url);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve windspeed by ID',
  })
  async getWindspeedById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const url = req.url.split('/manner')[1];
    return await this.service.getData(url);
  }
}
