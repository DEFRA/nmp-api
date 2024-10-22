import { Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common';
import { MannerMoistureTypesService } from './moisture-types.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller('vendors/manner/moisture-types')
@ApiTags('Manner moisture-types')
@ApiSecurity('Bearer')
export class MannerMoistureTypesController {
  constructor(private readonly service: MannerMoistureTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all MoistureTypes' })
  async getAllMoistureTypes(@Req() req: Request) {
    const endpoint = req.url.split('/manner')[1];
    return await this.service.getData(endpoint);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve rain type by ID',
  })
  async getMoistureTypesById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const url = req.url.split('/manner')[1];
    return await this.service.getData(url);
  }
}
