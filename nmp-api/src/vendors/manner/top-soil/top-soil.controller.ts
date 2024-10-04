import { Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common';
import { MannerTopSoilService } from './top-soil.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller('vendors/manner/top-soils')
@ApiTags('Manner top-soils')
@ApiSecurity('Bearer')
export class MannerTopSoilController {
  constructor(private readonly service: MannerTopSoilService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all top-soils' })
  async getAllTopSoils(@Req() req: Request) {
    const endpoint = req.url.split('/manner')[1];
    return await this.service.getData(endpoint);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve rain type by ID',
  })
  async getTopSoilsById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const url = req.url.split('/manner')[1];
    return await this.service.getData(url);
  }
}
